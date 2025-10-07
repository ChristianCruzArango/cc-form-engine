import {
  Rule,
  SchematicContext,
  Tree
} from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import * as ts from 'typescript';
import { FormSchema, ModelProperty } from './form-schema.interface';

export function form(options: FormSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info(`Searching for model "${options.model}" in "${options.path}" (recursive search in all subdirectories)...`);

    const modelInfo = findModelInProject(tree, options.model, options.path, context);

    if (!modelInfo) {
      context.logger.error(`Could not find interface or type "${options.model}" in ${options.path}`);
      context.logger.info(`Make sure the interface exists in any TypeScript file within ${options.path}`);
      throw new Error(`Could not find interface or type "${options.model}" in ${options.path}. Search was recursive.`);
    }

    context.logger.info(`Found model "${options.model}" at ${modelInfo.filePath}`);
    context.logger.info(`Properties found: ${modelInfo.properties.map(p => p.name).join(', ')}`);

    const componentPath = findComponentInProject(tree, options.component, options.path, context);

    if (!componentPath) {
      context.logger.error(`Could not find component "${options.component}" in ${options.path}`);
      context.logger.info(`Looking for files like: ${options.component}.component.ts or ${strings.dasherize(options.component)}.component.ts`);
      throw new Error(`Could not find component "${options.component}" in ${options.path}. Search was recursive.`);
    }

    context.logger.info(`Found component at ${componentPath}`);

    const formConfig = generateFormConfig(modelInfo.properties);
    const configFileName = `${strings.dasherize(modelInfo.actualModelName)}-form.config.ts`;

    const componentDir = componentPath.substring(0, componentPath.lastIndexOf('/'));
    const configDir = `${componentDir}/config`;
    const configFilePath = `${configDir}/${configFileName}`;

    const modelImportPath = getRelativeImportPath(configFilePath, modelInfo.filePath);
    const configFileContent = createConfigFile(modelInfo.actualModelName, modelImportPath, formConfig);

    if (tree.exists(configFilePath)) {
      tree.overwrite(configFilePath, configFileContent);
      context.logger.info(`Updated ${configFilePath}`);
    } else {
      tree.create(configFilePath, configFileContent);
      context.logger.info(`Created ${configFilePath}`);
    }

    updateComponentFile(tree, componentPath, modelInfo.actualModelName, configFilePath, modelInfo.filePath, context);

    context.logger.info(`Form generation completed successfully!`);
    context.logger.info(`\nNext steps:`);
    context.logger.info(`   1. Review the generated FormConfig at ${configFilePath}`);
    context.logger.info(`   2. Add custom validators if needed`);
    context.logger.info(`   3. Customize error messages`);

    return tree;
  };
}

function findModelInProject(
  tree: Tree,
  modelName: string,
  searchPath: string,
  context: SchematicContext
): {
  filePath: string;
  properties: ModelProperty[];
  importPath: string;
  actualModelName: string;
} | null {
  let result: { filePath: string; properties: ModelProperty[]; importPath: string; actualModelName: string } | null = null;
  let filesScanned = 0;
  const allInterfaces: Map<string, string[]> = new Map();

  tree.getDir(searchPath).visit((path) => {
    if (result) return;

    if (path.endsWith('.ts') && !path.endsWith('.spec.ts')) {
      filesScanned++;

      const content = tree.read(path);
      if (!content) return;

      const sourceFile = ts.createSourceFile(
        path,
        content.toString('utf-8'),
        ts.ScriptTarget.Latest,
        true
      );

      const interfacesInFile = getAllInterfaces(sourceFile);
      if (interfacesInFile.length > 0) {
        allInterfaces.set(path, interfacesInFile);
      }

      let properties = extractInterfaceProperties(sourceFile, modelName);
      let actualName = modelName;

      if (properties.length === 0) {
        const caseInsensitiveMatch = interfacesInFile.find(
          name => name.toLowerCase() === modelName.toLowerCase()
        );
        if (caseInsensitiveMatch) {
          properties = extractInterfaceProperties(sourceFile, caseInsensitiveMatch);
          actualName = caseInsensitiveMatch;
        }
      }

      if (properties.length > 0) {
        result = {
          filePath: path,
          properties,
          importPath: path.replace(/\.ts$/, '').replace(/^src\//, '../'),
          actualModelName: actualName
        };
      }
    }
  });

  context.logger.info(`Scanned ${filesScanned} TypeScript files in ${searchPath} and subdirectories`);

  if (!result && filesScanned === 0) {
    context.logger.warn(`No TypeScript files found in ${searchPath}. Check that the path is correct.`);
  } else if (!result) {
    context.logger.error(`Model "${modelName}" not found.`);
    context.logger.warn(`Available interfaces found in project:`);

    let totalInterfaces = 0;
    allInterfaces.forEach((interfaces, path) => {
      if (totalInterfaces < 20) {
        context.logger.warn(`  ${path}:`);
        interfaces.forEach(name => {
          if (totalInterfaces < 20) {
            context.logger.warn(`    - ${name}`);
            totalInterfaces++;
          }
        });
      }
    });

    if (totalInterfaces === 0) {
      context.logger.warn(`  No interfaces found. Make sure your model is exported as "export interface YourModel"`);
    } else if (totalInterfaces >= 20) {
      context.logger.warn(`  ... and more`);
    }

    context.logger.info(`\nTip: Model name is case-sensitive. Did you mean one of these?`);
    const similarNames = Array.from(allInterfaces.values())
      .flat()
      .filter(name => name.toLowerCase().includes(modelName.toLowerCase()));

    if (similarNames.length > 0) {
      similarNames.slice(0, 5).forEach(name => context.logger.info(`  - ${name}`));
    }
  }

  return result;
}

function getAllInterfaces(sourceFile: ts.SourceFile): string[] {
  const interfaces: string[] = [];

  function visit(node: ts.Node) {
    if (ts.isInterfaceDeclaration(node) && node.name) {
      interfaces.push(node.name.text);
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return interfaces;
}

function extractInterfaceProperties(sourceFile: ts.SourceFile, interfaceName: string): ModelProperty[] {
  const properties: ModelProperty[] = [];

  function visit(node: ts.Node) {
    if (ts.isInterfaceDeclaration(node) && node.name.text === interfaceName) {
      node.members.forEach((member) => {
        if (ts.isPropertySignature(member) && member.name) {
          const name = member.name.getText(sourceFile);
          const isOptional = !!member.questionToken;
          let type = 'string';
          let isArray = false;

          if (member.type) {
            const typeText = member.type.getText(sourceFile);

            if (typeText.includes('[]')) {
              isArray = true;
              type = inferTypeFromTS(typeText.replace('[]', ''));
            } else if (typeText.includes('Array<')) {
              isArray = true;
              const match = typeText.match(/Array<(.+)>/);
              type = match ? inferTypeFromTS(match[1]) : 'string';
            } else {
              type = inferTypeFromTS(typeText);
            }
          }

          properties.push({ name, type, isOptional, isArray });
        }
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return properties;
}

function inferTypeFromTS(tsType: string): string {
  const cleanType = tsType.trim().toLowerCase();

  if (cleanType === 'string') return 'string';
  if (cleanType === 'number') return 'number';
  if (cleanType === 'boolean') return 'boolean';
  if (cleanType === 'date') return 'date';
  if (cleanType.includes('money') || cleanType.includes('price') || cleanType.includes('salary') || cleanType.includes('salario') || cleanType.includes('precio')) return 'money';
  if (cleanType.includes('percent') || cleanType.includes('porcentaje')) return 'percentage';

  return 'string';
}

function generateFormConfig(properties: ModelProperty[]): string {
  const fields = properties.map(prop => {
    const defaultValue = getDefaultValue(prop);
    const validators = prop.isOptional ? '' : `\n    validators: [Validators.required],`;

    return `  ${prop.name}: {
    type: '${prop.type}',
    defaultValue: ${defaultValue},${validators}
    label: '${capitalizeFirst(prop.name)}',
    placeholder: 'Enter ${prop.name}'
  }`;
  });

  return `{\n${fields.join(',\n')}\n}`;
}

function getDefaultValue(prop: ModelProperty): string {
  if (prop.isArray) return '[]';
  if (prop.type === 'string') return "''";
  if (prop.type === 'number' || prop.type === 'money' || prop.type === 'percentage') return 'null';
  if (prop.type === 'boolean') return 'false';
  if (prop.type === 'date') return 'null';
  return 'null';
}

function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function createConfigFile(modelName: string, modelImportPath: string, formConfig: string): string {
  return `import { Validators } from '@angular/forms';
import { FormConfig } from 'cc-form-engine';
import { ${modelName} } from '${modelImportPath}';

export const ${modelName.toUpperCase()}_FORM_CONFIG: FormConfig<${modelName}> = ${formConfig};
`;
}

function findComponentInProject(
  tree: Tree,
  componentName: string,
  searchPath: string,
  context: SchematicContext
): string | null {
  let componentPath: string | null = null;
  let componentsFound = 0;
  const possibleNames = [
    `${componentName}.component.ts`,
    `${strings.dasherize(componentName)}.component.ts`
  ];

  tree.getDir(searchPath).visit((path) => {
    if (componentPath) return;

    if (path.endsWith('.component.ts')) {
      componentsFound++;
    }

    if (possibleNames.some(name => path.endsWith(name))) {
      componentPath = path;
    }
  });

  context.logger.info(`Found ${componentsFound} component files in ${searchPath} and subdirectories`);

  if (!componentPath && componentsFound === 0) {
    context.logger.warn(`No component files found in ${searchPath}. Check that the path is correct.`);
  } else if (!componentPath) {
    context.logger.warn(`Component "${componentName}" not found. Looked for:`);
    possibleNames.forEach(name => context.logger.warn(`  - */${name}`));
  }

  return componentPath;
}

function updateComponentFile(
  tree: Tree,
  componentPath: string,
  modelName: string,
  configPath: string,
  modelFilePath: string,
  context: SchematicContext
): void {
  const content = tree.read(componentPath);
  if (!content) return;

  let componentContent = content.toString('utf-8');
  const configImportPath = getRelativeImportPath(componentPath, configPath);
  const modelImportPath = getRelativeImportPath(componentPath, modelFilePath);
  const configConstName = `${modelName.toUpperCase()}_FORM_CONFIG`;

  // If component already has a 'form' property, use prefixed name (for multiple forms)
  // Otherwise, use simple 'form' name
  let formVarName = 'form';
  if (componentContent.includes('form!: FormGroup') || componentContent.includes('form: FormGroup')) {
    formVarName = `${strings.camelize(modelName)}Form`;
    context.logger.info(`Component already has a 'form' property. Using '${formVarName}' instead.`);
  }

  if (componentContent.includes(configConstName)) {
    context.logger.warn(`Component already has ${configConstName} imported. Skipping import.`);
    return;
  }

  if (!componentContent.includes('import { FormGroup }')) {
    componentContent = addImport(componentContent, "import { FormGroup } from '@angular/forms';");
  }

  const requiredCoreImports = ['inject', 'OnInit', 'WritableSignal'];
  const coreImportMatch = componentContent.match(/import\s*{([^}]+)}\s*from\s*'@angular\/core';/);

  if (coreImportMatch) {
    const existingImports = coreImportMatch[1].split(',').map(i => i.trim());
    const missingImports = requiredCoreImports.filter(imp => !existingImports.includes(imp));

    if (missingImports.length > 0) {
      const allImports = [...existingImports, ...missingImports];
      componentContent = componentContent.replace(
        coreImportMatch[0],
        `import { ${allImports.join(', ')} } from '@angular/core';`
      );
    }
  } else {
    componentContent = addImport(componentContent, `import { ${requiredCoreImports.join(', ')} } from '@angular/core';`);
  }

  componentContent = addImport(componentContent, `import { FormGeneratorService } from 'cc-form-engine';`);
  componentContent = addImport(componentContent, `import { ${configConstName} } from '${configImportPath}';`);
  componentContent = addImport(componentContent, `import { ${modelName} } from '${modelImportPath}';`);

  const classMatch = componentContent.match(/export class (\w+)/);
  if (!classMatch) return;

  const className = classMatch[1];

  if (!componentContent.includes('implements OnInit')) {
    componentContent = componentContent.replace(
      new RegExp(`(export class ${className})(\\s*{)`),
      `$1 implements OnInit$2`
    );
  }

  // If component already has a 'hasChanges' property, use prefixed name
  let hasChangesVarName = 'hasChanges';
  if (componentContent.includes('hasChanges!: WritableSignal') || componentContent.includes('hasChanges: WritableSignal')) {
    hasChangesVarName = `${strings.camelize(modelName)}HasChanges`;
    context.logger.info(`Component already has a 'hasChanges' property. Using '${hasChangesVarName}' instead.`);
  }

  const classBodyMatch = componentContent.match(new RegExp(`export class ${className}[^{]*{`));
  if (classBodyMatch) {
    const insertIndex = componentContent.indexOf(classBodyMatch[0]) + classBodyMatch[0].length;
    const propertiesToAdd: string[] = [];

    if (!componentContent.includes('formGenerator = inject(FormGeneratorService)')) {
      propertiesToAdd.push(`\n  private formGenerator = inject(FormGeneratorService);`);
    }

    if (!componentContent.includes(`${formVarName}!: FormGroup`)) {
      propertiesToAdd.push(`  ${formVarName}!: FormGroup<any>;`);
    }

    if (!componentContent.includes(`${hasChangesVarName}!: WritableSignal`)) {
      propertiesToAdd.push(`  ${hasChangesVarName}!: WritableSignal<boolean>;`);
    }

    if (propertiesToAdd.length > 0) {
      propertiesToAdd.push('\n');
      componentContent = componentContent.slice(0, insertIndex) + propertiesToAdd.join('\n') + componentContent.slice(insertIndex);
    }
  }

  if (!componentContent.includes('ngOnInit()')) {
    // Find the class body and insert ngOnInit before the last closing brace
    const classStartMatch = componentContent.match(new RegExp(`export class ${className}[^{]*{`));
    if (classStartMatch) {
      const classStartIndex = componentContent.indexOf(classStartMatch[0]) + classStartMatch[0].length;

      // Find the matching closing brace for the class
      let braceCount = 1;
      let classEndIndex = classStartIndex;

      for (let i = classStartIndex; i < componentContent.length; i++) {
        if (componentContent[i] === '{') braceCount++;
        if (componentContent[i] === '}') braceCount--;
        if (braceCount === 0) {
          classEndIndex = i;
          break;
        }
      }

      if (classEndIndex > classStartIndex) {
        const ngOnInitCode = `\n  ngOnInit(): void {\n    this.${formVarName} = this.formGenerator.generateFormGroup(${configConstName});\n    this.${hasChangesVarName} = this.formGenerator.getHasChanges(this.${formVarName});\n  }\n`;
        componentContent = componentContent.slice(0, classEndIndex) + ngOnInitCode + componentContent.slice(classEndIndex);
        context.logger.info(`Added ngOnInit() method to ${className}`);
      } else {
        context.logger.warn(`Could not find class end for ${className}. NgOnInit not added.`);
      }
    }
  } else {
    const ngOnInitMatch = componentContent.match(/ngOnInit\(\)[^{]*{/);
    if (ngOnInitMatch && !componentContent.includes(`this.${formVarName} = this.formGenerator.generateFormGroup`)) {
      const insertIndex = componentContent.indexOf(ngOnInitMatch[0]) + ngOnInitMatch[0].length;
      const formInitCode = `\n    this.${formVarName} = this.formGenerator.generateFormGroup(${configConstName});\n    this.${hasChangesVarName} = this.formGenerator.getHasChanges(this.${formVarName});`;
      componentContent = componentContent.slice(0, insertIndex) + formInitCode + componentContent.slice(insertIndex);
      context.logger.info(`Added form initialization to existing ngOnInit()`);
    }
  }

  tree.overwrite(componentPath, componentContent);
  context.logger.info(`Updated component at ${componentPath}`);
}

function addImport(content: string, importStatement: string): string {
  if (content.includes(importStatement)) {
    return content;
  }

  const importRegex = /import .+ from .+;[\n\r]*/g;
  const imports = content.match(importRegex);

  if (imports && imports.length > 0) {
    const lastImport = imports[imports.length - 1];
    const lastImportIndex = content.lastIndexOf(lastImport);
    return content.slice(0, lastImportIndex + lastImport.length) +
           importStatement + '\n' +
           content.slice(lastImportIndex + lastImport.length);
  }

  return importStatement + '\n' + content;
}

function getRelativeImportPath(fromPath: string, toPath: string): string {
  const from = fromPath.split('/').slice(0, -1);
  const to = toPath.replace('.ts', '').split('/');

  let commonLength = 0;
  for (let i = 0; i < Math.min(from.length, to.length); i++) {
    if (from[i] === to[i]) {
      commonLength++;
    } else {
      break;
    }
  }

  const upLevels = from.length - commonLength;
  const remainingPath = to.slice(commonLength);

  const relativePath = '../'.repeat(upLevels) + remainingPath.join('/');
  return relativePath.startsWith('.') ? relativePath : './' + relativePath;
}

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
    context.logger.info(`Searching for model "${options.model}" in project...`);

    const modelInfo = findModelInProject(tree, options.model, options.path);

    if (!modelInfo) {
      throw new Error(`Could not find interface or type "${options.model}" in ${options.path}`);
    }

    context.logger.info(`Found model "${options.model}" at ${modelInfo.filePath}`);
    context.logger.info(`Properties found: ${modelInfo.properties.map(p => p.name).join(', ')}`);

    const componentPath = findComponentInProject(tree, options.component, options.path);

    if (!componentPath) {
      throw new Error(`Could not find component "${options.component}" in ${options.path}`);
    }

    context.logger.info(`Found component at ${componentPath}`);

    const formConfig = generateFormConfig(modelInfo.properties);
    const configFileName = `${strings.dasherize(options.model)}-form.config.ts`;
    const configFilePath = `${options.configPath}/${configFileName}`;
    const configFileContent = createConfigFile(options.model, modelInfo.importPath, formConfig);

    if (tree.exists(configFilePath)) {
      tree.overwrite(configFilePath, configFileContent);
      context.logger.info(`Updated ${configFilePath}`);
    } else {
      tree.create(configFilePath, configFileContent);
      context.logger.info(`Created ${configFilePath}`);
    }

    updateComponentFile(tree, componentPath, options.model, configFilePath, context);

    context.logger.info(`Form generation completed successfully!`);
    context.logger.info(`\nNext steps:`);
    context.logger.info(`   1. Review the generated FormConfig at ${configFilePath}`);
    context.logger.info(`   2. Add custom validators if needed`);
    context.logger.info(`   3. Customize error messages`);

    return tree;
  };
}

function findModelInProject(tree: Tree, modelName: string, searchPath: string): {
  filePath: string;
  properties: ModelProperty[];
  importPath: string;
} | null {
  let result: { filePath: string; properties: ModelProperty[]; importPath: string } | null = null;

  tree.getDir(searchPath).visit((path) => {
    if (result) return;

    if (path.endsWith('.ts') && !path.endsWith('.spec.ts')) {
      const content = tree.read(path);
      if (!content) return;

      const sourceFile = ts.createSourceFile(
        path,
        content.toString('utf-8'),
        ts.ScriptTarget.Latest,
        true
      );

      const properties = extractInterfaceProperties(sourceFile, modelName);

      if (properties.length > 0) {
        result = {
          filePath: path,
          properties,
          importPath: path.replace(/\.ts$/, '').replace(/^src\//, '../')
        };
      }
    }
  });

  return result;
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

  return 'string'; // default
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

function findComponentInProject(tree: Tree, componentName: string, searchPath: string): string | null {
  let componentPath: string | null = null;
  const possibleNames = [
    `${componentName}.component.ts`,
    `${strings.dasherize(componentName)}.component.ts`
  ];

  tree.getDir(searchPath).visit((path) => {
    if (componentPath) return;

    if (possibleNames.some(name => path.endsWith(name))) {
      componentPath = path;
    }
  });

  return componentPath;
}

function updateComponentFile(
  tree: Tree,
  componentPath: string,
  modelName: string,
  configPath: string,
  context: SchematicContext
): void {
  const content = tree.read(componentPath);
  if (!content) return;

  let componentContent = content.toString('utf-8');
  const configImportPath = getRelativeImportPath(componentPath, configPath);
  const configConstName = `${modelName.toUpperCase()}_FORM_CONFIG`;

  // Check if already imported
  if (componentContent.includes(configConstName)) {
    context.logger.warn(`Component already has ${configConstName} imported. Skipping import.`);
    return;
  }

  // Add imports
  const importStatement = `import { FormGeneratorService, FormConfig } from 'cc-form-engine';\nimport { ${configConstName} } from '${configImportPath}';\nimport { ${modelName} } from '../models/${strings.dasherize(modelName)}.model';\n`;

  // Find last import and add after it
  const importRegex = /import .+ from .+;[\n\r]*/g;
  const imports = componentContent.match(importRegex);

  if (imports && imports.length > 0) {
    const lastImport = imports[imports.length - 1];
    const lastImportIndex = componentContent.lastIndexOf(lastImport);
    componentContent =
      componentContent.slice(0, lastImportIndex + lastImport.length) +
      importStatement +
      componentContent.slice(lastImportIndex + lastImport.length);
  }

  // Add service injection if not present
  if (!componentContent.includes('FormGeneratorService')) {
    const classMatch = componentContent.match(/export class \w+Component/);
    if (classMatch) {
      const classIndex = componentContent.indexOf(classMatch[0]);
      const constructorIndex = componentContent.indexOf('constructor', classIndex);

      if (constructorIndex === -1) {
        // No constructor, add one
        const openBraceIndex = componentContent.indexOf('{', classIndex);
        componentContent =
          componentContent.slice(0, openBraceIndex + 1) +
          `\n  private formGenerator = inject(FormGeneratorService);\n  ${strings.camelize(modelName)}Form!: FormGroup;\n` +
          componentContent.slice(openBraceIndex + 1);
      }
    }
  }

  tree.overwrite(componentPath, componentContent);
  context.logger.info(`Updated component at ${componentPath}`);
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

export interface FormSchema {
  model: string;
  component: string;
  path: string;
  configPath: string;
}

export interface ModelProperty {
  name: string;
  type: string;
  isOptional: boolean;
  isArray: boolean;
}

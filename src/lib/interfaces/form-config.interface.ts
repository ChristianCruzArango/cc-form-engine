import { ValidatorFn } from '@angular/forms';

export type FieldType = 
  | 'string'
  | 'number'
  | 'money'
  | 'percentage'
  | 'boolean'
  | 'date'
  | 'file'
  | 'string[]'
  | 'array';

export interface FormFieldConfig {
  defaultValue: any;
  validators?: ValidatorFn[];
  type: FieldType;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  hint?: string;
  errorMessages?: Record<string, string>;
}

export type FormConfig<T> = {
  [P in keyof T]: FormFieldConfig;
};

export interface FormStateConfig {
  trackChanges?: boolean;
  autoSave?: boolean;
  debounceTime?: number;
}
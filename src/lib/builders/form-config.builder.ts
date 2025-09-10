import { ValidatorFn } from '@angular/forms';
import { FormConfig, FormFieldConfig, FieldType } from '../interfaces/form-config.interface';

export class FormConfigBuilder<T> {
  private config: Partial<FormConfig<T>> = {};

  addField(
    name: keyof T,
    type: FieldType,
    options?: Partial<FormFieldConfig>
  ): FormConfigBuilder<T> {
    const fieldConfig: FormFieldConfig = {
      type,
      defaultValue: options?.defaultValue ?? this.getDefaultValueForType(type),
      validators: options?.validators || [],
      disabled: options?.disabled || false,
      label: options?.label,
      placeholder: options?.placeholder,
      hint: options?.hint,
      errorMessages: options?.errorMessages
    };

    this.config[name] = fieldConfig;
    return this;
  }

  addTextField(
    name: keyof T,
    options?: Partial<Omit<FormFieldConfig, 'type'>>
  ): FormConfigBuilder<T> {
    return this.addField(name, 'string', options);
  }

  addNumberField(
    name: keyof T,
    options?: Partial<Omit<FormFieldConfig, 'type'>>
  ): FormConfigBuilder<T> {
    return this.addField(name, 'number', options);
  }

  addMoneyField(
    name: keyof T,
    options?: Partial<Omit<FormFieldConfig, 'type'>>
  ): FormConfigBuilder<T> {
    return this.addField(name, 'money', options);
  }

  addPercentageField(
    name: keyof T,
    options?: Partial<Omit<FormFieldConfig, 'type'>>
  ): FormConfigBuilder<T> {
    return this.addField(name, 'percentage', options);
  }

  addBooleanField(
    name: keyof T,
    options?: Partial<Omit<FormFieldConfig, 'type'>>
  ): FormConfigBuilder<T> {
    return this.addField(name, 'boolean', {
      ...options,
      defaultValue: options?.defaultValue ?? false
    });
  }

  addDateField(
    name: keyof T,
    options?: Partial<Omit<FormFieldConfig, 'type'>>
  ): FormConfigBuilder<T> {
    return this.addField(name, 'date', options);
  }

  addFileField(
    name: keyof T,
    options?: Partial<Omit<FormFieldConfig, 'type'>>
  ): FormConfigBuilder<T> {
    return this.addField(name, 'file', options);
  }

  addArrayField(
    name: keyof T,
    options?: Partial<Omit<FormFieldConfig, 'type'>>
  ): FormConfigBuilder<T> {
    return this.addField(name, 'array', {
      ...options,
      defaultValue: options?.defaultValue ?? []
    });
  }

  addValidators(name: keyof T, validators: ValidatorFn[]): FormConfigBuilder<T> {
    if (this.config[name]) {
      const existingValidators = this.config[name]!.validators || [];
      this.config[name]!.validators = [...existingValidators, ...validators];
    }
    return this;
  }

  setDisabled(name: keyof T, disabled: boolean): FormConfigBuilder<T> {
    if (this.config[name]) {
      this.config[name]!.disabled = disabled;
    }
    return this;
  }

  setLabel(name: keyof T, label: string): FormConfigBuilder<T> {
    if (this.config[name]) {
      this.config[name]!.label = label;
    }
    return this;
  }

  setPlaceholder(name: keyof T, placeholder: string): FormConfigBuilder<T> {
    if (this.config[name]) {
      this.config[name]!.placeholder = placeholder;
    }
    return this;
  }

  setHint(name: keyof T, hint: string): FormConfigBuilder<T> {
    if (this.config[name]) {
      this.config[name]!.hint = hint;
    }
    return this;
  }

  setErrorMessages(
    name: keyof T,
    errorMessages: Record<string, string>
  ): FormConfigBuilder<T> {
    if (this.config[name]) {
      this.config[name]!.errorMessages = errorMessages;
    }
    return this;
  }

  build(): FormConfig<T> {
    return this.config as FormConfig<T>;
  }

  private getDefaultValueForType(type: FieldType): any {
    switch (type) {
      case 'string':
        return '';
      case 'number':
      case 'money':
      case 'percentage':
        return null;
      case 'boolean':
        return false;
      case 'date':
      case 'file':
        return null;
      case 'string[]':
      case 'array':
        return [];
      default:
        return null;
    }
  }
}
import { Injectable, inject } from '@angular/core';
import { FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { FormConfig } from '../interfaces/form-config.interface';
import { FormGeneratorService } from '../services/form-generator.service';
import { FormValidators } from '../validators/form-validators';
import { FormConfigBuilder } from './form-config.builder';

@Injectable({
  providedIn: 'root'
})
export class FormFactory {
  private formGenerator = inject(FormGeneratorService);

  createForm<T>(config: FormConfig<T>, data?: Partial<T>): FormGroup {
    if (data) {
      return this.formGenerator.generateFormGroupFromData(config, data);
    }
    return this.formGenerator.generateFormGroup(config);
  }

  createBuilder<T>(): FormConfigBuilder<T> {
    return new FormConfigBuilder<T>();
  }

  createLoginForm(data?: { email?: string; password?: string }): FormGroup {
    const config = new FormConfigBuilder<{ email: string; password: string }>()
      .addTextField('email', {
        validators: [Validators.required, FormValidators.strictEmail()],
        placeholder: 'user@example.com',
        label: 'Email Address',
        errorMessages: {
          required: 'Email is required',
          strictEmail: 'Invalid email format'
        }
      })
      .addTextField('password', {
        validators: [
          Validators.required,
          FormValidators.strongPassword(),
          Validators.minLength(8),
          Validators.maxLength(25)
        ],
        placeholder: 'Password',
        label: 'Password',
        errorMessages: {
          required: 'Password is required',
          strongPassword: 'Must contain uppercase, lowercase, numbers and special characters',
          minlength: 'Minimum 8 characters',
          maxlength: 'Maximum 25 characters'
        }
      })
      .build();

    return this.createForm(config, data);
  }

  createUserForm(data?: any): FormGroup {
    const config = new FormConfigBuilder<any>()
      .addTextField('firstName', {
        validators: [Validators.required, FormValidators.noWhitespace()],
        label: 'First Name',
        placeholder: 'Enter your first name'
      })
      .addTextField('lastName', {
        validators: [Validators.required, FormValidators.noWhitespace()],
        label: 'Last Name',
        placeholder: 'Enter your last name'
      })
      .addTextField('email', {
        validators: [Validators.required, FormValidators.strictEmail()],
        label: 'Email Address',
        placeholder: 'user@example.com'
      })
      .addDateField('birthDate', {
        validators: [Validators.required],
        label: 'Date of Birth'
      })
      .addBooleanField('active', {
        defaultValue: true,
        label: 'Active User'
      })
      .build();

    return this.createForm(config, data);
  }

  createProductForm(data?: any): FormGroup {
    const config = new FormConfigBuilder<any>()
      .addTextField('name', {
        validators: [Validators.required, FormValidators.noWhitespace()],
        label: 'Product Name'
      })
      .addTextField('description', {
        label: 'Description'
      })
      .addMoneyField('price', {
        validators: [
          Validators.required,
          FormValidators.minMoney(0),
          FormValidators.maxMoney(999999999)
        ],
        label: 'Price',
        placeholder: '0.00'
      })
      .addNumberField('stock', {
        validators: [Validators.required, Validators.min(0)],
        label: 'Available Stock',
        defaultValue: 0
      })
      .addPercentageField('discount', {
        validators: [FormValidators.percentage(0, 100)],
        label: 'Discount (%)',
        defaultValue: 0
      })
      .addBooleanField('available', {
        defaultValue: true,
        label: 'Available for Sale'
      })
      .build();

    return this.createForm(config, data);
  }

  createDynamicForm(fields: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'money' | 'percentage';
    label?: string;
    required?: boolean;
    validators?: ValidatorFn[];
  }>): FormGroup {
    const builder = new FormConfigBuilder<any>();

    fields.forEach(field => {
      const validators = field.validators || [];
      if (field.required) {
        validators.unshift(Validators.required);
      }

      const options = {
        validators,
        label: field.label
      };

      switch (field.type) {
        case 'string':
          builder.addTextField(field.name, options);
          break;
        case 'number':
          builder.addNumberField(field.name, options);
          break;
        case 'boolean':
          builder.addBooleanField(field.name, options);
          break;
        case 'date':
          builder.addDateField(field.name, options);
          break;
        case 'money':
          builder.addMoneyField(field.name, options);
          break;
        case 'percentage':
          builder.addPercentageField(field.name, options);
          break;
      }
    });

    return this.createForm(builder.build());
  }
}
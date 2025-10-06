import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormConfig } from '../interfaces/form-config.interface';
import { FormGeneratorService } from '../services/form-generator.service';
import { FormFactory } from '../builders/form-factory';
import { FormConfigBuilder } from '../builders/form-config.builder';
import { FormValidators } from '../validators/form-validators';

// Ejemplo 1: Uso directo con configuración
interface LoginModel {
  email: string;
  password: string;
}

export const LOGIN_FORM_CONFIG: FormConfig<LoginModel> = {
  email: {
    defaultValue: '',
    validators: [Validators.required, FormValidators.strictEmail()],
    type: 'string',
    label: 'Correo electrónico',
    placeholder: 'correo@ejemplo.com',
    errorMessages: {
      required: 'El correo es requerido',
      strictEmail: 'Formato de correo inválido'
    }
  },
  password: {
    defaultValue: '',
    validators: [
      Validators.required,
      FormValidators.strongPassword(),
      Validators.minLength(12),
      Validators.maxLength(25)
    ],
    type: 'string',
    label: 'Contraseña',
    placeholder: 'Ingrese su contraseña',
    errorMessages: {
      required: 'La contraseña es requerida',
      strongPassword: 'Debe contener mayúsculas, minúsculas, números y caracteres especiales',
      minlength: 'Mínimo 12 caracteres',
      maxlength: 'Máximo 25 caracteres'
    }
  }
};

@Component({
  selector: 'cc-login-example',
  template: `
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      @for (field of formFields; track field) {
        <div>
          <label>{{ getFieldConfig(field).label }}</label>
          <input
            [formControlName]="field"
            [placeholder]="getFieldConfig(field).placeholder"
          />
          @if (loginForm.get(field)?.invalid && loginForm.get(field)?.touched) {
            <span class="error">{{ getFieldError(field) }}</span>
          }
        </div>
      }
      <button type="submit" [disabled]="loginForm.invalid">
        Iniciar sesión
      </button>
      @if (hasChanges()) {
        <span>Hay cambios sin guardar</span>
      }
    </form>
  `,
  standalone: true,
  imports: [ReactiveFormsModule]
})
export class LoginExampleComponent implements OnInit {
  private formGenerator = inject(FormGeneratorService);

  loginForm!: FormGroup;
  formFields = ['email', 'password'];
  hasChanges!: any;

  ngOnInit() {
    this.loginForm = this.formGenerator.generateFormGroup(LOGIN_FORM_CONFIG);
    this.hasChanges = this.formGenerator.getHasChanges(this.loginForm);
  }

  getFieldConfig(field: string) {
    return LOGIN_FORM_CONFIG[field as keyof LoginModel];
  }

  getFieldError(field: string): string {
    const errors = this.formGenerator.getFormValidationErrors(this.loginForm);
    return errors[field] || '';
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const values = this.formGenerator.getTypedFormValues(
        this.loginForm,
        LOGIN_FORM_CONFIG
      );
      console.log('Form values:', values);

      // Reset form state after successful submission
      this.formGenerator.resetFormState(this.loginForm);
    }
  }
}

// Ejemplo 2: Uso con FormBuilder
@Component({
  selector: 'app-product-example',
  template: `...`,
  standalone: true,
  imports: [ReactiveFormsModule]
})
export class ProductExampleComponent implements OnInit {
  private formFactory = inject(FormFactory);

  productForm!: FormGroup;

  ngOnInit() {
    // Opción 1: Usar form predefinido
    this.productForm = this.formFactory.createProductForm();

    // Opción 2: Usar builder personalizado
    const config = new FormConfigBuilder<any>()
      .addTextField('name', {
        validators: [Validators.required],
        label: 'Nombre del producto'
      })
      .addMoneyField('price', {
        validators: [Validators.required, FormValidators.minMoney(0)],
        label: 'Precio'
      })
      .addPercentageField('discount', {
        validators: [FormValidators.percentage(0, 50)],
        label: 'Descuento',
        defaultValue: 0
      })
      .addBooleanField('available', {
        defaultValue: true,
        label: 'Disponible'
      })
      .build();

    this.productForm = this.formFactory.createForm(config);

    // Cargar datos existentes
    const existingProduct = {
      name: 'Laptop',
      price: 1500000,
      discount: 10,
      available: true
    };

    this.productForm = this.formFactory.createForm(config, existingProduct);
  }
}

// Ejemplo 3: Formulario dinámico
@Component({
  selector: 'app-dynamic-example',
  template: `...`,
  standalone: true,
  imports: [ReactiveFormsModule]
})
export class DynamicFormExampleComponent implements OnInit {
  private formFactory = inject(FormFactory);

  dynamicForm!: FormGroup;

  ngOnInit() {
    // Campos dinámicos desde el backend o configuración
    const fields = [
      { name: 'firstName', type: 'string' as const, label: 'Nombre', required: true },
      { name: 'lastName', type: 'string' as const, label: 'Apellido', required: true },
      { name: 'age', type: 'number' as const, label: 'Edad', validators: [Validators.min(18)] },
      { name: 'salary', type: 'money' as const, label: 'Salario' },
      { name: 'birthDate', type: 'date' as const, label: 'Fecha de nacimiento' },
      { name: 'active', type: 'boolean' as const, label: 'Activo' }
    ];

    this.dynamicForm = this.formFactory.createDynamicForm(fields);
  }
}

// Ejemplo 4: Uso con múltiples formularios
@Component({
  selector: 'app-multi-form-example',
  template: `...`,
  standalone: true,
  imports: [ReactiveFormsModule]
})
export class MultiFormExampleComponent implements OnInit {
  private formGenerator = inject(FormGeneratorService);

  personalForm!: FormGroup;
  addressForm!: FormGroup;

  ngOnInit() {
    const personalConfig: FormConfig<any> = {
      firstName: { type: 'string', defaultValue: '', validators: [Validators.required] },
      lastName: { type: 'string', defaultValue: '', validators: [Validators.required] },
      email: { type: 'string', defaultValue: '', validators: [FormValidators.strictEmail()] }
    };

    const addressConfig: FormConfig<any> = {
      street: { type: 'string', defaultValue: '' },
      city: { type: 'string', defaultValue: '' },
      zipCode: { type: 'string', defaultValue: '', validators: [FormValidators.numericOnly()] }
    };

    this.personalForm = this.formGenerator.generateFormGroup(personalConfig);
    this.addressForm = this.formGenerator.generateFormGroup(addressConfig);

    // Cargar datos en múltiples formularios
    const userData = {
      personal: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
      address: { street: '123 Main St', city: 'New York', zipCode: '10001' }
    };

    this.formGenerator.setFormValues(this.personalForm, userData.personal, personalConfig);
    this.formGenerator.setFormValues(this.addressForm, userData.address, addressConfig);
  }

  saveAll() {
    if (this.personalForm.valid && this.addressForm.valid) {
      const personalData = this.formGenerator.getTypedFormValues(this.personalForm, {} as any);
      const addressData = this.formGenerator.getTypedFormValues(this.addressForm, {} as any);

      console.log('Personal:', personalData);
      console.log('Address:', addressData);
    }
  }
}

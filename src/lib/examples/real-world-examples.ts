import { Component, OnInit, inject, WritableSignal, signal } from '@angular/core';
import { FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormConfig } from '../interfaces/form-config.interface';
import { FormGeneratorService } from '../services/form-generator.service';
import { FormValidators } from '../validators/form-validators';

// =========================================
// EXAMPLE 1: User Registration Form
// =========================================

interface UserRegistration {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: Date;
  phone: string;
  acceptTerms: boolean;
}

export const USER_REGISTRATION_CONFIG: FormConfig<UserRegistration> = {
  firstName: {
    type: 'string',
    defaultValue: '',
    validators: [Validators.required, Validators.minLength(2)],
    label: 'First Name',
    placeholder: 'Enter your first name',
    errorMessages: {
      required: 'First name is required',
      minlength: 'First name must be at least 2 characters'
    }
  },
  lastName: {
    type: 'string',
    defaultValue: '',
    validators: [Validators.required, Validators.minLength(2)],
    label: 'Last Name',
    placeholder: 'Enter your last name',
    errorMessages: {
      required: 'Last name is required',
      minlength: 'Last name must be at least 2 characters'
    }
  },
  email: {
    type: 'string',
    defaultValue: '',
    validators: [Validators.required, FormValidators.strictEmail()],
    label: 'Email Address',
    placeholder: 'user@example.com',
    errorMessages: {
      required: 'Email is required',
      strictEmail: 'Please enter a valid email address'
    }
  },
  password: {
    type: 'string',
    defaultValue: '',
    validators: [
      Validators.required,
      FormValidators.strongPassword(),
      Validators.minLength(8)
    ],
    label: 'Password',
    placeholder: 'Create a strong password',
    errorMessages: {
      required: 'Password is required',
      strongPassword: 'Password must contain uppercase, lowercase, numbers and special characters',
      minlength: 'Password must be at least 8 characters long'
    }
  },
  confirmPassword: {
    type: 'string',
    defaultValue: '',
    validators: [Validators.required],
    label: 'Confirm Password',
    placeholder: 'Confirm your password',
    errorMessages: {
      required: 'Password confirmation is required',
      passwordMismatch: 'Passwords do not match'
    }
  },
  birthDate: {
    type: 'date',
    defaultValue: null,
    validators: [Validators.required],
    label: 'Date of Birth',
    errorMessages: {
      required: 'Date of birth is required'
    }
  },
  phone: {
    type: 'string',
    defaultValue: '',
    validators: [FormValidators.numericOnly(), Validators.minLength(10)],
    label: 'Phone Number',
    placeholder: '1234567890',
    errorMessages: {
      numericOnly: 'Phone number must contain only numbers',
      minlength: 'Phone number must be at least 10 digits'
    }
  },
  acceptTerms: {
    type: 'boolean',
    defaultValue: false,
    validators: [Validators.requiredTrue],
    label: 'I accept the Terms and Conditions',
    errorMessages: {
      required: 'You must accept the terms and conditions'
    }
  }
};

@Component({
  selector: 'cc-user-registration',
  template: `
    <div class="registration-form">
      <h2>User Registration</h2>
      
      <form [formGroup]="registrationForm" (ngSubmit)="onSubmit()">
        
        <!-- Personal Information -->
        <fieldset>
          <legend>Personal Information</legend>
          
          <div class="form-row">
            <div class="form-field">
              <label for="firstName">{{ getFieldConfig('firstName')?.label }}</label>
              <input
                id="firstName"
                type="text"
                formControlName="firstName"
                [placeholder]="getFieldConfig('firstName')?.placeholder"
                [class.error]="registrationForm.get('firstName')?.invalid && registrationForm.get('firstName')?.touched"
              />
              @if (registrationForm.get('firstName')?.invalid && registrationForm.get('firstName')?.touched) {
                <span class="error-message">{{ getFieldError('firstName') }}</span>
              }
            </div>
            
            <div class="form-field">
              <label for="lastName">{{ getFieldConfig('lastName')?.label }}</label>
              <input
                id="lastName"
                type="text"
                formControlName="lastName"
                [placeholder]="getFieldConfig('lastName')?.placeholder"
                [class.error]="registrationForm.get('lastName')?.invalid && registrationForm.get('lastName')?.touched"
              />
              @if (registrationForm.get('lastName')?.invalid && registrationForm.get('lastName')?.touched) {
                <span class="error-message">{{ getFieldError('lastName') }}</span>
              }
            </div>
          </div>
          
          <div class="form-field">
            <label for="birthDate">{{ getFieldConfig('birthDate')?.label }}</label>
            <input
              id="birthDate"
              type="date"
              formControlName="birthDate"
              [class.error]="registrationForm.get('birthDate')?.invalid && registrationForm.get('birthDate')?.touched"
            />
            @if (registrationForm.get('birthDate')?.invalid && registrationForm.get('birthDate')?.touched) {
              <span class="error-message">{{ getFieldError('birthDate') }}</span>
            }
          </div>
        </fieldset>
        
        <!-- Contact Information -->
        <fieldset>
          <legend>Contact Information</legend>
          
          <div class="form-field">
            <label for="email">{{ getFieldConfig('email')?.label }}</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              [placeholder]="getFieldConfig('email')?.placeholder"
              [class.error]="registrationForm.get('email')?.invalid && registrationForm.get('email')?.touched"
            />
            @if (registrationForm.get('email')?.invalid && registrationForm.get('email')?.touched) {
              <span class="error-message">{{ getFieldError('email') }}</span>
            }
          </div>
          
          <div class="form-field">
            <label for="phone">{{ getFieldConfig('phone')?.label }}</label>
            <input
              id="phone"
              type="tel"
              formControlName="phone"
              [placeholder]="getFieldConfig('phone')?.placeholder"
              [class.error]="registrationForm.get('phone')?.invalid && registrationForm.get('phone')?.touched"
            />
            @if (registrationForm.get('phone')?.invalid && registrationForm.get('phone')?.touched) {
              <span class="error-message">{{ getFieldError('phone') }}</span>
            }
          </div>
        </fieldset>
        
        <!-- Security -->
        <fieldset>
          <legend>Security</legend>
          
          <div class="form-field">
            <label for="password">{{ getFieldConfig('password')?.label }}</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              [placeholder]="getFieldConfig('password')?.placeholder"
              [class.error]="registrationForm.get('password')?.invalid && registrationForm.get('password')?.touched"
            />
            @if (registrationForm.get('password')?.invalid && registrationForm.get('password')?.touched) {
              <span class="error-message">{{ getFieldError('password') }}</span>
            }
          </div>
          
          <div class="form-field">
            <label for="confirmPassword">{{ getFieldConfig('confirmPassword')?.label }}</label>
            <input
              id="confirmPassword"
              type="password"
              formControlName="confirmPassword"
              [placeholder]="getFieldConfig('confirmPassword')?.placeholder"
              [class.error]="registrationForm.get('confirmPassword')?.invalid && registrationForm.get('confirmPassword')?.touched"
            />
            @if (registrationForm.get('confirmPassword')?.invalid && registrationForm.get('confirmPassword')?.touched) {
              <span class="error-message">{{ getFieldError('confirmPassword') }}</span>
            }
          </div>
        </fieldset>
        
        <!-- Terms and Conditions -->
        <div class="form-field">
          <label class="checkbox-label">
            <input
              type="checkbox"
              formControlName="acceptTerms"
              [class.error]="registrationForm.get('acceptTerms')?.invalid && registrationForm.get('acceptTerms')?.touched"
            />
            {{ getFieldConfig('acceptTerms')?.label }}
          </label>
          @if (registrationForm.get('acceptTerms')?.invalid && registrationForm.get('acceptTerms')?.touched) {
            <span class="error-message">{{ getFieldError('acceptTerms') }}</span>
          }
        </div>
        
        <!-- Form Status -->
        <div class="form-status">
          @if (hasChanges()) {
            <div class="status-message warning">
              <span>⚠️ You have unsaved changes</span>
            </div>
          }
          @if (isSubmitting()) {
            <div class="status-message info">
              <span>🔄 Creating your account...</span>
            </div>
          }
        </div>
        
        <!-- Actions -->
        <div class="form-actions">
          <button 
            type="button" 
            class="btn btn-secondary"
            (click)="clearForm()"
            [disabled]="isSubmitting()"
          >
            Clear Form
          </button>
          
          <button 
            type="submit" 
            class="btn btn-primary"
            [disabled]="registrationForm.invalid || isSubmitting()"
          >
            @if (isSubmitting()) {
              <span>Creating Account...</span>
            } @else {
              <span>Create Account</span>
            }
          </button>
        </div>
        
        <!-- Debug Information (Development Only) -->
        <details class="debug-info">
          <summary>Form Debug Info</summary>
          <div>
            <p><strong>Form Valid:</strong> {{ registrationForm.valid }}</p>
            <p><strong>Form Touched:</strong> {{ registrationForm.touched }}</p>
            <p><strong>Has Changes:</strong> {{ hasChanges() }}</p>
            <p><strong>Form Values:</strong></p>
            <pre>{{ registrationForm.value | json }}</pre>
          </div>
        </details>
        
      </form>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styles: [`
    .registration-form {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    
    fieldset {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
    }
    
    legend {
      font-weight: bold;
      padding: 0 10px;
    }
    
    .form-row {
      display: flex;
      gap: 15px;
    }
    
    .form-field {
      margin-bottom: 15px;
      flex: 1;
    }
    
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
    }
    
    input[type="text"], input[type="email"], input[type="tel"], 
    input[type="password"], input[type="date"] {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    
    input.error {
      border-color: #dc3545;
    }
    
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .checkbox-label input[type="checkbox"] {
      width: auto;
    }
    
    .error-message {
      color: #dc3545;
      font-size: 12px;
      margin-top: 5px;
      display: block;
    }
    
    .form-status {
      margin: 20px 0;
    }
    
    .status-message {
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    
    .status-message.warning {
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      color: #856404;
    }
    
    .status-message.info {
      background-color: #d1ecf1;
      border: 1px solid #bee5eb;
      color: #0c5460;
    }
    
    .form-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 20px;
    }
    
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s;
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .btn-primary {
      background-color: #007bff;
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background-color: #0056b3;
    }
    
    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }
    
    .btn-secondary:hover:not(:disabled) {
      background-color: #545b62;
    }
    
    .debug-info {
      margin-top: 30px;
      border: 1px solid #ddd;
      padding: 15px;
      border-radius: 4px;
      font-size: 12px;
    }
    
    .debug-info pre {
      background-color: #f8f9fa;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }
  `]
})
export class UserRegistrationComponent implements OnInit {
  private formGenerator = inject(FormGeneratorService);

  registrationForm!: FormGroup;
  hasChanges!: WritableSignal<boolean>;
  isSubmitting = signal(false);

  ngOnInit() {
    // Generate form with configuration
    this.registrationForm = this.formGenerator.generateFormGroup(USER_REGISTRATION_CONFIG);
    
    // Get change tracking signal
    this.hasChanges = this.formGenerator.getHasChanges(this.registrationForm);
    
    // Add custom validator for password confirmation
    this.addPasswordMatchValidator();
  }

  private addPasswordMatchValidator() {
    const passwordControl = this.registrationForm.get('password');
    const confirmPasswordControl = this.registrationForm.get('confirmPassword');
    
    if (passwordControl && confirmPasswordControl) {
      confirmPasswordControl.addValidators((control) => {
        if (control.value !== passwordControl.value) {
          return { passwordMismatch: true };
        }
        return null;
      });
      
      // Update confirmation field when password changes
      passwordControl.valueChanges.subscribe(() => {
        if (confirmPasswordControl.value) {
          confirmPasswordControl.updateValueAndValidity();
        }
      });
    }
  }

  getFieldConfig(fieldName: keyof UserRegistration) {
    return USER_REGISTRATION_CONFIG[fieldName];
  }

  getFieldError(fieldName: string): string {
    const errors = this.formGenerator.getFormValidationErrors(
      this.registrationForm, 
      USER_REGISTRATION_CONFIG
    );
    return errors[fieldName] || '';
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      this.isSubmitting.set(true);
      
      // Get typed form values
      const userData = this.formGenerator.getTypedFormValues(
        this.registrationForm,
        USER_REGISTRATION_CONFIG
      );
      
      // Simulate API call
      this.simulateRegistration(userData);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.registrationForm.controls).forEach(key => {
        this.registrationForm.get(key)?.markAsTouched();
      });
    }
  }

  clearForm() {
    this.registrationForm.reset();
    
    // Reset to default values
    Object.keys(USER_REGISTRATION_CONFIG).forEach(key => {
      const control = this.registrationForm.get(key);
      const config = USER_REGISTRATION_CONFIG[key as keyof UserRegistration];
      if (control && config) {
        control.setValue(config.defaultValue);
      }
    });
    
    // Reset form state
    this.formGenerator.resetFormState(this.registrationForm);
  }

  private simulateRegistration(userData: UserRegistration) {
    console.log('Registration data:', userData);
    
    setTimeout(() => {
      alert('Account created successfully!');
      this.formGenerator.resetFormState(this.registrationForm);
      this.isSubmitting.set(false);
    }, 2000);
  }
}

// =========================================
// EXAMPLE 2: Product Management Form
// =========================================

interface Product {
  name: string;
  description: string;
  price: number;
  discount: number;
  category: string;
  inStock: boolean;
  tags: string;
}

export const PRODUCT_FORM_CONFIG: FormConfig<Product> = {
  name: {
    type: 'string',
    defaultValue: '',
    validators: [Validators.required, Validators.minLength(3)],
    label: 'Product Name',
    placeholder: 'Enter product name',
    errorMessages: {
      required: 'Product name is required',
      minlength: 'Product name must be at least 3 characters'
    }
  },
  description: {
    type: 'string',
    defaultValue: '',
    validators: [Validators.maxLength(500)],
    label: 'Description',
    placeholder: 'Describe your product...',
    errorMessages: {
      maxlength: 'Description cannot exceed 500 characters'
    }
  },
  price: {
    type: 'money',
    defaultValue: 0,
    validators: [Validators.required, Validators.min(0.01)],
    label: 'Price',
    placeholder: '0.00',
    errorMessages: {
      required: 'Price is required',
      min: 'Price must be greater than 0'
    }
  },
  discount: {
    type: 'percentage',
    defaultValue: 0,
    validators: [Validators.min(0), Validators.max(100)],
    label: 'Discount (%)',
    placeholder: '0',
    errorMessages: {
      min: 'Discount cannot be negative',
      max: 'Discount cannot exceed 100%'
    }
  },
  category: {
    type: 'string',
    defaultValue: '',
    validators: [Validators.required],
    label: 'Category',
    errorMessages: {
      required: 'Please select a category'
    }
  },
  inStock: {
    type: 'boolean',
    defaultValue: true,
    label: 'In Stock'
  },
  tags: {
    type: 'string',
    defaultValue: '',
    label: 'Tags',
    placeholder: 'Separate tags with commas'
  }
};

// =========================================
// HOW TO USE THE LIBRARY - QUICK GUIDE
// =========================================

/*
BASIC USAGE:

1. Install the library:
   npm install cc-form-engine

2. Import in your module or standalone component:
   import { FormGeneratorService, FormConfig } from 'cc-form-engine';

3. Define your form interface and configuration:
   interface MyForm {
     name: string;
     email: string;
   }
   
   const CONFIG: FormConfig<MyForm> = {
     name: {
       type: 'string',
       defaultValue: '',
       validators: [Validators.required],
       label: 'Full Name'
     },
     email: {
       type: 'string', 
       defaultValue: '',
       validators: [Validators.required, Validators.email],
       label: 'Email'
     }
   };

4. Use in your component:
   @Component({...})
   export class MyComponent implements OnInit {
     private formGenerator = inject(FormGeneratorService);
     
     myForm!: FormGroup;
     hasChanges!: WritableSignal<boolean>;
     
     ngOnInit() {
       this.myForm = this.formGenerator.generateFormGroup(CONFIG);
       this.hasChanges = this.formGenerator.getHasChanges(this.myForm);
     }
     
     onSubmit() {
       if (this.myForm.valid) {
         const data = this.formGenerator.getTypedFormValues(this.myForm, CONFIG);
         console.log('Form data:', data);
       }
     }
   }

FEATURES:
- ✅ Automatic form generation from configuration
- ✅ Type-safe form values
- ✅ Built-in validation with custom error messages  
- ✅ Change tracking with signals
- ✅ Support for different field types (string, number, date, boolean, money, percentage)
- ✅ Custom validators
- ✅ Form state management (reset, pristine, etc.)
- ✅ Multiple locale support
- ✅ Customizable error messages per field
*/
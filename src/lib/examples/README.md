# CC Form Engine - Usage Examples

This directory contains practical examples of how to use the CC Form Engine library in real-world scenarios.

## Quick Start

```bash
npm install cc-form-engine
```

## Basic Example

```typescript
import { Component, OnInit, inject, WritableSignal } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { FormGeneratorService, FormConfig } from 'cc-form-engine';

interface LoginForm {
  email: string;
  password: string;
}

const LOGIN_CONFIG: FormConfig<LoginForm> = {
  email: {
    type: 'string',
    defaultValue: '',
    validators: [Validators.required, Validators.email],
    label: 'Email',
    placeholder: 'user@example.com',
    errorMessages: {
      required: 'Email is required',
      email: 'Please enter a valid email'
    }
  },
  password: {
    type: 'string',
    defaultValue: '',
    validators: [Validators.required, Validators.minLength(8)],
    label: 'Password',
    errorMessages: {
      required: 'Password is required',
      minlength: 'Password must be at least 8 characters'
    }
  }
};

@Component({
  selector: 'app-login',
  template: `
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      @for (field of ['email', 'password']; track field) {
        <div class="form-field">
          <label>{{ getFieldConfig(field).label }}</label>
          <input 
            [formControlName]="field"
            [placeholder]="getFieldConfig(field).placeholder"
            [type]="field === 'password' ? 'password' : 'text'"
            [class.error]="loginForm.get(field)?.invalid && loginForm.get(field)?.touched"
          />
          @if (loginForm.get(field)?.invalid && loginForm.get(field)?.touched) {
            <span class="error">{{ getFieldError(field) }}</span>
          }
        </div>
      }
      
      @if (hasChanges()) {
        <div class="changes-indicator">You have unsaved changes</div>
      }
      
      <button 
        type="submit" 
        [disabled]="loginForm.invalid"
      >
        Login
      </button>
    </form>
  `,
  standalone: true,
  imports: [ReactiveFormsModule]
})
export class LoginComponent implements OnInit {
  private formGenerator = inject(FormGeneratorService);
  
  loginForm!: FormGroup;
  hasChanges!: WritableSignal<boolean>;
  
  ngOnInit() {
    this.loginForm = this.formGenerator.generateFormGroup(LOGIN_CONFIG);
    this.hasChanges = this.formGenerator.getHasChanges(this.loginForm);
  }
  
  getFieldConfig(field: string) {
    return LOGIN_CONFIG[field as keyof LoginForm];
  }
  
  getFieldError(field: string): string {
    const errors = this.formGenerator.getFormValidationErrors(this.loginForm, LOGIN_CONFIG);
    return errors[field] || '';
  }
  
  onSubmit() {
    if (this.loginForm.valid) {
      const data = this.formGenerator.getTypedFormValues(this.loginForm, LOGIN_CONFIG);
      console.log('Login data:', data);
      
      // Reset form state after successful submission
      this.formGenerator.resetFormState(this.loginForm);
    }
  }
}
```

## Key Features Demonstrated

### 1. Type Safety ✅
- The `getTypedFormValues` method returns exactly the `LoginForm` interface
- No manual casting or type assertions needed
- Full IntelliSense support

### 2. Change Tracking with `hasChanges()` ✅
The `hasChanges()` signal is a powerful feature that automatically tracks when form values differ from their initial state.

#### How it works:
1. **Initial State**: When form is created, `hasChanges()` returns `false`
2. **User Modifies**: When any field is changed, `hasChanges()` becomes `true`
3. **Revert Changes**: If user returns values to original state, `hasChanges()` becomes `false` again
4. **After Save/Reset**: When you call `resetFormState()`, it updates the baseline and `hasChanges()` becomes `false`

#### Practical Example:
```typescript
// Initial form load
this.myForm = this.formGenerator.generateFormGroup(CONFIG);
this.hasChanges = this.formGenerator.getHasChanges(this.myForm);
console.log(this.hasChanges()); // false - no changes yet

// User types "John" in name field
// hasChanges() immediately becomes true

// User deletes "John" and field becomes empty again (original state)
// hasChanges() automatically becomes false

// User types "Jane" 
// hasChanges() becomes true again
```

#### Common Use Cases:
```html
<!-- Save button that only enables when there are changes -->
<button 
  type="button"
  [disabled]="!hasChanges() || myForm.invalid"
  (click)="saveChanges()"
>
  Save Changes
</button>

<!-- Warning message for unsaved changes -->
@if (hasChanges()) {
  <div class="warning">
    ⚠️ You have unsaved changes. Save before leaving.
  </div>
}

<!-- Navigation guard -->
canDeactivate(): boolean {
  if (this.hasChanges()) {
    return confirm('You have unsaved changes. Are you sure you want to leave?');
  }
  return true;
}
```

### 3. Custom Error Messages ✅
- Define custom error messages per field in the configuration
- Messages are automatically shown based on validation state
- Supports all Angular validators and custom validators

### 4. Modern Angular Patterns ✅
- Uses `inject()` instead of constructor injection
- Signals for reactive state management
- New control flow syntax (`@if`, `@for`)
- Standalone components

## Available Examples

1. **`real-world-examples.ts`** - Complete user registration form with:
   - Multiple fieldsets (Personal, Contact, Security)
   - Password confirmation validation
   - Custom styling
   - Loading states
   - Form debug information

2. **`usage-example.ts`** - Various usage patterns:
   - Direct form generation
   - FormFactory usage
   - Dynamic forms
   - Multi-form management

3. **`configuration-examples.ts`** - Provider configurations:
   - Country-specific setups
   - Custom locales
   - Error message customization

## Supported Field Types

- `string` - Text inputs
- `number` - Numeric inputs  
- `money` - Currency formatting
- `percentage` - Percentage values
- `date` - Date picker
- `boolean` - Checkboxes
- `email` - Email validation

## Built-in Validators

```typescript
import { FormValidators } from 'cc-form-engine';

// Available validators:
FormValidators.strictEmail()        // Strict email validation
FormValidators.strongPassword()     // Strong password requirements
FormValidators.numericOnly()        // Numbers only
FormValidators.minMoney(amount)     // Minimum money amount
FormValidators.maxMoney(amount)     // Maximum money amount
FormValidators.percentage(min, max) // Percentage range
```

## Understanding `hasChanges()` - Step by Step Example

Here's a complete example showing exactly how `hasChanges()` works in a real editing scenario:

```typescript
@Component({
  selector: 'app-edit-user',
  template: `
    <h3>Edit User Profile</h3>
    
    <form [formGroup]="userForm">
      <div>
        <label>Name:</label>
        <input formControlName="name" placeholder="Enter name">
      </div>
      
      <div>
        <label>Email:</label>
        <input formControlName="email" placeholder="Enter email">
      </div>
      
      <!-- This button shows the key functionality -->
      <div class="actions">
        <button 
          type="button"
          [disabled]="!hasChanges() || userForm.invalid"
          (click)="saveChanges()"
          class="save-btn"
        >
          💾 Save Changes
        </button>
        
        <button 
          type="button"
          (click)="loadSampleData()"
          class="load-btn"
        >
          📝 Load Sample Data
        </button>
      </div>
      
      <!-- Real-time status display -->
      <div class="status">
        <p><strong>Has Changes:</strong> {{ hasChanges() ? 'YES' : 'NO' }}</p>
        <p><strong>Form Valid:</strong> {{ userForm.valid ? 'YES' : 'NO' }}</p>
        <p><strong>Button Enabled:</strong> {{ (hasChanges() && userForm.valid) ? 'YES' : 'NO' }}</p>
      </div>
    </form>
  `,
  standalone: true,
  imports: [ReactiveFormsModule]
})
export class EditUserComponent implements OnInit {
  private formGenerator = inject(FormGeneratorService);
  
  userForm!: FormGroup;
  hasChanges!: WritableSignal<boolean>;
  
  ngOnInit() {
    // Step 1: Create form
    this.userForm = this.formGenerator.generateFormGroup(USER_CONFIG);
    this.hasChanges = this.formGenerator.getHasChanges(this.userForm);
    // hasChanges() = false (no changes yet)
    
    // Step 2: Load existing user data (simulate loading from API)
    const existingUser = {
      name: 'John Doe',
      email: 'john@example.com'
    };
    
    this.formGenerator.setFormValues(this.userForm, existingUser, USER_CONFIG);
    // hasChanges() = false (this becomes the new baseline)
  }
  
  loadSampleData() {
    // This simulates clicking "Load Sample Data" button
    const sampleData = {
      name: 'Jane Smith',
      email: 'jane@example.com'
    };
    
    this.formGenerator.setFormValues(this.userForm, sampleData, USER_CONFIG);
    // hasChanges() = false (new baseline set)
    // Save button is DISABLED (no changes from new baseline)
  }
  
  saveChanges() {
    if (this.userForm.valid && this.hasChanges()) {
      const userData = this.formGenerator.getTypedFormValues(this.userForm, USER_CONFIG);
      console.log('Saving:', userData);
      
      // Simulate API call
      setTimeout(() => {
        // After successful save, reset the baseline
        this.formGenerator.resetFormState(this.userForm);
        // hasChanges() = false (changes saved, new baseline set)
        // Save button becomes DISABLED again
        
        alert('Changes saved successfully!');
      }, 1000);
    }
  }
}
```

### Real-World Scenario Flow:

1. **📱 Page Loads**: 
   - Form shows: Name: "John Doe", Email: "john@example.com"
   - `hasChanges()` = `false`
   - Save button = **DISABLED**

2. **✏️ User Types**: User changes name to "John Smith"
   - `hasChanges()` = `true` (immediately)
   - Save button = **ENABLED**

3. **↩️ User Reverts**: User deletes "Smith" and types "Doe" again
   - `hasChanges()` = `false` (back to original)
   - Save button = **DISABLED**

4. **📝 Load Sample Data**: User clicks "Load Sample Data"
   - Form now shows: Name: "Jane Smith", Email: "jane@example.com"  
   - `hasChanges()` = `false` (new baseline)
   - Save button = **DISABLED**

5. **✏️ Edit Sample**: User changes email to "jane.smith@example.com"
   - `hasChanges()` = `true`
   - Save button = **ENABLED**

6. **💾 Save**: User clicks "Save Changes"
   - Data is saved
   - `resetFormState()` is called
   - `hasChanges()` = `false`
   - Save button = **DISABLED**

### Key Benefits:

- ✅ **Smart Detection**: Knows the difference between "changed" and "different from original"
- ✅ **No False Positives**: Loading new data doesn't trigger "unsaved changes"  
- ✅ **Automatic Reversion**: If user undoes changes, button disables automatically
- ✅ **Perfect for Edit Forms**: Ideal for edit scenarios where you load existing data

### Visual Flow Diagram:

```
📱 Form Load          →  hasChanges() = false  →  Save Button: DISABLED
   ↓ (load existing data)
   
📄 Data Loaded        →  hasChanges() = false  →  Save Button: DISABLED  
   ↓ (user types)
   
✏️ User Edits         →  hasChanges() = true   →  Save Button: ENABLED
   ↓ (user reverts)
   
↩️ Back to Original   →  hasChanges() = false  →  Save Button: DISABLED
   ↓ (user edits again)
   
✏️ User Edits Again   →  hasChanges() = true   →  Save Button: ENABLED
   ↓ (user saves)
   
💾 Save & Reset       →  hasChanges() = false  →  Save Button: DISABLED
```

### Why This Matters:

**Without `hasChanges()`:**
```html
<!-- Basic approach - always enabled when valid -->
<button [disabled]="userForm.invalid">Save</button>
<!-- Problems: Users might click "Save" even when nothing changed -->
```

**With `hasChanges()`:**
```html
<!-- Smart approach - only enabled when there are actual changes -->
<button [disabled]="!hasChanges() || userForm.invalid">Save Changes</button>
<!-- Benefits: Better UX, prevents unnecessary API calls, clear user feedback -->
```

## Advanced Usage

### Loading Data into Forms

```typescript
// Create form with existing data
const existingUser = {
  email: 'user@example.com',
  password: ''
};

this.loginForm = this.formGenerator.generateFormGroupFromData(LOGIN_CONFIG, existingUser);
```

### Resetting Form State

```typescript
// Reset form to initial state
this.formGenerator.resetFormState(this.loginForm);

// Reset and clear all values
this.loginForm.reset();
```

### Multiple Forms Management

```typescript
const personalForm = this.formGenerator.generateFormGroup(PERSONAL_CONFIG);
const addressForm = this.formGenerator.generateFormGroup(ADDRESS_CONFIG);

// Each form has independent change tracking
const personalChanges = this.formGenerator.getHasChanges(personalForm);
const addressChanges = this.formGenerator.getHasChanges(addressForm);
```

## Form Configuration Options

```typescript
interface FieldConfig {
  type: 'string' | 'number' | 'boolean' | 'date' | 'money' | 'percentage';
  defaultValue: any;
  validators?: ValidatorFn[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  errorMessages?: { [key: string]: string };
}
```

## Best Practices

1. **Define Types First** - Always create TypeScript interfaces for your forms
2. **Use Descriptive Error Messages** - Customize error messages for better UX
3. **Leverage Change Tracking** - Use `hasChanges()` for unsaved changes warnings
4. **Reset Form State** - Always reset after successful submissions
5. **Group Related Fields** - Use fieldsets for better organization

## Need Help?

Check the complete examples in this directory or visit our [GitHub repository](https://github.com/ChristianCruzArango/cc-form-engine) for more documentation and community support.

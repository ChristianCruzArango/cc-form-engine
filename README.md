# CC Form Engine

## Stop Writing Repetitive Form Code! Create Complete Forms with Just One Line!

Transform this 50+ line nightmare:
```typescript
// Traditional Angular Forms - SO MUCH CODE!
this.userForm = this.fb.group({
  firstName: ['', [Validators.required, Validators.minLength(2)]],
  lastName: ['', [Validators.required, Validators.minLength(2)]],
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(8)]],
  confirmPassword: ['', Validators.required],
  birthDate: ['', Validators.required],
  acceptTerms: [false, Validators.requiredTrue]
});

// Add custom validators manually
this.userForm.get('confirmPassword')?.addValidators(...);
// Handle change tracking manually  
this.userForm.valueChanges.subscribe(...);
// Create custom error handling
this.getErrorMessage = (field) => { /* complex logic */ };
```

Into this **ONE LINE** of pure magic:
```typescript
// CC Form Engine - ONE LINE CREATES EVERYTHING!
this.userForm = this.formGenerator.generateFormGroup(USER_CONFIG);
// Validation? Done! Error messages? Done! Change tracking? Done!
```

[![npm version](https://badge.fury.io/js/cc-form-engine.svg)](https://badge.fury.io/js/cc-form-engine)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Angular](https://img.shields.io/badge/Angular-19%2B-red)](https://angular.io/)

---

## Why Developers Are Going Crazy Over This Library

### **ONE LINE = COMPLETE FORM**
Create fully validated forms with change tracking, error messages, and type safety in just one line!

### **BULLETPROOF TYPE SAFETY**
Your model interface **IS** your form validation. TypeScript errors if your config doesn't match your model perfectly!

### **SMART CHANGE DETECTION**
The `hasChanges()` signal knows the difference between "user typed something" vs "actually changed from original". No more false positives!

### **ZERO CONFIGURATION INTERNATIONALIZATION**
Works perfectly in Colombia, USA, Canada, Mexico, Brazil, and more - with proper currency formatting and translated messages!

### **WORKS WITH YOUR EXISTING CODE**
Drop it into any Angular project. No breaking changes. Your existing forms still work!

---

## Installation & 30-Second Setup

```bash
npm install cc-form-engine
```

**That's it!** No complex setup, no breaking changes to your existing code!

---

## Real-World Example: User Registration in 10 Lines!

```typescript
// Define your model (you probably already have this!)
interface User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Create config that matches your model EXACTLY
const USER_CONFIG: FormConfig<User> = {
  firstName: { type: 'string', defaultValue: '', validators: [Validators.required] },
  lastName: { type: 'string', defaultValue: '', validators: [Validators.required] },
  email: { type: 'string', defaultValue: '', validators: [Validators.required, Validators.email] },
  password: { type: 'string', defaultValue: '', validators: [Validators.required, FormValidators.strongPassword()] }
};

@Component({
  template: `
    <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
      <input formControlName="firstName" placeholder="First Name">
      <input formControlName="lastName" placeholder="Last Name">
      <input formControlName="email" placeholder="Email">
      <input formControlName="password" type="password" placeholder="Password">
      
      <!-- This button is SMART - only enables when there are real changes! -->
      <button [disabled]="userForm.invalid || !hasChanges()">Save User</button>
      
      <!-- Shows only when user actually changed something -->
      @if (hasChanges()) {
        <div class="warning">You have unsaved changes!</div>
      }
    </form>
  `
})
export class UserComponent implements OnInit {
  private formGenerator = inject(FormGeneratorService);
  
  userForm!: FormGroup;
  hasChanges!: WritableSignal<boolean>;

  ngOnInit() {
    // THE MAGIC LINE - Creates everything!
    this.userForm = this.formGenerator.generateFormGroup(USER_CONFIG);
    this.hasChanges = this.formGenerator.getHasChanges(this.userForm);
  }

  onSubmit() {
    if (this.userForm.valid) {
      // Get perfectly typed data! TypeScript knows this is User interface!
      const userData: User = this.formGenerator.getTypedFormValues(this.userForm, USER_CONFIG);
      
      console.log(userData); // { firstName: "John", lastName: "Doe", email: "john@test.com", password: "SecurePass123!" }
      
      // Reset baseline after save - hasChanges() becomes false
      this.formGenerator.resetFormState(this.userForm);
    }
  }
}
```

**That's it!** You just created a fully functional form with validation, change tracking, type safety, and error handling in **10 lines of code**!

---

## Type Safety That Actually Works

### **Without CC Form Engine:**
```typescript
// No type safety - runtime errors waiting to happen!
const userData = this.userForm.value; // any type
userData.firstName = 123; // No error! This will break your API!
userData.randomField = "oops"; // No error! Typo in field name!
```

### **With CC Form Engine:**
```typescript
// Bulletproof type safety!
const userData: User = this.formGenerator.getTypedFormValues(this.userForm, USER_CONFIG);
userData.firstName = 123; // TypeScript ERROR! Must be string!
userData.randomField = "oops"; // TypeScript ERROR! Field doesn't exist!
```

**Your model IS your validation!** If your config doesn't match your interface, TypeScript will scream at you during development, not in production!

---

## The `hasChanges()` Super Power

### The Problem with Traditional Forms:
```html
<!-- Traditional: Button always enabled when valid -->
<button [disabled]="userForm.invalid">Save</button>
<!-- Problems: User clicks "Save" even when nothing changed! Unnecessary API calls! -->
```

### The CC Form Engine Solution:
```html
<!-- Smart: Only enabled when there are REAL changes -->
<button [disabled]="userForm.invalid || !hasChanges()">Save Changes</button>
<!-- Benefits: Perfect UX! No unnecessary API calls! Clear user feedback! -->
```

### How `hasChanges()` Works:

1. **Form loads with data** → `hasChanges()` = `false` → Save button **DISABLED**
2. **User types** → `hasChanges()` = `true` → Save button **ENABLED** 
3. **User reverts to original** → `hasChanges()` = `false` → Save button **DISABLED**
4. **User saves** → `resetFormState()` called → `hasChanges()` = `false` → Save button **DISABLED**

**It's intelligent!** It knows the difference between "user typed something" vs "actually different from the original data"!

---

## 💾 Loading Data into Forms (Multiple Ways!)

### Method 1: Create form with initial data
```typescript
const existingUser: User = await this.userService.getUser(id);

// ONE LINE creates form with data loaded!
this.userForm = this.formGenerator.generateFormGroupFromData(USER_CONFIG, existingUser);
// hasChanges() = false (existing data becomes baseline)
```

### Method 2: Load data after form creation  
```typescript
// Create empty form first
this.userForm = this.formGenerator.generateFormGroup(USER_CONFIG);

// Load data later
const userData = await this.api.getUser(123);
this.formGenerator.setFormValues(this.userForm, userData, USER_CONFIG);
// hasChanges() = false (loaded data becomes new baseline)
```

### Method 3: Partial data (missing fields use defaults)
```typescript
const partialUser = { firstName: "John" }; // lastName, email, password will use defaults

this.formGenerator.setFormValues(this.userForm, partialUser, USER_CONFIG);
```

---

## 🎨 Custom Error Messages That Actually Work

```typescript
const USER_CONFIG: FormConfig<User> = {
  email: {
    type: 'string',
    defaultValue: '',
    validators: [Validators.required, FormValidators.strictEmail()],
    label: 'Email Address',
    errorMessages: {
      required: 'Email is required for your account',
      strictEmail: 'Please enter a valid email like user@example.com'
    }
  },
  password: {
    type: 'string',
    defaultValue: '',
    validators: [Validators.required, FormValidators.strongPassword()],
    label: 'Password', 
    errorMessages: {
      required: 'Password is required',
      strongPassword: 'Password must contain uppercase, lowercase, numbers, and special characters'
    }
  }
};

// In template - shows your custom messages!
@if (userForm.get('email')?.invalid && userForm.get('email')?.touched) {
  <span class="error">{{ getFieldError('email') }}</span>
}
```

---

## 🌍 Works Worldwide Out of the Box

### Colombia (Spanish + COP)
```typescript
// Automatically formats: $1.234.567 COP, "El correo es requerido"
provideFormEngineForColombia()
```

### United States (English + USD)
```typescript  
// Automatically formats: $1,234,567.00 USD, "Email is required"
provideFormEngineForUS()
```

### Canada (English + CAD)
```typescript
// Automatically formats: $1,234,567.00 CAD, "Email is required"  
provideFormEngineForCanada()
```

### Auto-detect user's country
```typescript
// Detects user's browser locale automatically!
provideFormEngineWithAutoLocale()
```

---

## Built-in Validators That Save You Hours

```typescript
import { FormValidators } from 'cc-form-engine';

// Email validation that actually works
FormValidators.strictEmail()              // Rejects fake emails

// Password security  
FormValidators.strongPassword()           // Enforces strong passwords

// Money & numbers
FormValidators.numericOnly()              // Numbers only, no letters
FormValidators.minMoney(100)              // Minimum currency amount
FormValidators.maxMoney(999999)           // Maximum currency amount
FormValidators.percentage(0, 100)         // Percentage range validation

// Text validation
FormValidators.noWhitespace()             // No spaces allowed
```

---

## Supported Field Types

| Type | What it does | Example Value |
|------|-------------|---------------|
| `string` | Text inputs | `"John Doe"` |
| `number` | Numeric inputs | `42` |
| `boolean` | Checkboxes | `true/false` |
| `date` | Date pickers | `new Date()` |
| `money` | Currency with locale formatting | `1234.56` → `$1,234.56` |
| `percentage` | Percentage inputs | `15.5` → `15.5%` |

---

## Quick Form Prototyping with FormFactory

```typescript
import { FormFactory } from 'cc-form-engine';

const factory = inject(FormFactory);

// Pre-built forms for rapid prototyping
const loginForm = factory.createLoginForm();           // Email + password
const userForm = factory.createUserForm();            // Full user registration  
const productForm = factory.createProductForm();      // E-commerce product form

// Dynamic forms from configuration
const dynamicForm = factory.createDynamicForm([
  { name: 'firstName', type: 'string', required: true },
  { name: 'age', type: 'number', required: true },
  { name: 'active', type: 'boolean' }
]);
```

---

## Why Choose CC Form Engine?

### **Saves 80% of Your Form Code**
- Turn 50+ lines into 1 line
- No more repetitive validation setup
- Built-in change tracking and error handling

### **Bulletproof Type Safety**
- Your TypeScript interface IS your validation
- Compile-time errors prevent runtime bugs
- IntelliSense support for all form values

### **Works with Existing Projects**
- Drop into any Angular 19+ project
- No breaking changes to your current forms
- Gradual migration possible

### **Global Ready**
- Built-in support for 5+ countries/currencies
- Automatic locale detection
- Professional error messages in multiple languages

### **Developer Experience**
- Intuitive API design
- Comprehensive documentation with examples
- Built with modern Angular patterns (signals, inject, standalone)

---

## Getting Started

1. **Install:**
   ```bash
   npm install cc-form-engine
   ```

2. **Add to main.ts:**
   ```typescript
   import { provideFormEngineForUS } from 'cc-form-engine'; // or your country
   
   bootstrapApplication(AppComponent, {
     providers: [provideFormEngineForUS()]
   });
   ```

3. **Create a form:**
   ```typescript
   // Define your model
   interface User { name: string; email: string; }
   
   // Define config 
   const CONFIG: FormConfig<User> = {
     name: { type: 'string', defaultValue: '', validators: [Validators.required] },
     email: { type: 'string', defaultValue: '', validators: [Validators.required, Validators.email] }
   };
   
   // ONE LINE creates your form!
   this.form = this.formGenerator.generateFormGroup(CONFIG);
   ```

4. **That's it!** You now have a fully functional form with validation, change tracking, and type safety!

---

## Contributing

Contributions welcome! Please check our [GitHub repository](https://github.com/ChristianCruzArango/cc-form-engine) for issues and pull requests.

## License

MIT License - feel free to use in commercial projects!

## Author

**Christian Alexis Cruz Arango**
- GitHub: [@ChristianCruzArango](https://github.com/ChristianCruzArango)
- Email: christiancruzarango@gmail.com

---

## Love this library? Give it a star on GitHub!

**Stop wasting time on repetitive form code. Start building amazing user experiences with CC Form Engine!**

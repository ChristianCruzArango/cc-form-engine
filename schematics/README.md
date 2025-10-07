# CC Form Engine Schematics

Angular Schematics for automatic form generation from TypeScript models.

---

## Basic Usage

### Generate a Form

```bash
ng generate cc-form-engine:form ModelName --component=component-name

# Short alias
ng g cc-form-engine:f ModelName --component=component-name
```

### Options

| Option | Description | Required | Example |
|--------|-------------|----------|---------|
| `model` | Name of the model/interface to search for | ✅ Yes | `Employee` |
| `--component` | Name of the component to integrate the form | ✅ Yes | `employee` |
| `--path` | Base path to search for model and component | ❌ No | `src/app` (default) |

---

## Usage Examples

### 1. Single Form per Component

If you have a model:

```typescript
// src/app/models/employee.model.ts
export interface Employee {
  id: number;
  name: string;
  email: string;
  salary: number;
  hireDate: Date;
  active: boolean;
}
```

**Execute:**
```bash
ng g cc-form-engine:form Employee --component=employee
```

**Generates:**

`src/app/features/employee/config/employee-form.config.ts`:
```typescript
import { Validators } from '@angular/forms';
import { FormConfig } from 'cc-form-engine';
import { Employee } from '../../models/employee.model';

export const EMPLOYEE_FORM_CONFIG: FormConfig<Employee> = {
  id: {
    type: 'number',
    defaultValue: null,
    validators: [Validators.required],
    label: 'Id',
    placeholder: 'Enter id'
  },
  name: {
    type: 'string',
    defaultValue: '',
    validators: [Validators.required],
    label: 'Name',
    placeholder: 'Enter name'
  },
  email: {
    type: 'string',
    defaultValue: '',
    validators: [Validators.required],
    label: 'Email',
    placeholder: 'Enter email'
  },
  salary: {
    type: 'money',
    defaultValue: null,
    validators: [Validators.required],
    label: 'Salary',
    placeholder: 'Enter salary'
  },
  hireDate: {
    type: 'date',
    defaultValue: null,
    validators: [Validators.required],
    label: 'HireDate',
    placeholder: 'Enter hireDate'
  },
  active: {
    type: 'boolean',
    defaultValue: false,
    validators: [Validators.required],
    label: 'Active',
    placeholder: 'Enter active'
  }
};
```

**Updates your component:**
```typescript
import { Component, inject, OnInit, WritableSignal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormGeneratorService } from 'cc-form-engine';
import { EMPLOYEE_FORM_CONFIG } from './config/employee-form.config';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-employee',
  template: `...`
})
export class EmployeeComponent implements OnInit {
  private formGenerator = inject(FormGeneratorService);

  employeeForm!: FormGroup<any>;
  employeeHasChanges!: WritableSignal<boolean>;

  ngOnInit(): void {
    this.employeeForm = this.formGenerator.generateFormGroup(EMPLOYEE_FORM_CONFIG);
    this.employeeHasChanges = this.formGenerator.getHasChanges(this.employeeForm);
  }
}
```

---

### 2. Multiple Forms in Same Component

If you have multiple models needed in a single component:

```typescript
// Model 1: Employee
export interface Employee {
  name: string;
  position: string;
}

// Model 2: Address
export interface Address {
  street: string;
  city: string;
  zipCode: string;
}

// Model 3: Contact
export interface Contact {
  phone: string;
  email: string;
}
```

**Execute sequentially:**
```bash
ng g cc-form-engine:form Employee --component=employee-profile
ng g cc-form-engine:form Address --component=employee-profile
ng g cc-form-engine:form Contact --component=employee-profile
```

**Result in component:**
```typescript
import { Component, inject, OnInit, WritableSignal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormGeneratorService } from 'cc-form-engine';
import { EMPLOYEE_FORM_CONFIG } from './config/employee-form.config';
import { ADDRESS_FORM_CONFIG } from './config/address-form.config';
import { CONTACT_FORM_CONFIG } from './config/contact-form.config';
import { Employee } from '../../models/employee.model';
import { Address } from '../../models/address.model';
import { Contact } from '../../models/contact.model';

@Component({
  selector: 'app-employee-profile',
  template: `...`
})
export class EmployeeProfileComponent implements OnInit {
  private formGenerator = inject(FormGeneratorService);

  // Employee form
  employeeForm!: FormGroup<any>;
  employeeHasChanges!: WritableSignal<boolean>;

  // Address form
  addressForm!: FormGroup<any>;
  addressHasChanges!: WritableSignal<boolean>;

  // Contact form
  contactForm!: FormGroup<any>;
  contactHasChanges!: WritableSignal<boolean>;

  ngOnInit(): void {
    // Initialize employee form
    this.employeeForm = this.formGenerator.generateFormGroup(EMPLOYEE_FORM_CONFIG);
    this.employeeHasChanges = this.formGenerator.getHasChanges(this.employeeForm);

    // Initialize address form
    this.addressForm = this.formGenerator.generateFormGroup(ADDRESS_FORM_CONFIG);
    this.addressHasChanges = this.formGenerator.getHasChanges(this.addressForm);

    // Initialize contact form
    this.contactForm = this.formGenerator.generateFormGroup(CONTACT_FORM_CONFIG);
    this.contactHasChanges = this.formGenerator.getHasChanges(this.contactForm);
  }

  onSubmit() {
    if (this.employeeForm.valid && this.addressForm.valid && this.contactForm.valid) {
      const employee = this.formGenerator.getTypedFormValues(this.employeeForm, EMPLOYEE_FORM_CONFIG);
      const address = this.formGenerator.getTypedFormValues(this.addressForm, ADDRESS_FORM_CONFIG);
      const contact = this.formGenerator.getTypedFormValues(this.contactForm, CONTACT_FORM_CONFIG);

      // Send combined data
      console.log({ employee, address, contact });
    }
  }
}
```

**Usage in template:**
```html
<form [formGroup]="employeeForm">
  <h3>Employee Information</h3>
  <input formControlName="name" placeholder="Name">
  <input formControlName="position" placeholder="Position">

  @if (employeeHasChanges()) {
    <span class="badge">Unsaved changes</span>
  }
</form>

<form [formGroup]="addressForm">
  <h3>Address</h3>
  <input formControlName="street" placeholder="Street">
  <input formControlName="city" placeholder="City">
  <input formControlName="zipCode" placeholder="Zip Code">

  @if (addressHasChanges()) {
    <span class="badge">Unsaved changes</span>
  }
</form>

<form [formGroup]="contactForm">
  <h3>Contact Information</h3>
  <input formControlName="phone" placeholder="Phone">
  <input formControlName="email" placeholder="Email">

  @if (contactHasChanges()) {
    <span class="badge">Unsaved changes</span>
  }
</form>

<button
  (click)="onSubmit()"
  [disabled]="!employeeHasChanges() && !addressHasChanges() && !contactHasChanges()">
  Save All Changes
</button>
```

---

### 3. Same Model in Different Components

```bash
# Create component
ng g cc-form-engine:form Employee --component=employee-create

# Edit component
ng g cc-form-engine:form Employee --component=employee-edit

# Search component
ng g cc-form-engine:form Employee --component=employee-search
```

Each component will have:
- ✅ Its own `config/` folder
- ✅ Its own `employee-form.config.ts`
- ✅ Independent variables: `employeeForm`, `employeeHasChanges`

---

## Smart Features

### 1. Automatic Type Detection

The schematic automatically detects field types:

| TypeScript Type | FormConfig Type | Example |
|-----------------|-----------------|---------|
| `string` | `'string'` | `name: string` |
| `number` | `'number'` | `age: number` |
| `number` (with "salary", "price", "salario", "precio") | `'money'` | `salary: number` |
| `number` (with "percent", "porcentaje") | `'percentage'` | `discount: number` |
| `boolean` | `'boolean'` | `active: boolean` |
| `Date` | `'date'` | `birthDate: Date` |
| `string[]` | `'string'` (isArray: true) | `tags: string[]` |

### 2. Automatic Validators

- **Required** fields → `validators: [Validators.required]`
- **Optional** fields (`?`) → No validators

```typescript
interface User {
  name: string;        // Validators.required
  email: string;       // Validators.required
  nickname?: string;   // No validators
}
```

### 3. Multilingual Support

Works with models in any language:

```typescript
// Spanish
interface Empleado {
  nombre: string;
  salario: number;
  fechaIngreso: Date;
}

// English
interface Employee {
  name: string;
  salary: number;
  hireDate: Date;
}

// French
interface Employé {
  nom: string;
  salaire: number;
  dateEmbauche: Date;
}
```

All work perfectly with the schematic.

### 4. Unique Variables per Model

The schematic generates unique names based on the model:

| Model | FormGroup | HasChanges Signal |
|-------|-----------|-------------------|
| `Employee` | `employeeForm` | `employeeHasChanges` |
| `Product` | `productForm` | `productHasChanges` |
| `UserProfile` | `userProfileForm` | `userProfileHasChanges` |

### 5. No Code Duplication

If you run the schematic multiple times on the same component:
- ✅ `formGenerator` is added **only once**
- ✅ Imports are added **only if they don't exist**
- ✅ `implements OnInit` is added **only if it doesn't exist**

---

## Generated Structure

```
src/app/features/employee/
├── employee.component.ts       # ← Updated automatically
├── employee.component.html
├── employee.component.scss
└── config/
    └── employee-form.config.ts # ← Generated automatically
```

---

## After Generation

1. **Review the generated FormConfig** and customize:
   - Labels
   - Placeholders
   - Error messages
   - Additional validators

2. **Add custom validators** if needed:
```typescript
import { FormValidators } from 'cc-form-engine';

export const EMPLOYEE_FORM_CONFIG: FormConfig<Employee> = {
  email: {
    type: 'string',
    defaultValue: '',
    validators: [Validators.required, FormValidators.strictEmail()],
    label: 'Email',
    errorMessages: {
      required: 'Email is required',
      strictEmail: 'Please enter a valid email'
    }
  }
};
```

3. **Use the form** in your template with Angular Forms directives.

---

## Build Process

### Building

To build the library with schematics:

```bash
npm run build:cc-form-engine
```

This script:
1. Compiles schematics TypeScript → JavaScript
2. Runs `ng build cc-form-engine`
3. Copies all compiled files to `dist/cc-form-engine/schematics/`

### Manual Compilation

To compile only schematics:

```bash
npm run build:schematics
```

---

## File Structure

```
schematics/
├── collection.json                  # Available schematics registry
├── tsconfig.json                    # TypeScript compilation config
├── README.md                        # This file
└── form/                            # Form generator schematic
    ├── index.ts                     # Main schematic logic
    ├── schema.json                  # Command options definition
    └── form-schema.interface.ts     # TypeScript interfaces
```

---

## Troubleshooting

### Error: "Could not find interface"

Make sure:
- The model exists in `src/app/` or in the path specified with `--path`
- The model name matches exactly (case-sensitive)

### Error: "Could not find component"

The schematic searches for `.component.ts` files with these names:
- `{component-name}.component.ts`
- `{component-name-dasherized}.component.ts`

Example: `--component=employee-profile` will search for:
- `employee-profile.component.ts`
- `employeeProfile.component.ts`

### Files are generated but not visible

Verify you ran the build:
```bash
npm run build:cc-form-engine
```

Schematics only work after building the library.

---

## Contributing

To improve schematics:

1. Edit files in `projects/cc-form-engine/schematics/`
2. Compile: `npm run build:schematics`
3. Test in a test project
4. Commit your changes

Compiled `.js` files are ignored in git (only `.ts` files are committed).

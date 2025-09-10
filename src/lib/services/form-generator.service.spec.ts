import { TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormGeneratorService } from './form-generator.service';
import { ValueParser } from '../parsers/value-parser';
import { FormConfig } from '../interfaces/form-config.interface';

describe('FormGeneratorService', () => {
  let service: FormGeneratorService;
  let fb: FormBuilder;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [FormGeneratorService, ValueParser]
    });
    service = TestBed.inject(FormGeneratorService);
    fb = TestBed.inject(FormBuilder);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('generateFormGroup', () => {
    it('should generate a form group from config', () => {
      const config: FormConfig<any> = {
        name: {
          type: 'string',
          defaultValue: '',
          validators: [Validators.required]
        },
        age: {
          type: 'number',
          defaultValue: null,
          validators: [Validators.min(0)]
        },
        active: {
          type: 'boolean',
          defaultValue: true
        }
      };

      const form = service.generateFormGroup(config);

      expect(form.get('name')).toBeTruthy();
      expect(form.get('age')).toBeTruthy();
      expect(form.get('active')).toBeTruthy();
      expect(form.get('active')?.value).toBe(true);
    });

    it('should apply validators from config', () => {
      const config: FormConfig<any> = {
        email: {
          type: 'string',
          defaultValue: '',
          validators: [Validators.required, Validators.email]
        }
      };

      const form = service.generateFormGroup(config);
      const emailControl = form.get('email');

      expect(emailControl?.hasError('required')).toBe(true);
      
      emailControl?.setValue('invalid');
      expect(emailControl?.hasError('email')).toBe(true);
      
      emailControl?.setValue('test@example.com');
      expect(emailControl?.valid).toBe(true);
    });

    it('should handle disabled fields', () => {
      const config: FormConfig<any> = {
        readOnlyField: {
          type: 'string',
          defaultValue: 'readonly',
          disabled: true
        }
      };

      const form = service.generateFormGroup(config);
      const control = form.get('readOnlyField');

      expect(control?.disabled).toBe(true);
      expect(control?.value).toBe('readonly');
    });
  });

  describe('getTypedFormValues', () => {
    it('should parse form values according to field types', () => {
      const config: FormConfig<any> = {
        name: { type: 'string', defaultValue: '' },
        age: { type: 'number', defaultValue: null },
        price: { type: 'money', defaultValue: null },
        discount: { type: 'percentage', defaultValue: null },
        active: { type: 'boolean', defaultValue: false },
        birthDate: { type: 'date', defaultValue: null },
        tags: { type: 'array', defaultValue: [] }
      };

      const form = service.generateFormGroup(config);
      
      form.patchValue({
        name: 'John',
        age: '25',
        price: '1,234.56',
        discount: '15.5',
        active: true,
        birthDate: new Date('1990-01-01'),
        tags: ['tag1', 'tag2']
      });

      const values = service.getTypedFormValues(form, config);

      expect(values.name).toBe('John');
      expect(values.age).toBe(25);
      expect(values.price).toBe(1234.56);
      expect(values.discount).toBe(15.5);
      expect(values.active).toBe(true);
      expect(values.birthDate).toBe('1990-01-01');
      expect(values.tags).toEqual(['tag1', 'tag2']);
    });

    it('should omit empty values', () => {
      const config: FormConfig<any> = {
        name: { type: 'string', defaultValue: '' },
        age: { type: 'number', defaultValue: null }
      };

      const form = service.generateFormGroup(config);
      const values = service.getTypedFormValues(form, config);

      expect(values.name).toBeUndefined();
      expect(values.age).toBeUndefined();
    });
  });

  describe('setFormValues', () => {
    it('should set form values from data', () => {
      const config: FormConfig<any> = {
        name: { type: 'string', defaultValue: '' },
        age: { type: 'number', defaultValue: null }
      };

      const form = service.generateFormGroup(config);
      const data = { name: 'Jane', age: 30 };

      service.setFormValues(form, data, config);

      expect(form.get('name')?.value).toBe('Jane');
      expect(form.get('age')?.value).toBe(30);
    });

    it('should handle date strings', () => {
      const config: FormConfig<any> = {
        birthDate: { type: 'date', defaultValue: null }
      };

      const form = service.generateFormGroup(config);
      service.setFormValues(form, { birthDate: '1990-05-15' }, config);

      const value = form.get('birthDate')?.value;
      expect(value).toBe('1990-05-15');
    });
  });

  describe('getHasChanges', () => {
    it('should track form changes', (done) => {
      const config: FormConfig<any> = {
        name: { type: 'string', defaultValue: 'initial' }
      };

      const form = service.generateFormGroup(config);
      const hasChanges = service.getHasChanges(form);

      expect(hasChanges()).toBe(false);

      form.get('name')?.setValue('modified');

      setTimeout(() => {
        expect(hasChanges()).toBe(true);
        
        service.resetFormState(form);
        expect(hasChanges()).toBe(false);
        done();
      }, 10);
    });
  });

  describe('getFormValidationErrors', () => {
    it('should return validation errors for dirty/touched controls', () => {
      const config: FormConfig<any> = {
        email: {
          type: 'string',
          defaultValue: '',
          validators: [Validators.required, Validators.email]
        }
      };

      const form = service.generateFormGroup(config);
      const emailControl = form.get('email');
      
      emailControl?.markAsDirty();
      emailControl?.markAsTouched();

      const errors = service.getFormValidationErrors(form);
      expect(errors['email']).toContain('requerido');

      emailControl?.setValue('invalid');
      const errors2 = service.getFormValidationErrors(form);
      expect(errors2['email']).toBeTruthy();
    });
  });

  describe('clearControl', () => {
    it('should clear a control value', () => {
      const config: FormConfig<any> = {
        name: { type: 'string', defaultValue: 'test' }
      };

      const form = service.generateFormGroup(config);
      expect(form.get('name')?.value).toBe('test');

      service.clearControl(form, 'name');
      expect(form.get('name')?.value).toBeNull();
      expect(form.get('name')?.pristine).toBe(true);
      expect(form.get('name')?.untouched).toBe(true);
    });
  });

  describe('markFormAsPristine', () => {
    it('should mark form and all controls as pristine', () => {
      const config: FormConfig<any> = {
        field1: { type: 'string', defaultValue: '' },
        field2: { type: 'string', defaultValue: '' }
      };

      const form = service.generateFormGroup(config);
      
      form.get('field1')?.markAsDirty();
      form.get('field1')?.markAsTouched();
      form.get('field2')?.markAsDirty();
      
      service.markFormAsPristine(form);

      expect(form.pristine).toBe(true);
      expect(form.get('field1')?.pristine).toBe(true);
      expect(form.get('field1')?.untouched).toBe(true);
      expect(form.get('field2')?.pristine).toBe(true);
    });
  });
});
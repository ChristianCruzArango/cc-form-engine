import { Injectable, signal, untracked, WritableSignal, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { FormConfig } from '../interfaces/form-config.interface';
import { FormTrackedState } from '../models/form-field.model';
import { ValueParser } from '../parsers/value-parser';
import { FormUtils } from '../utils/form-utils';
import { FormEngineConfigService } from './form-engine-config.service';

@Injectable({
  providedIn: 'root'
})
export class FormGeneratorService {
  private trackedForms = new Map<FormGroup, FormTrackedState>();
  private fb = inject(FormBuilder);
  private valueParser = inject(ValueParser);
  private configService = inject(FormEngineConfigService);

  generateFormGroup<T>(formConfig: FormConfig<T>): FormGroup {
    const group: { [key: string]: any } = {};
    
    for (const key in formConfig) {
      if (formConfig.hasOwnProperty(key)) {
        const config = formConfig[key];
        const control = new FormControl(
          { value: config.defaultValue, disabled: config.disabled || false },
          config.validators || []
        );
        group[key] = control;
      }
    }

    const form = this.fb.group(group);
    this.initializeTracking(form);
    
    return form;
  }

  generateFormGroupFromData<T>(
    formConfig: FormConfig<T>,
    data: Partial<T>
  ): FormGroup {
    const form = this.generateFormGroup(formConfig);
    this.setFormValues(form, data, formConfig);
    return form;
  }

  getTypedFormValues<T>(form: FormGroup, config: FormConfig<T>): T {
    const rawValues = form.getRawValue();
    const typedValues = {} as T;

    (Object.keys(config) as Array<keyof T>).forEach((key) => {
      const rawValue = rawValues[key as string];
      const fieldType = config[key].type;
      
      const value = this.valueParser.parseValue(rawValue, fieldType);
      
      if (!FormUtils.isEmpty(value)) {
        typedValues[key] = value;
      }
    });

    return typedValues;
  }

  setFormValues<T>(
    form: FormGroup,
    data: Partial<T>,
    config?: FormConfig<T>
  ): void {
    const tracked = this.ensureFormTracked(form);
    tracked.isInitializing = true;

    Object.keys(form.controls).forEach((key) => {
      const control = form.get(key);
      const value = data[key as keyof T];

      if (!control) return;

      if (value === undefined || value === null) {
        control.setValue(null, { emitEvent: false });
        return;
      }

      let parsedValue = value;
      
      if (config && config[key as keyof T]) {
        const fieldType = config[key as keyof T].type;
        parsedValue = this.valueParser.parseValue(value, fieldType);
      } else {
        parsedValue = this.autoParseValue(value);
      }

      control.setValue(parsedValue, { emitEvent: false });
    });

    tracked.initialValue = this.normalizeFormValues(form.getRawValue());
    untracked(() => tracked.hasChanges.set(false));
    form.updateValueAndValidity({ emitEvent: false });
    tracked.isInitializing = false;
  }

  getFormValidationErrors(form: FormGroup): { [key: string]: string };
  getFormValidationErrors<T>(form: FormGroup, config: FormConfig<T>): { [key: string]: string };
  getFormValidationErrors<T>(form: FormGroup, config?: FormConfig<T>): { [key: string]: string } {
    const errors: { [key: string]: string } = {};

    Object.keys(form.controls).forEach((key) => {
      const control = form.get(key);
      if (control && control.errors && (control.dirty || control.touched)) {
        const errorKeys = Object.keys(control.errors);
        const firstErrorKey = errorKeys[0];
        
        // Check if config is provided and has custom error messages
        if (config) {
          const fieldConfig = config[key as keyof T];
          if (fieldConfig && fieldConfig.errorMessages && fieldConfig.errorMessages[firstErrorKey]) {
            errors[key] = fieldConfig.errorMessages[firstErrorKey];
            return;
          }
        }
        
        // Fallback to default error message
        errors[key] = this.getErrorMessage(firstErrorKey, control.errors[firstErrorKey]);
      }
    });

    return errors;
  }

  getHasChanges(form: FormGroup): WritableSignal<boolean> {
    return this.ensureFormTracked(form).hasChanges;
  }

  resetFormState(form: FormGroup): void {
    const tracked = this.trackedForms.get(form);
    if (!tracked) return;

    tracked.initialValue = this.normalizeFormValues(form.getRawValue());
    untracked(() => tracked.hasChanges.set(false));
  }

  markFormAsPristine(form: FormGroup): void {
    form.markAsPristine();
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control) {
        control.markAsPristine();
        control.markAsUntouched();
      }
    });
    this.resetFormState(form);
  }

  clearControl(form: FormGroup, controlName: string, emitEvent = true): void {
    const control = form.get(controlName);
    if (!control) return;

    control.setValue(null, { emitEvent });
    control.markAsPristine();
    control.markAsUntouched();
    
    if (!emitEvent) {
      const tracked = this.trackedForms.get(form);
      if (tracked) {
        const current = this.normalizeFormValues(form.getRawValue());
        const base = untracked(() => tracked.initialValue);
        const changed = !FormUtils.deepEqual(current, base);
        untracked(() => tracked.hasChanges.set(changed));
      }
    }
  }

  disposeForm(form: FormGroup): void {
    this.trackedForms.delete(form);
  }

  private initializeTracking(form: FormGroup): void {
    const tracked: FormTrackedState = {
      initialValue: this.normalizeFormValues(form.getRawValue()),
      hasChanges: signal(false),
      isInitializing: false,
    };

    this.trackedForms.set(form, tracked);

    form.valueChanges.subscribe(() => {
      if (tracked.isInitializing) return;
      
      const current = this.normalizeFormValues(form.getRawValue());
      const base = untracked(() => tracked.initialValue);
      const changed = !FormUtils.deepEqual(current, base);
      untracked(() => tracked.hasChanges.set(changed));
    });
  }

  private ensureFormTracked(form: FormGroup): FormTrackedState {
    let tracked = this.trackedForms.get(form);
    
    if (!tracked) {
      this.initializeTracking(form);
      tracked = this.trackedForms.get(form)!;
    }
    
    return tracked;
  }

  private normalizeFormValues<T>(raw: T): T {
    const clone = FormUtils.clone(raw);

    for (const key in clone) {
      const value = clone[key];
      if (value instanceof Date && !isNaN(value.getTime())) {
        clone[key] = FormUtils.normalizeDate(value) as any;
      }
    }

    return clone;
  }

  private autoParseValue(value: any): any {
    if (value === null || value === undefined) return value;

    if (typeof value === 'string') {
      if (FormUtils.isDateString(value)) {
        return new Date(value);
      }
      
      if (value === 'true' || value === 'false') {
        return value === 'true';
      }
    }

    return value;
  }

  private getErrorMessage(errorKey: string, errorValue: any): string {
    return this.configService.formatErrorMessage(errorKey, errorValue);
  }
}
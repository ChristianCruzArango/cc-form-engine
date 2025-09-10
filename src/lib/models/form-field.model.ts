import { WritableSignal } from '@angular/core';

export interface FormFieldState {
  value: any;
  errors: Record<string, any> | null;
  touched: boolean;
  dirty: boolean;
  disabled: boolean;
}

export interface FormTrackedState {
  initialValue: unknown;
  hasChanges: WritableSignal<boolean>;
  isInitializing: boolean;
}

export interface FormFieldMetadata {
  label?: string;
  placeholder?: string;
  hint?: string;
  errorMessages?: Record<string, string>;
  cssClass?: string;
  order?: number;
}
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

export class FormValidators {
  
  static strictEmail(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      const regex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
      return regex.test(value) ? null : { strictEmail: true };
    };
  }

  static strongPassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;
      return regex.test(value) ? null : { strongPassword: true };
    };
  }

  static noWhitespace(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const isOnlyWhitespace = 
        typeof control.value === 'string' && 
        control.value.trim().length === 0;
      return isOnlyWhitespace ? { whitespace: true } : null;
    };
  }

  static alphanumeric(): ValidatorFn {
    return Validators.pattern(/^[a-zA-Z0-9\s]*$/);
  }

  static alphanumericDash(): ValidatorFn {
    return Validators.pattern(/^[a-zA-Z0-9\- ]*$/);
  }

  static alphanumericExtended(): ValidatorFn {
    return Validators.pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ/\-\s]*$/);
  }

  static numericOnly(): ValidatorFn {
    return Validators.pattern(/^[0-9]*$/);
  }

  static minDate(minDate: Date | (() => Date)): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const min = typeof minDate === 'function' ? minDate() : minDate;
      const selectedDate = new Date(control.value);
      
      if (selectedDate < min) {
        return {
          minDate: {
            min: min.toISOString().split('T')[0],
            actual: selectedDate.toISOString().split('T')[0]
          }
        };
      }
      
      return null;
    };
  }

  static maxDate(maxDate: Date | (() => Date)): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const max = typeof maxDate === 'function' ? maxDate() : maxDate;
      const selectedDate = new Date(control.value);
      
      if (selectedDate > max) {
        return {
          maxDate: {
            max: max.toISOString().split('T')[0],
            actual: selectedDate.toISOString().split('T')[0]
          }
        };
      }
      
      return null;
    };
  }

  static minMoney(minValue: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === null || value === undefined || value === '') return null;
      
      const parsed = this.parseMoney(value);
      
      if (isNaN(parsed) || !isFinite(parsed)) {
        return { minMoney: { min: minValue, actual: 'Invalid value' } };
      }
      
      if (parsed < minValue) {
        return { minMoney: { min: minValue, actual: parsed } };
      }
      
      return null;
    };
  }

  static maxMoney(maxValue: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === null || value === undefined || value === '') return null;
      
      const parsed = this.parseMoney(value);
      
      if (isNaN(parsed) || !isFinite(parsed) || parsed > Number.MAX_SAFE_INTEGER) {
        return { maxMoney: { max: maxValue, actual: 'Value too large' } };
      }
      
      if (parsed > maxValue) {
        return { maxMoney: { max: maxValue, actual: parsed } };
      }
      
      return null;
    };
  }

  static maxDecimals(decimals: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === null || value === undefined || value === '') return null;
      
      const regex = new RegExp(`^\\d+([,.]\\d{1,${decimals}})?$`);
      const stringValue = value.toString().replace('.', ',');
      
      if (!regex.test(stringValue)) {
        return { maxDecimals: { max: decimals } };
      }
      
      return null;
    };
  }

  static percentage(min = 0, max = 100): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === null || value === undefined || value === '') return null;
      
      const parsed = this.parsePercentage(value);
      
      if (isNaN(parsed)) {
        return { percentage: { message: 'Invalid percentage value' } };
      }
      
      if (parsed < min || parsed > max) {
        return { percentage: { min, max, actual: parsed } };
      }
      
      return null;
    };
  }

  private static parseMoney(value: string | number): number {
    if (typeof value === 'number') return value;
    
    const stringValue = value.toString();
    let cleanValue = stringValue.replace(/[$\s]/g, '');
    cleanValue = cleanValue.replace(/\./g, '');
    cleanValue = cleanValue.replace(/,/g, '.');
    
    return parseFloat(cleanValue);
  }

  private static parsePercentage(value: string | number): number {
    if (typeof value === 'number') return value;
    
    const stringValue = value.toString().replace(/\s|%/g, '');
    const cleanValue = stringValue.replace(',', '.');
    
    return parseFloat(cleanValue);
  }
}
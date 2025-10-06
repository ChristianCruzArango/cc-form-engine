import { InjectionToken } from '@angular/core';

export interface LocaleConfig {
  locale: string;
  currency: string;
  dateFormat?: 'short' | 'long';
  decimalSeparator?: '.' | ',';
  thousandsSeparator?: ',' | '.';
}

export interface ErrorMessages {
  required?: string;
  email?: string;
  strictEmail?: string;
  strongPassword?: string;
  minlength?: string;
  maxlength?: string;
  min?: string;
  max?: string;
  pattern?: string;
  whitespace?: string;
  minDate?: string;
  maxDate?: string;
  minMoney?: string;
  maxMoney?: string;
  percentage?: string;
  maxDecimals?: string;
  default?: string;
}

export interface FormEngineConfig {
  locale?: LocaleConfig;
  errorMessages?: ErrorMessages;
  trackChanges?: boolean;
  debounceTime?: number;
}

// Default configurations by country/language
export const DEFAULT_LOCALES: Record<string, LocaleConfig> = {
  'es-CO': {
    locale: 'es-CO',
    currency: 'COP',
    dateFormat: 'short',
    decimalSeparator: ',',
    thousandsSeparator: '.'
  },
  'en-US': {
    locale: 'en-US',
    currency: 'USD',
    dateFormat: 'short',
    decimalSeparator: '.',
    thousandsSeparator: ','
  },
  'en-CA': {
    locale: 'en-CA',
    currency: 'CAD',
    dateFormat: 'short',
    decimalSeparator: '.',
    thousandsSeparator: ','
  },
  'es-MX': {
    locale: 'es-MX',
    currency: 'MXN',
    dateFormat: 'short',
    decimalSeparator: '.',
    thousandsSeparator: ','
  },
  'pt-BR': {
    locale: 'pt-BR',
    currency: 'BRL',
    dateFormat: 'short',
    decimalSeparator: ',',
    thousandsSeparator: '.'
  }
};

export const DEFAULT_ERROR_MESSAGES: Record<string, ErrorMessages> = {
  'es': {
    required: 'Este campo es requerido',
    email: 'Ingrese un correo electrónico válido',
    strictEmail: 'El formato del correo electrónico no es válido',
    strongPassword: 'La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales',
    minlength: 'Mínimo {requiredLength} caracteres',
    maxlength: 'Máximo {requiredLength} caracteres',
    min: 'El valor mínimo es {min}',
    max: 'El valor máximo es {max}',
    pattern: 'El formato no es válido',
    whitespace: 'No puede contener solo espacios en blanco',
    minDate: 'La fecha mínima es {min}',
    maxDate: 'La fecha máxima es {max}',
    minMoney: 'El valor mínimo es {min}',
    maxMoney: 'El valor máximo es {max}',
    percentage: 'Porcentaje inválido',
    maxDecimals: 'Máximo {max} decimales',
    default: 'Campo inválido'
  },
  'en': {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    strictEmail: 'Invalid email format',
    strongPassword: 'Password must contain uppercase, lowercase, numbers and special characters',
    minlength: 'Minimum {requiredLength} characters',
    maxlength: 'Maximum {requiredLength} characters',
    min: 'Minimum value is {min}',
    max: 'Maximum value is {max}',
    pattern: 'Invalid format',
    whitespace: 'Cannot contain only whitespace',
    minDate: 'Minimum date is {min}',
    maxDate: 'Maximum date is {max}',
    minMoney: 'Minimum value is {min}',
    maxMoney: 'Maximum value is {max}',
    percentage: 'Invalid percentage',
    maxDecimals: 'Maximum {max} decimals',
    default: 'Invalid field'
  },
  'pt': {
    required: 'Este campo é obrigatório',
    email: 'Digite um endereço de email válido',
    strictEmail: 'Formato de email inválido',
    strongPassword: 'A senha deve conter maiúsculas, minúsculas, números e caracteres especiais',
    minlength: 'Mínimo {requiredLength} caracteres',
    maxlength: 'Máximo {requiredLength} caracteres',
    min: 'O valor mínimo é {min}',
    max: 'O valor máximo é {max}',
    pattern: 'Formato inválido',
    whitespace: 'Não pode conter apenas espaços em branco',
    minDate: 'A data mínima é {min}',
    maxDate: 'A data máxima é {max}',
    minMoney: 'O valor mínimo é {min}',
    maxMoney: 'O valor máximo é {max}',
    percentage: 'Porcentagem inválida',
    maxDecimals: 'Máximo {max} decimais',
    default: 'Campo inválido'
  }
};

// Injection tokens
export const FORM_ENGINE_CONFIG = new InjectionToken<FormEngineConfig>('FORM_ENGINE_CONFIG');
export const FORM_ENGINE_LOCALE = new InjectionToken<LocaleConfig>('FORM_ENGINE_LOCALE');
export const FORM_ENGINE_ERROR_MESSAGES = new InjectionToken<ErrorMessages>('FORM_ENGINE_ERROR_MESSAGES');
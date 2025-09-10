import { Provider } from '@angular/core';
import {
  FormEngineConfig,
  LocaleConfig,
  ErrorMessages,
  FORM_ENGINE_CONFIG
} from '../interfaces/form-engine-config.interface';
import { FormEngineConfigService } from '../services/form-engine-config.service';

/**
 * Provides complete FormEngine configuration
 */
export function provideFormEngineConfig(config: FormEngineConfig): Provider[] {
  return [
    { provide: FORM_ENGINE_CONFIG, useValue: config },
    FormEngineConfigService
  ];
}

/**
 * Provides FormEngine with locale-specific configuration
 */
export function provideFormEngineWithLocale(
  locale: string,
  customConfig?: Partial<FormEngineConfig>
): Provider[] {
  const config = FormEngineConfigService.createConfig({
    locale: FormEngineConfigService.createLocaleConfig(locale),
    errorMessages: FormEngineConfigService.createErrorMessages(locale.split('-')[0]),
    ...customConfig
  });

  return provideFormEngineConfig(config);
}

/**
 * Provides FormEngine for Colombian Spanish
 */
export function provideFormEngineForColombia(
  customConfig?: Partial<FormEngineConfig>
): Provider[] {
  return provideFormEngineWithLocale('es-CO', customConfig);
}

/**
 * Provides FormEngine for US English
 */
export function provideFormEngineForUS(
  customConfig?: Partial<FormEngineConfig>
): Provider[] {
  return provideFormEngineWithLocale('en-US', customConfig);
}

/**
 * Provides FormEngine for Canadian English
 */
export function provideFormEngineForCanada(
  customConfig?: Partial<FormEngineConfig>
): Provider[] {
  return provideFormEngineWithLocale('en-CA', customConfig);
}

/**
 * Provides FormEngine for Mexican Spanish
 */
export function provideFormEngineForMexico(
  customConfig?: Partial<FormEngineConfig>
): Provider[] {
  return provideFormEngineWithLocale('es-MX', customConfig);
}

/**
 * Provides FormEngine for Brazilian Portuguese
 */
export function provideFormEngineForBrazil(
  customConfig?: Partial<FormEngineConfig>
): Provider[] {
  return provideFormEngineWithLocale('pt-BR', customConfig);
}

/**
 * Provides FormEngine with custom locale and error messages
 */
export function provideFormEngineCustom(
  locale: LocaleConfig,
  errorMessages: ErrorMessages,
  customConfig?: Partial<Omit<FormEngineConfig, 'locale' | 'errorMessages'>>
): Provider[] {
  const config: FormEngineConfig = {
    locale,
    errorMessages,
    trackChanges: true,
    debounceTime: 300,
    ...customConfig
  };

  return provideFormEngineConfig(config);
}

/**
 * Provides FormEngine with auto-detection of browser locale
 */
export function provideFormEngineWithAutoLocale(
  fallbackLocale: string = 'en-US',
  customConfig?: Partial<FormEngineConfig>
): Provider[] {
  const browserLocale = typeof navigator !== 'undefined'
    ? navigator.language
    : fallbackLocale;

  return provideFormEngineWithLocale(browserLocale, customConfig);
}

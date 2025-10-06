import { Injectable, inject } from '@angular/core';
import { 
  FormEngineConfig, 
  LocaleConfig, 
  ErrorMessages, 
  DEFAULT_LOCALES, 
  DEFAULT_ERROR_MESSAGES,
  FORM_ENGINE_CONFIG,
  FORM_ENGINE_LOCALE,
  FORM_ENGINE_ERROR_MESSAGES
} from '../interfaces/form-engine-config.interface';

@Injectable({
  providedIn: 'root'
})
export class FormEngineConfigService {
  private config: FormEngineConfig;
  private locale: LocaleConfig;
  private errorMessages: ErrorMessages;

  constructor() {
    // Try to get configuration from injection tokens
    const tokenConfig = this.getInjectedConfig();
    
    // Merge configurations with priority: token > default
    this.config = this.mergeConfig(tokenConfig);
    this.locale = this.getLocaleConfig(this.config);
    this.errorMessages = this.getErrorMessagesConfig(this.config);
  }

  getLocale(): LocaleConfig {
    return this.locale;
  }

  getErrorMessages(): ErrorMessages {
    return this.errorMessages;
  }

  getConfig(): FormEngineConfig {
    return this.config;
  }

  formatErrorMessage(errorKey: string, errorValue?: any): string {
    let template = this.errorMessages[errorKey as keyof ErrorMessages] || this.errorMessages.default || 'Invalid field';

    // Replace placeholders in error messages
    if (errorValue && typeof template === 'string') {
      template = template.replace(/\{(\w+)\}/g, (match, key) => {
        return errorValue[key]?.toString() || match;
      });
    }

    return template;
  }

  updateConfig(newConfig: Partial<FormEngineConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.locale) {
      this.locale = newConfig.locale;
    }
    
    if (newConfig.errorMessages) {
      this.errorMessages = { ...this.errorMessages, ...newConfig.errorMessages };
    }
  }

  updateLocale(newLocale: Partial<LocaleConfig>): void {
    this.locale = { ...this.locale, ...newLocale };
  }

  updateErrorMessages(newMessages: Partial<ErrorMessages>): void {
    this.errorMessages = { ...this.errorMessages, ...newMessages };
  }

  // Static methods for creating configurations
  static createConfig(options: Partial<FormEngineConfig> = {}): FormEngineConfig {
    const browserLocale = this.getBrowserLocale();
    const defaultLocale = DEFAULT_LOCALES[browserLocale] || DEFAULT_LOCALES['en-US'];
    const languageCode = browserLocale.split('-')[0];
    const defaultMessages = DEFAULT_ERROR_MESSAGES[languageCode] || DEFAULT_ERROR_MESSAGES['en'];

    return {
      locale: defaultLocale,
      errorMessages: defaultMessages,
      trackChanges: true,
      debounceTime: 300,
      ...options
    };
  }

  static createLocaleConfig(locale: string): LocaleConfig {
    return DEFAULT_LOCALES[locale] || DEFAULT_LOCALES['en-US'];
  }

  static createErrorMessages(language: string): ErrorMessages {
    return DEFAULT_ERROR_MESSAGES[language] || DEFAULT_ERROR_MESSAGES['en'];
  }

  private getInjectedConfig(): FormEngineConfig | undefined {
    try {
      const config = inject(FORM_ENGINE_CONFIG, { optional: true });
      const locale = inject(FORM_ENGINE_LOCALE, { optional: true });
      const errorMessages = inject(FORM_ENGINE_ERROR_MESSAGES, { optional: true });

      if (!config && !locale && !errorMessages) {
        return undefined;
      }

      return {
        ...config,
        locale: locale || config?.locale,
        errorMessages: errorMessages || config?.errorMessages
      };
    } catch {
      return undefined;
    }
  }

  private mergeConfig(tokenConfig?: FormEngineConfig): FormEngineConfig {
    const defaultConfig = FormEngineConfigService.createConfig();

    return {
      ...defaultConfig,
      ...tokenConfig
    };
  }

  private getLocaleConfig(config: FormEngineConfig): LocaleConfig {
    return config.locale || DEFAULT_LOCALES['en-US'];
  }

  private getErrorMessagesConfig(config: FormEngineConfig): ErrorMessages {
    return config.errorMessages || DEFAULT_ERROR_MESSAGES['en'];
  }

  private static getBrowserLocale(): string {
    if (typeof navigator !== 'undefined') {
      return navigator.language || 'en-US';
    }
    return 'en-US';
  }
}
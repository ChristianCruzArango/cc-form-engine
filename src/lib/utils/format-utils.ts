import { FormEngineConfigService } from '../services/form-engine-config.service';
import { LocaleConfig } from '../interfaces/form-engine-config.interface';

export class FormatUtils {
  
  static formatMoney(value: number, localeConfig?: LocaleConfig, forceDecimals = false): string {
    if (value == null || isNaN(value)) return '$0';
    
    const config = localeConfig || FormatUtils.getDefaultLocaleConfig();
    const hasDecimals = value % 1 !== 0;
    
    return value.toLocaleString(config.locale, {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: forceDecimals || hasDecimals ? 2 : 0,
      maximumFractionDigits: 2,
    });
  }

  static formatPercentage(value: number, localeConfig?: LocaleConfig, decimals = 2): string {
    if (value == null || isNaN(value)) return '0%';
    
    const config = localeConfig || FormatUtils.getDefaultLocaleConfig();
    
    const formatted = value.toLocaleString(config.locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    
    return `${formatted}%`;
  }

  static formatNumber(value: number, localeConfig?: LocaleConfig, decimals?: number): string {
    if (value == null || isNaN(value)) return '0';
    
    const config = localeConfig || FormatUtils.getDefaultLocaleConfig();
    const options: Intl.NumberFormatOptions = {};
    
    if (decimals !== undefined) {
      options.minimumFractionDigits = decimals;
      options.maximumFractionDigits = decimals;
    }
    
    return value.toLocaleString(config.locale, options);
  }

  static formatDate(value: Date | string, localeConfig?: LocaleConfig, format?: 'short' | 'long'): string {
    if (!value) return '';
    
    const config = localeConfig || FormatUtils.getDefaultLocaleConfig();
    const dateFormat = format || config.dateFormat || 'short';
    const date = typeof value === 'string' ? new Date(value) : value;
    
    if (isNaN(date.getTime())) return '';
    
    if (dateFormat === 'short') {
      return date.toLocaleDateString(config.locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }
    
    return date.toLocaleDateString(config.locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  static formatDateTime(value: Date | string, localeConfig?: LocaleConfig): string {
    if (!value) return '';
    
    const config = localeConfig || FormatUtils.getDefaultLocaleConfig();
    const date = typeof value === 'string' ? new Date(value) : value;
    
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleString(config.locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  private static getDefaultLocaleConfig(): LocaleConfig {
    return {
      locale: 'en-US',
      currency: 'USD',
      dateFormat: 'short',
      decimalSeparator: '.',
      thousandsSeparator: ','
    };
  }

  // Instance methods for injection-aware formatting
  static createInstance(configService: FormEngineConfigService) {
    return new FormatUtilsInstance(configService);
  }
}

export class FormatUtilsInstance {
  constructor(private configService: FormEngineConfigService) {}

  formatMoney(value: number, forceDecimals = false): string {
    return FormatUtils.formatMoney(value, this.configService.getLocale(), forceDecimals);
  }

  formatPercentage(value: number, decimals = 2): string {
    return FormatUtils.formatPercentage(value, this.configService.getLocale(), decimals);
  }

  formatNumber(value: number, decimals?: number): string {
    return FormatUtils.formatNumber(value, this.configService.getLocale(), decimals);
  }

  formatDate(value: Date | string, format?: 'short' | 'long'): string {
    return FormatUtils.formatDate(value, this.configService.getLocale(), format);
  }

  formatDateTime(value: Date | string): string {
    return FormatUtils.formatDateTime(value, this.configService.getLocale());
  }
}
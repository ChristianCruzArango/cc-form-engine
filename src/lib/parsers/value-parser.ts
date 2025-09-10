import { Injectable, inject } from '@angular/core';
import { FieldType } from '../interfaces/form-config.interface';
import { FormEngineConfigService } from '../services/form-engine-config.service';

@Injectable({
  providedIn: 'root'
})
export class ValueParser {
  private configService = inject(FormEngineConfigService);
  
  parseValue(value: any, type: FieldType): any {
    if (value === null || value === undefined) {
      return this.getDefaultValue(type);
    }

    switch (type) {
      case 'number':
        return this.parseNumber(value);
      case 'money':
        return this.parseMoney(value);
      case 'percentage':
        return this.parsePercentage(value);
      case 'boolean':
        return this.parseBoolean(value);
      case 'date':
        return this.parseDate(value);
      case 'string[]':
        return this.parseStringArray(value);
      case 'array':
        return this.parseArray(value);
      case 'file':
        return value;
      case 'string':
      default:
        return this.parseString(value);
    }
  }

  private parseNumber(value: any): number | null {
    if (value === '' || value === null) return null;
    const parsed = Number(value);
    return isNaN(parsed) ? null : parsed;
  }

  private parseMoney(value: any): number | null {
    if (value === '' || value === null) return null;
    
    if (typeof value === 'number') return value;
    
    const locale = this.configService.getLocale();
    let cleaned = value.toString().replace(/[^0-9.,-]+/g, '');
    
    // Use locale-specific decimal and thousands separators
    if (locale.decimalSeparator === ',' && locale.thousandsSeparator === '.') {
      // European format: 1.234,56
      cleaned = cleaned.replace(/\./g, ''); // Remove thousands separators
      cleaned = cleaned.replace(/,/g, '.'); // Convert decimal separator
    } else {
      // US format: 1,234.56 (default)
      cleaned = cleaned.replace(/,/g, ''); // Remove thousands separators
    }
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  private parsePercentage(value: any): number | null {
    if (value === '' || value === null) return null;
    
    if (typeof value === 'number') return value;
    
    const locale = this.configService.getLocale();
    const stringValue = value.toString().replace(/\s|%/g, '');
    
    // Use locale-specific decimal separator
    const cleanValue = locale.decimalSeparator === ','
      ? stringValue.replace(',', '.')
      : stringValue;
    
    const parsed = parseFloat(cleanValue);
    
    return isNaN(parsed) ? 0 : parsed;
  }

  private parseBoolean(value: any): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  }

  private parseDate(value: any): string | null {
    if (!value) return null;
    
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value.toISOString().split('T')[0];
    }
    
    if (typeof value === 'string') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
    
    return null;
  }

  private parseStringArray(value: any): string[] {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      return value.split(',').map(v => v.trim()).filter(Boolean);
    }
    return [];
  }

  private parseArray(value: any): any[] {
    if (Array.isArray(value)) return value;
    
    if (typeof value === 'string') {
      return value
        .split(',')
        .map(v => v.trim())
        .filter(Boolean);
    }
    
    return [];
  }

  private parseString(value: any): string {
    if (value === null || value === undefined) return '';
    return String(value);
  }

  private getDefaultValue(type: FieldType): any {
    switch (type) {
      case 'number':
      case 'money':
      case 'percentage':
        return null;
      case 'boolean':
        return false;
      case 'date':
        return null;
      case 'string[]':
      case 'array':
        return [];
      case 'file':
        return null;
      case 'string':
      default:
        return '';
    }
  }
}
export class FormUtils {
  
  static deepEqual(a: any, b: any): boolean {
    if (a == null && b == null) return true;
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (typeof a !== 'object' || a === null || b === null) return a === b;
    
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!FormUtils.deepEqual(a[i], b[i])) return false;
      }
      return true;
    }
    
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    
    return keysA.every((key) => FormUtils.deepEqual(a[key], b[key]));
  }

  static clone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj;
    
    if (obj instanceof Date) {
      return new Date(obj.getTime()) as any;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => FormUtils.clone(item)) as any;
    }
    
    const clonedObj: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = FormUtils.clone(obj[key]);
      }
    }
    
    return clonedObj;
  }

  static isEmpty(value: any): boolean {
    return (
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && Object.keys(value).length === 0)
    );
  }

  static isDateString(value: string): boolean {
    if (!value || typeof value !== 'string') return false;
    
    return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?$/.test(value);
  }

  static normalizeDate(value: any): string | null {
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
}
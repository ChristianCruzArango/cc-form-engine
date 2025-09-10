import { bootstrapApplication } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { 
  provideFormEngineForColombia,
  provideFormEngineForCanada,
  provideFormEngineWithLocale,
  provideFormEngineCustom,
  provideFormEngineWithAutoLocale
} from '../providers/form-engine.providers';
import { FormEngineConfig, LocaleConfig, ErrorMessages } from '../interfaces/form-engine-config.interface';

// Example 1: Basic configuration for Colombia
@Component({
  selector: 'app-root',
  template: `<h1>Colombian Form Engine</h1>`
})
class AppComponent {}

// main.ts
bootstrapApplication(AppComponent, {
  providers: [
    // Colombian configuration with COP currency and Spanish messages
    provideFormEngineForColombia()
  ]
});

// Example 2: Canadian configuration
bootstrapApplication(AppComponent, {
  providers: [
    // Canadian configuration with CAD currency and English messages
    provideFormEngineForCanada()
  ]
});

// Example 3: Custom locale configuration
bootstrapApplication(AppComponent, {
  providers: [
    provideFormEngineWithLocale('fr-FR', {
      trackChanges: false,
      debounceTime: 500
    })
  ]
});

// Example 4: Completely custom configuration
const customLocale: LocaleConfig = {
  locale: 'es-AR',
  currency: 'ARS',
  dateFormat: 'long',
  decimalSeparator: ',',
  thousandsSeparator: '.'
};

const customErrorMessages: ErrorMessages = {
  required: 'Este campo es obligatorio',
  email: 'Por favor ingresá un email válido',
  strongPassword: 'La contraseña debe tener mayúsculas, minúsculas, números y símbolos',
  minlength: 'Mínimo {requiredLength} caracteres',
  maxlength: 'Máximo {requiredLength} caracteres',
  default: 'Campo inválido'
};

bootstrapApplication(AppComponent, {
  providers: [
    provideFormEngineCustom(customLocale, customErrorMessages, {
      trackChanges: true,
      debounceTime: 200
    })
  ]
});

// Example 5: Auto-detect browser locale
bootstrapApplication(AppComponent, {
  providers: [
    // Will use browser's locale, fallback to en-US
    provideFormEngineWithAutoLocale('en-US')
  ]
});

// Example 6: Module-based configuration (for older Angular projects)
import { NgModule } from '@angular/core';

@NgModule({
  providers: [
    provideFormEngineForColombia({
      trackChanges: true,
      debounceTime: 300
    })
  ]
})
export class AppModule {}

// Example 7: Component-level configuration override
import { FormEngineConfigService } from '../services/form-engine-config.service';

@Component({
  selector: 'app-special-form',
  template: `...`
})
export class SpecialFormComponent {
  constructor(private configService: FormEngineConfigService) {
    // Override configuration for this component only
    this.configService.updateConfig({
      errorMessages: {
        required: 'This field is mandatory',
        email: 'Please provide a valid email'
      }
    });
  }
}

// Example 8: Dynamic locale switching
@Component({
  selector: 'app-multi-language',
  template: `
    <select (change)="changeLanguage($event)">
      <option value="es-CO">Español (Colombia)</option>
      <option value="en-US">English (US)</option>
      <option value="en-CA">English (Canada)</option>
      <option value="pt-BR">Português (Brasil)</option>
    </select>
  `
})
export class MultiLanguageComponent {
  constructor(private configService: FormEngineConfigService) {}

  changeLanguage(event: any) {
    const locale = event.target.value;
    const newLocale = FormEngineConfigService.createLocaleConfig(locale);
    const newMessages = FormEngineConfigService.createErrorMessages(locale.split('-')[0]);
    
    this.configService.updateLocale(newLocale);
    this.configService.updateErrorMessages(newMessages);
  }
}

// Example 9: Using configuration in services
import { Injectable } from '@angular/core';

@Injectable()
export class MyFormService {
  constructor(private configService: FormEngineConfigService) {}

  formatCurrency(amount: number): string {
    const locale = this.configService.getLocale();
    return amount.toLocaleString(locale.locale, {
      style: 'currency',
      currency: locale.currency
    });
  }

  getRequiredMessage(): string {
    return this.configService.formatErrorMessage('required');
  }
}

// Example 10: Testing with different configurations
import { TestBed } from '@angular/core/testing';

describe('MyComponent with different locales', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideFormEngineForColombia()
      ]
    });
  });

  it('should format money in Colombian pesos', () => {
    const service = TestBed.inject(FormEngineConfigService);
    const locale = service.getLocale();
    expect(locale.currency).toBe('COP');
  });
});
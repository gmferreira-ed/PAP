import { AbstractControl, ValidationErrors } from '@angular/forms';

export class FValidators {
  static email(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(value) ? null : { email: true };
  }

  static phone(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const phoneRegex = /^\d{9,12}$/;
    return phoneRegex.test(value) ? null : { phone: true };
  }

  static postalCode(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const postalRegex = /^[a-zA-Z0-9\s\-]{4,10}$/;
    return postalRegex.test(value) ? null : { postalCode: true };
  }
}

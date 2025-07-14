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

  static strongPassword(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const errors: any = {};

    if (value.length < 8) {
      errors.minLength = true;
    }

    if (!/[a-z]/.test(value)) {
      errors.lowercase = true;
    }

    if (!/[A-Z]/.test(value)) {
      errors.uppercase = true;
    }

    if (!/\d/.test(value)) {
      errors.number = true;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
      errors.specialChar = true;
    }

    

    return Object.keys(errors).length > 0 ? errors : null;
  }

  static getPasswordStrength(password: string): { score: number; label: string; color: string } {
    if (!password) return { score: 0, label: 'No Password', color: '#ff4d4f' };

    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      longLength: password.length >= 12,
    };

    if (checks.length) score++;
    if (checks.lowercase) score++;
    if (checks.uppercase) score++;
    if (checks.number) score++;
    if (checks.specialChar) score++;
    if (checks.longLength) score++;

    if (score <= 2) return { score, label: 'Very Weak', color: '#ff4d4f' };
    if (score <= 3) return { score, label: 'Weak', color: '#ff7a45' };
    if (score <= 4) return { score, label: 'Fair', color: '#ffa940' };
    if (score <= 5) return { score, label: 'Good', color: '#52c41a' };
    return { score, label: 'Strong', color: '#389e0d' };
  }
}

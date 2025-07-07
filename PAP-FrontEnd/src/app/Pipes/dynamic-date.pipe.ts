import { inject, Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import rawLangMap from '../Data/custom-lang-codes.json';

@Pipe({ name: 'ddate', pure: false })
export class DynamicDatePipe implements PipeTransform {

  DatePipe = inject(DatePipe);
  TranslateService = inject(TranslateService);

  transform(value: any, format: string = 'mediumDate', timezone?:string): string | null {
    if (!value) return null;

    const LCodesCurrespondency = rawLangMap as Record<string, string>;

    const currentLang = this.TranslateService.currentLang || 'en';
    const locale = LCodesCurrespondency[currentLang] || 'en';

    return this.DatePipe.transform(value, format, timezone, locale);
  }
}

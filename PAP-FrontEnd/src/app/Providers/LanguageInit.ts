// src/app/init/init-translate.ts
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { AppSettings } from '../Services/AppSettings';

export async function initTranslate(translate: TranslateService): Promise<void> {
  const defaultLang = localStorage.getItem('language') || 'en';
  const mappedLanguages = Object.values(AppSettings.LanguageInfo).map((lang) => lang.language_code);

  translate.addLangs(mappedLanguages);
  translate.setDefaultLang('en');

  console.log('[i18n] Loading language:', defaultLang);

  await firstValueFrom(translate.use(defaultLang));

  console.log('Finished loading languages')
}

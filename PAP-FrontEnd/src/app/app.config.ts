import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom, DEFAULT_CURRENCY_CODE, inject, APP_INITIALIZER, provideAppInitializer } from '@angular/core'
import { provideAnimations } from "@angular/platform-browser/animations"
import { FormsModule } from '@angular/forms'
import { HttpClient, provideHttpClient } from '@angular/common/http'
import { CurrencyPipe, DatePipe, registerLocaleData } from '@angular/common'
import { provideRouter } from '@angular/router'
import { routes } from './app.routes'
import { provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';


// For pipes
import localeFr from '@angular/common/locales/fr';
import localeDe from '@angular/common/locales/de';
import localePt from '@angular/common/locales/pt';
import localeCs from '@angular/common/locales/cs';
import localeDa from '@angular/common/locales/da';
import localeEl from '@angular/common/locales/el';
import localeEn from '@angular/common/locales/en';
import localeEs from '@angular/common/locales/es';
import localeFi from '@angular/common/locales/fi';
import localeHi from '@angular/common/locales/hi';
import localeHu from '@angular/common/locales/hu';
import localeIt from '@angular/common/locales/it';
import localeJa from '@angular/common/locales/ja';
import localeKo from '@angular/common/locales/ko';
import localeNl from '@angular/common/locales/nl';
import localeNo from '@angular/common/locales/no';
import localePl from '@angular/common/locales/pl';
import localeRo from '@angular/common/locales/ro';
import localeRu from '@angular/common/locales/ru';
import localeSv from '@angular/common/locales/sv';
import localeTr from '@angular/common/locales/tr';
import localeUk from '@angular/common/locales/uk';
import localeVi from '@angular/common/locales/vi';
import localeZh from '@angular/common/locales/zh';
import localeZhTw from '@angular/common/locales/zh-Hant';

registerLocaleData(localeCs, 'cs');
registerLocaleData(localeDa, 'da');
registerLocaleData(localeDe, 'de');
registerLocaleData(localeEl, 'el');
registerLocaleData(localeEn, 'en');
registerLocaleData(localeEs, 'es');
registerLocaleData(localeFi, 'fi');
registerLocaleData(localeFr, 'fr');
registerLocaleData(localeHi, 'hi');
registerLocaleData(localeHu, 'hu');
registerLocaleData(localeIt, 'it');
registerLocaleData(localeJa, 'ja');
registerLocaleData(localeKo, 'ko');
registerLocaleData(localeNl, 'nl');
registerLocaleData(localeNo, 'no');
registerLocaleData(localePl, 'pl');
registerLocaleData(localePt, 'pt');
registerLocaleData(localeRo, 'ro');
registerLocaleData(localeRu, 'ru');
registerLocaleData(localeSv, 'sv');
registerLocaleData(localeTr, 'tr');
registerLocaleData(localeUk, 'uk');
registerLocaleData(localeVi, 'vi');
registerLocaleData(localeZh, 'zh');
registerLocaleData(localeZhTw, 'zh-TW');

// NGX translate
import { provideTranslateService, TranslateLoader, TranslatePipe, TranslateService } from "@ngx-translate/core"
import { TranslateHttpLoader } from '@ngx-translate/http-loader'

// Ng zorro language
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n'
import { AppSettings } from './Services/AppSettings'
import { DynamicCurrencyPipe } from './Pipes/dynamic-currency.pipe'
import { DynamicDatePipe } from './Pipes/dynamic-date.pipe'
import { initTranslate } from './Providers/LanguageInit'


const httpLoaderFactory: (http: HttpClient) => TranslateHttpLoader = (http: HttpClient) =>
  new TranslateHttpLoader(http, './i18n/', '.json');

export const appConfig: ApplicationConfig = {
  providers: [
    CurrencyPipe,
    DynamicCurrencyPipe,
    DynamicDatePipe,
    DatePipe,
    provideAnimations(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient],
      },
      defaultLanguage: 'en'
    }),
    provideHttpClient(),
    provideRouter(routes),
    importProvidersFrom(FormsModule),
    provideLottieOptions({
      player: () => player,
    }),
    { provide: NZ_I18N, useValue: en_US },
    { provide: DEFAULT_CURRENCY_CODE, useValue: AppSettings.Currency },

    provideAppInitializer(
      async () => {
        const translate = inject(TranslateService);
        await initTranslate(translate);
      }
    )
  ]
};

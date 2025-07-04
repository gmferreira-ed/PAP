import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom, DEFAULT_CURRENCY_CODE } from '@angular/core'
import { provideAnimations } from "@angular/platform-browser/animations"
import { FormsModule } from '@angular/forms'
import { HttpClient, provideHttpClient } from '@angular/common/http'
import { provideRouter } from '@angular/router'
import { routes } from './app.routes'
import { provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';


// NGX translate
import { provideTranslateService, TranslateLoader, TranslatePipe } from "@ngx-translate/core"
import {TranslateHttpLoader} from '@ngx-translate/http-loader'

// Ng zorro language
import { NZ_I18N, en_US} from 'ng-zorro-antd/i18n'
import { AppSettings } from './Services/AppSettings'
import { CurrencyPipe } from '@angular/common'
import { DynamicCurrencyPipe } from './Pipes/dynamic-currency.pipe'


const httpLoaderFactory: (http: HttpClient) => TranslateHttpLoader = (http: HttpClient) =>
  new TranslateHttpLoader(http, './i18n/', '.json');

export const appConfig: ApplicationConfig = {
  providers: [
    CurrencyPipe,
    DynamicCurrencyPipe,
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
    { provide: DEFAULT_CURRENCY_CODE, useValue: AppSettings.Currency}
  ]
};

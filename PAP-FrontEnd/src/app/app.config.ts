
import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core'
import { provideAnimations } from "@angular/platform-browser/animations"
import { FormsModule } from '@angular/forms'
import { HttpClient, provideHttpClient } from '@angular/common/http'
import { provideRouter } from '@angular/router'
import { routes } from './app.routes'


// NGX translate
import { provideTranslateService, TranslateLoader } from "@ngx-translate/core"
import {TranslateHttpLoader} from '@ngx-translate/http-loader'

// Ng zorro language
import { NZ_I18N, en_US} from 'ng-zorro-antd/i18n'


const httpLoaderFactory: (http: HttpClient) => TranslateHttpLoader = (http: HttpClient) =>
  new TranslateHttpLoader(http, './i18n/', '.json');

export const appConfig: ApplicationConfig = {
  providers: [
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
    { provide: NZ_I18N, useValue: en_US }

  ]
};

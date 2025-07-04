

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { AppSettings } from './app/Services/AppSettings';
import { inject } from '@angular/core';
import { HttpService } from './app/Services/Http.service';


async function StartApp() {

  await AppSettings.Load()
  
  bootstrapApplication(AppComponent, appConfig)
    .catch((err) => console.error(err));


}
StartApp()
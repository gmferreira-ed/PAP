
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Topbar } from './Components/topbar/topbar.component';
import { ThemeService } from './Services/Theme.service';
import {
  TranslateService,
  TranslatePipe,
  TranslateDirective
} from "@ngx-translate/core";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Topbar, TranslatePipe, TranslateDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  ThemeService = inject(ThemeService)

  constructor(
    private translate: TranslateService) {
      translate.setDefaultLang('en');
      
    const LanguageCode = localStorage.getItem('language') || 'pt'
    translate.use(LanguageCode);

    translate.addLangs(this.ThemeService.Languages);
  }
}

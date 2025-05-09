import { Component, inject } from '@angular/core';
import { PageLayoutComponent } from '../../Components/page-layout/page-layout.component';
import { ThemeService } from '../../Services/Theme.service';
import { FormsModule } from '@angular/forms';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'settings-page',
  imports: [PageLayoutComponent, FormsModule, NzRadioModule, TranslateModule],
  templateUrl: './settings.page.html',
  styleUrl: './settings.page.css'
})
export class SettingsPage {
  ThemeService = inject(ThemeService)
  TranslateService = inject(TranslateService)

 

  Themes = Object.entries(this.ThemeService.Themes).map(([key, values]) => ({
    key,
    ...values
  }));

  ChangeLanguage(Code:string){
    localStorage.setItem('language', Code)
    this.TranslateService.use(Code)
  }
}

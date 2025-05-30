import { Component, inject } from '@angular/core';
import { PageLayoutComponent } from '../../Components/page-layout/page-layout.component';
import { ThemeService } from '../../Services/Theme.service';
import { FormsModule } from '@angular/forms';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'user-settings-page',
  imports: [PageLayoutComponent, FormsModule, NzRadioModule, TranslateModule],
  templateUrl: './user-settings.page.html',
  styleUrl: './user-settings.page.css'
})
export class UserSettingsPage {
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

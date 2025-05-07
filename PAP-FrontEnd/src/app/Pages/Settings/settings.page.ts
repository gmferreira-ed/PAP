import { Component, inject } from '@angular/core';
import { PageLayout } from '../../Components/page-layout/page-layout.component';
import { ThemeService } from '../../Services/Theme.service';
import { FormsModule } from '@angular/forms';
import { NzRadioModule } from 'ng-zorro-antd/radio';

@Component({
  selector: 'settings-page',
  imports: [PageLayout, FormsModule, NzRadioModule],
  templateUrl: './settings.page.html',
  styleUrl: './settings.page.css'
})
export class SettingsPage {
  ThemeService = inject(ThemeService)


  Themes = Object.entries(this.ThemeService.Themes).map(([key, values]) => ({
    key,
    ...values
  }));
}

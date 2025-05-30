import { Component, inject } from '@angular/core';
import { PageLayoutComponent } from '../../Components/page-layout/page-layout.component';
import { ThemeService } from '../../Services/Theme.service';
import { FormsModule } from '@angular/forms';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'restaurant-settings',
  imports: [PageLayoutComponent, FormsModule, NzRadioModule, TranslateModule],
  templateUrl: './restaurant-settings.page.html',
  styleUrl: './restaurant-settings.page.css'
})
export class RestaurantSettingsPage {
}

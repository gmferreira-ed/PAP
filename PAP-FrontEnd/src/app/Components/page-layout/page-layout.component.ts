import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzMenuModule, NzMenuThemeType } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { ThemeService } from '../../Services/Theme.service';
import { TranslateModule } from '@ngx-translate/core';
import { IconsModule } from '../icon/icon.component';

@Component({
  selector: 'page-layout',
  imports: [RouterLink, NzMenuModule, NzIconModule, NzDividerModule, TranslateModule, IconsModule],
  templateUrl: './page-layout.component.html',
  styleUrl: './page-layout.component.css'
})
export class PageLayoutComponent {
  MenuCollapsed = false

  @ViewChild('PageContainer', { static: true }) LayoutContainer!: ElementRef;

  ThemeService = inject(ThemeService)
  Router = inject(Router)
  ActiveRoute = inject(ActivatedRoute)


  Capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  CurrentPage = this.Capitalize(this.Router.url.split('/')[1])

}

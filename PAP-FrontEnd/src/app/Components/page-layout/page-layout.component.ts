import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzMenuModule, NzMenuThemeType } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { ThemeService } from '../../Services/Theme.service';
import { TranslateModule } from '@ngx-translate/core';
import { IconsModule } from '../icon/icon.component';
import { NavbarModule } from '../navbar/navbar.module';

@Component({
  selector: 'page-layout',
  imports: [RouterLink, NzMenuModule, NzIconModule, NzDividerModule, TranslateModule, IconsModule, NavbarModule],
  templateUrl: './page-layout.component.html',
  styleUrl: './page-layout.component.less'
})
export class PageLayoutComponent {

  @ViewChild('PageContainer', { static: true }) LayoutContainer!: ElementRef;

  ThemeService = inject(ThemeService)
  Router = inject(Router)


  FormatTitle(value: string): string {
    const SplitTitle = value.split('-')
    const CapitalizedWords = SplitTitle.map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );
    return CapitalizedWords.join(' ')
  }

  CurrentPage = this.FormatTitle(this.Router.url.split('/')[1])


}

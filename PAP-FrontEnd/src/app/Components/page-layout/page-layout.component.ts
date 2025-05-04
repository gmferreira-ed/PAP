import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';

@Component({
  selector: 'page-layout',
  imports: [RouterLink, NzMenuModule, NzIconModule, NzDividerModule],
  templateUrl: './page-layout.component.html',
  styleUrl: './page-layout.component.css'
})
export class PageLayout {
  MenuCollapsed = false

  Router = inject(Router)
  ActiveRoute = inject(ActivatedRoute)

  Capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  CurrentPage = this.Capitalize(this.Router.url.split('/')[1])
  
}

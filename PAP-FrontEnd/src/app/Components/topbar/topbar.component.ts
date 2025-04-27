import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Location } from '@angular/common';

@Component({
  selector: 'topbar',
  imports: [RouterModule, NzMenuModule, NzIconModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.less'
})
export class Topbar {
  MenuCollapsed = false

  location = inject(Location)
  currentpage = this.location.path()
}

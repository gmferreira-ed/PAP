import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'topbar',
  imports: [RouterLink, NzMenuModule, NzIconModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class Topbar {
  MenuCollapsed = false
}

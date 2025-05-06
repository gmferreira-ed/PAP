import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Location } from '@angular/common';
import { AuthService } from '../../Services/Auth.service';
import { AppSettings } from '../../Services/AppSettings';

@Component({
  selector: 'topbar',
  imports: [RouterModule, NzMenuModule, NzIconModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.less'
})
export class Topbar {
  MenuCollapsed = false

  UserImagesURL = AppSettings.UserImagesURL
  
  location = inject(Location)
  AuthService = inject(AuthService)

  User = this.AuthService.User
  currentpage = this.location.path()
}

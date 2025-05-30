import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Location } from '@angular/common';
import { AuthService } from '../../Services/Auth.service';
import { AppSettings } from '../../Services/AppSettings';
import { HttpService } from '../../Services/Http.service';
import { IconsModule } from '../icon/icon.component';

@Component({
  selector: 'topbar',
  imports: [RouterModule, NzMenuModule, IconsModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.less'
})
export class Topbar {
  MenuCollapsed = false

  UserImagesURL = AppSettings.UserImagesURL

  Router = inject(Router)
  location = inject(Location)
  AuthService = inject(AuthService)
  HttpService = inject(HttpService)

  User = this.AuthService.User
  currentpage = this.location.path()

  async Logout() {
    const LogoutSucess = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'auth/logout', 'POST', 'Failed to logout')
    if (LogoutSucess) {
      this.Router.navigate(['/login']).then(()=>{
        window.location.reload()
      })
    }
  }
}

import { Component, inject, signal } from '@angular/core';
import { PageLayoutComponent } from '../../Components/page-layout/page-layout.component';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../../Services/Http.service';
import { AppSettings } from '../../Services/AppSettings';
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FileSelectComponent } from '../../Components/file-selector/file-select.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { UFile } from '../../../types/ufile';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { AuthService } from '../../Services/Auth.service';
import { LoadingScreen } from "../../Components/loading-screen/loading-screen.component";

@Component({
  selector: 'profile-page',
  imports: [PageLayoutComponent, DatePipe, TranslateModule, FileSelectComponent, NzIconModule, NzButtonModule, NzIconModule, LoadingScreen],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.less'
})
export class ProfilePage {
  User = signal<User | null>(null)

  UserImagesURL = AppSettings.UserImagesURL

  // Services
  Router = inject(Router)
  ActiveRoute = inject(ActivatedRoute)
  AuthService = inject(AuthService)
  HttpService = inject(HttpService)
  
  CurrentUser = this.AuthService.User

  // States
  LoadingInfo = false

  async ChangeUserImage(Files: UFile[]) {
    const File = Files[0]
    if (File) {
      
    }
  }

  async ngOnInit() {
    this.LoadingInfo = true
    
    const UserToSearch = this.ActiveRoute.snapshot.paramMap.get('username')

    const UsersURL = new URL('users', AppSettings.APIUrl)
    UsersURL.searchParams.append('user', UserToSearch || '')

    const [UserInfo] = await this.HttpService.MakeRequest(UsersURL, 'GET', 'Failed to fetch user info')

    if (UserInfo) {
      this.User.set(UserInfo)
      this.LoadingInfo = false
    }
  }
}

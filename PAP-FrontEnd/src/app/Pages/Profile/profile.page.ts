import { Component, inject, signal } from '@angular/core';
import { PageLayout } from '../../Components/page-layout/page-layout.component';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../../Services/Http.service';
import { AppSettings } from '../../Services/AppSettings';
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'profile-page',
  imports: [PageLayout, DatePipe, TranslateModule],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.css'
})
export class ProfilePage {
  User = signal<User | null>(null)

  UserImagesURL = AppSettings.UserImagesURL

  Router = inject(Router)
  ActiveRoute = inject(ActivatedRoute)
  HttpService = inject(HttpService)

  async ngOnInit() {
    const UserToSearch = this.ActiveRoute.snapshot.paramMap.get('username')

    const UsersURL = new URL('users',AppSettings.APIUrl )
    UsersURL.searchParams.append('user', UserToSearch || '')

    const [UserInfo] = await this.HttpService.MakeRequest(UsersURL, 'GET', 'Failed to fetch user info')

    if (UserInfo) {
      this.User.set(UserInfo)
    }
  }
}

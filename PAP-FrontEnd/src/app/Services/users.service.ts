import { inject, Injectable } from '@angular/core';
import { HttpService } from './Http.service';
import { AppSettings } from './AppSettings';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  HttpService = inject(HttpService)
  UsersURL = AppSettings.APIUrl+'users'
  TranslateService = inject(TranslateService)

  async GetUsers(PageNumber:any, PageSize:any){
      const UsersUrl = new URL(this.UsersURL);
      UsersUrl.searchParams.append('page', PageNumber);
      UsersUrl.searchParams.append('page_size', PageSize);

      const [Users] = await this.HttpService.MakeRequest(UsersUrl, 'GET', this.TranslateService.instant('Could not fetch users'))
      return Users
  }
}
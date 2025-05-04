import { inject, Injectable } from '@angular/core';
import { HttpService } from './Http.service';
import { AppSettings } from './AppSettings';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  HttpService = inject(HttpService)
  UsersURL = AppSettings.APIUrl+'users'

  async GetUsers(PageNumber:any, PageSize:any){
      const UsersUrl = new URL(this.UsersURL);
      UsersUrl.searchParams.append('page', PageNumber);
      UsersUrl.searchParams.append('pagesize', PageSize);

      const [Users] = await this.HttpService.MakeRequest(UsersUrl, 'GET', 'Could not fetch users')
      return Users
  }
}
import { Component, inject, signal } from '@angular/core';
import { NgStyle } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { PageLayout } from '../../Components/page-layout/page-layout.component';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { Router, RouterModule } from '@angular/router';
import { UsersService } from '../../Services/users.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { AppSettings } from '../../Services/AppSettings';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'users-page',
  imports: [PageLayout, NgStyle, NzTableModule, RouterModule, NzButtonModule, TranslateModule],
  templateUrl: './users.page.html',
  styleUrl: './users.page.css'
})

export class UsersPage {
  
    userService = inject(UsersService)
    router = inject(Router)
  
    UserImagesURL = AppSettings.UserImagesURL

    LoadingUsers = false
    UsersList:User[] = []
    PageCount = 0
    PageSize = 10
    PageNumber = 1
    
    async LoadPage(){
      this.LoadingUsers = true

      let UserPageResult = await this.userService.GetUsers(this.PageNumber, this.PageSize)

      this.UsersList = UserPageResult.Rows
      this.PageCount = UserPageResult.Pages*this.PageSize

      
      this.LoadingUsers = false
    }

    ViewProfile(UserInfo:User){
      this.router.navigate(['/profile/'+UserInfo.username])
    }
    ngOnInit(){
      this.LoadPage()
    }

    SwitchPage(PageNumber?:any){
      this.PageNumber = PageNumber
      this.LoadPage()
    }
    UpdatePageSize(PageSize?:any){
      this.PageSize = PageSize
      this.LoadPage()
    }
}

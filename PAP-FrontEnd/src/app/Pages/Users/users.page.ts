import { Component, inject, signal } from '@angular/core';
import { UsersService } from '../../Services/Users.service';
import { NgStyle } from '@angular/common';
import { PageLayout } from '../../Components/page-layout/page-layout.component';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'users-page',
  imports: [PageLayout, NgStyle, NzPaginationModule, RouterModule],
  templateUrl: './users.page.html',
  styleUrl: './users.page.css'
})

export class UsersPage {
  
    UserPfpUrl = "http://localhost:3000/images/profile-pictures/"

    UsersList = []
    userService = inject(UsersService)
    CurrentUserList = signal<any[]>([])
    PageCount = 0
    PageSize = 5
    PageNumber = 1
    
    async LoadPage(){
      
      let UserPageResult = await this.userService.GetUsers(this.PageNumber, this.PageSize)
      console.log(UserPageResult)

      this.CurrentUserList.set(UserPageResult.Rows)
      this.PageCount = UserPageResult.Pages*this.PageSize
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

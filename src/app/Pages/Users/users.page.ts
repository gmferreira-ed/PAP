import { Component, inject, signal } from '@angular/core';
import { PageLayout } from '../../Components/page-layout/page-layout.component';
import { UsersService } from '../../Services/users.service';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'users-page',
  imports: [PageLayout, NgStyle],
  templateUrl: './users.page.html',
  styleUrl: './users.page.css'
})

export class UsersPage {
  
    UsersList = []
    userService = inject(UsersService)
    CurrentUserList = signal<any[]>([])

    async ngOnInit( ){
      let UserPageResult = await this.userService.GetUsers()
      this.CurrentUserList.set(UserPageResult)
    }
}

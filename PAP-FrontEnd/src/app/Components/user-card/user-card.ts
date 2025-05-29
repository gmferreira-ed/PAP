import { Component, inject, Input } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { AppSettings } from '../../Services/AppSettings';

type UserData = {
  fullname: string
  username?: string
  email?: string

}
@Component({
  selector: 'user-card',
  imports: [RouterModule],
  templateUrl: './user-card.html',
  styleUrl: './user-card.less'
})
export class UserCard {
  @Input() UserData:UserData|undefined = undefined

  UserImagesURL = AppSettings.UserImagesURL
}

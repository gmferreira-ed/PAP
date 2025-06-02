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
import { IconsModule } from "../../Components/icon/icon.component";
import { NoDataComponent } from '../../Components/no-data/no-data';
import { AnimationItem } from 'lottie-web';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import GlobalUtils from '../../Services/GlobalUtils';
import { CardService } from '../../Services/Card.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AtendanceViewer } from "../../Components/attendance/attendance";
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'profile-page',
  imports: [PageLayoutComponent, DatePipe, TranslateModule, FileSelectComponent, NzIconModule,
    NzButtonModule, NzIconModule, LoadingScreen, IconsModule, NoDataComponent, LottieComponent, AtendanceViewer],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.less'
})
export class ProfilePage {
  User = signal<User | null>(null)

  UserImagesURL = AppSettings.UserImagesURL

  // Services
  Router = inject(Router)
  ActiveRoute = inject(ActivatedRoute)
  CardService = inject(CardService)
  AuthService = inject(AuthService)
  HttpService = inject(HttpService)
  NotificationService = inject(NzNotificationService)
  MessageService = inject(NzMessageService)

  CurrentUser = this.AuthService.User

  // States
  LoadingInfo = false
  UploadingImage = false
  TogglingUserStatus = false

  // Data
  UserEntries: any = []

  CardAnimationOptions: AnimationOptions = {
    path: 'Animations/card_read.json',
  };

  async ChangeUserImage(Files: UFile[]) {
    this.UploadingImage = true

    const File = Files[0]
    if (File) {
      const FileData = new FormData();
      FileData.append('image', File);

      const [UploadResult] = await this.HttpService.MakeRequest(AppSettings.ImagesURL + 'users', 'POST', 
        'Failed to upload user image', 
        FileData
      )

      if (UploadResult){
        this.MessageService.success('Successfully changed user image')
      }
    }

    this.UploadingImage = false
  }

  async ToggleUserStatus() {
    this.TogglingUserStatus = true

    const CurrentActive = this.User()!.active
    const Action = CurrentActive ? 'deactivated' : 'activated'

    const [ActiveToggleSucess] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'users', 'PATCH', 'Failed to deactivate user', {
      userid: this.User()!.userid,
      active: !CurrentActive
    })
    if (ActiveToggleSucess){
      this.MessageService.success("Sucessfully "+Action+' user')
      this.User()!.active = !CurrentActive
    }
    
    this.TogglingUserStatus = false
  }

  async PromptCard() {
    this.CardService.PromptingCardRead = true
  }

  async RemoveCard() {
    const [RemoveSucess] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'users/keycard', 'DELETE', 'Failed to disassociate keycard', {
      userid: this.User()!.userid
    })
    if (RemoveSucess)
      this.User()!.card_id = null
  }




  async ngOnInit() {

    // Listen to card scan
    this.CardService.OnScan.subscribe(async (CardID) => {
      if (this.CardService.PromptingCardRead) {
        const UserInfo = this.User()!
        const UserId = UserInfo.userid
        const FullName = UserInfo.fullname

        const [AttributeSucess] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'users/keycard', 'POST', 'Failed to attribute keycard', {
          userid: UserId,
          card_id: CardID
        })

        this.CardService.PromptingCardRead = false
        UserInfo.card_id = CardID
        this.NotificationService.success('Attribution sucess', 'The keycard ' + CardID + ' has been successfully attributed to ' + FullName)
      }
    })

    // User Info
    this.LoadingInfo = true

    const UserToSearch = this.ActiveRoute.snapshot.paramMap.get('username')

    const UsersURL = new URL('users', AppSettings.APIUrl)
    UsersURL.searchParams.append('user', UserToSearch || '')

    const [UserInfo] = await this.HttpService.MakeRequest(UsersURL, 'GET', 'Failed to fetch user info') as [User]

    if (UserInfo) {
      this.User.set(UserInfo)
      this.LoadingInfo = false
    }

  }
}

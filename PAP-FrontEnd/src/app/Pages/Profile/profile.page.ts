import { Component, effect, inject, signal, SimpleChanges, ViewChild } from '@angular/core';
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
import GlobalUtils, { DefaultChartOptions } from '../../Services/GlobalUtils';
import { CardService } from '../../Services/Card.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AtendanceViewer } from "../../Components/attendance/attendance";
import { NzMessageService } from 'ng-zorro-antd/message';
import { StatCardComponent } from "../../Components/stats-card/stat-card.component";
import { ApexChartOptions } from '../../../types/apex-chart';
import { Subscription } from 'rxjs';
import { DynamicCurrencyPipe } from '../../Pipes/dynamic-currency.pipe';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { UserRole } from '../../../shared/permissions';
import { PermissionsService } from '../../Services/Permissions.Service';
import { UnavailableInfo } from '../../Components/unavailable-info/unavailable-info';
import { TranslateService } from '@ngx-translate/core';

type Shift = {
  start: Date
  end: Date
  duration: number
}

@Component({
  selector: 'profile-page',
  imports: [PageLayoutComponent, DatePipe, TranslateModule, FileSelectComponent, NzIconModule, DynamicCurrencyPipe, NzDropDownModule,
    NzButtonModule, NzIconModule, LoadingScreen, IconsModule, NoDataComponent, LottieComponent, AtendanceViewer, StatCardComponent,
    UnavailableInfo],
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
  PermissionsService = inject(PermissionsService)
  MessageService = inject(NzMessageService)
  TranslateService = inject(TranslateService)

  CurrentUser = this.AuthService.User

  // States
  LoadingInfo = false
  UploadingImage = false
  TogglingUserStatus = false
  DisassociatingCard = false
  ChangingUserRole = false

  @ViewChild('FileSelector') FileSelector!: FileSelectComponent

  // Data
  Shifts: any = []
  Roles: UserRole[] = []

  // Variables
  CanViewEntries = this.AuthService.HasEndpointPermission('entries', 'GET') || this.CurrentUser() == this.User()?.username
  CanModifyUser = this.AuthService.HasEndpointPermission('users', 'PATCH')




  CardAnimationOptions: AnimationOptions = {
    path: 'Animations/card_read.json',
  };


  // Update functions fields
  async ChangeUserImage(Files: UFile[]) {
    this.UploadingImage = true

    const File = Files[0]
    if (File) {
      const FileData = new FormData();
      FileData.append('image', File);

      const [UploadResult] = await this.HttpService.MakeRequest(AppSettings.ImagesURL + 'users', 'POST',
        this.TranslateService.instant('Failed to upload user image'),
        FileData
      )

      if (UploadResult) {
        this.MessageService.success(this.TranslateService.instant('Successfully changed user image'))
      }
    }

    this.UploadingImage = false
  }

  async UpdateUserInfo(DataArray: any, ErrorMessage: string) {
    const [Sucess] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'users', 'PATCH', ErrorMessage,
      DataArray
    )
    return Sucess
  }

  async ChangeUserRole(RoleName: string) {
    this.ChangingUserRole = true

    const ActiveToggleSucess = await this.UpdateUserInfo({
      role: RoleName,
      userid: this.User()?.userid,
    }, this.TranslateService.instant('Failed to change user role'))

    if (ActiveToggleSucess) {
      this.MessageService.success(this.TranslateService.instant('Sucessfully changed user role'))
      this.LoadUserInfo()
    }

    this.ChangingUserRole = false
  }

  async ToggleUserStatus() {
    this.TogglingUserStatus = true

    const CurrentActive = this.User()!.active
    const Action = CurrentActive ? 'deactivated' : 'activated'

    const ActiveToggleSucess = await this.UpdateUserInfo({
      userid: this.User()!.userid,
      active: !CurrentActive
    }, this.TranslateService.instant('Failed to toggle user status'))

    if (ActiveToggleSucess) {
      const ActionMessage = `Successfully ${Action} user`
      this.MessageService.success(this.TranslateService.instant(ActionMessage))
      this.User()!.active = !CurrentActive
    }

    this.TogglingUserStatus = false
  }

  // CARD UTILS
  async PromptCard() {
    this.CardService.PromptingCardRead = true
  }

  async RemoveCard() {
    this.DisassociatingCard = true

    const [RemoveSucess] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'users/keycard', 'DELETE', this.TranslateService.instant('Failed to disassociate keycard'), {
      userid: this.User()!.userid
    })
    if (RemoveSucess)
      this.User()!.card_id = null

    this.DisassociatingCard = false
  }

  // STATS
  ShiftChartOptions = {
    ...DefaultChartOptions,
    chart: {
      ...DefaultChartOptions.chart,
      width: '100%',
    },
    stroke: {
      curve: 'straight',
    },

    annotations: {
      yaxis: [
        {
          y: AppSettings.WorkHourLimit,
          strokeDashArray: 0,
          borderColor: "rgba(178, 34, 34, 0.8)",
          label: {
            text: "Limit",
            style: {
              color: "#fff",
              background: "rgba(178, 34, 34, 0.9)"
            }
          }
        },
        {
          y: AppSettings.WorkHours,
          strokeDashArray: 0,
          borderColor: "rgba(34, 139, 34, 0.8)",
          label: {
            text: "Normal Shift",
            style: {
              color: "#000",
              background: "rgba(200, 200, 200, 0.6)"
            }
          }
        }
      ],
    },

    markers: {
      size: 2,
      strokeWidth: 1
    },


    tooltip: {
      ...DefaultChartOptions.tooltip,
      y: {
        formatter: (val: number) => {
          const hours = Math.floor(val);
          const minutes = Math.round((val - hours) * 60);
          return `${hours}h : ${minutes.toString().padStart(2, '0')}m`;
        },
      },
    },


    yaxis: {
      labels: {
        formatter: (val: number) => {
          const hours = Math.floor(val);
          const minutes = Math.round((val - hours) * 60);
          return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
        }
      },
      min: 0,
      max: 24,
      forceNiceScale: true,
      tickAmount: 5
    }
  } as ApexChartOptions

  TotalHours = 0

  TotalFinalPay = 0
  TotalNormalPay = 0
  TotalExtraPay = 0
  TotalMealAllowance = 0


  UserEntries?: any[] = undefined
  ShiftsMap?: { [key: string]: number }

  async SalaryRangeChanged(dateRange?: [number?, number?]) {

    // The function triggers early on load, therefore we wait
    while (!this.ShiftsMap) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    const ShiftsMap = this.ShiftsMap

    const ExtraMinutesLimit = (AppSettings.WorkHourLimit - AppSettings.WorkHours) * 60

    let TotalHours = 0
    let TotalExtraMinutes = 0
    let TotalMealAllowance = 0

    for (const dayKey in ShiftsMap) {
      const [year, month, day] = dayKey.split('-').map(Number);
      const dayDate = new Date(year, month - 1, day);
      const TimeStamp = dayDate.getTime()

      if (dateRange && dateRange[0] && dateRange[1] && (TimeStamp < dateRange[0] || TimeStamp > dateRange[1])) continue;

      const Duration = ShiftsMap[dayKey]
      const NormalHoursWorked = Math.min(Math.round(Duration), AppSettings.WorkHours)
      const ExtraMinutesWorked = 60 * Math.max(0, Duration - AppSettings.WorkHours)


      TotalHours += NormalHoursWorked
      TotalExtraMinutes += Math.min(ExtraMinutesWorked, ExtraMinutesLimit)
      TotalMealAllowance += AppSettings.MealAllowance
    }

    this.TotalMealAllowance = TotalMealAllowance
    this.TotalExtraPay = Math.floor((TotalExtraMinutes / AppSettings.ExtraPayMinuteRate) * AppSettings.ExtraPay)
    this.TotalNormalPay = Math.floor(TotalHours * AppSettings.PayPerHour)
    this.TotalFinalPay = TotalMealAllowance + this.TotalNormalPay + this.TotalExtraPay
  }

  FormatTotal(Value: number) {
    const hours = Math.floor(Value);
    const minutes = Math.round((Value - hours) * 60);
    const paddedMinutes = minutes.toString().padStart(2, '0')
    return `${hours}h:${paddedMinutes}m`
  }
  EntriesChanged(UserEntries?: any[], dateRange?: [number?, number?]) {


    if (UserEntries) {

      let TotalHours = 0
      const ReversedEntries = [...UserEntries].reverse()
      const Shifts: Shift[] = []
      const ChartShifts: any[] = []

      for (let i = 1; i < ReversedEntries.length; i++) {
        const Entry = ReversedEntries[i]
        const LastEntry = ReversedEntries[i - 1]

        if (LastEntry && LastEntry.action == 'Entry') {
          const Start = new Date(LastEntry.timestamp)
          const End = new Date(Entry.timestamp)
          const Duration = (End.getTime() - Start.getTime()) / 1000 / 60 / 60
          const Shift = {
            start: Start,
            end: End,
            duration: Duration
          };
          Shifts.push(Shift)
        }
      }

      const ShiftsMap: { [key: string]: number } = {};
      for (const shift of Shifts) {
        const dayKey = shift.start.getFullYear() + '-' + (shift.start.getMonth() + 1).toString().padStart(2, '0') + '-' + shift.start.getDate().toString().padStart(2, '0');
        ShiftsMap[dayKey] = (ShiftsMap[dayKey] || 0) + shift.duration;
      }

      for (const dayKey in ShiftsMap) {
        const [year, month, day] = dayKey.split('-').map(Number);
        const dayDate = new Date(year, month - 1, day);
        const Duration = ShiftsMap[dayKey]
        const TimeStamp = dayDate.getTime()
        ChartShifts.push([TimeStamp, Duration]);

        if (dateRange && dateRange[0] && dateRange[1] && (TimeStamp < dateRange[0] || TimeStamp > dateRange[1])) continue;
        TotalHours += Duration
      }


      this.ShiftChartOptions = {
        ...this.ShiftChartOptions,
        series: [{ name: 'Duration', data: ChartShifts }],
      };

      this.TotalHours = TotalHours
      this.UserEntries = UserEntries
      this.ShiftsMap = ShiftsMap
    }
  }


  ScanSound = new Audio('Sounds/scan-sucess.mp3');
  ErrorSound = new Audio('Sounds/scan-error.mp3');

  // LOADING

  async LoadUserInfo() {
    this.LoadingInfo = true

    // When navigating from a profile page to another, this needs to be reset in case of missing permissions
    this.TotalFinalPay = 0
    this.TotalHours = 0

    const UserToSearch = this.ActiveRoute.snapshot.paramMap.get('username')

    const UsersURL = new URL('users/user', AppSettings.APIUrl)
    UsersURL.searchParams.append('user', UserToSearch || '')

    const [UserInfo] = await this.HttpService.MakeRequest(UsersURL, 'GET', this.TranslateService.instant('Failed to fetch user info')) as [User]

    if (UserInfo) {
      this.User.set(UserInfo)
    }

    this.LoadingInfo = false
  }


  async ngOnInit() {

    this.ActiveRoute.params.subscribe((params) => {
      const Username = params['username']
      if (Username) {
        this.LoadUserInfo()
      }
    })

    this.LoadUserInfo()
    const Roles = await this.PermissionsService.LoadRoles()
    this.Roles = Roles
  }


  private ScanConnection?: Subscription;

  constructor() {

    effect(() => {
      this.CanViewEntries = this.AuthService.HasEndpointPermission('entries', 'GET') || this.CurrentUser() == this.User()?.username
    })

    console.log('Connected scan event')
    this.ScanConnection = this.CardService.OnScan.subscribe(async (CardID) => {
      console.log('Scan event received')
      if (this.CardService.PromptingCardRead) {
        const UserInfo = this.User()!
        const UserId = UserInfo.userid
        const FullName = UserInfo.fullname

        const [AttributeSucess] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'users/keycard', 'POST', this.TranslateService.instant('Failed to attribute keycard: '), {
          userid: UserId,
          card_id: CardID
        })

        if (AttributeSucess) {
          UserInfo.card_id = CardID
          this.NotificationService.success(this.TranslateService.instant('Attribution sucess'), this.TranslateService.instant('The keycard') + ' ' + CardID + this.TranslateService.instant('has been successfully attributed to') + ' ' + FullName)
          this.ScanSound.play()
        } else {
          this.ErrorSound.play()
        }

        this.CardService.PromptingCardRead = false
      }
    })
  }

  ngOnDestroy() {
    if (this.ScanConnection) {
      this.ScanConnection.unsubscribe();
      console.log('Disconnected scan event')
    }
  }
}

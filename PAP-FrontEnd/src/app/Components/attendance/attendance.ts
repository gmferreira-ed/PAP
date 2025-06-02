import { DatePipe } from '@angular/common';
import { Component, inject, HostBinding, Input, input, Output, EventEmitter, Signal, signal, effect } from '@angular/core';
import { NoDataComponent } from '../no-data/no-data';
import { IconsModule } from '../icon/icon.component';
import { LoadingScreen } from '../loading-screen/loading-screen.component';
import { AppSettings } from '../../Services/AppSettings';
import { HttpService } from '../../Services/Http.service';


@Component({
  selector: 'attendance-view',
  imports: [DatePipe, NoDataComponent, IconsModule, LoadingScreen],

  templateUrl: 'attendance.html',
  styleUrl: 'attendance.less'
})


export class AtendanceViewer {
  @Input() SelectedUser: Signal<User | null> = signal(null)
  @Input() AwaitUser = false

  UserEntries: any = []
  LoadingEntries = true

  HttpService = inject(HttpService)

  UserImagesURL = AppSettings.UserImagesURL

  async LoadUserEntries() {
    this.LoadingEntries = true

    const [UserEntries] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'entries', 'GET', 'Failed to load user attendance', {
      userid: this.SelectedUser()?.userid,
      page_size: 6,
    }) as [any[]]

    if (UserEntries) {
      this.UserEntries = UserEntries.map((EntryInfo: any) => ({
        ...EntryInfo,
        action: EntryInfo.action.charAt(0).toUpperCase() + EntryInfo.action.slice(1),
        timestamp: new Date(EntryInfo.timestamp)
      }))
    }

    this.LoadingEntries = false
  }

  GetFormmatedTime(to: Date = new Date()): string {
    const fromDate = new Date();
    const diffInSeconds = Math.floor((fromDate.getTime() - to.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `Now`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }

    // If older than 1 day, return YYYY-MM-DD format
    return fromDate.toISOString().split('T')[0];
  }

  constructor() {
    effect(() => {
      this.LoadUserEntries()
    })
  }

  async ngOnInit() {
    setTimeout(() => {
      if (!this.AwaitUser) {
        this.LoadUserEntries()
      }
    }, 1);

    const EntriesWebsocket = await this.HttpService.ConnectToWebsocket('entries')
    EntriesWebsocket.OnMessage = (Message, Data) => {
      const CurrentUserInfo = this.SelectedUser()
      if (!CurrentUserInfo || Data.userid == CurrentUserInfo?.userid) {
        this.LoadUserEntries()
      }
    }
  }
}


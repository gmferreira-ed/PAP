import { DatePipe } from '@angular/common';
import { Component, inject, HostBinding, Input, input, Output, EventEmitter, Signal, signal, effect } from '@angular/core';
import { NoDataComponent } from '../no-data/no-data';
import { IconsModule } from '../icon/icon.component';
import { LoadingScreen } from '../loading-screen/loading-screen.component';
import { AppSettings } from '../../Services/AppSettings';
import { HttpService } from '../../Services/Http.service';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { ScrollingModule } from '@angular/cdk/scrolling';


@Component({
  selector: 'attendance-view',
  imports: [DatePipe, NoDataComponent, IconsModule, LoadingScreen, NzToolTipModule, ScrollingModule],

  templateUrl: 'attendance.html',
  styleUrl: 'attendance.less'
})


export class AtendanceViewer {
  @Input() SelectedUser: Signal<User | null> = signal(null)
  @Input() AwaitUser = false

  @Input() UserEntries: any = []
  @Output() UserEntriesChange = new EventEmitter()

  LoadingEntries = true

  HttpService = inject(HttpService)

  UserImagesURL = AppSettings.UserImagesURL
  AppSettings = AppSettings

  async LoadUserEntries() {
    this.LoadingEntries = true

    let [UserEntries] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'entries', 'GET', 'Failed to load user attendance', {
      userid: this.SelectedUser()?.userid,
      page_size: 6,
    }) as [any[]]


    if (UserEntries) {
      UserEntries = UserEntries.map((EntryInfo: any) => ({
        ...EntryInfo,
        action: EntryInfo.action.charAt(0).toUpperCase() + EntryInfo.action.slice(1),
        timestamp: new Date(EntryInfo.timestamp)
      }))
      this.UserEntries = UserEntries
      this.UserEntriesChange.emit(UserEntries)
    }

    this.LoadingEntries = false
  }


  constructor() {
    effect(() => {
      if (this.SelectedUser()) {
        this.LoadUserEntries()
      }
    })
  }

  async ngOnInit() {
    if (!this.AwaitUser) {
      this.LoadUserEntries()
    }

    const EntriesWebsocket = await this.HttpService.ConnectToWebsocket('entries')
    EntriesWebsocket.OnMessage = (Message, Data) => {
      const CurrentUserInfo = this.SelectedUser()
      if (!CurrentUserInfo || Data.userid == CurrentUserInfo?.userid) {
        this.LoadUserEntries()
      }
    }
  }


  // Utils
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

}


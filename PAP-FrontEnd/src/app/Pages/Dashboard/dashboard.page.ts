import { Component, inject, ViewChild } from '@angular/core';
import { PageLayoutComponent } from '../../Components/page-layout/page-layout.component';
import { RestaurantLayout } from "../../Components/layout/layout.component";
import { AtendanceViewer } from "../../Components/attendance/attendance";
import { ScrollingModule } from '@angular/cdk/scrolling';
import { UserCard } from "../../Components/user-card/user-card";
import { DatePipe } from '@angular/common';
import { DurationPipe } from '../../Pipes/duration.pipe';
import { HttpService } from '../../Services/Http.service';
import { AppSettings } from '../../Services/AppSettings';
import { LoadingScreen } from "../../Components/loading-screen/loading-screen.component";
import GlobalUtils from '../../Services/GlobalUtils';
import { IconsModule } from "../../Components/icon/icon.component";
import { NoDataComponent } from '../../Components/no-data/no-data';
import { OrdersService } from '../../Services/Orders.service';
import { DynamicCurrencyPipe } from '../../Pipes/dynamic-currency.pipe';
import { AuthService } from '../../Services/Auth.service';
import { UnavailableInfo } from '../../Components/unavailable-info/unavailable-info';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DynamicDatePipe } from '../../Pipes/dynamic-date.pipe';

type BestSeller = {
  name: string
  sales: number
}
@Component({
  selector: 'dashboard-page',
  imports: [PageLayoutComponent, RestaurantLayout, AtendanceViewer, ScrollingModule, UserCard, DurationPipe, LoadingScreen,
    DynamicCurrencyPipe, IconsModule, NoDataComponent, UnavailableInfo, TranslateModule, DynamicDatePipe],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.less',
})
export class DashboardPage {

  // Services
  HttpService = inject(HttpService)
  OrdersService = inject(OrdersService)
  AuthService = inject(AuthService)
  TranslateService = inject(TranslateService)

  @ViewChild('AttendanceView') AttendanceView?:AtendanceViewer

  // Data
  WorkingStaff: any[] = []
  Reservations: any[] = []
  CategorizedRevenue: any[] = []
  Revenue?: number

  TotalTables = 0
  OccupiedTables = 0
  AvailableTables = 0
  ReservedTables = 0


  // Variables
  Now = new Date()
  TodayStart = new Date()
  TodayEnd = new Date()

  MenuImagesURL = AppSettings.ImagesURL + 'menu/'

  CanViewRevenue = this.AuthService.HasEndpointPermission('revenue-categorized', 'GET')
  CanViewEntries = this.AuthService.HasEndpointPermission('entries', 'GET')
  CanViewReservations = this.AuthService.HasEndpointPermission('reservations', 'GET')

  // States
  LoadingReservations = false
  LoadingRevenue = false
  LoadingTables = false

  // Loading functions
  LoadWorkingStaff(Attendance: any[]) {

    const DayStart = this.TodayStart.getTime()
    const DayEnd = this.TodayEnd.getTime()

    const UserStatuses: { [userid: string]: { name: string, lastAction: string, entry?: any } } = {};


    const TodayEntries = Attendance.filter((a) => {
      const Time = new Date(a.timestamp)
      const Timestamp = Time.getTime()

      return Timestamp >= DayStart && Timestamp <= DayEnd
    })

    for (const entry of TodayEntries) {
      const userid = entry.userid
      if (!UserStatuses[userid]) {
        UserStatuses[userid] = { name: entry.name || entry.fullname || '', lastAction: '', entry: undefined };
      }
      UserStatuses[userid].lastAction = entry.action;
      if (entry.action === 'Entry') {
        UserStatuses[userid].entry = entry
      } else if (entry.action === 'Exit') {
        UserStatuses[userid].entry = undefined
      }
    }

    this.WorkingStaff = Object.values(UserStatuses)
      .filter(u => u.lastAction === 'Entry' && u.entry)
      .map(u => {
        return {
          ...u.entry,
        }
      })
  }

  async LoadReservations() {

    if (this.CanViewReservations){
      this.LoadingReservations = true

      const [Reservations] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'reservations', 'GET', this.TranslateService.instant('Failed to load reservations'), {
        StartDate: GlobalUtils.ToSQLDate(this.Now),
        EndDate: GlobalUtils.ToSQLDate(this.TodayEnd),
      }) as [any[]]

      if (Reservations) {
        this.Reservations = Reservations.filter((Reservation) => {
          const ReservTimestamp = new Date(Reservation.date).getTime()
          return this.Now.getTime() < ReservTimestamp
        })
      }


      this.LoadingReservations = false
    }
  }

  async LoadRevenue() {

    if (this.CanViewRevenue) {
      this.LoadingRevenue = true

      const [CategorizedRevenue] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'revenue-categorized',
        'GET', this.TranslateService.instant('Failed to load revenue'), {
        StartDate: GlobalUtils.ToSQLDate(this.TodayStart),
        EndDate: GlobalUtils.ToSQLDate(this.TodayEnd),
      }) as [any[]]

      this.CategorizedRevenue = CategorizedRevenue
      this.Revenue = CategorizedRevenue[0]?.total_revenue_all_products || 0

      this.LoadingRevenue = false
    }
  }

  async LoadTables() {
    this.LoadingTables = true

    const Tables = await this.OrdersService.Tables.Get() as Record<string, any>;

    let Occupied = 0
    let Available = 0
    let Total = 0

    for (const Table of Object.values(Tables)) {
      Total += 1
      if (Table.status == 'OnGoing') {
        Occupied += 1
      } else {
        Available += 1
      }
    }

    this.TotalTables = Total
    this.OccupiedTables = Occupied
    this.AvailableTables = Available
    this.LoadingTables = false
  }

  Date(Obj: any) {
    return new Date(Obj)
  }

  // Pre-load
  constructor() {
    const TodayStart = new Date()
    TodayStart.setUTCHours(0, 0, 0, 0)
    const TodayEnd = new Date(TodayStart)
    TodayEnd.setUTCDate(TodayStart.getUTCDate() + 1)
    TodayEnd.setMilliseconds(- 1)

    this.TodayStart = TodayStart
    this.TodayEnd = TodayEnd
  }

  // Dashboard Init
  async ngOnInit() {
    this.LoadReservations()
    this.LoadRevenue()
    this.LoadTables()
  }

  FormatTotal(Value: number) {
    const hours = Math.floor(Value);
    const minutes = Math.round((Value - hours) * 60);
    const paddedMinutes = minutes.toString().padStart(2, '0')
    return `${hours}h:${paddedMinutes}m`
  }
}


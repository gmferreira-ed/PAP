import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { PageLayoutComponent } from '../../Components/page-layout/page-layout.component';
import { DatePipe } from '@angular/common';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrdersService } from '../../Services/Orders.service';

import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NoDataComponent } from '../../Components/no-data/no-data';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { IconsModule } from '../../Components/icon/icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { RestaurantLayout } from "../../Components/layout/layout.component";
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { HttpService } from '../../Services/Http.service';
import { AppSettings } from '../../Services/AppSettings';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LoadingScreen } from "../../Components/loading-screen/loading-screen.component";
import { Vector2 } from '../../../types/vector';
import { AuthService } from '../../Services/Auth.service';


function ToSQLDate(Date: Date) {
  return Date.toISOString().slice(0, 19).replace('T', ' ')
}

@Component({
  selector: 'schedule-page',
  imports: [PageLayoutComponent, DatePipe, NzRadioModule, FormsModule, NzEmptyModule, NoDataComponent, NzButtonModule, NzIconModule, IconsModule,
    TranslateModule, NzModalModule, ReactiveFormsModule, NzFormModule, NzInputModule, NzDatePickerModule, NzInputNumberModule, RestaurantLayout,
    NzTimePickerModule, LoadingScreen],
  templateUrl: './schedule.page.html',
  styleUrl: './schedule.page.less'
})
export class SchedulePage {

  ViewType: string = localStorage.getItem('calendar_view') || 'Week'
  CurrentDate: Date = new Date()
  Today: Date = new Date()

  // DOM Uses
  @ViewChild('ScheduleContainer') ScheduleContainer!: ElementRef
  @ViewChild('SchedulePrompt') SchedulePrompt!: ElementRef
  SheduleScroll = 0
  SchedulePromptTop = 0
  SchedulePromptLeft = 0

  // CONFIGURATION
  OpeningHours = new Date(5, 5, 10, 8, 30, 0, 0)
  ClosingHours = new Date(5, 5, 10, 23, 0, 0, 0)
  TotalHoursOpen = (this.ClosingHours.getTime() - this.OpeningHours.getTime()) / 1000 / 60 / 60


  // SERVICES
  OrdersService = inject(OrdersService)
  HttpService = inject(HttpService)
  MessageService = inject(NzMessageService)
  AuthService = inject(AuthService)

  // DATA
  Reservations: any[] = []
  TodayReservations: any[] = []

  // STATES
  LoadingTodayReservations = false
  LoadingReservations = false
  PromptingSchedule = false
  BookingReservation = false
  ReservationsModalVisible = false
  DeletingReservation = false
  TableSelectVisible = false

  // VARIABLES
  CanModifyReservations = this.AuthService.HasEndpointPermission('reservations', 'POST')


  // FORMS
  ReservationForm = new FormGroup({
    tableid: new FormControl<number | string | undefined>(undefined, [Validators.required]),
    guest_count: new FormControl('1', [Validators.required, Validators.min(1)]),
    date: new FormControl<Date | undefined>(undefined, [Validators.required]),
    time: new FormControl<Date | undefined>(undefined, [Validators.required]),
    name: new FormControl(undefined, []),
    phone: new FormControl(undefined, []),
    email: new FormControl(undefined, [Validators.email]),
    notes: new FormControl(undefined)
  })


  async BookReservation() {
    this.BookingReservation = true
    this.ReservationForm.disable()
    const FormValues = this.ReservationForm.value

    FormValues.tableid = Number(FormValues.tableid)

    const FinalDate = new Date(FormValues.time!)
    FinalDate.setFullYear(FormValues.date?.getFullYear()!)
    FinalDate.setMonth(FormValues.date?.getMonth()!)
    FinalDate.setDate(FormValues.date?.getDate()!)

    const FormattedDate = ToSQLDate(FinalDate)

    const Data = {
      tableid: FormValues.tableid,
      date: FormattedDate,
      guest_count: FormValues.guest_count,
      name: FormValues.name,
      phone: FormValues.phone,
      email: FormValues.email,
      notes: FormValues.notes,
    }

    const [Result] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'reservations', 'POST', 'Failed to book reservations', Data
    )

    if (Result) {
      this.ReservationForm.reset()
      this.ReservationsModalVisible = false
      this.PromptingSchedule = false

      this.MessageService.success("Sucessfully booked reservation")
      this.LoadReservations()
      if (this.IsSameDate(FinalDate, this.Today)) {
        this.LoadTodayReservations()
      }
    }

    this.BookingReservation = false
    this.ReservationForm.enable()
  }

  GetReservationRect(Reservation: any) {
    const ScheduleContainer = this.ScheduleContainer?.nativeElement as HTMLElement
    if (ScheduleContainer) {
      const TargetDate = Reservation.date
      const ContainerRect = ScheduleContainer.getBoundingClientRect()
      const ContainerHeight = ScheduleContainer.scrollHeight

      const OpeningHours = new Date(this.OpeningHours.getTime())
      OpeningHours.setFullYear(TargetDate.getFullYear())
      OpeningHours.setMonth(TargetDate.getMonth())
      if (TargetDate.getHours() < OpeningHours.getHours()) {
        OpeningHours.setDate(TargetDate.getDate() - 1)
      } else {
        OpeningHours.setDate(TargetDate.getDate())
      }

      const HoursSinceOpen = (TargetDate.getTime() - OpeningHours.getTime()) / 1000 / 60 / 60

      const Percentage = HoursSinceOpen / this.TotalHoursOpen

      const Y = Math.min(ContainerHeight * Percentage - 35 / 2, ContainerHeight - 35)

      let OtherReservationsAmount = 1
      let ReservationUniqueID = 0

      for (const OtherReservation of this.Reservations) {
        const Difference = Math.abs(OtherReservation.date.getTime() - TargetDate.getTime()) / 1000 / 60
        const IsSameID = Reservation.id == OtherReservation.id
        if (!IsSameID && Difference <= 30) {
          OtherReservationsAmount += 1
        } else if (IsSameID) {
          ReservationUniqueID = OtherReservationsAmount
        }
      }

      const Width = 100 / OtherReservationsAmount
      const X = 100 - (Width * ReservationUniqueID)
      return {
        X: X,
        Y: Y,
        Width: Width
      }
    }
    return {}
  }


  PromptBookReservation(Event: MouseEvent, DayDate: Date) {
    if (this.CanModifyReservations) {
      const ScheduleContainer = this.ScheduleContainer.nativeElement as HTMLElement
      const SchedulePrompt = this.SchedulePrompt.nativeElement as HTMLElement

      const ContainerRect = ScheduleContainer.getBoundingClientRect()
      const PromptRect = SchedulePrompt.getBoundingClientRect()

      const TargetY = Event.clientY - ContainerRect.top + ScheduleContainer.scrollTop
      const SchedulePercentage = TargetY / (ScheduleContainer.scrollHeight)


      const TargetAbsoluteHour = this.TotalHoursOpen * SchedulePercentage
      const minutes = Math.round((TargetAbsoluteHour % 1) * 60) // Offset
      const roundedMinutes = Math.round(minutes / 15) * 15;

      const TargetDate = new Date(this.OpeningHours)

      TargetDate.setHours(TargetDate.getHours() + Math.floor(TargetAbsoluteHour))
      TargetDate.setMinutes(TargetDate.getMinutes() + roundedMinutes)
      TargetDate.setFullYear(DayDate.getFullYear())
      TargetDate.setMonth(DayDate.getMonth())
      TargetDate.setDate(DayDate.getDate())

      this.PromptingSchedule = true
      this.SelectedReservation = false

      this.SchedulePromptTop = Math.min(TargetY, ScheduleContainer.scrollHeight - PromptRect.height - 20)
      this.SchedulePromptLeft = Math.min(Event.clientX - ContainerRect.left, ContainerRect.width - PromptRect.width - 20)

      this.ReservationForm.get('date')?.setValue(TargetDate)
      this.ReservationForm.get('time')?.setValue(TargetDate)
    }
  }


  // SHOW RESERVATION INF
  SelectedReservation: any = undefined
  ReservationPromptPosition = new Vector2()

  PromptReservationInfo(Event: MouseEvent, Reservation: any) {
    Event.stopPropagation()
    this.SelectedReservation = Reservation
    this.ReservationPromptPosition = new Vector2(Event.clientX, Event.clientY)
    this.PromptingSchedule = false
  }


  // CANCEL RESERVATION
  async DeleteReservation(Reservation: any) {
    this.DeletingReservation = true
    this.SelectedReservation = undefined

    const [DeleteResult] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'reservations', 'DELETE', 'Failed to cancel reservation', {
      reservation_id: Reservation.id
    })

    if (DeleteResult) {
      this.MessageService.success('Successfully canceled reservation')
      this.LoadReservations()
      if (this.IsSameDate(Reservation.date, this.Today)) {
        this.LoadTodayReservations()
      }
    }

    this.DeletingReservation = false
  }


  SetView(ViewType: string) {
    this.ViewType = ViewType as string
    this.SelectedReservation = undefined
    localStorage.setItem('calendar_view', ViewType)
    this.LoadReservations()
  }

  OnTableSelected(Table: any) {
    const TableID = Table.tableid as number
    this.TableSelectVisible = false
    this.ReservationForm.get('tableid')?.setValue(TableID)
  }


  IsSameDate(date1: Date, date2: Date) {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return d1.getTime() === d2.getTime();
  }

  DateFromDay(Day: number) {
    const ReturnDate = new Date(this.CurrentDate)
    ReturnDate.setDate(ReturnDate.getDate() + Day)
    return ReturnDate
  }

  GetMonthDays() {
    const Month = this.CurrentDate.getMonth()

    const TestDate = new Date(this.CurrentDate)
    TestDate.setDate(1)

    const Days = [];

    while (TestDate.getMonth() === Month) {
      Days.push(new Date(TestDate)); // clone the date object
      TestDate.setDate(TestDate.getDate() + 1);
    }

    return Days;
  }

  GetTimeIntervals() {
    const Result: Date[] = []


    const StartDate = new Date(this.OpeningHours)
    StartDate.setSeconds(0)
    StartDate.setMilliseconds(0)


    while (StartDate < this.ClosingHours) {
      const IntervalDate = new Date(StartDate)
      Result.push(IntervalDate)

      StartDate.setMinutes(StartDate.getMinutes() + 30)
    }

    return Result
  }



  async LoadTodayReservations() {
    this.LoadingTodayReservations = true

    const [TodayReservations] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'reservations', 'GET', `Failed to load today's reservations`, {
      StartDate: ToSQLDate(new Date()),
    })

    if (TodayReservations)
      this.TodayReservations = TodayReservations
        .map((reservation: any) => ({
          ...reservation,
          date: new Date(reservation.date)
        }))
        .filter((reservation: any) => reservation.date > this.Today)

    this.LoadingTodayReservations = false
  }

  NavigateTime(Amount: 1 | -1, Event: MouseEvent) {
    Event.stopPropagation()
    this.SelectedReservation = undefined
    const NewDate = new Date(this.CurrentDate)
    if (this.ViewType == 'Month') {
      NewDate.setMonth(NewDate.getMonth() + Amount)
    } else {
      NewDate.setDate(NewDate.getDate() + Amount)
    }
    this.CurrentDate = NewDate
    this.LoadReservations()
  }


  async LoadReservations() {
    this.LoadingReservations = true

    let StartDate: Date = new Date(this.CurrentDate)
    let EndDate: Date | undefined = new Date(this.CurrentDate)

    if (this.ViewType == 'Week') {
      EndDate.setDate(EndDate.getDate() + 3)
    }
    else if (this.ViewType == 'Month') {
      StartDate.setDate(1)
      EndDate.setMonth(EndDate.getMonth() + 1)
      EndDate.setDate(0)

      // console.log(StartDate)
      // console.log(EndDate)
    }
    else {
      EndDate = undefined
    }

    const StartSQLDate = ToSQLDate(StartDate)
    const EndSQLDate = EndDate && ToSQLDate(EndDate)

    const [Reservations] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'reservations', 'GET', 'Failed to get reservations', {
      StartDate: StartSQLDate,
      EndDate: EndSQLDate
    })

    if (Reservations) {
      this.Reservations = Reservations.map((reservation: any) => ({
        ...reservation,
        date: new Date(reservation.date)
      }))
    }

    this.LoadingReservations = false
  }






  GetFormmatedTimeTo(reservationDate: Date): string {
    let diff = reservationDate.getTime() - this.Today.getTime()

    if (diff <= 0) {
      if (reservationDate.getHours() < this.ClosingHours.getHours()) {
        reservationDate = new Date(reservationDate)
        reservationDate.setDate(reservationDate.getDate() + 1)
        diff = reservationDate.getTime() - this.Today.getTime()
      } else {
        return 'Now'
      }
    }

    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let parts: string[] = [];
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    if (seconds || parts.length === 0) parts.push(`${seconds}s`);

    return parts.join(' ');
  }

  ngOnInit() {
    this.LoadReservations()
    this.LoadTodayReservations()

    setInterval(() => {
      this.Today = new Date()
    }, 1000);
  }
}

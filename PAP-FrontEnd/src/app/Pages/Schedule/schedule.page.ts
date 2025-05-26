import { Component, inject } from '@angular/core';
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

@Component({
  selector: 'schedule-page',
  imports: [PageLayoutComponent, DatePipe, NzRadioModule, FormsModule, NzEmptyModule, NoDataComponent, NzButtonModule, NzIconModule, IconsModule,
    TranslateModule, NzModalModule, ReactiveFormsModule, NzFormModule, NzInputModule, NzDatePickerModule, NzInputNumberModule, RestaurantLayout,
  NzTimePickerModule],
  templateUrl: './schedule.page.html',
  styleUrl: './schedule.page.less'
})
export class SchedulePage {

  ViewType: string = 'Week'
  CurrentDate: Date = new Date()
  Today: Date = new Date()

  // CONFIGURATION
  OpeningHours = new Date(5, 5, 10, 8, 30, 0, 0)
  ClosingHours = new Date(5, 5, 11, 2, 0, 0, 0)


  // SERVICES
  OrdersService = inject(OrdersService)

  // VALUES
  Reservations = new Map()


  // STATES
  ReservationsModalVisible = false
  TableSelectVisible = false


  // FORMS
  ReservationForm = new FormGroup({
    tableid: new FormControl<number|string>('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    phone: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    guest_count: new FormControl(1, [Validators.required, Validators.min(1)]),
    date: new FormControl('', [Validators.required]),
    time: new FormControl('', [Validators.required]),
    notes: new FormControl('')
  })


  BookReservation() {

  }



  OnTableSelected(Table:any) {
    const TableID = Table.tableid as number
    this.TableSelectVisible = false
    this.ReservationForm.get('tableid')?.setValue(TableID)
  }


  ToArray(Obj: Record<any, any> | Map<any, any>) {
    return Object.values(Obj)
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


    while (StartDate <= this.ClosingHours) {
      const IntervalDate = new Date(StartDate)
      Result.push(IntervalDate)

      StartDate.setMinutes(StartDate.getMinutes() + 30)
    }

    return Result
  }
}

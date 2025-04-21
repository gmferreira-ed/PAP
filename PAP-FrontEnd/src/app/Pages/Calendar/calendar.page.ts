import { Component } from '@angular/core';
import { PageLayout } from '../../Components/page-layout/page-layout.component';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';

@Component({
  selector: 'calendar-page',
  imports: [PageLayout, NzCalendarModule],
  templateUrl: './calendar.page.html',
  styleUrl: './calendar.page.css'
})
export class CalendarPage {

}

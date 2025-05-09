import { Component } from '@angular/core';
import { PageLayoutComponent } from '../../Components/page-layout/page-layout.component';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';

@Component({
  selector: 'calendar-page',
  imports: [PageLayoutComponent, NzCalendarModule],
  templateUrl: './calendar.page.html',
  styleUrl: './calendar.page.css'
})
export class CalendarPage {

}

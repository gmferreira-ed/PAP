import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { Component, inject, HostBinding, Input, input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { ApexXAxis, ChartComponent, NgApexchartsModule, XAxisAnnotations } from 'ng-apexcharts';
import { ApexChartOptions } from '../../../types/apex-chart';
import { NoDataComponent } from '../no-data/no-data';
import { IconsModule } from "../icon/icon.component";
import { DynamicCurrencyPipe } from '../../Pipes/dynamic-currency.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { DynamicDatePipe } from '../../Pipes/dynamic-date.pipe';



@Component({
  selector: 'stat-card',
  imports: [DynamicCurrencyPipe, NgApexchartsModule, NoDataComponent, NgTemplateOutlet, IconsModule, DynamicDatePipe, TranslateModule],

  templateUrl: 'stat-card.component.html',
  styleUrl: 'stat-card.component.less'
})


export class StatCardComponent {
  @Input() StatName?: string
  @Input() StatTotalValue?: number
  @Input() FormatType?: 'currency'
  @Input() FormatCallback?: Function

  @Input() ChartOptions?: ApexChartOptions
  @Input() TimeOptions: string[] = ['Week', 'Month', 'Year', 'All']
  @Input() ChartsTimeOptions: { [key: string]: Partial<ApexXAxis> } = {}

  @Input() ShowChartTimeOptions = true
  @Input() ShowTimeNavigation = true

  @ViewChild("Chart", { static: false, read: ElementRef }) Chart!: ElementRef;

  @Input() ViewType = 'All'
  @Output() ViewTypeChanged = new EventEmitter<[number?, number?]>();

  @Input() DateRange: [number?, number?] = [0, 0]

  DateStart = new Date()

  UpdateChartView(ViewType: string) {
    this.ViewType = ViewType
    const ViewTypeInfo = this.ChartsTimeOptions[ViewType]!

    if (this.ChartOptions) {
      this.ChartOptions.xaxis = {
        ...this.ChartOptions!.xaxis,
        min: ViewTypeInfo.min,
        max: ViewTypeInfo.max,
      }
    }

    this.ViewTypeChanged.emit([ViewTypeInfo.min, ViewTypeInfo.max])
    this.DateRange = [ViewTypeInfo.min, ViewTypeInfo.max]
  }

  NavigateDate(direction: number) {
    const date = new Date(this.DateStart);
    switch (this.ViewType) {
      case 'Day':
        date.setDate(date.getDate() + (direction === 1 ? 1 : -1));
        break;
      case 'Week':
        date.setDate(date.getDate() + (direction === 1 ? 7 : -7));
        break;
      case 'Month':
        date.setMonth(date.getMonth() + (direction === 1 ? 1 : -1));
        break;
      case 'Year':
        date.setFullYear(date.getFullYear() + (direction === 1 ? 1 : -1));
        break;
      default:
        return;
    }
    this.DateStart = date;
    this.UpdateTimeOptions();
  }

  GetChartOptions(ViewType: string): Partial<ApexXAxis> {
    return this.ChartsTimeOptions[ViewType]
  }

  UpdateTimeOptions() {
    const today = this.DateStart;
    today.setHours(0, 0, 0, 0);

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    const yearStart = new Date(today.getFullYear(), 0, 1);
    const yearEnd = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);

    const DayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const DayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    this.ChartsTimeOptions = {
      "Day": {
        min: DayStart.getTime(),
        max: DayEnd.getTime(),
        labels: {
          format: 'HH:mm',
        }
      },
      "Week": {
        min: weekStart.getTime(),
        max: weekEnd.getTime(),
        labels: {
          format: 'DD MMM',
        }
      },
      "Month": {
        min: monthStart.getTime(),
        max: monthEnd.getTime(),
        labels: {
          format: 'DD MMM',
        }
      },
      "Year": {
        min: yearStart.getTime(),
        max: yearEnd.getTime(),
        labels: {
          format: 'MMM',
        }
      },
      "All": {
        min: undefined,
        max: undefined,
        labels: {
          format: 'MMM YY',
        }
      }
    }

    this.UpdateChartView(this.ViewType)
  }
  ngOnInit() {
    this.UpdateTimeOptions()
  }

  // Chart scroll error fix
  ngAfterViewInit() {
    if (this.Chart && this.Chart.nativeElement && this.ChartOptions?.chart.type != 'bar') {
      this.Chart.nativeElement.addEventListener('wheel', (e: Event) => {
        e.preventDefault();
      }, { passive: false });
      this.Chart.nativeElement.addEventListener('touchmove', (e: Event) => {
        e.preventDefault();
      }, { passive: false });
    }
  }
}


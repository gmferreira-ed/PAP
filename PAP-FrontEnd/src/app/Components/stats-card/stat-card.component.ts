import { CurrencyPipe, DatePipe, NgTemplateOutlet } from '@angular/common';
import { Component, inject, HostBinding, Input, input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { ApexXAxis, ChartComponent, NgApexchartsModule, XAxisAnnotations } from 'ng-apexcharts';
import { ApexChartOptions } from '../../../types/apex-chart';
import { NoDataComponent } from '../no-data/no-data';



@Component({
  selector: 'stat-card',
  imports: [CurrencyPipe, NgApexchartsModule, NoDataComponent, NgTemplateOutlet],

  templateUrl: 'stat-card.component.html',
  styleUrl: 'stat-card.component.less'
})


export class StatCardComponent {
  @Input() StatName?: string
  @Input() StatTotalValue?: number
  @Input() FormatType?: 'currency'

  @Input() ChartOptions?: ApexChartOptions
  @Input() ChartsTimeOptions: { [key: string]: Partial<ApexXAxis> } = {}
  @Input() ShowChartTimeOptions = true

  @ViewChild("Chart", { static: false, read:ElementRef }) Chart!: ElementRef;

  @Input() ViewType = 'Month'
  @Output() ViewTypeChanged = new EventEmitter<[number?, number?]>();

  UpdateChartView(ViewType: string) {
    this.ViewType = ViewType
    const ViewTypeInfo = this.ChartsTimeOptions[ViewType]!

    this.ChartOptions!.xaxis = {
      ...this.ChartOptions!.xaxis,
      min: ViewTypeInfo.min,
      max: ViewTypeInfo.max,
    }

    this.ViewTypeChanged.emit([ViewTypeInfo.min, ViewTypeInfo.max])
  }

  GetObjectKeys = Object.keys

  ngOnInit(){
     const today = new Date();

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    const yearStart = new Date(today.getFullYear(), 0, 1);
    const yearEnd = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);

    this.ChartsTimeOptions = {
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

    // Chart scroll error fix
  ngAfterViewInit() {
    if (this.Chart && this.Chart.nativeElement) {
      this.Chart.nativeElement.addEventListener('wheel', (e: Event) => {
        e.preventDefault();
      }, { passive: false });
      this.Chart.nativeElement.addEventListener('touchmove', (e: Event) => {
        e.preventDefault();
      }, { passive: false });
    }
  }
}


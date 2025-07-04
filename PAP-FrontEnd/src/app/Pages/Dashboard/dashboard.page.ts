import { Component } from '@angular/core';
import { PageLayoutComponent } from '../../Components/page-layout/page-layout.component';
import { RestaurantLayout } from "../../Components/layout/layout.component";
import { AtendanceViewer } from "../../Components/attendance/attendance";
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'dashboard-page',
  imports: [PageLayoutComponent, RestaurantLayout, AtendanceViewer, ScrollingModule],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.css'
})
export class DashboardPage {}


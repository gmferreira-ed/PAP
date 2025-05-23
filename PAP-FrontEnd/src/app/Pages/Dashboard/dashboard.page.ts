import { Component } from '@angular/core';
import { PageLayoutComponent } from '../../Components/page-layout/page-layout.component';
import { RestaurantLayout } from "../../Components/layout/layout.component";

@Component({
  selector: 'dashboard-page',
  imports: [PageLayoutComponent, RestaurantLayout],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.css'
})
export class DashboardPage {}


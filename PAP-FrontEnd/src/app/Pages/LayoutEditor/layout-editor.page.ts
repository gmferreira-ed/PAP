import { Component } from '@angular/core';
import { PageLayoutComponent } from '../../Components/page-layout/page-layout.component';
import { RestaurantLayout } from "../../Components/layout/layout.component";

@Component({
  selector: 'stocks-page',
  imports: [PageLayoutComponent, RestaurantLayout],
  templateUrl: './layout-editor.page.html',
  styleUrl: './layout-editor.page.css'
})
export class LayoutEditorPage {

}

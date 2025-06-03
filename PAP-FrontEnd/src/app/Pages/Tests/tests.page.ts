import { Component } from '@angular/core';
import { PageLayoutComponent } from '../../Components/page-layout/page-layout.component';

@Component({
  selector: 'tests-page',
  imports: [PageLayoutComponent],
  templateUrl: './tests.page.html',
  styleUrl: './tests.page.less'
})
export class TestsPage {
  Array = Array
}

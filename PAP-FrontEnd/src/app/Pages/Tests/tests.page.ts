import { Component } from '@angular/core';
import { PageLayoutComponent } from '../../Components/page-layout/page-layout.component';
import { LoaderComponent } from '../../Components/loader/loader.component';

@Component({
  selector: 'tests-page',
  imports: [PageLayoutComponent, LoaderComponent],
  templateUrl: './tests.page.html',
  styleUrl: './tests.page.less'
})
export class TestsPage {
  Array = Array
}

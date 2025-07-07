import { Component } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'error-page',
  imports: [TranslateModule],
  templateUrl: './error.page.html',
  styleUrl: './error.page.less'
})
export class ErrorPage {
}

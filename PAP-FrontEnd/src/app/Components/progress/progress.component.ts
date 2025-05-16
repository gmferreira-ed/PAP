import { Component, inject, HostBinding, Input, input, Output, EventEmitter } from '@angular/core';



@Component({
  selector: 'progress-viewer',
  imports: [],

  templateUrl: 'progress.component.html',
  styleUrl: 'progress.component.less'
})


export class ProgressComponent {

  @Input() Progress: number = 0
}


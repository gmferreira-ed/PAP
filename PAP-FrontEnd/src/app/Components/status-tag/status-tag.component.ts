import { HttpClient } from '@angular/common/http';
import { Component, inject, HostBinding, Input, input, Output, EventEmitter, ElementRef } from '@angular/core';
import { LoaderComponent } from '../loader/loader.component';



@Component({
  selector: 'status-tag',
  imports: [LoaderComponent],

  templateUrl: 'status-tag.component.html',
  styleUrl: 'status-tag.component.less'
})


export class StatusTagComponent {
    @Input() Loading = false

    @HostBinding('class') @Input()status = '';
}


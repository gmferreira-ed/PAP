import { Component, inject, HostBinding, Input, input, Output, EventEmitter } from '@angular/core';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';



interface Option {
  label:string,
  value:string,
  active:boolean,
  status:string
}

@Component({
  selector: 'dropdown',
  imports: [NzSpinModule, NzToolTipModule],

  templateUrl: 'dropdown.component.html',
  styleUrl: 'dropdown.component.less'
})


export class OptionsBar {

  @Input() Visible = false

  OnMouseEnter () {
    this.Visible = true
  }

  OnMouseLeave () {
    this.Visible = false
  }
}


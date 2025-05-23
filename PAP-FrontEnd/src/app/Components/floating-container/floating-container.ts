import { Component, inject, Input } from '@angular/core';
import { Location } from '@angular/common';
import { AuthService } from '../../Services/Auth.service';
import { AppSettings } from '../../Services/AppSettings';

@Component({
  selector: 'floating-container',
  imports: [],
  templateUrl: './floating-container.html',
  styleUrl: './floating-container.less'
})
export class FloatingContainer {
  @Input() Top = 0
  @Input() Left = 0
  @Input() Bottom = 0
  @Input() Right = 0
}

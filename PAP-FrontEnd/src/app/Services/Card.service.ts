import { EventEmitter, HostListener, inject, Injectable, Input, Output, signal } from '@angular/core';
import { AppSettings } from './AppSettings';
import { ActivatedRouteSnapshot, Route, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Form, FormGroup } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { HttpService } from './Http.service';

@Injectable({
  providedIn: 'root'
})

export class CardService {
  @Input() PromptingCardRead = false
  
  @Output() OnScan = new EventEmitter<number>();

  // Host listener in app.component.ts
}

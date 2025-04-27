import { inject, Injectable, signal } from '@angular/core';
import { AppSettings } from './AppSettings';
import { ActivatedRouteSnapshot, Route, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Form, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})

export class FormsService {

    MarkAllAsDirty(Form:FormGroup){
      Object.values(Form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true })
        }
    }
  )}
}

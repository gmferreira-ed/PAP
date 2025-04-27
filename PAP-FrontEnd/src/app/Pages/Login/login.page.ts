import { Component, inject } from '@angular/core';
import { AuthService } from '../../Services/Auth.service';
import { Router } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { FormBuilder, FormControl, FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';

@Component({
  selector: 'login-page',
  imports: [NzFormModule, ReactiveFormsModule, FormsModule, NzInputModule, NzButtonModule, NzDividerModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.less'
})
export class LoginPage {

  AuthService = inject(AuthService)
  router = inject(Router)

  LoginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  })

  ngOnInit(){
    const User = this.AuthService.User()
    if (User){
      this.router.navigate(['/home'])
    }
  }
}

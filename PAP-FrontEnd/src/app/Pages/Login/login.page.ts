import { Component, inject } from '@angular/core';
import { AuthService } from '../../Services/Auth.service';
import { Router } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { FormBuilder, FormControl, FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { HttpService } from '../../Services/Http.service';
import { AppSettings } from '../../Services/AppSettings';

@Component({
  selector: 'login-page',
  imports: [NzFormModule, ReactiveFormsModule, FormsModule, NzInputModule, NzButtonModule, NzDividerModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.less'
})
export class LoginPage {

  HttpService = inject(HttpService)
  AuthService = inject(AuthService)
  router = inject(Router)
  LoggingIn = false

  LoginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  })

  async Login() {
    this.LoginForm.disable()
    this.LoggingIn = true

    const [LoginResult, LoginError] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'auth/login', 'POST', 'Failed to log in', this.LoginForm.value)
    if (LoginResult){
      this.router.navigate(['/dashboard'])
    }else{
      if (LoginError == 'Incorrect password'){
         this.LoginForm.get('password')?.reset()

      }else if(LoginError == 'User does not exist'){
         this.LoginForm.get('username')?.reset()
      }
    }
    
    this.LoggingIn = false
    this.LoginForm.enable()
  }

  ngOnInit() {
    const User = this.AuthService.User()
    if (User) {
      this.router.navigate(['/dashboard'])
    }
  }
}

import { Component, inject } from '@angular/core';
import { AuthService } from '../../Services/Auth.service';
import { Router, RouterModule } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { FormBuilder, FormControl, FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { HttpService } from '../../Services/Http.service';
import { AppSettings } from '../../Services/AppSettings';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'login-page',
  imports: [NzFormModule, ReactiveFormsModule, FormsModule, NzInputModule, NzButtonModule, NzDividerModule, TranslateModule, RouterModule, NzIconModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.less'
})
export class LoginPage {

  HttpService = inject(HttpService)
  AuthService = inject(AuthService)
  TranslateService = inject(TranslateService)
  router = inject(Router)

  LoggingIn = false
  Initialized = false
  passwordVisible = false

  LoginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  })

  async Login() {
    this.LoginForm.disable()
    this.LoggingIn = true

    const [LoginResult, LoginError] = await this.HttpService.MakeRequest(
      AppSettings.APIUrl + 'auth/login',
      'POST',
      this.TranslateService.instant('Failed to log in'),
      this.LoginForm.value
    )
    if (LoginResult){
      this.router.navigate(['/dashboard'])
    }else{
      if (LoginError?.ErrorMessage == this.TranslateService.instant('Incorrect password')){
         this.LoginForm.get('password')?.reset()

      }else if(LoginError?.ErrorMessage == this.TranslateService.instant('User does not exist')){
         this.LoginForm.get('username')?.reset()
      }
      else if(LoginError?.ErrorCode ==403){
        console.log(LoginError)
         this.router.navigate(['register'], {queryParams:{verifying:LoginError['email']}})
      }
    }
    
    this.LoggingIn = false
    this.LoginForm.enable()
  }

  ngOnInit(){
    setTimeout(() => {
      this.Initialized = true
    }, 5);
  }
}

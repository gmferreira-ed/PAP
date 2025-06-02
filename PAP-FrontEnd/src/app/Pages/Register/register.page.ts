import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { IconsModule } from '../../Components/icon/icon.component';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';
import { RouterLink } from '@angular/router';
import { AnimationItem } from 'lottie-web';
import { NgOtpInputModule } from 'ng-otp-input';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'register-page',
  imports: [NzButtonModule, ReactiveFormsModule, FormsModule, IconsModule, NzStepsModule, NzDatePickerModule, NzFormModule, NzInputModule, NzIconModule,
    LottieComponent, RouterLink, NgOtpInputModule, TranslatePipe
  ],
  templateUrl: './register.page.html',
  styleUrl: './register.page.less'
})
export class RegisterPage {
  StepIndex = 2
  CurrentStepIndex = 2

  VerificationCode = ''
  CreatingAccount = false
  VerifyingAccount = false

  EmailSentOptions: AnimationOptions = {
    path: 'Animations/MailSent.json',
  }

  EmailVerifiedOptions: AnimationOptions = {
    path: 'Animations/MailVerified.json',
    loop: false,
  }

  SetSpeed(animation: AnimationItem, Speed:number): void {
    animation.setSpeed(Speed)
  }

  RegisterForm = new FormGroup({
    account_info: new FormGroup({
      username: new FormControl('', Validators.required),
      active: new FormControl(false),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl(''),
      role: new FormControl(''),
      password: new FormControl('', Validators.required)
    }),
    personnal_info: new FormGroup({
      fullname: new FormControl('', Validators.required),
      birthdate: new FormControl(''),
      country: new FormControl(''),
      city: new FormControl(''),
      address: new FormControl(''),
      postalcode: new FormControl('')
    }),
    verification_code: new FormControl('', [Validators.minLength(6), Validators.required])
  });

  CreateAccount(){
    this.CreatingAccount = true

    if (true){
      this.StepIndex = 2
      this.CurrentStepIndex = 2
    }
    this.CreatingAccount = false
  }

  Verify(){
    this.VerifyingAccount = true

    if (true){
      this.StepIndex = 3
      this.CurrentStepIndex = 3
    }
    this.VerifyingAccount = false
  }

  AdvanceStep(Target: number) {
    if (Target > this.CurrentStepIndex) {
      this.CurrentStepIndex = Target
    }
    this.StepIndex = Target
  }
}

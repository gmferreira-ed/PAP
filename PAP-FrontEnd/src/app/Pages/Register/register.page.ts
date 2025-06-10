import { Component, inject } from '@angular/core';
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
import { HttpService } from '../../Services/Http.service';
import { AppSettings } from '../../Services/AppSettings';

@Component({
  selector: 'register-page',
  imports: [NzButtonModule, ReactiveFormsModule, FormsModule, IconsModule, NzStepsModule, NzDatePickerModule, NzFormModule, NzInputModule, NzIconModule,
    LottieComponent, RouterLink, NgOtpInputModule, TranslatePipe
  ],
  templateUrl: './register.page.html',
  styleUrl: './register.page.less'
})
export class RegisterPage {
  StepIndex = 0
  CurrentStepIndex = 0

  VerificationCode = ''
  CreatingAccount = false
  VerifyingAccount = false

  HttpService = inject(HttpService)

  EmailSentOptions: AnimationOptions = {
    path: 'Animations/MailSent.json',
  }

  EmailVerifiedOptions: AnimationOptions = {
    path: 'Animations/MailVerified.json',
    loop: false,
  }

  SetSpeed(animation: AnimationItem, Speed: number): void {
    animation.setSpeed(Speed)
  }

  RegisterForm = new FormGroup({
    account_info: new FormGroup({
      username: new FormControl('', Validators.required),
      active: new FormControl(false),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', Validators.required),
      role: new FormControl(''),
      password: new FormControl('', Validators.required)
    }),
    personnal_info: new FormGroup({
      fullname: new FormControl('', Validators.required),
      birthdate: new FormControl('', Validators.required),
      country: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      postalcode: new FormControl('', Validators.required)
    }),
    verification_code: new FormControl('', [Validators.minLength(6), Validators.required])
  });

  async CreateAccount() {
    this.CreatingAccount = true

    const BirthDate = new Date(this.RegisterForm.value.personnal_info?.birthdate!).toISOString().slice(0, 19).replace('T', ' ')
    const [AccountCreateSucess] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'auth/signup', 'POST', 'Failed to create account', {
      ...this.RegisterForm.value.account_info,
      ...this.RegisterForm.value.personnal_info,
      birthdate: BirthDate
    })
    if (AccountCreateSucess) {
      this.StepIndex = 2
      this.CurrentStepIndex = 2
    }
    this.CreatingAccount = false
  }

  async Verify() {
    this.VerifyingAccount = true

    const [VerifiedSucessfully] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'auth/verify', 'POST', 'Failed to verify', {
      verificationcode: this.RegisterForm.value.verification_code
    })
    if (VerifiedSucessfully) {
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

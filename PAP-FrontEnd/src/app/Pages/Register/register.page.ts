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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AnimationItem } from 'lottie-web';
import { NgOtpInputModule } from 'ng-otp-input';
import { TranslatePipe } from '@ngx-translate/core';
import { HttpService } from '../../Services/Http.service';
import { AppSettings } from '../../Services/AppSettings';
import { TranslateService } from '@ngx-translate/core';
import GlobalUtils from '../../Services/GlobalUtils';

import {
  trigger,
  state,
  style,
  transition,
  animate,
  AnimationEvent
} from '@angular/animations';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FValidators } from '../../Services/Validators';


@Component({
  selector: 'register-page',
  imports: [NzButtonModule, ReactiveFormsModule, FormsModule, IconsModule, NzStepsModule, NzDatePickerModule, NzFormModule, NzInputModule, NzIconModule,
    LottieComponent, RouterLink, NgOtpInputModule, TranslatePipe
  ],
  templateUrl: './register.page.html',
  styleUrl: './register.page.less',
  animations: [
    trigger('swipeState', [
      state('inactive', style({ transform: 'translateX(0)', opacity: 1 })),
      state('swipping', style({ transform: 'translateX(50%)', opacity: 0 })),

      transition('* => swipping', [
        style({ opacity: 0, transform: 'translateX(50%)' }),
        animate('0ms')
      ]),

      transition('swipping => inactive', [
        style({ opacity: 0, transform: 'translateX(-10%)' }), // start off-screen left
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
    ]),
  ],
})
export class RegisterPage {
  StepIndex = 0
  CurrentStepIndex = 0

  VerificationCode = ''
  CreatingAccount = false
  VerifyingAccount = false
  Initialized = false
  Swipping = false

  HttpService = inject(HttpService)
  TranslateService = inject(TranslateService)
  MessageService = inject(NzMessageService)
  ActiveRoute = inject(ActivatedRoute)

  EnforceNumber = GlobalUtils.EnforceNumber

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
      username: new FormControl('aasdasd', [Validators.required, Validators.minLength(3)]),
      active: new FormControl(false),
      email: new FormControl('tesel81357@dxirl.com', [Validators.required, FValidators.email]),
      phone: new FormControl('1231123123', [Validators.required, FValidators.phone]),
      password: new FormControl('123', Validators.required)
    }),
    personnal_info: new FormGroup({
      fullname: new FormControl('', Validators.required),
      birthdate: new FormControl('', Validators.required),
      country: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      postalcode: new FormControl('', [Validators.required, FValidators.postalCode])
    }),
    verification_code: new FormControl('', [Validators.minLength(6), Validators.required])
  });

  async CreateAccount() {
    this.CreatingAccount = true

    const BirthDate = new Date(this.RegisterForm.value.personnal_info?.birthdate!).toISOString().slice(0, 19).replace('T', ' ')
    const [AccountCreateSucess] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'auth/signup', 'POST', this.TranslateService.instant('Failed to create account'), {
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

    const [VerifiedSucessfully] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'auth/verify', 'POST',
      this.TranslateService.instant('Failed to verify'), {
      verificationcode: this.RegisterForm.value.verification_code
    })
    if (VerifiedSucessfully) {
      this.StepIndex = 3
      this.CurrentStepIndex = 3
    }
    this.VerifyingAccount = false
  }

  AdvanceStep(Target: number) {
    this.Swipping = true

    if (Target > this.CurrentStepIndex) {
      this.CurrentStepIndex = Target
    }
    this.StepIndex = Target

    setTimeout(() => {
      this.Swipping = false
    }, 400);
  }

  onAnimationDone(event: AnimationEvent) {
    if (event.toState === 'swipping') {
      this.Swipping = false
    }
  }

  async ResendCode() {
    const [Result] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'request-code', 'POST',
      this.TranslateService.instant('Failed to re-send code: '))
    if (Result) {
      this.MessageService.success(this.TranslateService.instant('Email successfully sent!'))
    }
  }

  defaultPickerValue = new Date(
    new Date().getFullYear() - 14,
    new Date().getMonth(),
    new Date().getDate()
  );

  DisableDate = (current: Date): boolean => {
    if (!current) return false

    const today = new Date();
    const fourteenYearsAgo = new Date(
      today.getFullYear() - 14,
      today.getMonth(),
      today.getDate()
    );

    return current > fourteenYearsAgo
  }

  ngOnInit() {

    const RedirectedEmail = this.ActiveRoute.snapshot.queryParamMap.get('verifying')
    if (RedirectedEmail) {
      this.RegisterForm.get('account_info')?.get('email')?.setValue(RedirectedEmail)
      this.StepIndex = 2
      this.CurrentStepIndex = 2
      this.HttpService.MakeRequest(AppSettings.APIUrl + 'request-code', 'POST', undefined)
    }

    setTimeout(() => {
      this.Initialized = true
    }, 1);
  }
}

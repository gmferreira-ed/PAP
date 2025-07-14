import { Component, inject, signal } from '@angular/core';
import { NgStyle } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { PageLayoutComponent } from '../../Components/page-layout/page-layout.component';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { Router, RouterModule } from '@angular/router';
import { UsersService } from '../../Services/users.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { AppSettings } from '../../Services/AppSettings';
import { TranslateModule } from '@ngx-translate/core';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpService } from '../../Services/Http.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';
import { PermissionsService } from '../../Services/Permissions.Service';
import { UserRole } from '../../../shared/permissions';
import { FValidators } from '../../Services/Validators';
import GlobalUtils from '../../Services/GlobalUtils';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'users-page',
  imports: [PageLayoutComponent, NgStyle, NzTableModule, RouterModule, NzButtonModule, TranslateModule, NzSelectModule, NzIconModule,
    NzModalModule, NzFormModule, NzInputModule, NzSelectModule, NzDatePickerModule, ReactiveFormsModule],
  templateUrl: './users.page.html',
  styleUrl: './users.page.css'
})

export class UsersPage {

  userService = inject(UsersService)
  router = inject(Router)
  HttpService = inject(HttpService)
  MessageService = inject(NzMessageService)
  TranslateService = inject(TranslateService)
  PermissionsService = inject(PermissionsService)

  Roles: UserRole[] = []
  UserImagesURL = AppSettings.UserImagesURL

  LoadingUsers = false
  UsersList: User[] = []
  PageCount = 0
  PageSize = 10
  PageNumber = 1

  // Modal states
  UserCreateModalVisible = false
  CreatingUser = false
  passwordVisible = false

  // User creation form
  UserCreateForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, FValidators.email]),
    phone: new FormControl('', [FValidators.phone]),
    fullname: new FormControl('', [Validators.required, Validators.minLength(3)]),
    birthdate: new FormControl('', [Validators.required]),
    country: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    address: new FormControl('', [Validators.required]),
    postalcode: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, FValidators.strongPassword]),
    role: new FormControl('User', [Validators.required])
  });

  // Available roles
  EnforceNumbers = GlobalUtils.EnforceNumber

  // Password strength tracking
  passwordStrength = FValidators.getPasswordStrength('');

  onPasswordChange(password: string) {
    this.passwordStrength = FValidators.getPasswordStrength(password);
  }

  getPasswordErrorMessage(): string {
    const control = this.UserCreateForm.get('password');
    if (control?.errors) {
      const errors = control.errors;
      const messages = [];
      
      if (errors['minLength']) messages.push(this.TranslateService.instant('At least 8 characters'));
      if (errors['lowercase']) messages.push(this.TranslateService.instant('One lowercase letter'));
      if (errors['uppercase']) messages.push(this.TranslateService.instant('One uppercase letter'));
      if (errors['number']) messages.push(this.TranslateService.instant('One number'));
      if (errors['specialChar']) messages.push(this.TranslateService.instant('One special character'));
      
      return this.TranslateService.instant('Password must contain: ') + messages.join(', ');
    }
    return '';
  }

  async LoadPage() {
    this.LoadingUsers = true

    let UserPageResult = await this.userService.GetUsers(this.PageNumber, this.PageSize)

    this.UsersList = UserPageResult.Rows
    this.PageCount = UserPageResult.Pages * this.PageSize


    this.LoadingUsers = false
  }

  ViewProfile(UserInfo: User) {
    this.router.navigate(['/profile/' + UserInfo.username])
  }
  async ngOnInit() {
    this.LoadPage()
    this.Roles = await this.PermissionsService.LoadRoles()
  }

  SwitchPage(PageNumber?: any) {
    this.PageNumber = PageNumber
    this.LoadPage()
  }
  UpdatePageSize(PageSize?: any) {
    this.PageSize = PageSize
    this.LoadPage()
  }

  async CreateUser() {
    this.CreatingUser = true
    const FormValues = this.UserCreateForm.value

    const [Result] = await this.HttpService.MakeRequest(
      AppSettings.APIUrl + 'users',
      'POST',
      this.TranslateService.instant('Failed to create user'),
      {
        ...FormValues,
        birthdate: GlobalUtils.ToSQLDate(FormValues.birthdate)
      }
    );

    if (Result) {
      this.MessageService.success(this.TranslateService.instant('User created successfully'));
      this.UserCreateModalVisible = false
      
      this.router.navigate(['/profile', FormValues.username])
      this.UserCreateForm.reset()
      this.UserCreateForm.get('role')?.setValue('User')

    }

    this.CreatingUser = false
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
}

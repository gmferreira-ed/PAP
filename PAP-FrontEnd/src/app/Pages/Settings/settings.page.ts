import { Component, inject } from '@angular/core';
import { PageLayoutComponent } from '../../Components/page-layout/page-layout.component';
import { ThemeService } from '../../Services/Theme.service';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppSettings } from '../../Services/AppSettings';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import CurrencyCodes from './currency-codes.json'
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { HttpService } from '../../Services/Http.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'settings-page',
  imports: [
    PageLayoutComponent, FormsModule, ReactiveFormsModule, NzFormModule, NzRadioModule, TranslateModule,
    NzInputModule, NzInputNumberModule, NzSelectModule, NzButtonModule
  ],
  templateUrl: './settings.page.html',
  styleUrl: './settings.page.less'
})
export class SettingsPage {

  // Services
  ThemeService = inject(ThemeService)
  TranslateService = inject(TranslateService)
  HttpService = inject(HttpService)
  MessageService = inject(NzMessageService)


  AppSettings = AppSettings
  CurrencyCodes = CurrencyCodes

  ModifyingSettings = false

  Themes = Object.entries(this.ThemeService.Themes).map(([key, values]) => ({
    key,
    ...values
  }));

  settingsForm = new FormGroup({
    WorkHours: new FormControl(AppSettings.WorkHours),
    WorkHourLimit: new FormControl(AppSettings.WorkHourLimit),
    PayPerHour: new FormControl(AppSettings.PayPerHour),
    MealAllowance: new FormControl(AppSettings.MealAllowance),
    ExtraPay: new FormControl(AppSettings.ExtraPay),
    ExtraPayMinuteRate: new FormControl(AppSettings.ExtraPayMinuteRate),
    Currency: new FormControl(AppSettings.Currency),
    City: new FormControl(AppSettings.City),
    Contact: new FormControl(AppSettings.Contact ),
    TaxID: new FormControl(AppSettings.TaxID),
    Adress: new FormControl(AppSettings.Adress),
    RestaurantName: new FormControl(AppSettings.RestaurantName),
    PostalCode: new FormControl(AppSettings.PostalCode)
  });


  CurrentLanguage = this.TranslateService.currentLang

  ChangeLanguage(Code: string) {
    localStorage.setItem('language', Code)
    this.TranslateService.use(Code)
  }

  FieldsChanged(): boolean {
    const formValue = this.settingsForm.value;
    return (
      formValue.WorkHours !== AppSettings.WorkHours ||
      formValue.WorkHourLimit !== AppSettings.WorkHourLimit ||
      formValue.PayPerHour !== AppSettings.PayPerHour ||
      formValue.MealAllowance !== AppSettings.MealAllowance ||
      formValue.ExtraPay !== AppSettings.ExtraPay ||
      formValue.ExtraPayMinuteRate !== AppSettings.ExtraPayMinuteRate ||
      formValue.Currency !== AppSettings.Currency ||
      formValue.City !== (AppSettings.City || '') ||
      formValue.Contact !== (AppSettings.Contact || '') ||
      formValue.TaxID !== (AppSettings.TaxID || '') ||
      formValue.Adress !== (AppSettings.Adress || '') ||
      formValue.RestaurantName !== (AppSettings.RestaurantName || '') ||
      formValue.PostalCode !== (AppSettings.PostalCode || '')
    );
  }

  async SaveSettings() {
    const formValue = this.settingsForm.value;

    this.settingsForm.disable()
    this.ModifyingSettings = true

    const [PatchSucess] = await this.HttpService.MakeRequest(
      AppSettings.APIUrl + 'settings',
      'PATCH',
      'Failed to save settings',
      {
        WorkHours: formValue.WorkHours,
        WorkHourLimit: formValue.WorkHourLimit,
        PayPerHour: formValue.PayPerHour,
        MealAllowance: formValue.MealAllowance,
        ExtraPay: formValue.ExtraPay,
        ExtraPayMinuteRate: formValue.ExtraPayMinuteRate,
        Currency: formValue.Currency,
        City: formValue.City,
        Contact: formValue.Contact,
        TaxID: formValue.TaxID,
        Adress: formValue.Adress,
        RestaurantName: formValue.RestaurantName,
        PostalCode: formValue.PostalCode
      }
    )

    if (PatchSucess) {
      AppSettings.WorkHours = formValue.WorkHours!
      AppSettings.WorkHourLimit = formValue.WorkHourLimit!
      AppSettings.PayPerHour = formValue.PayPerHour!
      AppSettings.MealAllowance = formValue.MealAllowance!
      AppSettings.ExtraPay = formValue.ExtraPay!
      AppSettings.ExtraPayMinuteRate = formValue.ExtraPayMinuteRate!
      AppSettings.Currency = formValue.Currency!
      AppSettings.City = formValue.City!
      AppSettings.Contact = formValue.Contact!
      AppSettings.TaxID = formValue.TaxID!
      AppSettings.Adress = formValue.Adress!
      AppSettings.RestaurantName = formValue.RestaurantName!
      AppSettings.PostalCode = formValue.PostalCode!
      this.MessageService.success('Successfully changed settings!')
    }

    this.settingsForm.enable()
    this.ModifyingSettings = false
  }

  FormatNumb(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
}

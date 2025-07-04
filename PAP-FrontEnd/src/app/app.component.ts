
import { Component, HostListener, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Topbar } from './Components/topbar/topbar.component';
import { ThemeService } from './Services/Theme.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  TranslateService,
  TranslatePipe,
  TranslateDirective
} from "@ngx-translate/core";
import { HttpService } from './Services/Http.service';
import { AppSettings } from './Services/AppSettings';
import GlobalUtils from './Services/GlobalUtils';
import { CardService } from './Services/Card.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Topbar],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  // Init Card Service
  CardService = inject(CardService)
  ThemeService = inject(ThemeService)
  NotificationService = inject(NzNotificationService)
  HttpService = inject(HttpService)

  constructor(
    private translate: TranslateService) {
    translate.setDefaultLang('en');

    const LanguageCode = localStorage.getItem('language') || 'en'
    translate.use(LanguageCode);

    translate.addLangs(this.ThemeService.Languages);
  }


  InputBuffer: string = ''
  BufferTimeout: any

  ScanSound = new Audio('Sounds/scan-sucess.mp3');
  ErrorSound = new Audio('Sounds/scan-error.mp3');

  @HostListener('window:keydown', ['$event'])
  async OnKeyDown(event: KeyboardEvent) {
    clearTimeout(this.BufferTimeout)

    const BufferString = this.InputBuffer
    if (event.key === 'Enter' && BufferString.length >= 7) {

      // Card Validation
      const CardID = Number(BufferString)
      this.InputBuffer = ''
      if (CardID) {

        console.log('Scanned', CardID)
        this.CardService.OnScan.emit(CardID)
        if (!this.CardService.PromptingCardRead) {
          const [EntryResult] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'entries', 'POST', 'Error logging card entry', {
            card_id: CardID
          })
          if (EntryResult) {
            const User = EntryResult.user
            if (User) {
              const State = EntryResult.is_entry ? 'Entry' : 'Exit'
              this.NotificationService.success(State, `${State} from ${User}`)
              this.ScanSound.play()
            } else {
              this.NotificationService.warning('Ignored entry', 'There is no user linked to the card ' + CardID)
              this.ErrorSound.play()
            }
            return
          } else {
            this.NotificationService.error('Error', 'There was an issue reading the provided card, please try again')
            this.ErrorSound.play()
          }
        }

      }



    } else {
      this.InputBuffer += event.key;
      this.BufferTimeout = setTimeout(() => {
        this.InputBuffer = ''
      }, 40);
    }
  }
}

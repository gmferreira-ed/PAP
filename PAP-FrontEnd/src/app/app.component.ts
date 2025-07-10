
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
  TranslateService = inject(TranslateService)



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
          const [EntryResult] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'entries', 'POST', this.TranslateService.instant('Error logging card entry'), {
            card_id: CardID
          })
          if (EntryResult) {
            const User = EntryResult.user
            if (User) {
              const State = this.TranslateService.instant(EntryResult.is_entry ? 'Entry' : 'Exit')
              this.NotificationService.success(State, `${State} ${this.TranslateService.instant('from')} ${User}`)
              this.ScanSound.play()
            } else {
              this.NotificationService.warning(this.TranslateService.instant('Ignored entry'), this.TranslateService.instant('There is no user linked to the card') + ' ' + CardID)
              this.ErrorSound.play()
            }
            return
          } else {
            this.NotificationService.error(this.TranslateService.instant('Error'), this.TranslateService.instant('There was an issue reading the provided card, please try again'))
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

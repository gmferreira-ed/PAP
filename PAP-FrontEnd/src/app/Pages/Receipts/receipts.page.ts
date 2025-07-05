import { Component, inject, ViewChild } from '@angular/core';
import { PageLayoutComponent } from '../../Components/page-layout/page-layout.component';
import { AppSettings } from '../../Services/AppSettings';
import { HttpService } from '../../Services/Http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { LoadingScreen } from '../../Components/loading-screen/loading-screen.component';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { StatusTagComponent } from "../../Components/status-tag/status-tag.component";
import { ReceiptComponent } from "../../Components/receipt/receipt.component";
import { IconsModule } from "../../Components/icon/icon.component";
import { DynamicCurrencyPipe } from '../../Pipes/dynamic-currency.pipe';
import { AuthService } from '../../Services/Auth.service';

@Component({
  selector: 'receipts-page',
  imports: [PageLayoutComponent, NzTableModule, LoadingScreen, DatePipe, TranslatePipe, DynamicCurrencyPipe, StatusTagComponent, ReceiptComponent, IconsModule],
  templateUrl: './receipts.page.html',
  styleUrl: './receipts.page.less'
})
export class ReceiptsPage {

  @ViewChild('Receipt') Receipt!: ReceiptComponent;

  // Services
  HttpService = inject(HttpService)
  ActiveRoute = inject(ActivatedRoute)
  Router = inject(Router)

  // States
  LoadingReceiptData = false
  LoadingReceipts = false

  // Variables
  ReceiptsURL = AppSettings.APIUrl + 'receipts'
  UserImagesURL = AppSettings.UserImagesURL
  MenuImagesURL = AppSettings.ImagesURL+'menu/'

  // Receipts
  ReceiptsPageIndex = 1
  ReceiptsPageSize = 10
  TotalPages = 0
  Receipts: any[] = []

  async LoadReceipts() {
    this.LoadingReceipts = true

    const [Result] = await this.HttpService.MakeRequest(this.ReceiptsURL, 'GET', 'Failed to load receipts: ', {
      page_size: this.ReceiptsPageSize,
      page: this.ReceiptsPageIndex
    })

    if (Result) {
      this.Receipts = Result.Rows
      this.TotalPages = Result.Pages * this.ReceiptsPageSize
    }

    this.LoadingReceipts = false
  }


  // Receipt Data
  ReceiptData: any

  async LoadReceiptData() {
    this.LoadingReceiptData = true

    const [ReceiptData] = await this.HttpService.MakeRequest(this.ReceiptsURL + '/id', 'GET', 'Failed to load receipt data: ',
      { id: this.ReceiptId })
    if (ReceiptData) {
      this.ReceiptData = ReceiptData
   
    }

    this.LoadingReceiptData = false
  }

  private _receiptid?: number
  set ReceiptId(NewID: number | undefined) {

    this._receiptid = NewID

    if (NewID) {
      this.Router.navigate(['receipts', NewID])
      this.LoadReceiptData()
    } else {
      this.ReceiptData = undefined
      this.Router.navigate(['receipts'])
    }

  }

  get ReceiptId() {
    return this._receiptid
  }

  ngOnInit() {
    this.LoadReceipts()

    this.ActiveRoute.params.subscribe((params) => {
      const ReceiptID = params['id']
      if (ReceiptID && this.ReceiptId != ReceiptID) {
        this.ReceiptId = ReceiptID
      } else if (!ReceiptID) {
        this.ReceiptId = undefined
      }
    });
  }
}


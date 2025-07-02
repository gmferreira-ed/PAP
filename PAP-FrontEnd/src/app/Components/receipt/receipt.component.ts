import { HttpClient } from '@angular/common/http';
import { Component, inject, HostBinding, Input, input, Output, EventEmitter, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { LoaderComponent } from '../loader/loader.component';
import { ImageInfo, PrinterFunction, TextData } from './receipt-types';
import { FormatPrice, JustifyLine } from './receipt.utils';
import { NzMessageService } from 'ng-zorro-antd/message';


declare global {
  interface Window {
    electronAPI: {
      printReceipt: (data: any) => void;
    };
  }
}



@Component({
  selector: 'receipt',
  imports: [],

  templateUrl: 'receipt.component.html',
  styleUrl: 'receipt.component.less'
})


export class ReceiptComponent implements OnChanges {

  PrinterInstructions: PrinterFunction[] = []
  @Input() ReceiptData?: ReceiptData
  @Output() ReceiptDataChange = new EventEmitter()

  MessageService = inject(NzMessageService)

  CompileInstructions() {
    const PrinterInstructions: PrinterFunction[] = []

    const ReceiptData = this.ReceiptData

    if (ReceiptData) {
      const RestroLinkLogo = new ImageData(1, 1)

      const Today = ReceiptData.checked_out_at ? new Date(ReceiptData.checked_out_at) : new Date()
      const FormattedDate = Today.toISOString().split('T')[0];
      const hours = String(Today.getHours()).padStart(2, '0');
      const minutes = String(Today.getMinutes()).padStart(2, '0');

      let TotalPrice = ReceiptData.total ||  ReceiptData.items.reduce((total: number, product: any) => {
        return total + product.price * product.quantity;
      }, 0);

      let SubTotal = TotalPrice
      if (ReceiptData.discount){
        TotalPrice*=1-(ReceiptData.discount/100)
      }

      const AmountPaid = ReceiptData.payment_method == 'Cash' ? Number(ReceiptData.amount_paid) : TotalPrice

      // BUILDING RECEIPT
      PrinterInstructions.push(new PrinterFunction('align', 'CT'))
      PrinterInstructions.push(new PrinterFunction('text', new TextData('Restaurant', { size: [1, 1] })))
      PrinterInstructions.push(new PrinterFunction('text', new TextData('Mock Address')))
      PrinterInstructions.push(new PrinterFunction('text', new TextData('3030-032 Coimbra')))
      PrinterInstructions.push(new PrinterFunction('text', new TextData('Telef./Fax: 246 247 284')))
      PrinterInstructions.push(new PrinterFunction('text', new TextData('Tax ID No: 23424423')))
      PrinterInstructions.push(new PrinterFunction('drawLine'))
      PrinterInstructions.push(new PrinterFunction('text', new TextData(JustifyLine([FormattedDate, 'RECEIPT N:']), { justified: true })))
      PrinterInstructions.push(new PrinterFunction('text', new TextData(JustifyLine(['Original ', String(ReceiptData.order_id)]), { justified: true })))
      PrinterInstructions.push(new PrinterFunction('align', 'LT'))
      PrinterInstructions.push(new PrinterFunction('text', new TextData(`${hours}:${minutes}`)))
      PrinterInstructions.push(new PrinterFunction('drawLine'))

      PrinterInstructions.push(new PrinterFunction('text', new TextData('Taxpayer ID: ' + (ReceiptData.TIN || '-'))))
      PrinterInstructions.push(new PrinterFunction('text', new TextData('Payment Method: ' + (ReceiptData.payment_method || '-'))))


      PrinterInstructions.push(new PrinterFunction('drawLine'))


      PrinterInstructions.push(new PrinterFunction('text', new TextData(JustifyLine(['Qt/Product', 'T/Price']), { justified: true })))
      for (const Product of ReceiptData.items) {
        const QtPrice = FormatPrice(Product.price) + '/un'
        const TotalProductPrice = FormatPrice(Product.price * Product.quantity)

        PrinterInstructions.push(new PrinterFunction('text', new TextData(
          JustifyLine([
            `${Product.quantity}x ${Product.name}`,
            TotalProductPrice,
          ]), { justified: true })))

        PrinterInstructions.push(new PrinterFunction('text', new TextData(QtPrice)))
        PrinterInstructions.push(new PrinterFunction('text', new TextData('')))
      }

      PrinterInstructions.push(new PrinterFunction('drawLine'))
      // PrinterInstructions.push(new PrinterFunction('text', new TextData('Subtotal: $12.50')))
      // PrinterInstructions.push(new PrinterFunction('text', new TextData('Tax (10%): $1.25')))
      PrinterInstructions.push(new PrinterFunction('text', new TextData('')))
      PrinterInstructions.push(new PrinterFunction('text', new TextData(`Sub-Total: ${FormatPrice(SubTotal)}`)))
      PrinterInstructions.push(new PrinterFunction('text', new TextData(`Discount: ${ReceiptData.discount || '-'}%`)))
      PrinterInstructions.push(new PrinterFunction('text', new TextData('')))
      PrinterInstructions.push(new PrinterFunction('text', new TextData(`Total: ${FormatPrice(TotalPrice)}`)))
      PrinterInstructions.push(new PrinterFunction('text', new TextData('Amount Paid: ' + FormatPrice(AmountPaid))))
      PrinterInstructions.push(new PrinterFunction('text', new TextData('Change: ' + FormatPrice(Math.max(AmountPaid - TotalPrice, 0)))))
      PrinterInstructions.push(new PrinterFunction('text', new TextData('')))

      PrinterInstructions.push(new PrinterFunction('align', 'CT'))
      PrinterInstructions.push(new PrinterFunction('drawLine'))
      PrinterInstructions.push(new PrinterFunction('text', new TextData('')))
      PrinterInstructions.push(new PrinterFunction('text', new TextData('Thank you for your visit')))
      PrinterInstructions.push(new PrinterFunction('text', new TextData('')))
      PrinterInstructions.push(new PrinterFunction('drawLine'))

      PrinterInstructions.push(new PrinterFunction('text', new TextData('')))
      PrinterInstructions.push(new PrinterFunction('text', new TextData('')))
      PrinterInstructions.push(new PrinterFunction('text', new TextData('This receipt was powered by')))
      PrinterInstructions.push(new PrinterFunction('text', new TextData('')))
      const Image = new ImageInfo(600, 300, new Uint8Array(RestroLinkLogo.data.buffer))
      PrinterInstructions.push(new PrinterFunction('image', Image))

      this.PrinterInstructions = PrinterInstructions
    }
  }


  Print() {
    try {
      window.electronAPI.printReceipt(this.PrinterInstructions)
    } catch (Error) {
      this.MessageService.error('Failed to print receipt. Please check if your printer is connected properly')
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['ReceiptData']) {
      this.CompileInstructions();
    }
  }
}


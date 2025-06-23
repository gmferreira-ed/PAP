import { Component, Inject, inject } from '@angular/core';
import { PageLayoutComponent } from '../../Components/page-layout/page-layout.component';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenuService } from '../../Services/menu.service';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { AppSettings } from '../../Services/AppSettings';
import { IconsModule } from '../../Components/icon/icon.component';
import { CurrencyPipe, DatePipe, NgTemplateOutlet } from '@angular/common';
import { HttpService } from '../../Services/Http.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LoadingScreen } from "../../Components/loading-screen/loading-screen.component";
import { RestaurantLayout } from '../../Components/layout/layout.component';
import { TranslateModule } from '@ngx-translate/core';
import { OrdersService } from '../../Services/Orders.service';
import { FloatingContainer } from '../../Components/floating-container/floating-container';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { MenuProductSelect } from "../../../shared/product-selector/product-select";


declare global {
  interface Window {
    electronAPI: {
      printReceipt: (data: any) => void;
    };
  }
}

type PrinterFunctionName = 'text' | 'align' | 'drawLine' | 'image'
type TextAlign = 'LT' | 'CT' | 'RT';
type TextFontSize = 0 | 1 | 2 | 'NORMAL';
type TextStyle = 'B' | 'U' | 'I' | 'BU' | 'BI' | 'UI' | 'UBI' | 'NORMAL';
type TextFont = 'A' | 'B'

type TextSettings = {
  align: TextAlign,
  size: [TextFontSize, TextFontSize],
  style: TextStyle,
  font: TextFont,
  justified: boolean,
}

const DefaultSettings: TextSettings = {
  align: 'LT',
  size: ['NORMAL', 'NORMAL'],
  style: 'NORMAL',
  font: 'A',
  justified: false
}
var CurrentSettings = DefaultSettings

class TextData {
  align: TextAlign;
  size: [TextFontSize, TextFontSize];
  style: TextStyle;
  font: TextFont;
  text: string;
  justified: boolean;

  constructor(
    text: string,
    text_settings: Partial<TextSettings> = {}
  ) {
    const settings: TextSettings = {
      ...DefaultSettings,
      ...text_settings
    };

    this.text = text
    this.align = settings.align
    this.size = settings.size
    this.style = settings.style
    this.font = settings.font
    this.justified = settings.justified
  }
}

class ImageInfo {
  width: number
  height: number
  data: Uint8Array<ArrayBuffer>

  constructor(width: number, height: number, data: Uint8Array<ArrayBuffer>) {
    this.width = width
    this.height = height
    this.data = data
  }
}
type PrinterFunctionData = string | TextData | ImageInfo

class PrinterFunction {
  name: PrinterFunctionName
  data?: PrinterFunctionData

  constructor(name: PrinterFunctionName, data?: PrinterFunctionData) {
    this.name = name
    this.data = data

    if (name == 'align') {
      CurrentSettings.align = data as TextAlign
    }
  }

  isTextData(): this is PrinterFunction & { data: TextData } {
    return this.name === 'text';
  }
}

function JustifyLine(parts: string[], lineWidth: number = 42): string {
  const totalTextLength = parts.reduce((sum, part) => sum + part.length, 0);
  const totalSpaces = lineWidth - totalTextLength;

  if (totalSpaces < 0) {
    throw 'Invalid content fit'
  }

  const gaps = parts.length - 1;
  const evenSpace = gaps > 0 ? Math.floor(totalSpaces / gaps) : 0;
  const extra = gaps > 0 ? totalSpaces % gaps : 0;

  let result = '';
  for (let i = 0; i < parts.length; i++) {
    result += parts[i];
    if (i < gaps) {
      const spacesToAdd = evenSpace + (i < extra ? 1 : 0);
      result += ' '.repeat(spacesToAdd);
    }
  }

  console.log(result.length)
  return result;
}



function FormatPrice(price: number | string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(Number(price));
}




@Component({
  selector: 'checkout-page',
  imports: [PageLayoutComponent, NzRadioModule, FormsModule, ReactiveFormsModule, NzInputModule, NzIconModule, NzButtonModule, IconsModule, CurrencyPipe,
    RouterModule, LoadingScreen, RestaurantLayout, TranslateModule, FloatingContainer, DatePipe, NgTemplateOutlet, NzSelectModule, NzFormModule, MenuProductSelect],
  templateUrl: './checkout.page.html',
  styleUrl: './checkout.page.less'
})
export class CheckoutPage {

  // Services
  MenuService = inject(MenuService)
  HttpService = inject(HttpService)
  MessageService = inject(NzMessageService)
  ActiveRoute = inject(ActivatedRoute)
  Router = inject(Router)
  OrdersService = inject(OrdersService)


  // Api URLS
  MenuImagesURL = AppSettings.ImagesURL + 'menu/'
  OrdersURL = AppSettings.APIUrl + 'orders/'
  SelectedCategory: string = 'All'

  CustomerInfoForm = new FormGroup({
    amount_paid: new FormControl('', [Validators.required]),
    TIN: new FormControl('', [Validators.required]),
    payment_method: new FormControl('Visa', [Validators.required]),
  })

  // Data
  Categories: any[] = []
  Products: any[] = []
  Tables: any[] = []

  // Variables
  PaymentMethods = ['Visa', 'Mastercard', 'MBWay', 'Cash']

  SelectedTable: null | any = null

  // States
  ProcessingOrder = false
  LoadingProducts = true
  LoadingOrder = true
  FinalizingCheckout = false
  CheckingOut = false

  ViewType: 'Layout' | 'Grid' = 'Layout'

  OrderInfo: any | undefined = undefined
  OrderProducts: any[] = []
  OrderTotal = 0

  CalculateTotal() {
    const total = this.OrderProducts.reduce((sum, item) => sum + item.price * item.quantity, 0)
    return total
  }


  async AddToOrder(Product: any) {
    const ExistingProduct = this.OrderProducts.find((Prod) => { return Prod.id == Product.id })

    if (ExistingProduct) {

      // Increase quanitity
      ExistingProduct.quantity += 1
      this.UpdateItemAmountAsync(ExistingProduct)


    } else {
      // ADD TO ORDER
      Product.quantity = 1
      this.OrderProducts.push(Product)
      await this.HttpService.MakeRequest(AppSettings.APIUrl + 'orders/items', 'POST', 'Failed to add item to order', {
        order_id: this.OrderInfo.order_id,
        product_id: Product.id,
      })
    }
  }



  // RECEIPT MAKER
  Receipt: PrinterFunction[] = []

  async MoveToCheckout() {
    const Receipt: PrinterFunction[] = []


    const RestroLinkLogo = new ImageData(1, 1)

    const Today = new Date()
    const FormattedDate = Today.toISOString().split('T')[0];
    const hours = String(Today.getHours()).padStart(2, '0');
    const minutes = String(Today.getMinutes()).padStart(2, '0');


    let TotalPrice = this.OrderInfo.products.reduce((total: number, product: any) => {
      return total + product.price * product.quantity;
    }, 0);
    const FormData = this.CustomerInfoForm.value
    const AmountPaid = FormData.payment_method == 'Cash' ? Number(FormData.amount_paid) : TotalPrice

    // BUILDING RECEIPT
    Receipt.push(new PrinterFunction('align', 'CT'))
    Receipt.push(new PrinterFunction('text', new TextData('Restaurant', { size: [1, 1] })))
    Receipt.push(new PrinterFunction('text', new TextData('Mock Address')))
    Receipt.push(new PrinterFunction('text', new TextData('3030-032 Coimbra')))
    Receipt.push(new PrinterFunction('text', new TextData('Telef./Fax: 246 247 284')))
    Receipt.push(new PrinterFunction('text', new TextData('Tax ID No: 23424423')))
    Receipt.push(new PrinterFunction('drawLine'))
    Receipt.push(new PrinterFunction('text', new TextData(JustifyLine([FormattedDate, 'RECEIPT N:']), { justified: true })))
    Receipt.push(new PrinterFunction('text', new TextData(JustifyLine(['Original ', String(this.OrderInfo.order_id)]), { justified: true })))
    Receipt.push(new PrinterFunction('align', 'LT'))
    Receipt.push(new PrinterFunction('text', new TextData(`${hours}:${minutes}`)))
    Receipt.push(new PrinterFunction('drawLine'))

    Receipt.push(new PrinterFunction('text', new TextData('Taxpayer ID: ' + FormData.TIN)))
    Receipt.push(new PrinterFunction('text', new TextData('Payment Method: ' + FormData.payment_method)))


    Receipt.push(new PrinterFunction('drawLine'))


    Receipt.push(new PrinterFunction('text', new TextData(JustifyLine(['Qt/Product', 'T/Price']), { justified: true })))
    for (const Product of this.OrderInfo.products) {
      const QtPrice = FormatPrice(Product.price) + '/un'
      const TotalProductPrice = FormatPrice(Product.price * Product.quantity)

      Receipt.push(new PrinterFunction('text', new TextData(
        JustifyLine([
          `${Product.quantity}x ${Product.name}`,
          TotalProductPrice,
        ]), { justified: true })))

      Receipt.push(new PrinterFunction('text', new TextData(QtPrice)))
      Receipt.push(new PrinterFunction('text', new TextData('')))
    }

    Receipt.push(new PrinterFunction('drawLine'))
    // Receipt.push(new PrinterFunction('text', new TextData('Subtotal: $12.50')))
    // Receipt.push(new PrinterFunction('text', new TextData('Tax (10%): $1.25')))
    Receipt.push(new PrinterFunction('text', new TextData('')))
    Receipt.push(new PrinterFunction('text', new TextData(`Total: ${FormatPrice(TotalPrice)}`)))
    Receipt.push(new PrinterFunction('text', new TextData('Amount Paid: ' + FormatPrice(AmountPaid))))
    Receipt.push(new PrinterFunction('text', new TextData('Change: ' + FormatPrice(Math.max(AmountPaid - TotalPrice, 0)))))
    Receipt.push(new PrinterFunction('text', new TextData('')))

    Receipt.push(new PrinterFunction('align', 'CT'))
    Receipt.push(new PrinterFunction('drawLine'))
    Receipt.push(new PrinterFunction('text', new TextData('')))
    Receipt.push(new PrinterFunction('text', new TextData('Thank you for your visit')))
    Receipt.push(new PrinterFunction('text', new TextData('')))
    Receipt.push(new PrinterFunction('drawLine'))

    Receipt.push(new PrinterFunction('text', new TextData('')))
    Receipt.push(new PrinterFunction('text', new TextData('')))
    Receipt.push(new PrinterFunction('text', new TextData('This receipt was powered by')))
    Receipt.push(new PrinterFunction('text', new TextData('')))
    const Image = new ImageInfo(600, 300, new Uint8Array(RestroLinkLogo.data.buffer))
    Receipt.push(new PrinterFunction('image', Image))

    this.Receipt = Receipt
    this.CheckingOut = true

  }

  async OnInfoChange() {
    this.MoveToCheckout()
  }

  async PrinptReceipt() {
    window.electronAPI.printReceipt(this.Receipt)
  }

  async FinalizeCheckout() {
    const [Response] = await this.HttpService.MakeRequest(this.OrdersURL, 'POST', 'Failed to checkout', {
      products: this.OrderProducts,
    })
    if (Response) {
      window.electronAPI.printReceipt(this.Receipt)
      this.MessageService.success('Sucessfullly checked out')
      this.OrderProducts = []
    }
  }

  async UpdateItemAmountAsync(Product: any) {
    const Data = {
      order_id: this.OrderInfo.order_id,
      product_id: Product.id,
      quantity: Product.quantity
    }
    await this.HttpService.MakeRequest(AppSettings.APIUrl + 'orders/items', 'PATCH', 'Failed to update order item quantity', Data)

  }

  async RemoveOrderItem(Product: any) {
    const ExistingProductIndex = this.OrderProducts.findIndex((Prod) => { return Prod.id == Product.id })
    if (ExistingProductIndex != -1) {
      this.OrderProducts.splice(ExistingProductIndex, 1)
      await this.HttpService.MakeRequest(AppSettings.APIUrl + 'orders/items', 'DELETE', 'Failed to remove item from order', {
        order_id: this.OrderInfo.order_id,
        product_id: Product.id,
      })
    }

  }

  async DecreaseOrderItem(Product: any) {
    Product.quantity -= 1
    if (Product.quantity <= 0) {
      this.RemoveOrderItem(Product)
    } else {
      this.UpdateItemAmountAsync(Product)
    }
  }

  LeaveOrder() {
    if (this.OrderProducts.length == 0) {
      this.MessageService.warning('You left an open table order with no items.\nTo cancel the order, click the cancel button')
    }
    if (this.CheckingOut) {
      this.Router.navigate(['/orders/' + this.SelectedTable])
    } else {
      this.Router.navigate(['/orders'])
    }
    this.CheckingOut = false
  }

  SelectionViewChanged() {
    localStorage.setItem('TableView', this.ViewType)
  }

  SelectTable(Id: number | string) {
    this.SelectedTable = Id
    this.Router.navigate(['checkout/' + Id])
  }



  async LoadProducts() {
    this.LoadingProducts = true
    const Products = await this.MenuService.MenuProducts.Get()
    if (Products) {
      this.Products = Products
    }
    this.LoadingProducts = false
  }


  async CancelOrder() {
    if (this.OrderInfo) {

      let [Result] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'orders', 'DELETE', 'Failed to cancel order', {
        order_id: this.OrderInfo.order_id,
      })
      if (Result) {
        this.OrdersService.Tables.ResetExpiration()
        this.Router.navigate(['/orders'])
        if (Result.deleted)
          this.MessageService.warning('Your order was empty, therefore it was not saved in the registry')

      }
      this.MessageService.success('Your order has been sucessfully cancelled')
    }
  }

  ToArray(Obj: Record<any, any> | Map<any, any>) {
    return Object.values(Obj)
  }

  async OpenOrder() {

    const SelectedTable = this.SelectedTable

    this.ProcessingOrder = true

    let [ExistingOrder] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'orders', 'GET', 'Could not get order details', {
      tableid: SelectedTable,
      status: 'ongoing'
    })

    if (!ExistingOrder || ExistingOrder.length == 0) {

      // CREATE AN ORDER
      let [OrderInfo] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'orders', 'POST', 'Could not create order', {
        tableid: SelectedTable,
      })
      if (OrderInfo) {
        // Order open sucess
        this.OrderInfo = { order_id: OrderInfo.order_id, products: [] }
        this.MessageService.info('Created a new order')
        this.OrdersService.Tables.ResetExpiration()
      }
    } else {

      // USE EXISTING ORDER
      this.OrderInfo = ExistingOrder[0]
    }


    this.OrderProducts = this.OrderInfo.products
    this.ProcessingOrder = false
  }

  async ngOnInit() {
    const StoredView = localStorage.getItem('TableView')
    if (StoredView)
      this.ViewType = StoredView as 'Layout' | 'Grid'

    const SelectedTable = this.ActiveRoute.snapshot.paramMap.get('table') || this.CheckingOut && 1
    if (SelectedTable) {
      this.SelectedTable = SelectedTable


      await this.OpenOrder()

      // Load products and categories
      this.LoadProducts()
      const Categories = await this.MenuService.GetCategories()
      if (Categories)
        this.Categories = Categories
    }

    const Tables = await this.OrdersService.Tables.Get()
    this.Tables = Tables
  }
}


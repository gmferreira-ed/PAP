import { Component, Inject, inject, ViewChild } from '@angular/core';
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
import { ReceiptComponent } from "../../Components/receipt/receipt.component";
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';




@Component({
  selector: 'checkout-page',
  imports: [PageLayoutComponent, NzRadioModule, FormsModule, ReactiveFormsModule, NzInputModule, NzIconModule, NzButtonModule, IconsModule, CurrencyPipe, NzInputNumberModule,
    RouterModule, LoadingScreen, RestaurantLayout, TranslateModule, FloatingContainer, DatePipe, NgTemplateOutlet, NzSelectModule, NzFormModule, MenuProductSelect, 
    ReceiptComponent],
  templateUrl: './checkout.page.html',
  styleUrl: './checkout.page.less'
})
export class CheckoutPage {

  @ViewChild('Receipt') Receipt!: ReceiptComponent;

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
    discount: new FormControl(''),
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
    let total = this.OrderProducts.reduce((sum, item) => sum + item.price * item.quantity, 0)
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

  async MoveToCheckout() {
    this.OnInfoChange()
    this.CheckingOut = true
  }

  ReceiptData?: ReceiptData
  async OnInfoChange() {
    const FormValues = this.CustomerInfoForm.value
    this.ReceiptData = {
      items: this.OrderProducts,
      order_id: this.OrderInfo.order_id,
      payment_method: FormValues.payment_method,
      amount_paid: FormValues.amount_paid,
      TIN: FormValues.TIN,
      discount: Number(FormValues.discount)
    }
  }

  async PrinptReceipt() {
    this.Receipt.Print()
  }

  async FinalizeCheckout() {
    this.FinalizingCheckout = true

    const FormValues = this.CustomerInfoForm.value
    const [Response] = await this.HttpService.MakeRequest(AppSettings.APIUrl+'checkout', 'POST', 'Failed to checkout', {
      products: this.OrderProducts,
      order_id: this.OrderInfo.order_id,
      payment_method: FormValues.payment_method,
      amount_paid: FormValues.amount_paid,
      TIN: FormValues.TIN,
      discount: Number(FormValues.discount)
    })
    if (Response) {
      this.MessageService.success('Sucessfullly checked out')
      this.OrderProducts = []

      this.Router.navigate(['/orders'])
      this.Receipt.Print()
    }

    this.FinalizingCheckout = false
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
      this.MessageService.success('Your order has been sucessfully Cancelled')
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
      status: 'OnGoing'
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


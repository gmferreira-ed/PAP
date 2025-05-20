import { Component, inject } from '@angular/core';
import { PageLayoutComponent } from '../../Components/page-layout/page-layout.component';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../Menu/menu.service';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { AppSettings } from '../../Services/AppSettings';
import { IconsModule } from '../../Components/icon/icon.component';
import { CurrencyPipe } from '@angular/common';
import { HttpService } from '../../Services/Http.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'checkout-page',
  imports: [PageLayoutComponent, NzRadioModule, FormsModule, NzInputModule, NzIconModule, NzButtonModule, IconsModule, CurrencyPipe],
  templateUrl: './checkout.page.html',
  styleUrl: './checkout.page.less'
})
export class CheckoutPage {

  MenuService = inject(MenuService)
  HttpService = inject(HttpService)
  MessageService = inject(NzMessageService)

  MenuImagesURL = AppSettings.ImagesURL+'menu/'
  OrdersURL = AppSettings.APIUrl+'orders/'
  SelectedCategory:string = 'All'

  Categories:any[] = []
  Products:any[] = []

  
  OrderProducts:any[] = []
  OrderTotal = 0
  OrderDiscount = 0
  
  CalculateTotal(){
    const total = this.OrderProducts.reduce((sum, item) => sum + item.price * item.amount, 0)
    return total
  }

  AddToOrder(Product:any){
    const ExistingProduct = this.OrderProducts.find((Prod)=>{return Prod.id == Product.id})
    if (ExistingProduct){
      ExistingProduct.amount += 1
    }else{
      Product.amount = 1
      this.OrderProducts.push(Product)
    }
  }

  CheckingOut = false
  async Checkout(){
    const [Response] = await this.HttpService.MakeRequest(this.OrdersURL, 'POST', 'Failed to checkout', {
      products:this.OrderProducts,
    })
    if (Response){
      this.OrderProducts = []
      this.MessageService.success('Sucessfullly checked out')
    }
  }

  RemoveOrderItem(Product:any){
    const ExistingProductIndex = this.OrderProducts.findIndex((Prod)=>{return Prod.id == Product.id})
    if (ExistingProductIndex != -1)
      this.OrderProducts.splice(ExistingProductIndex, 1)
  }

  DecreaseOrderItem(Product:any){
    Product.amount -= 1
    console.log(Product.amount)
    if (Product.amount <= 0){
      this.RemoveOrderItem(Product)
    }
  }

  async LoadProducts(){
    const Category = this.SelectedCategory != 'All' && this.SelectedCategory || undefined
    const Products = await this.MenuService.GetMenuItems(Category)
    if (Products){
      this.Products = Products
    }
  }

  async ngOnInit(){
    this.LoadProducts()
    const Categories = await this.MenuService.GetCategories()
    if (Categories)
      this.Categories = Categories
  }
}


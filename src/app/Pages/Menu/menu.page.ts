import { Component, inject, signal } from '@angular/core';
import { MenuService } from '../../Services/menu.service';
import { PageLayout } from '../../Components/page-layout/page-layout.component';
import { CurrencyPipe } from '@angular/common';

import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzFloatButtonModule } from 'ng-zorro-antd/float-button'
@Component({
  selector: 'menu-page',
  imports: [PageLayout, CurrencyPipe, NzSegmentedModule, 
    NzInputModule, NzIconModule, NzButtonModule,NzDrawerModule,
    NzSkeletonModule, NzFloatButtonModule
   ],
  templateUrl: './menu.page.html',
  styleUrl: './menu.page.css'
})

export class MenuPage {

  MenuList = []
  MenuService = inject(MenuService)
  CurrentMenuList = signal<any[]>([])
  CurrentCategories = signal<any[]>([])

  SelectedItemInfo = {
    product:"None",
    price:0,
    category:"Dish",
  }
  DrawerOpen = false;

  DisplayItemInfo(ItemInfo:any) {
    this.DrawerOpen = true,
    this.SelectedItemInfo = ItemInfo
  }
  
  

  async LoadProducts(Category:any = null){
    let MenuItemResult = await this.MenuService.GetMenuItems(Category)
    console.log(MenuItemResult)
    this.CurrentMenuList.set(MenuItemResult)
  }
  async LoadCategories(){
      
    let CategoriesResult = await this.MenuService.GetCategories()
    let ConvertedResult = Object.keys(CategoriesResult).map(key => (CategoriesResult[key].category))
    ConvertedResult.unshift("All")

    this.CurrentCategories.set(ConvertedResult);
  }
  ngOnInit(){
    this.LoadProducts()
    this.LoadCategories()
  }


   
}

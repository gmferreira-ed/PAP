import { Component, inject, signal, ViewChild } from '@angular/core';
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
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule, NzSelectSizeType } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzUploadFile, NzUploadModule, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { NzMessageService } from 'ng-zorro-antd/message';
import {FormControl, FormsModule, NgForm, ReactiveFormsModule} from '@angular/forms';


@Component({
  selector: 'menu-page',
  imports: [PageLayout, CurrencyPipe, NzSegmentedModule, 
    NzInputModule, NzButtonModule,NzDrawerModule, NzInputNumberModule,
    NzSkeletonModule, NzFloatButtonModule, NzModalModule, NzFormModule, NzSelectModule, NzRadioModule,
    NzUploadModule, NzIconModule, FormsModule, ReactiveFormsModule
   ],
  templateUrl: './menu.page.html',
  styleUrl: './menu.page.css'
})

export class MenuPage {

  MenuList = []

  // SERVICES
  ModalService = inject(NzModalService)
  MenuService = inject(MenuService)
  MessageService = inject(NzMessageService)
  
  // SIGNALS
  CurrentMenuList = signal<any[]>([])
  CurrentCategories = signal<any[]>([])

  // IMAGE UPLOADING / LOADING
  ThumbnailsUrl = "http://localhost:3000/images/menu-thumbnails/"
  SelectedThumbnailUrl = ""
  LoadingThumbnail = false

  // OBJECTS
  IsInsertingItem = false
  InsertItemThumbnailFileName = ""
  InsertItemname = ""
  InsertItemPrice= 0
  InsertItemCategory= ""

  DrawerOpen = false;
  InsertModalOpen = false;

  async InsertMenuItem(){
    if (this.InsertItemname != "" && this.InsertItemCategory != "" && this.InsertItemPrice > 0){
      this.IsInsertingItem = true
      await this.MenuService.InsertMenuItem(this.InsertItemname, this.InsertItemCategory, this.InsertItemPrice, this.InsertItemThumbnailFileName)
      await this.LoadProducts()
      this.IsInsertingItem = false
      this.InsertModalOpen = false
    }else{
      this.MessageService.error(`There are invalid fields`);
    }
  }
  
  ChangeSelectedImage(info: { file: NzUploadFile }){
    switch (info.file.status) {
      case 'uploading':
        this.LoadingThumbnail = true
        break;
      case 'done':
        this.SelectedThumbnailUrl = info.file.response.url
        this.InsertItemThumbnailFileName = info.file.response.filename
        this.LoadingThumbnail = false
        break;
      case 'error':
        this.MessageService.error('Network error');
        this.LoadingThumbnail = false
        break;
    }
  }

  SelectedItemInfo = {
    product:"None",
    price:0,
    category:"Dish",
    image_path:"",
  }
  

  DisplayItemInfo(ItemInfo:any) {
    this.DrawerOpen = true,
    this.SelectedItemInfo = ItemInfo
  }

  
  
  async OpenUploadModel(){
    this.InsertModalOpen = true
  }

  async LoadProducts(Category:any = null){
    let MenuItemResult = await this.MenuService.GetMenuItems(Category)
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

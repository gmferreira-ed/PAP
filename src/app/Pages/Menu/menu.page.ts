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
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule, NzSelectSizeType } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzUploadFile, NzUploadModule, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';

@Component({
  selector: 'menu-page',
  imports: [PageLayout, CurrencyPipe, NzSegmentedModule, 
    NzInputModule, NzIconModule, NzButtonModule,NzDrawerModule, NzInputNumberModule,
    NzSkeletonModule, NzFloatButtonModule, NzModalModule, NzFormModule, NzSelectModule, NzRadioModule,
    NzUploadModule
   ],
  templateUrl: './menu.page.html',
  styleUrl: './menu.page.css'
})

export class MenuPage {

  MenuList = []
  ModalService = inject(NzModalService)
  MenuService = inject(MenuService)
  MessageService = inject(NzMessageService)
  
  CurrentMenuList = signal<any[]>([])
  CurrentCategories = signal<any[]>([])


  ThumbnailsUrl = "http://localhost:3000/images/menu-thumbnails"
  SelectedThumbnailUrl = ""
  LoadingThumbnail = false

  private getBase64(img: File, callback: (img: string) => void): void {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result!.toString()));
    reader.readAsDataURL(img);
  }

  // UploadImage = (item: any) => {

  //   console.log('uploading image...');
  //   console.log(item);

  //   this.http.post('https://jsonplaceholder.typicode.com/posts/', item)
  //     .subscribe(res => console.log(res));
  // }

  ChangeSelectedImage(info: { file: NzUploadFile }){
    switch (info.file.status) {
      case 'uploading':
        break;
      case 'done':
        this.getBase64(info.file!.originFileObj!, (img: string) => {
          this.SelectedThumbnailUrl = img;
        });
        break;
      case 'error':
        this.MessageService.error('Network error');
        break;
    }
  }

  SelectedItemInfo = {
    product:"None",
    price:0,
    category:"Dish",
    image_path:"",
  }
  DrawerOpen = false;
  UploadModalOpen = false;

  DisplayItemInfo(ItemInfo:any) {
    this.DrawerOpen = true,
    this.SelectedItemInfo = ItemInfo
  }
  
  async OpenUploadModel(){
    this.UploadModalOpen = true
  }
  
  async UploadMenuItem(){
    console.log()
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

import { Component, inject, signal } from '@angular/core';
import { PageLayoutComponent } from '../../Components/page-layout/page-layout.component';
import { CommonModule, CurrencyPipe } from '@angular/common';

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
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenuService } from './menu.service';
import { TranslateModule } from '@ngx-translate/core';
import { HttpService } from '../../Services/Http.service';
import { AppSettings } from '../../Services/AppSettings';
import { FileSelectComponent } from "../../Components/file-selector/file-select.component";
import { CdkDrag, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { ProgressComponent } from '../../Components/progress/progress.component';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { LoadingScreen } from "../../Components/loading-screen/loading-screen.component";
import { UFile } from '../../../types/ufile';


@Component({
  selector: 'menu-page',
  imports: [PageLayoutComponent, CurrencyPipe, NzSegmentedModule, NzInputModule, NzButtonModule, NzDrawerModule, TranslateModule, NzSwitchModule, NzTableModule, CdkDrag,
    CdkDropList, CdkDragHandle, NzToolTipModule,
    NzSkeletonModule, NzModalModule, NzFormModule, NzSelectModule, NzUploadModule, NzIconModule, FormsModule, CommonModule, ReactiveFormsModule, FileSelectComponent, LoadingScreen],
  templateUrl: './menu.page.html',
  styleUrl: './menu.page.less'
})


export class MenuPage {

  MenuList = []

  // SERVICES
  ModalService = inject(NzModalService)
  MenuService = inject(MenuService)
  MessageService = inject(NzMessageService)
  HttpService = inject(HttpService)

  // SIGNALS
  CurrentMenuList = signal<any[]>([])

  // IMAGE UPLOADING / LOADING
  ThumbnailsUrl = AppSettings.ImagesURL + 'menu/'
  NewItemImage: string | null = null
  LoadingThumbnail = false
  SelectedThumbnailUrl = ''
  InsertItemThumbnailFileName = ''
  CurrentCategory = ''

  // OBJECTS

  Categories:string[] = []

  CategoryToInsert = ""

  SelectedItemInfo = {
    id: 5,
    name: "None",
    price: 0,
    category: "Dish",
    ImageURL: "",
    image_path: "",
    active: true,
  }

  console = console

  // STATES
  CategoryInsertVisible = false
  DrawerOpen = false
  InsertModalOpen = false
  CategoriesModalVisible = false

  LoadingMenu = false
  IsInsertingItem = false
  InsertingCategory = false

  ItemCreationForm = new FormGroup({
    product: new FormControl('', [Validators.required, Validators.minLength(3)]),
    category: new FormControl('Dish', [Validators.required]),
    price: new FormControl(1.00, [Validators.required]),
    active: new FormControl(false, []),
  })



  MenuThumbnails = []
  async InsertMenuItem() {
    this.IsInsertingItem = true

    const FormValues = this.ItemCreationForm.value
    const ProductName = FormValues.product!
    const ProductPrice = Number(FormValues.price!)
    const ProductCategory = FormValues.category!

    this.ItemCreationForm.disable()

    await this.MenuService.InsertMenuItem(ProductName, ProductCategory, ProductPrice, FormValues.active!, this.MenuThumbnails[0])
    await this.LoadMenuItems(this.CurrentCategory)

    this.MenuThumbnails = []

    this.ItemCreationForm.enable()
    this.ItemCreationForm.reset()

    this.IsInsertingItem = false
    this.InsertModalOpen = false
  }

  async CreateCategory() {
    const Category = this.CategoryToInsert
    let Categories = this.Categories
    let ValidLenght = this.CategoryToInsert.length >= 3
    let ValidName = !Categories.includes(Category)

    if (ValidLenght && ValidName) {
      const InsertSucess = await this.MenuService.InsertCategory(Category)
      if (InsertSucess){
        this.CategoryInsertVisible = false
        this.LoadCategories()
      }
    } else if (!ValidName) {
      this.MessageService.error("This category already exists")

    } else {
      this.MessageService.error("Your category must have 3 or more characters")
    }
  }


  async ChangeProductImage(Product:any, Files:UFile[]){
    const File = Files[0]
    if (File){
      await this.MenuService.SetImage(Product.name, File)
      Product.ImageURL = File.imagebase64
    }
  }

  async DeleteItem() {
    let SelectedProduct = this.SelectedItemInfo.name
    this.DrawerOpen = false
    this.ModalService.confirm({
      nzTitle: `Delete ${SelectedProduct}?`,
      nzCentered: true,
      nzContent: 'This action cannot be reversed!',
      nzOnOk: () => {
        return this.MenuService.DeleteMenuItem(SelectedProduct)
          .then(() => {
            this.LoadMenuItems()
          })
      }
    })

  }

  PromptToggleItemActive() {
    const SelectedProduct = this.SelectedItemInfo
    const TargetActive = !SelectedProduct.active

    const PromptTitle = TargetActive ? 'Activate' : 'Deactivate'
    const PromptContent = TargetActive ? 'The product will be back available on the menu.'
      : 'This will make the product become unavailable on the menu.'

    this.ModalService.confirm({
      nzTitle: `${PromptTitle} ${this.SelectedItemInfo.name}?`,
      nzContent: PromptContent,
      nzCentered: true,
      nzOnOk: async () => {
        const [UpdateResult] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'menu', 'PATCH', 'Could not update menu item', {
          active: TargetActive,
          name: SelectedProduct.name,
        })

        if (UpdateResult) {
          if (TargetActive)
            this.MessageService.success("Product activated")
          else
            this.MessageService.success("Product deactivated")

          this.LoadMenuItems()
        }
      }
    })
  }

  async DeleteCategory(Category:string) {
    await this.MenuService.DeleteCategory(Category)
    this.LoadCategories()
  }



  DisplayItemInfo(ItemInfo: any) {
    this.DrawerOpen = true,
    this.SelectedItemInfo = ItemInfo
  }

  async OpenUploadModel() {
    this.InsertModalOpen = true
  }

  async LoadMenuItems(Category: any = null) {
    this.LoadingMenu = true
    
    const CategoryToSet = Category != 'All' ? Category : 'Dish'
    this.ItemCreationForm.get('category')?.setValue(CategoryToSet)

    let MenuItemResult:any[] = await this.MenuService.GetMenuItems(Category)
    if (MenuItemResult) {
      this.CurrentMenuList.set(MenuItemResult)
      const SelectedMenuItem = this.SelectedItemInfo
      if (SelectedMenuItem){
        const SelectedMenuItemIndex = MenuItemResult.findIndex((product)=>product.id == SelectedMenuItem.id)
        if (SelectedMenuItemIndex != -1){
          this.SelectedItemInfo = MenuItemResult[SelectedMenuItemIndex]
        }
      }
    }
    this.LoadingMenu = false
  }
  async LoadCategories() {

    let CategoriesResult = await this.MenuService.GetCategories()

    if (CategoriesResult) {
      let ConvertedResult = Object.keys(CategoriesResult).map(key => (CategoriesResult[key].category))

      this.Categories = ConvertedResult
    }
  }


  ngOnInit() {
    this.LoadCategories()

  }



}

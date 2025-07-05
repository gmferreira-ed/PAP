import { Component, inject, Renderer2, signal, ViewChild } from '@angular/core';
import { PageLayoutComponent } from '../../Components/page-layout/page-layout.component';
import { CommonModule } from '@angular/common';
import { DynamicCurrencyPipe } from '../../Pipes/dynamic-currency.pipe';

import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule, NzSelectSizeType } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenuService } from '../../Services/menu.service';
import { TranslateModule } from '@ngx-translate/core';
import { HttpService } from '../../Services/Http.service';
import { AppSettings } from '../../Services/AppSettings';
import { FileSelectComponent } from "../../Components/file-selector/file-select.component";
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { LoadingScreen } from "../../Components/loading-screen/loading-screen.component";
import { UFile } from '../../../types/ufile';
import { FloatingContainer } from "../../Components/floating-container/floating-container";
import { AuthService } from '../../Services/Auth.service';


@Component({
  selector: 'menu-page',
  imports: [PageLayoutComponent, DynamicCurrencyPipe, NzSegmentedModule, NzInputModule, NzButtonModule,
    NzDrawerModule, TranslateModule, NzSwitchModule, NzTableModule,
    CdkDropList, NzToolTipModule, CdkDropList, CdkDrag, CdkDragHandle,
    NzSkeletonModule, NzModalModule, NzFormModule, NzSelectModule, NzIconModule, FormsModule,
    CommonModule, ReactiveFormsModule, FileSelectComponent, LoadingScreen, FloatingContainer],
  templateUrl: './menu.page.html',
  styleUrl: './menu.page.less'
})


export class MenuPage {

  MenuList = []

  // SERVICES
  ModalService = inject(NzModalService)
  MenuService = inject(MenuService)
  MessageService = inject(NzMessageService)
  AuthService = inject(AuthService)
  Renderer = inject(Renderer2)
  HttpService = inject(HttpService)


  // IMAGE UPLOADING / LOADING
  ThumbnailsUrl = AppSettings.ImagesURL + 'menu/'
  NewItemImage: string | null = null
  SelectedThumbnailUrl = ''
  InsertItemThumbnailFileName = ''
  CurrentCategory = ''

  // OBJECTS
  @ViewChild('FileSelector') FileSelector?: FileSelectComponent
  Categories: any[] = []

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


  // STATES
  CategoryInsertVisible = false
  DrawerOpen = false
  InsertModalOpen = false
  CategoriesModalVisible = false
  LoadingThumbnail = false
  CreatingCategory = false

  LoadingCategories = false
  LoadingMenu = false
  IsInsertingItem = false
  InsertingCategory = false

  ItemCreationForm = new FormGroup({
    product: new FormControl('', [Validators.required, Validators.minLength(3)]),
    category: new FormControl('Dish', [Validators.required]),
    price: new FormControl(1.00, [Validators.required]),
    active: new FormControl(false, []),
  })


  // Variables
  CanModifyMenu = this.AuthService.HasEndpointPermission('menu', 'POST')

  MenuThumbnails = []
  async InsertMenuItem() {
    this.IsInsertingItem = true

    const FormValues = this.ItemCreationForm.value
    const ProductName = FormValues.product!
    const ProductPrice = Number(FormValues.price!)
    const ProductCategory = FormValues.category || null

    this.ItemCreationForm.disable()

    const ItemInsertResult = await this.MenuService.InsertMenuItem(ProductName, ProductCategory, ProductPrice, FormValues.active!, this.MenuThumbnails[0])
    if (ItemInsertResult) {
      await this.LoadMenuItems(this.CurrentCategory)

      this.MenuThumbnails = []
      this.ItemCreationForm.reset()
      this.InsertModalOpen = false
    }

    this.ItemCreationForm.enable()
    this.IsInsertingItem = false
  }

  async CreateCategory() {

    this.CreatingCategory = true

    const Category = this.CategoryToInsert
    let Categories = this.Categories
    let ValidLenght = this.CategoryToInsert.length >= 3
    let ValidName = !Categories.includes(Category)

    if (ValidLenght && ValidName) {

      const InsertSucess = await this.MenuService.InsertCategory(Category)
      if (InsertSucess) {
        this.CategoryInsertVisible = false
        this.LoadCategories()
      }
    } else if (!ValidName) {
      this.MessageService.error("This category already exists")

    } else {
      this.MessageService.error("Your category must have 3 or more characters")
    }
    
    this.CreatingCategory = false
  }


  async ChangeProductImage(Product: any, Files: UFile[]) {
    const File = Files[0]
    if (File) {
      await this.MenuService.SetImage(Product.name, File)
      Product.ImageURL = File.imagebase64
    }
  }

  async ChangeProductOrder(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.MenuProducts, event.previousIndex, event.currentIndex);

    this.MenuProducts.forEach((product, index) => {
      product.order = index + 1;
    });

    const [OrderUpdate] = await this.HttpService.MakeRequest(
      AppSettings.APIUrl + 'menu/order',
      'PATCH',
      'Failed to update menu order',
      { order: this.MenuProducts.map(item => ({ id: item.id, order: item.order })) }
    );
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
          id: SelectedProduct.id,
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

  async DeleteCategory(Category: any) {
    Category.Deleting = true
    await this.MenuService.DeleteCategory(Category)
    Category.Deleting = false
    this.LoadCategories()
  }



  DisplayItemInfo(ItemInfo: any) {
    this.DrawerOpen = true,
      this.SelectedItemInfo = ItemInfo
  }

  async OpenUploadModel() {
    this.InsertModalOpen = true
  }

  MenuProducts: any[] = []

  async LoadMenuItems(Category: any = null) {
    this.LoadingMenu = true

    const CategoryToSet = Category != 'All' ? Category : 'Dish'
    this.ItemCreationForm.get('category')?.setValue(CategoryToSet)

    let MenuProducts: any[] = await this.MenuService.MenuProducts.Get(true)

    if (MenuProducts) {
      this.MenuProducts = MenuProducts

      // Update selected item info
      const SelectedMenuItem = this.SelectedItemInfo
      if (SelectedMenuItem) {
        const SelectedMenuItemIndex = MenuProducts.findIndex((product) => product.id == SelectedMenuItem.id)
        if (SelectedMenuItemIndex != -1) {
          this.SelectedItemInfo = MenuProducts[SelectedMenuItemIndex]
        }
      }
    }
    this.LoadingMenu = false
  }

  GetFilteredMenuItems() {
    if (this.CurrentCategory == 'All') {
      return this.MenuProducts
    } else {
      return this.MenuProducts.filter((Product) => Product.category == this.CurrentCategory)
    }
  }


  async LoadCategories() {

    this.LoadingCategories = true

    let CategoriesResult = await this.MenuService.GetCategories()

    if (CategoriesResult) {
      let ConvertedResult = Object.keys(CategoriesResult).map(key => (CategoriesResult[key]))

      this.Categories = ConvertedResult
    }

    
    this.LoadingCategories = false
  }


  ngOnInit() {
    this.LoadCategories()
    this.LoadMenuItems()
  }



}

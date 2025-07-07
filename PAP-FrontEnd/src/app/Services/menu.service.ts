
import { inject, Injectable } from '@angular/core';
import { HttpService } from './Http.service';
import { AppSettings } from './AppSettings';
import { NzMessageService } from 'ng-zorro-antd/message';
import SimpleCache from '../../shared/SimpleCache';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  HttpService = inject(HttpService)
  MessageService = inject(NzMessageService)
  TranslateService = inject(TranslateService)

  FailedMenuItems = false

  LoadingMenuItems = true
  LoadingCategories = true

  MenuURL = AppSettings.APIUrl + "menu"
  ImagesURL = AppSettings.ImagesURL + "menu/"
  CategoriesURL = this.MenuURL + "/categories"

  MenuProducts = new SimpleCache(async (category: string): Promise<any[]> => {
    this.LoadingMenuItems = true

    const MenuURL = new URL(this.MenuURL)
    if (category != "All" && category) {
      MenuURL.searchParams.append('category', category);
    }

    const [Result] = await this.HttpService.MakeRequest(MenuURL, 'GET', this.TranslateService.instant('Could not get menu items. Please try again'))

    if (Array.isArray(Result)) {
      for (const MenuItem of Result)
        MenuItem.ImageURL = this.ImagesURL + MenuItem.name
    }
    this.LoadingMenuItems = false

    return Result
  }, 30)



  Categories: any[] = []

  LastMenuFetch = 0

  async DeleteMenuItem(ProductName: string) {
    const [Result] = await this.HttpService.MakeRequest(this.MenuURL, 'DELETE', this.TranslateService.instant('Failed to delete menu item'), {
      name: ProductName,
    })
    if (Result) {
      this.MessageService.success(this.TranslateService.instant('Sucessfully removed') + ` ${ProductName} ` + this.TranslateService.instant('from the menu'))
    }
    return Result
  }


  async SetImage(product: string, File: File) {
    const FileData = new FormData();
    FileData.append('name', product)
    FileData.append('image', File);

    const [UploadResult] = await this.HttpService.MakeRequest(AppSettings.ImagesURL + 'menu', 'POST', this.TranslateService.instant('Failed to upload menu item image'), FileData)

    if (UploadResult) {
      this.MessageService.success(this.TranslateService.instant('Successfully changed product image'))
    }
    return UploadResult
  }

  async InsertMenuItem(name: string, category: string|null, price: number, active: boolean | string, File?: File) {


    var UploadResult: any = true
    if (File) {
      UploadResult = await this.SetImage(name, File)
    }

    if (UploadResult) {
      const formData = new URLSearchParams();
      formData.append('name', name)
      if (category)
        formData.append('category_id', category)
      formData.append('price', String(price))
      formData.append('active', 'true')

      const [Result] = await this.HttpService.MakeRequest(this.MenuURL, 'POST', this.TranslateService.instant('Failed to insert menu item'), formData)

      if (Result) {
        this.MessageService.success(this.TranslateService.instant('Sucessfully added') + ` ${name} ` + this.TranslateService.instant('to the menu'))
        return true
      }
    }


    return false
  }

  async DeleteCategory(Category: any) {
    const [Result] = await this.HttpService.MakeRequest(this.CategoriesURL, 'DELETE', this.TranslateService.instant('Failed to delete category'), {
      category_id: Category.id,
    })

    if (Result) {
      this.MessageService.success(this.TranslateService.instant('Sucessfully removed category') + ` ${Category.name}`)
    }
    return Result
  }

  async InsertCategory(Category: String) {
    const [Result] = await this.HttpService.MakeRequest(this.CategoriesURL, 'POST', this.TranslateService.instant('Failed to insert category'), {
      category: Category,
    })

    if (Result) {
      this.MessageService.success(this.TranslateService.instant('Sucessfully added category') + ` ${Category}`)
    }

    return Result
  }

  async GetCategories(category: any = null) {
    this.LoadingCategories = true

    const CategoriesUrl = new URL(this.CategoriesURL);
    CategoriesUrl.searchParams.append('category', category);

    const [Result] = await this.HttpService.MakeRequest(this.CategoriesURL, 'GET', this.TranslateService.instant('Failed to load categories'))

    if (Result)
      this.Categories = Result

    this.LoadingCategories = false
    return Result
  }
}
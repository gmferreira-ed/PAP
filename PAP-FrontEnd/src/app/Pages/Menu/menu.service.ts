
import { inject, Injectable } from '@angular/core';
import { HttpService } from '../../Services/Http.service';
import { AppSettings } from '../../Services/AppSettings';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  HttpService = inject(HttpService)
  MessageService = inject(NzMessageService)

  FailedMenuItems = false

  LoadingMenuItems = true
  LoadingCategories = true

  MenuURL = AppSettings.APIUrl + "menu"
  ImagesURL = AppSettings.ImagesURL + "menu/"
  CategoriesURL = this.MenuURL + "/categories"

  async GetMenuItems(category: any = null) {
    this.LoadingMenuItems = true

    const MenuURL = new URL(this.MenuURL)
    if (category != "All" && category) {
      MenuURL.searchParams.append('category', category);
    }
    let [Result] = await this.HttpService.MakeRequest(MenuURL, 'GET', 'Could not get menu items. Please try again')

    if (Array.isArray(Result)){
      for (const MenuItem of Result)
        MenuItem.ImageURL = this.ImagesURL+MenuItem.name
    } 
    this.LoadingMenuItems = false

    return Result
  }

  async DeleteMenuItem(ProductName: string) {
    const [Result] = await this.HttpService.MakeRequest(this.MenuURL, 'DELETE', 'Failed to delete menu item', {
      name: ProductName,
    })
    if (Result) {
      this.MessageService.success(`Sucessfully removed ${ProductName} from the menu`)
    }
    return Result
  }


  async SetImage(product:string, File:File){
      const FileData = new FormData();
      FileData.append('name', product)
      FileData.append('image', File);

      const [UploadResult] = await this.HttpService.MakeRequest(AppSettings.ImagesURL + 'menu', 'POST', 'Failed to upload menu item image', FileData)
      return UploadResult
  }

  async InsertMenuItem(name: string, category: string, price: number, active: boolean | string, File?: File) {


    var UploadResult: any = true
    if (File) {
      UploadResult = await this.SetImage(name, File)
    }

    if (UploadResult) {
      const formData = new URLSearchParams();
      formData.append('name', name)
      formData.append('category', category)
      formData.append('price', String(price))
      formData.append('active', 'true')

      const [Result] = await this.HttpService.MakeRequest(this.MenuURL, 'POST', 'Failed to insert menu item', formData)

      if (Result) {
        this.MessageService.success(`Sucessfully added ${name} to the menu`)
        return true
      }
    }


    return false
  }

  async DeleteCategory(Category: String) {
    const [Result] = await this.HttpService.MakeRequest(this.CategoriesURL, 'DELETE', 'Failed to delete category', {
      category: Category,
    })

    if (Result) {
      this.MessageService.success(`Sucessfully removed category ${Category}`)
    }
    return Result
  }

  async InsertCategory(Category: String) {
    const [Result] = await this.HttpService.MakeRequest(this.CategoriesURL, 'POST', 'Failed to insert category', {
      category: Category,
    })

    if (Result) {
      this.MessageService.success(`Sucessfully added category ${Category}`)
    }

    return Result
  }

  async GetCategories(category: any = null) {
    this.LoadingCategories = true

    const CategoriesUrl = new URL(this.CategoriesURL);
    CategoriesUrl.searchParams.append('category', category);

    const [Result] = await this.HttpService.MakeRequest(this.CategoriesURL, 'GET', 'Failed to load categories')

    this.LoadingCategories = false
    return Result
  }
}
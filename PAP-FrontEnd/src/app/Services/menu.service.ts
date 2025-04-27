
import { inject, Injectable } from '@angular/core';
import { HttpService } from './Http.service';
import { AppSettings } from './AppSettings';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  HttpService = inject(HttpService)

  FailedMenuItems = false

  LoadingMenuItems = true
  LoadingCategories = true

  MenuURL = AppSettings.APIUrl+"menu/"
  CategoriesURL = this.MenuURL+"categories"

  async GetMenuItems(category: any = null) {
    this.LoadingMenuItems = true

    const MenuURL = new URL (this.MenuURL)
    if (category != "All" && category) {
      MenuURL.searchParams.append('category', category);
    }
    const Result = await this.HttpService.MakeRequest(MenuURL, 'GET', 'Could not get menu items. Please try again')

    this.LoadingMenuItems = false
    return Result
  }

  async DeleteMenuItem(ProductName:string) {
    const Result = await this.HttpService.MakeRequest(this.MenuURL, 'DELETE', 'Failed to delete menu item',{
      product: ProductName,
    })
    return Result
  }



  async InsertMenuItem(name: string, category: string, price: number, filename: any) {
    
    const Result = await this.HttpService.MakeRequest(this.MenuURL, 'DELETE', 'Failed to insert menu item',{
      product: name,
      category: category,
      price: price,
      image_path: filename,
      active: true
    })

    return Result
  }

  async DeleteCategory(Category:String) {
    const Result = await this.HttpService.MakeRequest(this.CategoriesURL, 'DELETE', 'Failed to delete category',{
      category: Category,
    })

    return await Result.json()
  }

  async InsertCategory(Category:String) {
    const Result = await this.HttpService.MakeRequest(this.CategoriesURL, 'POST', 'Failed to insert category',{
      category: Category,
    })

    return await Result.json()
  }

  async GetCategories(category: any = null) {
    this.LoadingCategories = true

    const CategoriesUrl = new URL(this.CategoriesURL);
    CategoriesUrl.searchParams.append('category', category);
    
    const Result = await this.HttpService.MakeRequest(this.CategoriesURL, 'GET', 'Failed to load categories')
    
    this.LoadingCategories = false
    return await Result.json()
  }
}
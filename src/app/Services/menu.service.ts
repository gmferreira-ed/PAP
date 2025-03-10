import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(private http:HttpClient){}

    async GetMenuItems(category:any = null){
        const UsersUrl = new URL("http://localhost:3000/menu");
        if (category != "All" && category){
          UsersUrl.searchParams.append('category', category);
        }
        const Result = await fetch(UsersUrl)
        return await Result.json()
    }

    async GetCategories(category:any = null){
      const UsersUrl = new URL("http://localhost:3000/menu/categories");
      UsersUrl.searchParams.append('category', category);
      const Result = await fetch(UsersUrl)
      return await Result.json()
  }
}
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private http:HttpClient){}

  async GetUsers(PageNumber:any, PageSize:any){
      const UsersUrl = new URL("http://localhost:3000/users");
      UsersUrl.searchParams.append('page', PageNumber);
      UsersUrl.searchParams.append('pagesize', PageSize);
      const Result = await fetch(UsersUrl)
      return await Result.json()
  }
}
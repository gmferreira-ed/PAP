import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private http:HttpClient){}

  async GetUsers(){
      const Result = await fetch("http://localhost:3000/users")
      return await Result.json()
  }
}
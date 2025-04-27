import { inject, Injectable, signal } from '@angular/core';
import { AppSettings } from './AppSettings';
import { ActivatedRouteSnapshot, Route, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root'
})

export class HttpService {

  private MessageService = inject(NzMessageService)

  private readonly DefaultHeaders = {
    'Content-Type': 'application/json'
  }

  wait = (seconds: number) => new Promise(resolve => setTimeout(resolve, seconds * 1000));



  async MakeRequest(RequestURL: URL | string, Method: string = "GET", ErrorSuffix: string = "", Body?: any, Headers: HeadersInit = this.DefaultHeaders, JSONBody: boolean = true): Promise<Boolean | any> {
    return new Promise(async (resolve, reject) => {
      if (JSONBody) {
        Body = JSON.stringify(Body)
      }

      if (typeof(RequestURL) == 'string'){
        RequestURL = new URL(RequestURL)
      }

      // PURPOSITAL DELAY TESTS
      const RequestDelay = AppSettings.RequestDelay
      if (RequestDelay && RequestDelay>0 && !RequestURL.pathname.includes('auth') && (!RequestURL.pathname.includes('permission-profiles') || Method!='GET')){
        await this.wait(RequestDelay)
      }

      const Request = fetch(RequestURL, {
        method: Method,
        credentials: 'include',
        headers: Headers,
        body: Body,
      }).then(async (Response) => {

        var Result = await Response.json()
        if (Response.ok) {
          resolve(Result)
        } else {
          if (ErrorSuffix)
          this.MessageService.error(`${ErrorSuffix}\n${Result.error}`)
          resolve(false)
        }
      }).catch((Error: Error) => {
        this.MessageService.error(`Could not connect to the server. Please try again later`)
        resolve(false)
      })
    })
  }



  // WEB SOCKETS

  async ConnectToWebsocket(WebSocketURL:URL|string, Retry?:Boolean, RetryInterval:number=5):Promise<WebSocket>{
    return new Promise(async (FinalResolve, FinalReject) => {
      
      let ConnectedWebsocket = null
      
      while (!ConnectedWebsocket){
        const ConnectionPromise:Promise<any>  = new Promise((resolve, reject)=> {
          // CONNECTING
          const NewWebsocket = new WebSocket(WebSocketURL)
          console.log("Trying to connect to",NewWebsocket.url)
          
          NewWebsocket.onopen = ()=>{
            if (NewWebsocket.readyState === WebSocket.OPEN) {
              console.log("Connected to socket", NewWebsocket.url)
              resolve(NewWebsocket)
            }
          }
    
          NewWebsocket.onerror = ()=>{
            console.log("Failed to connect to socket", NewWebsocket.url)
            resolve(null)
          }
        })

        ConnectedWebsocket = await ConnectionPromise

        if (ConnectedWebsocket){
          FinalResolve(ConnectedWebsocket)
          break
        }else if(Retry){
          console.log("Retrying connection to socket in",RetryInterval)
          await this.wait(RetryInterval)
        }else{
          break
        }
      }
    })
  }
}

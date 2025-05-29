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



  async MakeRequest(RequestURL: URL | string, Method: string = "GET", ErrorSuffix: string = "", Data?: any): Promise<[Boolean | any, string?]> {
    return new Promise(async (resolve, reject) => {


      let RequestHeaders: any = undefined




      if (typeof (RequestURL) == 'string') {
        RequestURL = new URL(RequestURL)
      }

      if (Method == 'GET' && Data) {

        // Convert object to search params
        for (const [key, value] of Object.entries(Data)) {
          RequestURL.searchParams.append(key, String(value))
        }
        Data = undefined
      } else {

        // Convert body type
        const FormDataBody = (Data instanceof FormData)
        const EncodedBody = (Data instanceof URLSearchParams)
        const JSONBody = !EncodedBody && !FormDataBody
        if (JSONBody) {
          Data = JSON.stringify(Data)
          RequestHeaders = { 'Content-Type': 'application/json' }
        } else if (EncodedBody) {
          RequestHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      }

      // PURPOSITAL DELAY TESTS
      const RequestDelay = AppSettings.RequestDelay
      if (RequestDelay && RequestDelay > 0 && !RequestURL.pathname.includes('auth') && (!RequestURL.pathname.includes('role-permissions/user') || Method != 'GET')) {
        await this.wait(RequestDelay)
      }

      const Request = fetch(RequestURL, {
        headers: RequestHeaders,
        method: Method,
        credentials: 'include',
        body: Data,

        //PARSING
      }).then(async (Response) => {
        const ContentType = Response.headers.get("Content-Type") || ''

        var Result: any = undefined

        if (ContentType.includes("application/json")) {
          Result = await Response.json()
        } else if (ContentType.includes("text/html")) {
          Result = await Response.text()
        } else {
          Result = await Response.blob()
        }


        if (Response.ok) {
          resolve([Result])
        } else {
          if (ErrorSuffix)
            this.MessageService.error(`${ErrorSuffix}\n${Result.error}`)
          resolve([false, Result.error])
        }

        // ERROR
      }).catch((Error: Error) => {
        console.error(Error)
        this.MessageService.error(`Could not connect to the server. Please try again later`)
        resolve([false, 'Connection error'])
      })
    })
  }



  // WEB SOCKETS

  async ConnectToWebsocket(WebSocketURL: URL | string, Retry?: Boolean, RetryInterval: number = 5): Promise<WebSocket> {
    return new Promise(async (FinalResolve, FinalReject) => {

      let ConnectedWebsocket = null

      while (!ConnectedWebsocket) {
        const ConnectionPromise: Promise<any> = new Promise((resolve, reject) => {
          // CONNECTING
          const NewWebsocket = new WebSocket(WebSocketURL)
          console.log("Trying to connect to", NewWebsocket.url)

          NewWebsocket.onopen = () => {
            if (NewWebsocket.readyState === WebSocket.OPEN) {
              console.log("Connected to socket", NewWebsocket.url)
              resolve(NewWebsocket)
            }
          }

          NewWebsocket.onerror = () => {
            console.log("Failed to connect to socket", NewWebsocket.url)
            resolve(null)
          }
        })

        ConnectedWebsocket = await ConnectionPromise

        if (ConnectedWebsocket) {
          FinalResolve(ConnectedWebsocket)
          break
        } else if (Retry) {
          console.log("Retrying connection to socket in", RetryInterval)
          await this.wait(RetryInterval)
        } else {
          break
        }
      }
    })
  }
}

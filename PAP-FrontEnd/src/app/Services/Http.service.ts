import { inject, Injectable, signal } from '@angular/core';
import { AppSettings } from './AppSettings';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';

type ErrorInfo = {
  ErrorCode: number,
  ErrorMessage: string
}

@Injectable({
  providedIn: 'root'
})

export class HttpService {

  private MessageService = inject(NzMessageService)
  private TranslateService = inject(TranslateService)

  private readonly DefaultHeaders = {
    'Content-Type': 'application/json'
  }

  wait = (seconds: number) => new Promise(resolve => setTimeout(resolve, seconds * 1000));



  async MakeRequest(RequestURL: URL | string, Method: string = "GET", ErrorSuffix: string = "", Data?: any): Promise<[Boolean | any, ErrorInfo?]> {
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
            this.MessageService.error(`${ErrorSuffix}\n${this.TranslateService.instant(Result.error)}`)
          resolve([false, {
            ErrorCode: Response.status,
            ErrorMessage: Result.error
          }])
        }

        // ERROR
      }).catch((Error: Error) => {
        this.MessageService.error(this.TranslateService.instant(`Could not connect to the server. Please try again later`))
        resolve([false, {
          ErrorCode: -1,
          ErrorMessage: 'Connection Error'
        }])
      })
    })
  }



  // WEB SOCKETS
  async ConnectToWebsocket(WebSocketPath: URL | string, Retry?: Boolean, RetryInterval: number = 5)
    : Promise<WebSocket & { OnMessage?: (Message: string, Data: any) => void }> {

    return new Promise(async (FinalResolve, FinalReject) => {

      let ConnectedWebsocket = null
      const WebSocketURL = AppSettings.APIUrl + 'websocket/' + WebSocketPath

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

          NewWebsocket.onmessage = (msg) => {
            try {
              const MessageData = JSON.parse(msg.data);
              (NewWebsocket as any).OnMessage?.(MessageData.message, MessageData.data);
            } catch (e) {
              console.warn('Received non-JSON message:', msg.data);
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

  // Utils
  GetInstancePatchCallback(URL: URL | string, Error?: string, SucessMessage?: string, Method: string = 'PATCH') {
    return (Instance: any, FieldName: string, IdField: string = 'id') => {
      return async (NewValue: any) => {
        const [UpdateResult] = await this.MakeRequest(URL, Method, Error, {
          [FieldName]: NewValue,
          id: Instance[IdField]
        });
        if (UpdateResult && SucessMessage) {
          //Instance[FieldName] = NewValue
          this.MessageService.success(SucessMessage);
        }
        return UpdateResult
      };
    }
  }
}

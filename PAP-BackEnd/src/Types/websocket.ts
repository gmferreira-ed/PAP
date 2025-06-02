
import WebSocketModule, { WebSocket, WebSocketServer } from 'ws';
import WebsocketService from '../Services/WebsocketService';
interface ExpressWebSocket extends WebSocket {
    User?: User | undefined | string
}



interface WebsocketServerOptions {
    ConnectionGuard?: Function,
    ClientSendFilter?: Function,
    ClientRecieveFilter?: Function,
}


export class ExpressWebSocketServer {
    Server: WebSocketModule.Server;

    ConnectionGuard: Function
    ClientSendFilter: Function
    ClientRecieveFilter: Function

    ClientSockets: Set<ExpressWebSocket> = new Set()

    // Send global message
    SendGlobalMessage(Message: string, Data?: any) {
        const MessageData = {
            message: Message,
            data: Data
        }
        this.ClientSockets.forEach(ClientSocket => {
            const CanListen = this.ClientRecieveFilter(ClientSocket, MessageData)
            if (ClientSocket.readyState == 1 && CanListen) {
                ClientSocket.send(JSON.stringify(MessageData))
            }
        })
    }

    constructor(Path: string, Options?: WebsocketServerOptions) {
        const WebSocketServer: WebSocketServer = new WebSocketModule.Server({ noServer: true })
        this.Server = WebSocketServer

        Path = "/api/websocket" + Path

        WebsocketService.WebSocketServers[Path] = this

        this.ConnectionGuard = Options?.ConnectionGuard || (() => true)
        this.ClientSendFilter = Options?.ClientSendFilter || (() => true)
        this.ClientRecieveFilter = Options?.ClientRecieveFilter || (() => true)



        // On user connect
        WebSocketServer.on('connection', (Request: ExpressRequest, LocalSocket: ExpressWebSocket) => {

            //console.log("WEBSOCKET CONNECTION")

            const User = Request.session.user
            LocalSocket.User = User

            // ON MESSAGE
            LocalSocket.on('message', (WebSocketMessage: string)=> {
                if (this.ClientSendFilter())
                     this.SendGlobalMessage(WebSocketMessage)
            });

            // ON CLOSE
            LocalSocket.on('close', () => {
                console.log("SOCKET", User, "DISCONNECTED")
                this.ClientSockets.delete(LocalSocket);
                 this.SendGlobalMessage('disconnect', User)
            });

             this.ClientSockets.add(LocalSocket);
        });

        

        WebSocketServer.on('wsClientError', (Error)=>{
            console.error(Error)
        })
    }
}
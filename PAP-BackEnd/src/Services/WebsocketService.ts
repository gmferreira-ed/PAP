import { Request } from "express";
import { Http2SecureServer } from "http2";
import WebSocketModule, { WebSocket, WebSocketServer } from 'ws';
import { ExpressWebSocketServer } from "../Types/websocket";

const url = require('url');



class WebSocketService {
    WebSocketServers: { [key: string]: ExpressWebSocketServer } = {}


    
    Connect(HttpServer: Http2SecureServer, SessionMiddleware: Function) {

        HttpServer.on('upgrade', (Request, Socket, Head) => {
            const ParsedURL = url.parse(Request.url, true)
            const Path = ParsedURL.pathname
            const QueryParams = ParsedURL.query

            Request.query = QueryParams

            const TargetWebsocketServer = this.WebSocketServers[Path]

            if (TargetWebsocketServer) {
                SessionMiddleware(Request, {}, function () {

                    const ConnectionGuard = TargetWebsocketServer.ConnectionGuard

                    if (ConnectionGuard && !ConnectionGuard(Request)) {
                        Socket.destroy();
                        return;
                    }
                    TargetWebsocketServer.Server.handleUpgrade(Request, Socket, Head, (NewSocket) => {
                        TargetWebsocketServer.Server.emit('connection', Request, NewSocket);
                    })
                })
            } else {
                console.log("Invalid connection to websocket " + Path)
                Socket.destroy()
            }
        })
    }


}

export default new WebSocketService()
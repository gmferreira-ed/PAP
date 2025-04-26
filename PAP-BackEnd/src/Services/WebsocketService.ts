import {Request} from "express";
import { Http2SecureServer } from "http2";
import WebSocketModule, { WebSocketServer } from 'ws';

const url = require('url');

const WebSocketServers:{[key: string]: WebSocketServer } = {}


async function CreateWebSocketServer(Path:string):Promise<WebSocketServer> {
    const WebSocketServer = new WebSocketModule.Server({ noServer: true })
    Path = "/websocket" + Path
    WebSocketServers[Path] = WebSocketServer
    return WebSocketServer
}

async function ConfigureSessionSocket(WebSocketServer:WebSocketServer) {
    const SessionSockets:Set<any> = new Set()


    // CONNECT
    WebSocketServer.on('connection', (Request:Request, LocalSocket:any) => {

        const User = Request.session.user
        const SocketOffice = Request.query.office
        const SocketStation = Request.query.station


        LocalSocket.User = User
        LocalSocket.Office = SocketOffice
        LocalSocket.Station = SocketStation

        // ON MESSAGE
        LocalSocket.on('message', function (WebSocketMessage:string) {
            //console.log("RECIEVED WEBSOCKET MESSAGE",WebSocketMessage)
            SessionSockets.forEach(OtherSocket => {
                if (OtherSocket.readyState == 1 && OtherSocket.Office == SocketOffice && OtherSocket.Station == SocketStation) {
                    console.log("SOCKET MESSAGE sent to", OtherSocket.User)
                    OtherSocket.send('Update')
                }
            })
        });

        // ON CLOSE
        LocalSocket.on('close', () => {
            console.log("SOCKET", User, "DISCONNECTED")
            SessionSockets.delete(LocalSocket);
        });

        SessionSockets.add(LocalSocket);
    });
}

function Connect(HttpServer:Http2SecureServer, SessionMiddleware:Function) {
    console.log("Listening to websocket connection")

    HttpServer.on('upgrade', (Request, Socket, Head) => {
        const ParsedURL = url.parse(Request.url, true)
        const Path = ParsedURL.pathname
        const QueryParams = ParsedURL.query

        Request.query = QueryParams

        const TargetWebsocketServer = WebSocketServers[Path]

        if (TargetWebsocketServer) {
            SessionMiddleware(Request, {}, function () {
                TargetWebsocketServer.handleUpgrade(Request, Socket, Head, (NewSocket) => {
                    TargetWebsocketServer.emit('connection', Request, NewSocket );
                })
            })
        } else {
            console.log("Invalid connection to websocket " + Path)
            Socket.destroy()
        }
    })
}

module.exports = {
    ConfigureSessionSocket,
    CreateWebSocketServer,
    WebSocketServers,
    Connect,
}
const path = require('path')
const cors = require('cors')
const http = require('http')

import dotenv from "dotenv"
dotenv.config()

import fs from 'fs'

import express, { NextFunction, Router } from 'express'
import session from 'express-session'
import expressmysqlsession from "express-mysql-session"
import { parse as CommentParser } from 'comment-parser'

import { DBOptions, EndpointRegex, EndpointsAttributes, Database } from './Globals'
import PermissionsService from './Services/PermissionsService'
import WebSocketService from './Services/WebsocketService'

const MySQLStore = expressmysqlsession(session as any)


// SESSION SETUP
const SessionStore = new MySQLStore(DBOptions);
const SessionMiddleware = session({
  secret: 'uh*&T*8787GT^hk0a(#R)@',

  store: SessionStore,

  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, }
})



// MIDDLEWARE SETUP
const Server = express();
Server.use(cors({
  origin: ['http://localhost:5000', 'http://192.168.1.99:5000', 'http://172.22.224.1:5000'],
  credentials: true,
}))
Server.use(express.json())
Server.use(express.urlencoded({ extended: true }))


Server.use(SessionMiddleware)
Server.use(PermissionsService.PermissionsMiddleware);




// ENDPOINTS SETUP

const EndpointsFolder = path.join(__dirname, 'Endpoints/');
fs.readdirSync(EndpointsFolder).forEach((Endpoint: string) => {
  const FilePath = EndpointsFolder + Endpoint

  const FileContent = fs.readFileSync(FilePath, 'utf8');
  const EndpointRouter: Router = require(FilePath);
  const AttributeBlocks = CommentParser(FileContent);


  if (AttributeBlocks.length > 0) {
    for (const [Index, AttributeBlock] of AttributeBlocks.entries()) {
      const AttributesObject = Object.fromEntries(AttributeBlock.tags.map(t => [t.tag, t.name]))
      const Method: string = AttributesObject.method!
      const Path = AttributesObject.path

      const EndpointID = `${Method}/api${Path}`.replace(EndpointRegex, '$1/')

      EndpointsAttributes[EndpointID] = {
        DisplayName: AttributesObject.displayname,
        Category: AttributesObject.category,
        Connected: AttributesObject.connected,
        Unprotected: AttributesObject.unprotected == 'true',
        Root: AttributesObject.root == 'true',
        Summary: AttributesObject.summary
      }
    }
  }

  Server.use('/api/', EndpointRouter)
  //console.log(EndpointRouter)
});


const HttpServer = http.createServer(Server)
WebSocketService.Connect(HttpServer, SessionMiddleware)

// START SERVER
HttpServer.listen(7000, '0.0.0.0', async () => {
  console.log('Server running on port 7000');



  // const EndpointsData=  await PermissionsService.EndpointsData.Get()
  // console.log(EndpointsData)
});



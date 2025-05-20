const path = require('path');
const cors = require('cors')
const dotenv = require('dotenv')

import fs from 'fs'

import express, { NextFunction, Router } from 'express'
import session from 'express-session'
import expressmysqlsession from "express-mysql-session";
import { parse as CommentParser } from 'comment-parser'

import multer from 'multer'

import { EndpointMatches, EndpointRegex, EndpointsAttributes } from './Globals'
import Configs from './Config/EnviromentConfigs'
import PermissionsService from './Services/PermissionsService';
import SQLUtils from './Services/SQLUtils';

const MySQLStore = expressmysqlsession(session as any)


// SESSION SETUP
const SessionDBOptions = {
  host: Configs.DB_Host,

  user: Configs.DB_User,
  password: Configs.DB_Password,

  database: 'sessions',
};

const SessionStore = new MySQLStore(SessionDBOptions);
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
  origin: ['http://localhost:5000', 'http://localhost:7000'],
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
            const Method:string = AttributesObject.method!
            const Path = AttributesObject.path

            const MethodMatch = EndpointMatches[Method]
            const EndpointID = `${MethodMatch}/api${Path}`.replace(EndpointRegex, '$1/')
            
            EndpointsAttributes[EndpointID] = {
                DisplayName:AttributesObject.displayname,
                Category:AttributesObject.category,
                TypeLabel:AttributesObject.type_label,
                Unprotected:AttributesObject.unprotected=='true',
                Summary:AttributesObject.summary
            }
        }
    }

    Server.use('/api/', EndpointRouter)
    //console.log(EndpointRouter)
});


// START SERVER
Server.listen(7000, async () => {
  console.log('Server running on http://localhost:7000');



  //const EndpointsData=  await PermissionsService.EndpointsData.Get()
  //console.log(EndpointsData)
});

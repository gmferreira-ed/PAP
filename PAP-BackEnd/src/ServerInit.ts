const path = require('path');
const cors = require('cors')
const dotenv = require('dotenv')

import fs from 'fs'

import express from 'express'
import session from 'express-session'
import expressmysqlsession from "express-mysql-session";
import swaggerExpress from 'swagger-ui-express';

import { Database } from './Globals'
import Configs from './Config/EnviromentConfigs'

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
  origin: ['http://localhost:4200', 'http://localhost:3000'],
  credentials: true,
}))
Server.use(express.json())
Server.use(express.urlencoded({ extended: true }))

Server.use(SessionMiddleware)
//Server.use(PermissionsService.PermissionsMiddleware);




// ENDPOINTS SETUP
const EndpointsFolder = path.join(__dirname, './Endpoints/');
fs.readdirSync(EndpointsFolder).forEach((Endpoint: string) => {
  const EndpointRouter = require(EndpointsFolder + Endpoint);
  Server.use('/api/', EndpointRouter)
  //console.log(EndpointRouter)
});





// START SERVER
Server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

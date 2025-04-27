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
  port: Configs.DB_Port,

  user: Configs.DB_Password,
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



// API DOCS

const swaggerSpec = {
  swagger: '2.0',
  info: {
    title: 'DinnerLink API',
    version: '2.3.1',
    description: 'Express REST API application for DinnerLink, for all your restaurant needs',
    termsOfService: 'http://www.dinnerlink.com/terms/',
    contact: {
      name: 'DinnerLink Support',
      email: 'support@dinnerlink.com',
      url: 'http://www.dinnerlink.com/contact'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  host: "localhost:3000",
  basePath: "/api",
  tags: [
    {
      name: "Menu",
      description: "Access to the restaurant's menu"
    },
    {
      name: "Users",
      description: "All restaurant-related users, from customers to staff"
    },
    {
      name: "Images",
      description: "Images for profiles and menu items"
    },
  ],
  schemes: ["https", "http"],
  paths: {}
}


// API SPECS SETUP
const API_Specs = path.join(__dirname, './Config/OpenApi/'); console.log(API_Specs)

fs.readdirSync(API_Specs).forEach((EndpointSpec: string) => {
  const ParsedSpec = JSON.parse(fs.readFileSync(API_Specs + EndpointSpec, 'utf-8'));
  Object.assign(swaggerSpec.paths, ParsedSpec);
})

Server.use('/api-docs', swaggerExpress.serve, swaggerExpress.setup(swaggerSpec));



// START SERVER
Server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

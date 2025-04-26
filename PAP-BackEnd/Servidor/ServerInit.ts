const path = require('path');
const cors = require('cors')
import express from 'express'

import session from 'express-session'
const MySQLStore = require('express-mysql-session')(session)

import fs from 'fs'
import { Database } from './Globals'



// SESSION SETUP
const SessionDBOptions = {
  host: 'localhost',
  user: 'root',
  password: '',
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
Server.use(cors())
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
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerExpress from 'swagger-ui-express';

console.log(EndpointsFolder)
const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API for JSONPlaceholder',
      version: '1.0.0',
      description:
        'This is a REST API application made with Express. It retrieves data from JSONPlaceholder.',
    },
  },

  
  apis: [EndpointsFolder+"*"],
});

console.log(swaggerSpec)

Server.use('/api-docs', swaggerExpress.serve, swaggerExpress.setup(swaggerSpec));




Server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

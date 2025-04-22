const path = require('path');
const cors = require('cors')
import express from 'express'
import { Database } from './Globals.ts'
import session from 'express-session'
const MySQLStore = require('express-mysql-session')(session)


const PermissionsService = require('./Services/PermissionsService');

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
Server.use(PermissionsService.PermissionsMiddleware);



Server.get("/", function (request, response) {
  response.send("DinnerSync API main page")
})


Server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});


import express, { response } from 'express'
import multer from 'multer'
const Router = express.Router();
import { Database, HandleEndpointFunction, OrdersWebsocket } from '../Globals'
import SQLUtils from '../Services/SQLUtils';
import path from 'path';
import PermissionsService from '../Services/PermissionsService';
import { ResultSetHeader } from 'mysql2';




module.exports = Router
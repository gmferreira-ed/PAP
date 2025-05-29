import mysql from 'mysql2'

import { Request, Response, NextFunction, RequestHandler } from 'express';
import EnviromentConfigs from './Config/EnviromentConfigs';
import WebsocketService from './Services/WebsocketService';
import { ExpressWebSocketServer } from './Types/websocket';


// SQL AND DATABASE SETUP
const Database = mysql.createPool({
  host: EnviromentConfigs.DB_Host,
  port: EnviromentConfigs.DB_PORT,

  user: EnviromentConfigs.DB_User,
  password: EnviromentConfigs.DB_Password,

  timezone: 'Z',
  database: 'restaurant',

}).promise()



async function GetPaginatedResult(Table: string, SQLQuery:string, SQLValues:any, 
  PageNumber?: number|string, 
  PageSize?: number|string, 
  OrderBy?: string)
:Promise<PaginatedResult> {


  PageSize = PageSize ? Number(PageSize) : 25
  PageNumber = PageNumber ? Number(PageNumber) : 1

  PageSize = Math.min(PageSize, 100)

  if (OrderBy) {
    SQLQuery = SQLQuery + `\n${OrderBy}`
  }
  if (PageNumber && PageNumber >= 1) {
    SQLQuery = SQLQuery + `
      LIMIT ${PageSize} OFFSET ${(PageNumber - 1) * PageSize}`
  }

  const [rows] = await Database.execute<any[]>(SQLQuery,SQLValues);

  const PagesSQLQuery = `SELECT CEIL(COUNT(*) / ${PageSize}) AS total_pages FROM ${Table};`
  let [CountResult] = await Database.query<any[]>(PagesSQLQuery);

  const TotalPages:number = CountResult[0].total_pages

  return { Rows: rows, Pages: TotalPages }
}

function ErrorResponse(errorcode: any, error: any, response: Response) {
  const ErrorMessage = typeof (error) == 'string' ? error : error.message
  response.statusMessage = ErrorMessage
  response.status(errorcode)
  response.send({ error: ErrorMessage })
}


function HandleEndpointFunction(EndpointFunction: AsyncEndpoint, DisplayServerError: boolean = false) {

  return function (Request: Request, Response: Response, Next: NextFunction) {
    EndpointFunction(Request, Response, Next).catch(function (Error: any) {

      console.warn(Error)

      let ErrorMessage = "Internal server error: " + Error.message
      let ClientDisplayedError = Error.code || (DisplayServerError ? ErrorMessage : "Internal server error")

      Response.statusMessage = ClientDisplayedError
      Response.status(502)
      Response.send({ success: false, error: ClientDisplayedError })
    });
  };
}


let EndpointsAttributes:{[EndpointID: string]: EndpointAttributes} = {}

const EndpointMatches:{[key: string]:string} = {
  GET: 'VIEW',
  PATCH: 'EDIT',
  POST: 'CREATE',
  DELETE: 'CREATE',
}

const EndpointRegex = '^(.*[^/*])$'


const OrdersWebsocket = new ExpressWebSocketServer('/orders')
export {
  Database, GetPaginatedResult, HandleEndpointFunction, ErrorResponse,
  OrdersWebsocket,
  EndpointsAttributes,
  EndpointRegex,
  EndpointMatches,
};
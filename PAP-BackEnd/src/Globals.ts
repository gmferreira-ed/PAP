import mysql from 'mysql2'

import { Request, Response, NextFunction, RequestHandler } from 'express';
import EnviromentConfigs from './Config/EnviromentConfigs';
import WebsocketService from './Services/WebsocketService';
import { ExpressWebSocketServer } from './Types/websocket';

const DBOptions = {

  host: EnviromentConfigs.DB_Host,
  port: EnviromentConfigs.DB_PORT,

  user: EnviromentConfigs.DB_User,
  password: EnviromentConfigs.DB_Password,
  database: 'restaurant',
}

// SQL AND DATABASE SETUP
const Database = mysql.createPool({
  ...DBOptions,

  timezone: 'Z',
  enableKeepAlive: true,

}).promise()



async function GetPaginatedResult(Table: string, SQLQuery: string, SQLValues: any, QueryParams: any,
  MaxPageSize: number = 100,
  OrderBy?: string)
  : Promise<PaginatedResult> {


  let PageSize = QueryParams.page_size ? Number(QueryParams.page_size) : 25
  let PageIndex = QueryParams.page ? Number(QueryParams.page) : 1


  PageSize = Math.min(PageSize, MaxPageSize)


  if (OrderBy) {
    SQLQuery = SQLQuery + `\n${OrderBy}`
  }
  if (PageIndex >= 1) {
    SQLQuery = SQLQuery + `
      LIMIT ${PageSize} OFFSET ${(PageIndex - 1) * PageSize}`
  }

  const [rows] = await Database.execute<any[]>(SQLQuery, SQLValues);

  const PagesSQLQuery = `SELECT CEIL(COUNT(*) / ${PageSize}) AS total_pages FROM ${Table};`
  let [CountResult] = await Database.query<any[]>(PagesSQLQuery);

  const TotalPages: number = CountResult[0].total_pages

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


let EndpointsAttributes: { [EndpointID: string]: EndpointAttributes } = {}


const EndpointRegex = '^(.*[^/*])$'


const OrdersWebsocket = new ExpressWebSocketServer('/orders')
export {
  Database, GetPaginatedResult, HandleEndpointFunction, ErrorResponse,
  OrdersWebsocket,
  EndpointsAttributes,
  EndpointRegex,
  DBOptions
};
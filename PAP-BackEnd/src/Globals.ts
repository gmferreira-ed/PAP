import mysql from 'mysql2'

import { Request, Response, NextFunction, RequestHandler } from 'express';
import EnviromentConfigs from './Config/EnviromentConfigs';


// SQL AND DATABASE SETUP
const Database = mysql.createPool({
  host: EnviromentConfigs.DB_Host,

  user: EnviromentConfigs.DB_User,
  password: EnviromentConfigs.DB_Password,

  database: 'restaurant',
}).promise()



async function GetTablePage(Table: string, PageNumber: number, PageSize: number, OrderBy: string = "") {
  var SQLQuery = `SELECT * FROM ${Table}`

  PageSize = Math.min(PageSize, 100)

  if (OrderBy) {
    SQLQuery = SQLQuery + `\n${OrderBy}`
  }
  if (PageNumber && PageNumber >= 1) {
    SQLQuery = SQLQuery + `
      LIMIT ${PageSize} OFFSET ${(PageNumber - 1) * PageSize}`
  }

  const [rows] = await Database.query(SQLQuery);

  const PagesSQLQuery = `SELECT CEIL(COUNT(*) / ${PageSize}) AS total_pages FROM users;`
  let [TotalPages] = await Database.query<any[]>(PagesSQLQuery);

  TotalPages = TotalPages[0].total_pages

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



export {
  Database, GetTablePage, HandleEndpointFunction, ErrorResponse
};
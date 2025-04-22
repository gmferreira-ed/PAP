const mysql = require('mysql2')

import { Request, Response, NextFunction, RequestHandler } from 'express';


// SQL AND DATABASE SETUP
const Database = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'restaurante',
});


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

    const [rows] = await Database.promise().query(SQLQuery);

    const PagesSQLQuery = `SELECT CEIL(COUNT(*) / ${PageSize}) AS total_pages FROM users;`
    let TotalPages = await Database.promise().query(PagesSQLQuery);

    TotalPages = TotalPages[0][0].total_pages

    return { Rows: rows, Pages: TotalPages }
}


function HandleEndpointFunction(EndpointFunction:AsyncEndpoint, DisplayServerError:boolean=false) {

    return function (Request: Request, Response: Response, Next: NextFunction) {
      EndpointFunction(Request, Response, Next).catch(function (Error:any) {
  
        console.warn(Error)
  
        let ErrorMessage = "Internal server error: "+Error.message
        let ClientDisplayedError = Error.code ||  (DisplayServerError ? ErrorMessage : "Internal server error" )
        
        Response.statusMessage = ClientDisplayedError
        Response.status(502)
        Response.send({ success: false, error: ClientDisplayedError })
      });
    };
  }

  

export {
    Database, GetTablePage, HandleEndpointFunction
};
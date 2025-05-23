
import express from 'express'
import multer from 'multer'
const Router = express.Router();
import { Database, HandleEndpointFunction } from '../Globals'
import SQLUtils from '../Services/SQLUtils';
import path from 'path';



/**
 * @displayname "Restaurant Layout"
 * @path /layout
 * @method GET
 * @summary "View restaurant layout"
 * @unprotected true
 */
Router.get('/layout', HandleEndpointFunction(async (req, res) => {

    var LayoutQuery = `SELECT * FROM layout`

    const [Layout] = await Database.query<any>(LayoutQuery);

    res.send(Layout)

}));

/**
 * @displayname "Tables"
 * @path /tables
 * @method GET
 * @summary "View restaurant tables"
 * @unprotected true
 */
Router.get('/tables', HandleEndpointFunction(async (req, res) => {

    var LayoutQuery = `SELECT layout.*, orders.order_id, orders.status, orders.created_at FROM layout
    LEFT JOIN orders ON orders.tableid = layout.tableid AND status='ongoing'
     WHERE type='table' or type='roundtable'`

    const [Tables] = await Database.query<any>(LayoutQuery);

    res.send(Tables)

}));


/**
 * @displayname "Edit Layout"
 * @path /layout
 * @method POST
 * @summary "Edit the restaurant layout"
 */
Router.post('/layout', HandleEndpointFunction(async (req, res) => {


    const body = req.body
    body.tableid = null
    if (body.type == 'Table' || body.type == 'RoundTable') {

        const [HighestID] = await Database.query<any[]>("SELECT MAX(tableid) as tableid FROM layout");
        body.tableid = (HighestID[0].tableid || 0) + 1

        console.log(HighestID)
    }

    const [InsertQuery, Values] = SQLUtils.BuildInsertQuery('layout', [
        'top',
        'left',
        'width',
        'height',
        'type',
        'componentid',
        'tableid',
    ], body)


    const [Result] = await Database.execute<any>(InsertQuery, Values);

    res.send({ id: Result?.insertId, tableid:body.tableid  })

}));

/**
 * @displayname "Edit Layout"
 * @path /layout/import
 * @method POST
 * @summary "Edit the restaurant layout"
 */
Router.post('/layout/import', HandleEndpointFunction(async (req, res) => {


    const body = req.body

    const [InsertQuery, Values] = SQLUtils.BuildInsertQuery('layout', [
        'top',
        'left',
        'width',
        'height',
        'type',
        'componentid',
    ], body)

    const [Result] = await Database.execute<any>(InsertQuery, Values);

    res.send({ id: Result?.insertId })

}));


/**
 * @displayname "Edit Layout"
 * @path /layout
 * @method PATCH
 * @summary "Edit the restaurant layout"
 */
Router.patch('/layout', HandleEndpointFunction(async (req, res) => {
    const body = req.body

    var [SQLQuery, Values] = SQLUtils.BuildUpdateQuery('layout', ['top', 'left', 'width', 'height'], body, ['componentid'])

    const [rows] = await Database.execute(SQLQuery, Values);
    res.send(rows)


}));


/**
 * @displayname "Menu Items"
 * @path /menu
 * @method DELETE
 * @summary "Edit the restaurant layout"
 */
Router.delete('/layout', HandleEndpointFunction(async (Request, Response) => {

    const body = Request.body

    var SQLQuery = "DELETE FROM `layout` "
    var Values = []

    if (!body.clear) {
        SQLQuery += 'WHERE componentid=?'
        Values.push(body.componentid)
    }

    const [rows] = await Database.execute(SQLQuery, Values);
    Response.send(rows)
}))


module.exports = Router
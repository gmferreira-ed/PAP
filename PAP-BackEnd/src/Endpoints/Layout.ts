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
 * @category "Layout"
 * @summary "Add a new layout component"
 * @path /layout
 * @method POST
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
 * @displayname "Import Layout"
 * @category "Layout"
 * @summary "Import a layout component"
 * @path /layout/import
 * @method POST
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
 * @displayname "Update Layout"
 * @category "Layout"
 * @summary "Update layout component properties"
 * @path /layout
 * @method PATCH
 */
Router.patch('/layout', HandleEndpointFunction(async (req, res) => {
    const body = req.body

    var [SQLQuery, Values] = SQLUtils.BuildUpdateQuery('layout', ['top', 'left', 'width', 'height'], body, ['componentid'])

    const [rows] = await Database.execute(SQLQuery, Values);
    res.send(rows)


}));


/**
 * @displayname "Delete Layout"
 * @category "Layout"
 * @summary "Delete a layout component or clear all"
 * @path /menu
 * @method DELETE
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
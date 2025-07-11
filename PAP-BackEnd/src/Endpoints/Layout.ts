import express from 'express'
import multer from 'multer'
const Router = express.Router();
import { Database, HandleEndpointFunction } from '../Globals'
import SQLUtils from '../Services/SQLUtils';
import path from 'path';



/**
 * @displayname "View Restaurant Layout"
 * @category "Layout"
 * @path /layout
 * @method GET
 * @summary "View restaurant layout components and positioning"
 * @unprotected true
 */
Router.get('/layout', HandleEndpointFunction(async (req, res) => {

    var LayoutQuery = `SELECT * FROM layout`

    const [Layout] = await Database.query<any>(LayoutQuery);

    res.send(Layout)

}));

/**
 * @displayname "View Tables"
 * @category "Layout"
 * @path /tables
 * @method GET
 * @summary "View restaurant tables with current order status"
 * @unprotected true
 */
Router.get('/tables', HandleEndpointFunction(async (req, res) => {

    var LayoutQuery = `SELECT layout.*, orders.order_id, orders.status, orders.created_at FROM layout
    LEFT JOIN orders ON orders.tableid = layout.tableid AND status='OnGoing'
     WHERE type='table' or type='roundtable'`

    const [Tables] = await Database.query<any>(LayoutQuery);

    res.send(Tables)

}));


/**
 * @displayname "Modify Restaurant Layout"
 * @category "Layout"
 * @summary "Allows the user to change the layout of the restaurant, including tables, walls and other components"
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
        'rotation',
        'type',
        'componentid',
        'tableid',
    ], body)


    const [Result] = await Database.execute<any>(InsertQuery, Values);

    res.send({ id: Result?.insertId, tableid: body.tableid })

}));

/**
 * @displayname "Import Layout Component"
 * @category "Layout"
 * @summary "Import a layout component from external source"
 * @path /layout/import
 * @method POST
 * @connected POST/api/layout
 */
Router.post('/layout/import', HandleEndpointFunction(async (req, res) => {


    const body = req.body

    await Database.query('DELETE FROM layout')

    if (req.body && Array.isArray(req.body) && req.body.length > 0) {
        const [InsertQuery, Values] = SQLUtils.BuildInsertQuery('layout', [
            'top',
            'left',
            'width',
            'height',
            'rotation',
            'type',
            'tableid',
        ], body)

        const [Result] = await Database.execute<any>(InsertQuery, Values);
    }

    res.send()

}));


/**
 * @displayname "Update Layout Component"
 * @category "Layout"
 * @summary "Update layout component position and dimensions"
 * @path /layout
 * @method PATCH
 * @connected POST/api/layout
 */
Router.patch('/layout', HandleEndpointFunction(async (req, res) => {
    const body = req.body

    var [SQLQuery, Values] = SQLUtils.BuildUpdateQuery('layout', ['top', 'left', 'width', 'height', 'rotation'], body, ['componentid'])

    const [rows] = await Database.execute(SQLQuery, Values);
    res.send(rows)


}));


/**
 * @displayname "Delete Layout Component"
 * @category "Layout"
 * @summary "Delete a specific layout component or clear all components"
 * @path /layout
 * @method DELETE
 * @connected POST/api/layout
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
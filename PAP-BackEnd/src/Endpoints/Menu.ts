import express from 'express'
import multer from 'multer'
const Router = express.Router();
import { Database, HandleEndpointFunction } from '../Globals'
import SQLUtils from '../Services/SQLUtils';
import path from 'path';



/**
 * @displayname "Menu"
 * @path /menu
 * @method GET
 * @summary "View menu"
 * @unprotected true
 */
Router.get('/menu', HandleEndpointFunction(async (req, res) => {

    const query = req.query

    var SQLQuery = `SELECT menu.*, catg.name as category FROM menu 
    LEFT JOIN  menu_categories catg ON catg.id = menu.category_id
     LEFT JOIN  stock_items stockitem ON stockitem.connected_product_id = menu.id
    `
    const [MenuItems] = await Database.execute(SQLQuery);


    res.send(MenuItems)

}));

/**
 * @displayname "Add Menu Item"
 * @category "Menu"
 * @summary "Create a new item on the menu"
 * @path /menu
 * @method POST
 */
Router.post('/menu',  HandleEndpointFunction(async (req, res) => {


    const body = req.body
    body.active = body.active == 'true' ? 1 : 0
    
    const [InsertQuery, Values] = SQLUtils.BuildInsertQuery('menu', [
        'name', 
        'price', 
        'category_id', 
        'active', 
    ], body)

    const [Result] = await Database.execute(InsertQuery, Values);


    res.send()

}));

/**
 * @displayname "Update Menu Item"
 * @category "Menu"
 * @summary "Change menu item information"
 * @path /menu
 * @method PATCH
 */
Router.patch('/menu', HandleEndpointFunction(async (req, res) => {
    const body = req.body


    var [SQLQuery, Values] = SQLUtils.BuildUpdateQuery('menu', ['active', 'price', 'category'], body, ['id'])


    const [rows] = await Database.execute(SQLQuery, Values);
    res.send(rows)


}));


/**
 * @displayname "Delete Menu Item"
 * @category "Menu"
 * @summary "Delete an item from the menu"
 * @path /menu
 * @method DELETE
 */
Router.delete('/menu', HandleEndpointFunction(async (Request, Response) => {

    const body = Request.body

    var SQLQuery = "DELETE FROM `menu` WHERE name=?"


    const [rows] = await Database.execute(SQLQuery, [body.name]);
    Response.send(rows)


}))


module.exports = Router
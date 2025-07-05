import express from 'express'
const Router = express.Router();
import { Database, HandleEndpointFunction } from '../Globals'


/**
 * @displayname "View Menu Categories"
 * @category "Menu"
 * @path /menu/categories
 * @method GET
 * @summary "View all menu categories"
 * @unprotected true
 */
Router.get('/menu/categories', HandleEndpointFunction(async (req, res) => {
    var SQLQuery = `SELECT * FROM menu_categories`
    const [rows] = await Database.query(SQLQuery);
    res.send(rows)
}))


/**
 * @displayname "Create/Modify Menu Categories"
 * @category "Menu"
 * @summary "Create new menu categories and delete existing ones"
 * @path /menu/categories
 * @method POST
 * @connected POST/api/menu
 */
Router.post('/menu/categories', HandleEndpointFunction(async (req, res) => {

    const body = req.body

    var SQLQuery = `INSERT INTO menu_categories (name) VALUES (?)`;

    const [rows] = await Database.execute(SQLQuery, [body.category]);
    res.send(rows)

}))

/**
 * @displayname "Delete Menu Category"
 * @category "Menu"
 * @summary "Delete a menu category"
 * @path /menu/categories
 * @method DELETE
 * @connected POST/api/menu
 */
Router.delete('/menu/categories', HandleEndpointFunction(async (req, res) => {
    const body = req.body

    var SQLQuery = "DELETE FROM `menu_categories` WHERE id=?"


    const [rows] = await Database.execute(SQLQuery, [body.category_id]);
    res.send(rows)
}))

module.exports = Router
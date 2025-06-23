import express from 'express'
const Router = express.Router();
import { Database, HandleEndpointFunction } from '../Globals'


/**
 * @displayname "Menu Categories"
 * @path /menu/categories
 * @method GET
 * @summary "View categories"
 * @unprotected true
 */
Router.get('/menu/categories', HandleEndpointFunction(async (req, res) => {
    var SQLQuery = `SELECT * FROM menu_categories`
    const [rows] = await Database.query(SQLQuery);
    res.send(rows)
}))


/**
 * @displayname "Add Menu Category"
 * @category "Menu"
 * @summary "Create a new menu category"
 * @path /menu/categories
 * @method POST
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
 */
Router.delete('/menu/categories', HandleEndpointFunction(async (req, res) => {
    const body = req.body

    var SQLQuery = "DELETE FROM `menu_categories` WHERE id=?"


    const [rows] = await Database.execute(SQLQuery, [body.category_id]);
    res.send(rows)
}))

module.exports = Router

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
 * @displayname "Menu Categories"
 * @path /menu/categories
 * @method POST
 */
Router.post('/menu/categories', HandleEndpointFunction(async (req, res) => {

    const body = req.body

    var SQLQuery = `INSERT INTO menu_categories (category) VALUES ('${body.category}')`;

    const [rows] = await Database.query(SQLQuery);
    res.send(rows)

}))

/**
 * @displayname "Menu Categories"
 * @path /menu/categories
 * @method DELETE
 * @summary "Create/Delete categories"
 */
Router.delete('/menu/categories', HandleEndpointFunction(async (req, res) => {
    const body = req.body

    var SQLQuery = "DELETE FROM `menu_categories` WHERE category=?"


    const [rows] = await Database.execute(SQLQuery, [body.category]);
    res.send(rows)
}))

module.exports = Router
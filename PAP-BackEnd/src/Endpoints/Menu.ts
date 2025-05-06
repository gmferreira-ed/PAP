
import express from 'express'
const Router = express.Router();
import { Database, HandleEndpointFunction } from '../Globals'



/**
 * @displayname "Menu"
 * @path /menu
 * @method GET
 * @summary "View menu"
 * @unprotected true
 */
Router.get('/menu', HandleEndpointFunction(async (req, res) => {

    const query = req.query
    const category = query.category

    var SQLQuery = `SELECT * FROM menu`

    if (category) {
        SQLQuery = SQLQuery + ' WHERE `category`="' + category + '"'
    }
    const [rows] = await Database.query(SQLQuery);

    res.send(rows)

}));

/**
 * @displayname "Menu Items"
 * @path /menu
 * @method POST
 * @summary "Create/Delete items on the menu"
 */
Router.post('/menu', HandleEndpointFunction(async (req, res) => {
    const body = req.body

    var SQLQuery = `INSERT INTO menu (\`product\`, \`price\`, \`category\`, \`image_path\`, \`active\`) 
      VALUES ('${body.product}', '${body.price}', '${body.category}', '${body.image_path}', '${1}')`;


    const [rows] = await Database.query(SQLQuery);
    res.send(rows)


}));

/**
 * @displayname "Menu Items"
 * @path /menu
 * @method DELETE
 * @summary "Create/Delete items on the menu"
 */
Router.delete('/menu', HandleEndpointFunction(async (Request, Response) => {

    const body = Request.body

    var SQLQuery = "DELETE FROM `menu` WHERE product=" + `"${body.product}"`


    const [rows] = await Database.query(SQLQuery);
    Response.send(rows)


}))


module.exports = Router
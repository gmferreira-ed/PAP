
import express from 'express'
const Router = express.Router();
import { Database, HandleEndpointFunction } from '../Globals'



// MENU
Router.get('/menu', HandleEndpointFunction(async (req, res) => {

    const query = req.query
    const category = query.category

    var SQLQuery = `SELECT * FROM menu`

    if (category) {
        SQLQuery = SQLQuery + ' WHERE `category`="' + category + '"'
    }
    const [rows] = await Database.promise().query(SQLQuery);

    res.send(rows)

}));


Router.post('/menu', HandleEndpointFunction(async (req, res) => {
    const body = req.body

    var SQLQuery = `INSERT INTO menu (\`product\`, \`price\`, \`category\`, \`image_path\`, \`active\`) 
      VALUES ('${body.product}', '${body.price}', '${body.category}', '${body.image_path}', '${1}')`;


    const [rows] = await Database.promise().query(SQLQuery);
    res.send(rows)


}));

Router.post('/menu/delete', HandleEndpointFunction(async (Request, Response) => {

    const body = Request.body

    var SQLQuery = "DELETE FROM `menu` WHERE product=" + `"${body.product}"`


    const [rows] = await Database.promise().query(SQLQuery);
    Response.send(rows)


}));

module.exports = Router
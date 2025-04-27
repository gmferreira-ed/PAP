
import express from 'express'
const Router = express.Router();
import { Database, HandleEndpointFunction } from '../Globals'



Router.get('/menu/categories', HandleEndpointFunction(async (req, res) => {
    var SQLQuery = `SELECT * FROM menu_categories`
    const [rows] = await Database.promise().query(SQLQuery);
    res.send(rows)
}))



Router.post('/menu/categories', HandleEndpointFunction(async (req, res) => {

    const body = req.body

    var SQLQuery = `INSERT INTO menu_categories (category) VALUES ('${body.category}')`;

    const [rows] = await Database.promise().query(SQLQuery);
    res.send(rows)

}))


Router.delete('/menu/categories', HandleEndpointFunction(async (req, res) => {
    const body = req.body

    var SQLQuery = "DELETE FROM `menu_categories` WHERE category=" + body.category


    const [rows] = await Database.promise().query(SQLQuery);
    res.send(rows)
}))

module.exports = Router
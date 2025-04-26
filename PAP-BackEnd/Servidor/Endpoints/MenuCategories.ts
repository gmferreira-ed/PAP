
import express from 'express'
const Router = express.Router();
import { Database } from '../Globals'

Router.get('/menu/categories', async (req, res) => {
    var SQLQuery = `SELECT * FROM menu_categories`
    const [rows] = await Database.promise().query(SQLQuery);
    res.send(rows)
})


Router.post('/menu/categories', async (req, res) => {

    const body = req.body

    var SQLQuery = `INSERT INTO menu_categories 
      VALUES ('NULL', '${body.category}')`;



    const [rows] = await Database.promise().query(SQLQuery);
    res.send(rows)

})



Router.post('/menu/categories/delete', async (req, res) => {
    const body = req.body

    var SQLQuery = "DELETE FROM `menu_categories` WHERE category=" + body.category


    const [rows] = await Database.promise().query(SQLQuery);
    res.send(rows)
});


module.exports = Router
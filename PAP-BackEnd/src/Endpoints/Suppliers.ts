import express from 'express'
const Router = express.Router();
import { Database, HandleEndpointFunction } from '../Globals'
import SQLUtils from '../Services/SQLUtils'



/**
 * @displayname "View Suppliers"
 * @category "Suppliers"
 * @path /suppliers
 * @method GET
 * @summary "View all stock suppliers and their contact information"
 * @connected GET/api/stock-items
 */
Router.get('/suppliers', HandleEndpointFunction(async (req, res) => {
    const SuppliersQuery = `SELECT * FROM suppliers`
    const [Suppliers] = await Database.execute(SuppliersQuery)
    res.send(Suppliers)
}))

/**
 * @displayname "Create/Modify Suppliers"
 * @category "Stocks"
 * @summary "Create new suppliers and modify existing supplier information"
 * @path /suppliers
 * @method POST
 */
Router.post('/suppliers', HandleEndpointFunction(async (req, res) => {
    const [Query, Values] = SQLUtils.BuildInsertQuery('suppliers', [
        'name', 'email', 'phone', 'address', 'active', 'notes'
    ], req.body)
    const [Result] = await Database.execute(Query, Values)
    res.send()
}))

/**
 * @displayname "Update Supplier"
 * @category "Suppliers"
 * @summary "Update supplier contact information and status"
 * @path /suppliers
 * @method PATCH
 * @connected POST/api/suppliers
 */
Router.patch('/suppliers', HandleEndpointFunction(async (req, res) => {
    const [Query, Values] = SQLUtils.BuildUpdateQuery('suppliers', [
        'name', 'email', 'phone', 'address', 'active', 'notes'
    ], req.body, ['id'])
    const [Result] = await Database.execute(Query, Values)
    res.send()
}))

// /**
//  * @displayname "Delete Supplier"
//  * @category "Suppliers"
//  * @summary "Delete a supplier"
//  * @path /suppliers
//  * @method DELETE
//  */
// Router.delete('/suppliers', HandleEndpointFunction(async (req, res) => {
//     const [Query, Values] = SQLUtils.BuildDeleteQuery('suppliers', req.body, ['id'])
//     const [Result] = await Database.execute(Query, Values)
//     res.send(Result)
// }))

module.exports = Router
import express from 'express'
const Router = express.Router();
import { Database, HandleEndpointFunction } from '../Globals'
import SQLUtils from '../Services/SQLUtils'



/**
 * @displayname "Suppliers"
 * @path /suppliers
 * @method GET
 * @summary "View suppliers"
 * @unprotected true
 */
Router.get('/suppliers', HandleEndpointFunction(async (req, res) => {
    const SuppliersQuery = `SELECT * FROM suppliers`
    const [Suppliers] = await Database.execute(SuppliersQuery)
    res.send(Suppliers)
}))

/**
 * @displayname "Add Supplier"
 * @category "Suppliers"
 * @summary "Add a new supplier"
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
 * @summary "Update supplier information"
 * @path /suppliers
 * @method PATCH
 */
Router.patch('/suppliers', HandleEndpointFunction(async (req, res) => {
    const [Query, Values] = SQLUtils.BuildUpdateQuery('suppliers', [
        'name', 'email', 'phone', 'address', 'active', 'notes'
    ], req.body, ['id'])
    const [Result] = await Database.execute(Query, Values)
    res.send()
}))

/**
 * @displayname "Delete Supplier"
 * @category "Suppliers"
 * @summary "Delete a supplier"
 * @path /suppliers
 * @method DELETE
 */
Router.delete('/suppliers', HandleEndpointFunction(async (req, res) => {
    const [Query, Values] = SQLUtils.BuildDeleteQuery('suppliers', req.body, ['id'])
    const [Result] = await Database.execute(Query, Values)
    res.send(Result)
}))

module.exports = Router
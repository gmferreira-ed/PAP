import express from 'express'
const Router = express.Router();
import { Database, HandleEndpointFunction } from '../Globals'
import SQLUtils from '../Services/SQLUtils'
import { GetStockItems } from '../Services/StocksUtils';

/**
 * @displayname "Stock Items"
 * @path /stock-items
 * @method GET
 * @summary "View stock items"
 * @unprotected true
 */
Router.get('/stock-items', HandleEndpointFunction(async (req, res) => {
    const StockItems = await GetStockItems()
    res.send(StockItems)
}))

/**
 * @displayname "Add Stock Item"
 * @category "Stock"
 * @summary "Add a new stock item"
 * @path /stock-items
 * @method POST
 */
Router.post('/stock-items', HandleEndpointFunction(async (req, res) => {
    const [Query, Values] = SQLUtils.BuildInsertQuery('stock_items', [
        'SKU', 'name', 'quantity_in_stock', 'unit_of_measure', 'purchase_price', 'supplier_id', 'description', 'active'
    ], req.body)
    const [Result] = await Database.execute(Query, Values)
    res.send(Result)
}))

/**
 * @displayname "Update Stock Item"
 * @category "Stock"
 * @summary "Update stock item information"
 * @path /stock-items
 * @method PATCH
 */
Router.patch('/stock-items', HandleEndpointFunction(async (req, res) => {
    const [Query, Values] = SQLUtils.BuildUpdateQuery('stock_items', [
        'SKU', 'name', 'quantity_in_stock', 'unit_of_measure', 'purchase_price', 'supplier_id', 'description', 'active', 'connected_product_id'
    ], req.body, ['id'])

    console.log(Query, Values)
    const [Result] = await Database.execute(Query, Values)
    res.send(Result)
}))

/**
 * @displayname "Delete Stock Item"
 * @category "Stock"
 * @summary "Delete a stock item"
 * @path /stock-items
 * @method DELETE
 */
Router.delete('/stock-items', HandleEndpointFunction(async (req, res) => {
    const [Query, Values] = SQLUtils.BuildDeleteQuery('stock_items', req.body, ['id'])
    const [Result] = await Database.execute(Query, Values)
    res.send(Result)
}))

module.exports = Router

import express from 'express'
const Router = express.Router();
import { Database, HandleEndpointFunction } from '../Globals'
import SQLUtils from '../Services/SQLUtils'

/**
 * @displayname "Purchase Orders"
 * @path /stock-orders
 * @method GET
 * @summary "View purchase orders"
 * @unprotected true
 */
Router.get('/stock-orders', HandleEndpointFunction(async (req, res) => {
    const [Query, Values] = SQLUtils.BuildSelectQuery('purchase_orders', req.query, ['purchase_items.item_id'], undefined, 
        'JOIN purchase_items ON purchase_items.purchase_order_id=purchase_orders.id', 'ORDER BY purchase_orders.order_date ASC')

    const [StockOrders] = await Database.execute(Query, Values)
    res.send(StockOrders)
}))

/**
 * @displayname "Add Purchase Order"
 * @category "Purchase Orders"
 * @summary "Create a new purchase order with items"
 * @path /stock-orders
 * @method POST
 */
Router.post('/stock-orders', HandleEndpointFunction(async (req, res) => {

    // CREATE PURCHASE ORDER
    const body = req.body
    const [OrderQuery, OrderValues] = SQLUtils.BuildInsertQuery('purchase_orders', [
        'supplier_id', 'order_date', 'delivery_date', 'status'
    ], body)

    const [OrderResult]: any = await Database.execute(OrderQuery, OrderValues)
    const PurchaseOrderID = OrderResult.insertId

    // INSERT PURCHASE ORDER ITEMS
    const PurchaseItems = body.items
    PurchaseItems.forEach((Item:any) => {
        Item.purchase_order_id = PurchaseOrderID
    });
    
    const [ItemQuery, ItemValues] = SQLUtils.BuildInsertQuery('purchase_items', [
        'purchase_order_id', 'item_id', 'quantity', 'cost'
    ], PurchaseItems)
    const ItemsInsertResult = await Database.execute(ItemQuery, ItemValues)

    res.send()
}))

/**
 * @displayname "Update Purchase Order"
 * @category "Purchase Orders"
 * @summary "Update purchase order information"
 * @path /stock-orders
 * @method PATCH
 */
Router.patch('/stock-orders', HandleEndpointFunction(async (req, res) => {
    const [Query, Values] = SQLUtils.BuildUpdateQuery('purchase_orders', [
        'delivery_date', 'status'
    ], req.body, ['id'])
    const [Result] = await Database.execute(Query, Values)
    res.send(Result)
}))


/**
 * @displayname "Update Purchase Item"
 * @category "Purchase Orders"
 * @summary "Update purchase order item"
 * @path /purchase-items
 * @method PATCH
 */
Router.patch('/purchase-items', HandleEndpointFunction(async (req, res) => {
    const [Query, Values] = SQLUtils.BuildUpdateQuery('purchase_items', [
        'item_id', 'quantity', 'cost'
    ], req.body, ['id'])
    const [Result] = await Database.execute(Query, Values)
    res.send(Result)
}))

/**
 * @displayname "Delete Purchase Item"
 * @category "Purchase Orders"
 * @summary "Delete a purchase order item"
 * @path /purchase-items
 * @method DELETE
 */
Router.delete('/purchase-items', HandleEndpointFunction(async (req, res) => {
    const [Query, Values] = SQLUtils.BuildDeleteQuery('purchase_items', req.body, ['id'])
    const [Result] = await Database.execute(Query, Values)
    res.send(Result)
}))

module.exports = Router

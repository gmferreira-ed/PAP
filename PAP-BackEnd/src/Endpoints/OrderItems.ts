
import express, { response } from 'express'
import multer from 'multer'
const Router = express.Router();
import { Database, HandleEndpointFunction, OrdersWebsocket } from '../Globals'
import SQLUtils from '../Services/SQLUtils';
import path from 'path';
import PermissionsService from '../Services/PermissionsService';
import { ResultSetHeader } from 'mysql2';


/**
 * @displayname "Create/Modify Order Items"
 * @category "Order Items"
 * @path /orders/items
 * @method POST
 * @summary "Add items to orders and modify order item quantities"
 * @connected POST/api/orders
 */
Router.post('/orders/items', HandleEndpointFunction(async (req, res) => {


    const body = req.body
    const order_id = body.order_id
    const product_id = body.product_id
    const quantity = body.quantity || 1

    const InsertQuery = `INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)`;
    const [InsertResult] = await Database.execute(InsertQuery, [order_id, product_id, quantity]);

    OrdersWebsocket.SendGlobalMessage('insert-item', { order_id: order_id, product_id: product_id })

    res.send()
}));

/**
 * @displayname "Update Order Item"
 * @category "Order Items"
 * @path /orders/items
 * @method PATCH
 * @summary "Modify quantity of items in an order"
 * @connected POST/api/orders
 */
Router.patch('/orders/items', HandleEndpointFunction(async (req, res) => {
    const body = req.body
    const order_id = body.order_id
    const product_id = body.product_id
    const quantity = Number(body.quantity)


    const UpdateQuery = `UPDATE order_items SET quantity = ? WHERE order_id = ? AND product_id = ?`;
    const [UpdateResult] = await Database.execute(UpdateQuery, [quantity, order_id, product_id])

    OrdersWebsocket.SendGlobalMessage('update-item', { order_id: order_id, product_id: product_id, quantity: quantity })
    res.send()
}));


/**
 * @displayname "Delete Order Item"
 * @category "Order Items"
 * @path /orders/items
 * @method DELETE
 * @summary "Remove items from an order"
 * @connected POST/api/orders
 */
Router.delete('/orders/items', HandleEndpointFunction(async (req, res) => {


    const body = req.body
    const order_id = body.order_id
    const product_id = body.product_id

    const DeleteQuery = `DELETE FROM order_items WHERE order_id=? AND product_id=?`
    const [DeleteResult] = await Database.execute(DeleteQuery, [order_id, product_id])

    OrdersWebsocket.SendGlobalMessage('delete-item', { order_id: order_id, product_id: product_id })
    res.send()
}));


module.exports = Router
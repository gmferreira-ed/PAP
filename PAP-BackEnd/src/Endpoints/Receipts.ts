import express, { response } from 'express'
const Router = express.Router();
import { Database, GetPaginatedResult, HandleEndpointFunction, OrdersWebsocket } from '../Globals'
import SQLUtils from '../Services/SQLUtils';

// Modified version of orders, used for receipt logs instead

/**
 * @displayname "Receipts"
 * @path /receipts
 * @method GET
 * @summary "View orders"
 */
Router.get('/receipts', HandleEndpointFunction(async (req, res) => {

    const QueryParams = req.query

    const OrdersQuery = `SELECT * FROM orders `

    const Data = await GetPaginatedResult('orders', OrdersQuery, [], QueryParams, 100, 'ORDER BY created_at DESC')


    res.send(Data)

}))

/**
 * @displayname "Receipts"
 * @path /receipts/id
 * @method GET
 * @summary "View orders"
 */
Router.get('/receipts/id', HandleEndpointFunction(async (req, res) => {

    const ReceiptID = req.query.id

    const OrderInfoQuery = `SELECT 
    orders.*, 
    item.*, 
    orders.order_id as id, 
    menu_item.name,
    menu_item.price,
    user.username

    FROM orders
    LEFT JOIN order_items item ON item.order_id = orders.order_id
    LEFT JOIN menu menu_item ON menu_item.id = item.product_id
    LEFT JOIN users user ON user.userid = orders.created_by
    WHERE  orders.order_id = ?`

    const [OrderItems] = await Database.execute(OrderInfoQuery, [ReceiptID]) as any[]

    const OrderData = OrderItems[0]
    if (OrderData) {
        console.log(OrderData)
        const Order = {
            id: OrderData.id,
            order_id: OrderData.order_id,
            tableid: OrderData.tableid,
            
            TIN: OrderData.TIN,
            total_price: OrderData.total_price,
            amount_paid: OrderData.amount_paid,
            payment_method: OrderData.payment_method,
            discount: OrderData.discount,
            
            created_at: OrderData.created_at,
            created_by: OrderData.created_by,
            checked_out_at: OrderData.checked_out_at,
            username: OrderData.username,
            status: OrderData.status,

            items: [] as any[]
        }
        for (const OrderItem of OrderItems) {
            Order.items.push({
                product_id: OrderItem.product_id,
                name: OrderItem.name,
                price: OrderItem.price,
                quantity: OrderItem.quantity,
            })
        }

        res.send(Order)

    } else {
        res.status(404).send({ error: 'Not found' })
    }
}))


module.exports = Router
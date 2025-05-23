
import express, { response } from 'express'
import multer from 'multer'
const Router = express.Router();
import { Database, HandleEndpointFunction } from '../Globals'
import SQLUtils from '../Services/SQLUtils';
import path from 'path';
import PermissionsService from '../Services/PermissionsService';
import { ResultSetHeader } from 'mysql2';



/**
 * @displayname "Orders"
 * @path /orders
 * @method GET
 * @summary "View orders"
 */
Router.get('/orders', HandleEndpointFunction(async (req, res) => {

    const query = req.query

    const [OrdersQuery, Values] = SQLUtils.BuildSelectQuery('orders', query, ['status', 'tableid'])


    const [Orders] = await Database.execute<any>(OrdersQuery, Values);

    if (Orders && !query.ignore_products) {
        const orderIds: any[] = Orders.map((Order: any) => Order.order_id);
        if (orderIds.length > 0) {
            const ProductsQuery = `SELECT * FROM order_items 
            JOIN menu ON order_items.product_id = menu.id  
            WHERE order_id IN (${orderIds.join(', ')})`;
            const [Products] = await Database.execute<any[]>(ProductsQuery, orderIds);

            const ProductsByOrder: Record<number, any[]> = {};
            for (const product of Products) {
                if (!ProductsByOrder[product.order_id]) {
                    ProductsByOrder[product.order_id] = [];
                }
                ProductsByOrder[product.order_id].push(product);
            }

            for (const order of Orders) {
                order.products = ProductsByOrder[order.order_id] || [];
            }
        }
    }

    res.send(Orders)

}))


async function CheckoutOrder(OrderID: number) {

    const ProductsQuery = `SELECT * FROM order_items
     JOIN menu ON order_items.product_id = menu.id
      WHERE order_id=${OrderID}`

    const [OrderProducts] = await Database.query<any[]>(ProductsQuery)


    var TotalPrice = 0
    for (const product of OrderProducts) {
        TotalPrice += product.price
    }

    const [CheckoutQuery, Values] = SQLUtils.BuildUpdateQuery('orders', [
        'total_price',
        'userid'
    ], {
        total_price: TotalPrice,
        order_id: OrderID
    }, ['order_id'])
    const [CheckoutResult] = await Database.execute(CheckoutQuery, Values)

}


async function CreateOrder(TableID: number, User?: User) {

    const [OrderInsertQuery, Values] = SQLUtils.BuildInsertQuery('orders', [
        'tableid',
        'userid'
    ], {
        tableid: TableID,
        userid: User?.userid
    })

    const [OrderInsertResult] = await Database.execute(OrderInsertQuery, Values) as ResultSetHeader[]
    return OrderInsertResult.insertId
}



/**
 * @displayname "Orders"
 * @path /orders
 * @method POST
 * @summary "Create/Cancel orders"
 */
Router.post('/orders', HandleEndpointFunction(async (req, res) => {


    const body = req.body
    const tableid = body.tableid

    const OrderID = await CreateOrder(tableid)

    res.send({ order_id: OrderID })
}));



/**
 * @displayname "Orders"
 * @path /orders
 * @method PATCH
 * @summary "Modify order details"
 */
Router.patch('/orders', HandleEndpointFunction(async (req, res) => {
}));


/**
 * @displayname "Orders"
 * @path /orders
 * @method DELETE
 * @summary "Create/Cancel orders"
 */
Router.delete('/orders', HandleEndpointFunction(async (req, res) => {


    const body = req.body

    const SelectQuery = `SELECT * FROM order_items WHERE order_id=?`
    const [OrderProducts] = await Database.execute<any[]>(SelectQuery, [body.order_id])

    var Deleted = false

    if (OrderProducts?.length > 0) {
        const UpdateQuery = `UPDATE orders SET status='cancelled' WHERE order_id=?`
        const [UpdateResult] = await Database.execute(UpdateQuery, [body.order_id])
    }else{
        Deleted = true
        const DeleteQuery = `DELETE FROM orders WHERE order_id=?`
        const [DeleteResult] = await Database.execute(DeleteQuery, [body.order_id])
    }


    res.send({deleted:Deleted})
}));

/**
 * @displayname "Checkout Orders"
 * @path /checkout
 * @method POST
 * @summary "Checkout orders"
 */
Router.post('/checkout', HandleEndpointFunction(async (req, res) => {


    const body = req.body
    const order_id = body.tableid

    const CheckoutResult = await CheckoutOrder(body.products)

    res.send({ result: CheckoutResult })
}));



module.exports = Router

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

    const Values: any[] = []

    var OrdersQuery = `SELECT * FROM orders`

    const [Orders] = await Database.execute<any>(OrdersQuery, Values);

    res.send(Orders)

}));


async function CreateOrder(ClientSelectedProducts: any[], NIF?: number, User?: User) {


    let UserId = undefined
    if (User) {
        const UserData = await PermissionsService.GetUserData(User)
        UserId = UserData.userid
    }


    // Fetch server product data, avoid altering

    const QuantityMap = new Map<number, number>();
    for (const product of ClientSelectedProducts) {
        const id = Number(product.id);
        const amount = Number(product.amount) || 0;

        if (amount > 0) {
            QuantityMap.set(id, amount)
        }
    }

    const ProductsQuery = `SELECT name, price, id as product_id FROM menu WHERE id IN (${[...QuantityMap.keys()].join(',')});`
    const [ProductsData] = await Database.query<any[]>(ProductsQuery)



    var TotalPrice = 0
    for (const Product of ProductsData) {
        const quantity = QuantityMap.get(Product.product_id)!
        Product.quantity = quantity
        TotalPrice += Product.price * quantity
    }


    const [OrderQuery, Values] = SQLUtils.BuildInsertQuery('orders', [
        'NIF',
        'total_price',
        'userid',
    ], {nif:NIF, total_price:TotalPrice, userid:UserId})

    const [OrderInfo] = await Database.execute<ResultSetHeader>(OrderQuery, Values)


    const OrderID = OrderInfo.insertId
    for (const product of ProductsData) {
        product.order_id = OrderID;
    }

    const [OrderItemsQuery, OrderItems] = SQLUtils.BuildInsertQuery('order_items', [
        'product_id',
        'order_id',
        'quantity',
    ], ProductsData)
    const [Result] = await Database.execute<ResultSetHeader>(OrderItemsQuery, OrderItems)

    return Result
}



/**
 * @displayname "Orders"
 * @path /orders
 * @method POST
 * @summary "Create orders"
 */
Router.post('/orders', HandleEndpointFunction(async (req, res) => {


    const body = req.body

    const CheckoutResult = await CreateOrder(body.products)

    res.send()
}));


module.exports = Router
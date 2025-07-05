
import express, { response } from 'express'
import multer from 'multer'
const Router = express.Router();
import { Database, HandleEndpointFunction, OrdersWebsocket } from '../Globals'
import SQLUtils from '../Services/SQLUtils';
import path from 'path';
import PermissionsService from '../Services/PermissionsService';
import { ResultSetHeader } from 'mysql2';



/**
 * @displayname "View Orders"
 * @category "Orders"
 * @path /orders
 * @method GET
 * @summary "View all orders with optional filtering by status and table"
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





async function CreateOrder(TableID: number, UserID?: number) {

    const [OrderInsertQuery, Values] = SQLUtils.BuildInsertQuery('orders', [
        'tableid',
        'created_by'
    ], {
        tableid: TableID,
        created_by: UserID
    })

    const [OrderInsertResult] = await Database.execute(OrderInsertQuery, Values) as ResultSetHeader[]
    return OrderInsertResult.insertId
}



/**
 * @displayname "Create/Modify Orders"
 * @category "Orders"
 * @path /orders
 * @method POST
 * @summary "Create a new order and modify order details"
 */
Router.post('/orders', HandleEndpointFunction(async (req, res) => {


    const body = req.body
    const tableid = body.tableid

    const OrderID = await CreateOrder(tableid, req.session.userid)

    res.send({ order_id: OrderID })
}));





/**
 * @displayname "Cancel Order"
 * @category "Orders"
 * @path /orders
 * @method DELETE
 * @summary "Cancel or delete an order"
 * @connected POST/api/orders
 */
Router.delete('/orders', HandleEndpointFunction(async (req, res) => {


    const body = req.body
    const order_id = body.order_id

    const SelectQuery = `SELECT * FROM order_items WHERE order_id=?`
    const [OrderProducts] = await Database.execute<any[]>(SelectQuery, [body.order_id])

    var Deleted = false

    if (OrderProducts?.length > 0) {
        const UpdateQuery = `UPDATE orders SET status='Cancelled' WHERE order_id=?`
        const [UpdateResult] = await Database.execute(UpdateQuery, [body.order_id])
    } else {
        Deleted = true
        const DeleteQuery = `DELETE FROM orders WHERE order_id=?`
        const [DeleteResult] = await Database.execute(DeleteQuery, [body.order_id])
    }

    OrdersWebsocket.SendGlobalMessage('update', { order_id: order_id })


    res.send({ deleted: Deleted })
}));

function AddCheckOutTimestamp(Query: string): string {
    const whereIndex = Query.toUpperCase().indexOf(' WHERE ');
    const beforeWhere = Query.slice(0, whereIndex).trim();
    const afterWhere = Query.slice(whereIndex);

    let newBeforeWhere = beforeWhere;

    if (!beforeWhere.endsWith(',')) {
        newBeforeWhere += ',';
    }
    newBeforeWhere += ' checked_out_at = NOW()';

    return `${newBeforeWhere} ${afterWhere}`;
}

async function CheckoutOrder(Body: any) {

    const OrderID = Body.order_id


    // Update static order products cost
    const OrderItemsUpdateQuery = `UPDATE order_items order_item
    JOIN menu product ON order_item.product_id = product.id
    SET order_item.cost = order_item.quantity * product.price
    WHERE order_item.order_id=?`

    const [ItemsUpdateResult] = await Database.execute<any[]>(OrderItemsUpdateQuery, [OrderID])


    // Calculate the total price
    const ProductsQuery = `SELECT * FROM order_items
     JOIN menu ON order_items.product_id = menu.id
      WHERE order_id=?`

    const [OrderProducts] = await Database.execute<any[]>(ProductsQuery, [OrderID])

    var TotalPrice = 0
    for (const product of OrderProducts) {
        TotalPrice += product.price * product.quantity
    }


    // Update empty fields with checkout data
    const TIN = Number(Body.TIN)

    let [CheckoutQuery, Values] = SQLUtils.BuildUpdateQuery('orders', [
        'total_price',
        'TIN',
        'discount',
        'amount_paid',
        'payment_method',

        'checked_out_at',
        'status',
    ], {
        total_price: TotalPrice,
        TIN: TIN,
        discount: Body.discount,
        amount_paid: Body.amount_paid || TotalPrice,
        payment_method: Body.payment_method,

        status: 'Finished',

        order_id: OrderID,
    }, ['order_id'])


    CheckoutQuery = AddCheckOutTimestamp(CheckoutQuery)
    CheckoutQuery += " AND status='OnGoing'"

    const [CheckoutResult] = await Database.execute(CheckoutQuery, Values)


    return CheckoutResult as any
}


/**
 * @displayname "Checkout Order"
 * @category "Orders"
 * @path /checkout
 * @method POST
 * @summary "Process order checkout with payment and finalize order"
 * @connected POST/api/orders
 */
Router.post('/checkout', HandleEndpointFunction(async (req, res) => {


    const body = req.body

    const CheckoutResult = await CheckoutOrder(body)

    if (CheckoutResult.affectedRows > 0) {
        OrdersWebsocket.SendGlobalMessage('update', { order_id: body.order_id })
        res.send({ result: CheckoutResult })
    } else {
        res.status(401).send({ error: 'This order was already closed' })
    }

}));

/**
 * @displayname "View Revenue"
 * @category "Orders"
 * @path /revenue-categorized
 * @method GET
 * @summary "View revenue statistics categorized by menu categories"
 */
Router.get('/revenue-categorized', HandleEndpointFunction(async (req, res) => {
const Query = `
WITH ranked_sales AS (
    SELECT
        category.id AS category_id,
        category.name AS category_name,
        product.name AS product_name,
        SUM(purchased_item.quantity) AS total_quantity_sold,
        SUM(purchased_item.quantity * product.price) AS total_revenue,
        ROW_NUMBER() OVER (
            PARTITION BY category.id
            ORDER BY SUM(purchased_item.quantity) DESC
        ) AS rnk
    FROM order_items purchased_item
    LEFT JOIN menu product ON purchased_item.product_id = product.id
    LEFT JOIN menu_categories category ON product.category_id = category.id
    JOIN orders orde ON orde.order_id = purchased_item.order_id
    WHERE orde.created_at >= ? AND orde.created_at <= ?
    GROUP BY category.id, category.name, product.id, product.name
),
total_revenue_all AS (
    SELECT
        SUM(purchased_item.quantity * product.price) AS total_revenue_all_products
    FROM order_items purchased_item
    LEFT JOIN menu product ON purchased_item.product_id = product.id
    JOIN orders orde ON orde.order_id = purchased_item.order_id
    WHERE orde.created_at >= ? AND orde.created_at <= ?
)
SELECT
    rs.category_id,
    rs.category_name AS category,
    rs.product_name,
    rs.total_quantity_sold,
    rs.total_revenue,
    tra.total_revenue_all_products
FROM ranked_sales rs
CROSS JOIN total_revenue_all tra
WHERE rs.rnk = 1
ORDER BY 
    (rs.category_id IS NULL),
    rs.category_id;
`;


    const StartDate = req.query.StartDate
    const EndDate = req.query.EndDate
    

    const [CategoriesRevenue] = await Database.execute(Query, [StartDate, EndDate, StartDate, EndDate])
    res.send(CategoriesRevenue)
}))



module.exports = Router
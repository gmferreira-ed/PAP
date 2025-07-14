import express from 'express'
const Router = express.Router();
import { Database, HandleEndpointFunction } from '../Globals'
import SQLUtils from '../Services/SQLUtils'
import { QueryResult } from 'mysql2';
import { ModifyStocksQuantity } from '../Services/StocksUtils';
import { StockOrder } from '../../../PAP-FrontEnd/src/shared/stock-order';


async function GetStockOrders(Fields: {}): Promise<StockOrder[]> {
    const [Query, Values] = SQLUtils.BuildSelectQuery('purchase_orders', Fields,
        ['purchase_orders.id', 'purchase_items.item_id'],

        [
            'purchase_orders.*',
            'purchase_items.purchase_order_id, purchase_items.item_id, purchase_items.quantity, purchase_items.cost',
            'users.username AS username',
            'suppliers.name as supplier_name',
            'suppliers.phone as supplier_phone',
            'suppliers.email as supplier_email',
            'suppliers.address as supplier_address',
            'suppliers.notes as supplier_notes'
        ],
        `JOIN purchase_items ON purchase_items.purchase_order_id=purchase_orders.id
        LEFT JOIN users ON users.userid=purchase_orders.userid
        LEFT JOIN suppliers ON suppliers.id=purchase_orders.supplier_id 
        `, 'ORDER BY purchase_orders.order_date DESC')

    const [StockOrders] = await Database.execute(Query, Values) as any[]

    const StockOrdersMap = new Map()

    for (const row of StockOrders) {
        const OrderID = row.purchase_order_id

        // Build Stock Order
        if (!StockOrdersMap.has(OrderID)) {
            StockOrdersMap.set(OrderID, {
                id: row.id,
                order_date: row.order_date,
                delivery_date: row.delivery_date,

                cost: 0, // Total cost
                quantity: 0, // Total quantity

                status: row.status,
                total: row.total,
                notes: row.notes,

                username: row.username,
                supplier: {
                    name: row.supplier_name,
                    phone: row.supplier_phone,
                    email: row.supplier_email,
                    address: row.supplier_address,
                    notes: row.supplier_notes
                },
                items: []
            })
        }

        // Push purchased stock items
        StockOrdersMap.get(OrderID).cost += row.cost // item cost
        StockOrdersMap.get(OrderID).quantity += row.quantity // item cost
        StockOrdersMap.get(OrderID).items.push({
            item_id: row.item_id,
            quantity: row.quantity,
            cost: row.cost,
        })
    }

    const FormattedStockOrders = Array.from(StockOrdersMap.values())


    return FormattedStockOrders as StockOrder[]
}


/**
 * @displayname "View Stock Orders"
 * @category "Stocks"
 * @path /stock-orders
 * @method GET
 * @summary "View all stock orders with supplier and item details"
 */
Router.get('/stock-orders', HandleEndpointFunction(async (req, res) => {

    const StockOrders = await GetStockOrders(req.query)

    res.send(StockOrders)
}))

/**
 * @displayname "Create/Modify Stock Orders"
 * @category "Stocks"
 * @summary "Create new stock orders and modify existing ones"
 * @path /stock-orders
 * @method POST
 */
Router.post('/stock-orders', HandleEndpointFunction(async (req, res) => {

    // CREATE PURCHASE ORDER
    const body = req.body
    body.userid = req.session.userid

    const [OrderQuery, OrderValues] = SQLUtils.BuildInsertQuery('purchase_orders', [
        'supplier_id', 'order_date', 'delivery_date', 'status', 'userid'
    ], body)

    const [OrderResult]: any = await Database.execute(OrderQuery, OrderValues)
    const PurchaseOrderID = OrderResult.insertId

    // INSERT PURCHASE ORDER ITEMS
    const PurchaseItems = body.items
    PurchaseItems.forEach((Item: any) => {
        Item.purchase_order_id = PurchaseOrderID
    });

    const [ItemQuery, ItemValues] = SQLUtils.BuildInsertQuery('purchase_items', [
        'purchase_order_id', 'item_id', 'quantity', 'cost'
    ], PurchaseItems)
    const ItemsInsertResult = await Database.execute(ItemQuery, ItemValues)

    res.send()
}))

/**
 * @displayname "Update Stock Order"
 * @category "Stock Orders"
 * @summary "Update stock order status and process received items"
 * @path /stock-orders
 * @method PATCH
 * @connected POST/api/stock-orders
 */
Router.patch('/stock-orders', HandleEndpointFunction(async (req, res) => {
    const OrderID = req.body.id
    const Status = req.body.status

    if (Status == 'Received' || Status == 'Cancelled') {


        const StockOrders = await GetStockOrders({ id: req.body.id })
        const OrderInfo = StockOrders[0]

        console.log(StockOrders, OrderInfo)

        if (!OrderInfo) {
            res.status(502).send({ error: 'Order not found' })
            return
        }


        const Query = `UPDATE purchase_orders SET status=?, delivery_date=CURRENT_TIMESTAMP() WHERE id=? AND status='Pending'`
        const [Result] = await Database.execute<any>(Query, [Status, OrderID])

        if (Status == 'Received') {

            const ItemReportsMap: ItemReport[] = []
            for (const PurchasedItem of OrderInfo.items) {
                ItemReportsMap.push({
                    item_id: PurchasedItem.item_id,
                    action: 'ADD',
                    amount: PurchasedItem.quantity,
                })
            }
            ModifyStocksQuantity(ItemReportsMap)
        }

        if (Result.affectedRows >= 1) {
            res.send(Result)
        } else {
            res.status(401).send({ error: 'This order status has already been set' })
        }

    } else {
        res.status(401).send({ error: 'Unauthorized' })
    }
}))



module.exports = Router

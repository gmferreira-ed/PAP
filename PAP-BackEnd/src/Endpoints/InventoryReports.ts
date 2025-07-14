import express from 'express'
const Router = express.Router();
import { Database, HandleEndpointFunction } from '../Globals'
import SQLUtils from '../Services/SQLUtils'
import { QueryResult } from 'mysql2';
import { ModifyStocksQuantity } from '../Services/StocksUtils';


/**
 * @displayname "View Inventory Reports"
 * @category "Stocks"
 * @summary "View all inventory reports with item details and user information"
 * @path /inventory-reports
 * @method GET
 */
Router.get('/inventory-reports', HandleEndpointFunction(async (req, res) => {

    const Query = `SELECT 
    report.*, 
    item.*, 
    stock_item.name, 
    stock_item.unit_of_measure AS unit, 
    user.username AS username,
    menu.name AS product_name
    
    FROM inventory_reports report
    LEFT JOIN inventory_report_items item ON item.report_id = report.id
    LEFT JOIN users user ON user.userid = report.created_by
    LEFT JOIN stock_items stock_item ON stock_item.id = item.item_id
    LEFT JOIN menu ON menu.id = stock_item.connected_product_id
    ORDER BY report.created_at DESC`

    const [InventoryReports] = await Database.execute(Query) as any[]

    const InventoryReportsMap = new Map()

    for (const row of InventoryReports) {
        const ReportID = row.id

        // Build Stock Order
        if (!InventoryReportsMap.has(ReportID)) {
            InventoryReportsMap.set(ReportID, {
                id: row.id,
                created_at: row.created_at,
                created_by: row.created_by,
                username: row.username,
                items: []
            })
        }

        // Push purchased stock items
        InventoryReportsMap.get(ReportID).items.push({
            item_id: row.item_id,
            action: row.action,
            amount: row.amount,
            name: row.name,
            unit: row.unit,
            new_amount: row.new_amount,
            old_amount: row.old_amount,
        })
    }

    const FormattedInventoryReports = Array.from(InventoryReportsMap.values())

    res.send(FormattedInventoryReports)
}))

/**
 * @displayname "Create Inventory Report"
 * @category "Stocks"
 * @summary "Create an inventory report and modify stock item quantities"
 * @path /inventory-reports
 * @method POST
 */
Router.post('/inventory-reports', HandleEndpointFunction(async (req, res) => {


    const body = req.body

    const Sucess = await ModifyStocksQuantity(req)
    if (Sucess) {
        res.send()
    } else {
        res.status(502).send({ error: 'Internal Server Error' })
    }

}))



module.exports = Router

import { StockItem } from "../../../PAP-FrontEnd/src/shared/stock-item"
import { Database } from "../Globals"
import SQLUtils from "./SQLUtils"

async function GetStockItems(): Promise<StockItem[]> {
    const StockItemsQuery = `SELECT stock_items.*, 
        menu.name AS product_name,
        menu.price AS selling_price,
        category.name AS product_category
    
        FROM stock_items
        LEFT JOIN menu ON menu.id = stock_items.connected_product_id
        LEFT JOIN menu_categories category ON menu.category_id = category.id`
    const [Rows] = await Database.execute(StockItemsQuery)
    return Rows as StockItem[]
}




async function ModifyStocksQuantity(Request: ExpressRequest | ItemReport[]) {

    let Items: ItemReport[]
    let UserId

    if (Array.isArray(Request)) {
        Items = Request
    } else {
        Items = Request.body.items
        UserId = Request.session.userid
    }

    let WhenClause = ''
    let IDPlaceholders = []

    const Values: any[] = []

    for (const ItemReport of Items) {
        let ActionString = ''
        if (ItemReport.action == 'ADD')
            ActionString = 'quantity_in_stock + '
        else if (ItemReport.action == 'REMOVE')
            ActionString = 'quantity_in_stock - '
        else if (ItemReport.action == 'SET')
            ActionString = ''

        IDPlaceholders.push('?')
        Values.push(ItemReport.item_id, ItemReport.amount)
        WhenClause += `WHEN ? THEN ${ActionString} ? \n`
    }

    // Re-do loop for id order
    for (const ItemReport of Items) {
        Values.push(ItemReport.item_id)
    }

    // Pre-update stock items
    const OldStockItems = await GetStockItems()
    const OldStockItemsMap = new Map<number, StockItem>()
    OldStockItems.forEach(StockItem => {
        OldStockItemsMap.set(StockItem.id, StockItem)
    });

    // UPDATE STOCK ITEMS 
    const StocksUpdateQuery = `UPDATE stock_items
    SET quantity_in_stock = CASE id
        ${WhenClause}
        ELSE quantity_in_stock
    END
    WHERE id IN (${IDPlaceholders.join(',')})`

    try {
        const [UpdateResult] = await Database.execute(StocksUpdateQuery, Values)
    } catch (Error) {
        console.log(Error)
        return false
    }

    // Pos-Update Stock Items
    const NewStockItems = await GetStockItems()
    const NewStockItemsMap = new Map<number, StockItem>()
    NewStockItems.forEach(StockItem => {
        NewStockItemsMap.set(StockItem.id, StockItem)
    });

    // LOG REPORT
    if (UserId) {
        const LogQuery = `INSERT INTO inventory_reports (created_by) VALUES (?)`

        try {
            const [ReportLogResult]: any = await Database.execute(LogQuery, [UserId])
            const ReportID = ReportLogResult.insertId

            for (const ItemReport of Items) {
                ItemReport.report_id = ReportID
                const OldStockItem = OldStockItemsMap.get(ItemReport.item_id)
                const NewStockItem = NewStockItemsMap.get(ItemReport.item_id)
                ItemReport.old_amount = OldStockItem?.quantity_in_stock
                ItemReport.new_amount = NewStockItem?.quantity_in_stock
            }

            const [ReportItemsQuery, ItemValues] = SQLUtils.BuildInsertQuery('inventory_report_items', [
                'report_id', 'item_id', 'action', 'amount', 'old_amount', 'new_amount'
            ], Items)


            try {
                const [ReportItemsLogResult]: any = await Database.execute(ReportItemsQuery, ItemValues)
                return true
            } catch (Error) {
                console.log(Error)
                return false
            }

        } catch (Error) {
            console.log(Error)
            return false
        }
    }
}

export { ModifyStocksQuantity, GetStockItems }
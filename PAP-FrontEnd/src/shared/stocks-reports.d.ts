type ItemReport = {
    action: 'ADD' | 'SET' | 'REMOVE'
    item_id: number
    amount: number
    
    // Pos-Database
    name?:string
    product_name?:string
    old_amount?:number
    new_amount?:number
    unit?:string
    report_id?:number
}

type InventoryReport = {
    id:number
    created_at:any
    username:string
    items: ItemReport[]
}
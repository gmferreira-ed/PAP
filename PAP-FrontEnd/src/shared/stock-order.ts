import { Supplier } from "../types/supplier"


export interface StockOrder {
    id: number
    supplier_id: number
    order_date: string
    delivery_date: string
    status: string

    
    purchase_order_id?: number
    quantity: number
    cost: number
    username:string

    supplier:Supplier
    items:StockOrderItem[]
    
    [key:string]:any
}

export interface StockOrderItem {
    item_id: number
    quantity: number
    cost: number
    
    [key:string]:any
}

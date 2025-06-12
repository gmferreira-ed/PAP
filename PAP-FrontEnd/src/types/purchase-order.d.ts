export interface StockOrder {
    id: number;
    supplier_id: number;
    order_date: string;
    delivery_date: string;
    status: string;

    
    purchase_order_id?: number;
    item_id: number;
    quantity: number;
    cost: number;
    
    [key:string]:any
}

export interface StockOrderItem {
    id?: number;
    purchase_order_id?: number;
    item_id: number;
    quantity: number;
    cost: number;
    
    [key:string]:any
}

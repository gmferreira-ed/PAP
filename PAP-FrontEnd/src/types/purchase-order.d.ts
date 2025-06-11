export interface PurchaseOrder {
    id: number;
    supplier_id: number;
    order_date: string;
    delivery_date: string;
    status: string;
}

export interface PurchaseItem {
    id: number;
    purchase_order_id: number;
    item_id: number;
    quantity: number;
    cost: number;
}

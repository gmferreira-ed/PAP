export interface StockItem {
    id: number;
    SKU: string;
    name: string;
    quantity_in_stock: number;
    unit_of_measure: string;
    purchase_price: number;
    supplier_id: number;
    description: string;
    active: boolean;
    created_at: string;
}

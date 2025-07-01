import { ApexChartOptions } from "../types/apex-chart";
import { StockOrder, StockOrderItem } from "./stock-order";

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
    
    product_name?:string
    product_category?:string
    selling_price?:number
    
    // Optional chart data. Caches
    Orders:StockOrder[]
    ExpensesChartOptions?:ApexChartOptions
    QuantityChartOptions?:ApexChartOptions

    [key:string]:any
}

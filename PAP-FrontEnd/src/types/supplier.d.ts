export interface Supplier {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    active: boolean;
    notes: string;

    TogglingActive?:any
}

type ReceiptData = {
  items: any[]
  order_id: any
  payment_method: string | null | undefined
  amount_paid: string | null | undefined
  TIN: string | null | undefined

  created_at?: string
  checked_out_at?: string
  discount?:number
  total?:number
}
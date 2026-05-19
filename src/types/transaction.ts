import type { Customer } from './customer'

export interface TransactionItem {
    id: number
    transaction_id: number
    product_id: number
    product_name: string
    price: number
    quantity: number
    subtotal: number
}

export interface Transaction {
    id: number
    code: string
    customer_id: number
    subtotal: number
    tax: number
    total: number
    created_at: string
    customer?: Customer | null
    items?: TransactionItem[]
}

import { InMemoryRepository } from '@/shared/api/inMemoryRepository'
import {
  initialSalesOrders,
  initialSalesOrderItems,
  initialDeliveryNotes,
  initialDeliveryNoteItems,
  initialSalesInvoices,
  initialSalesPayments,
} from '@/shared/api/seed/seedPenjualan'
import type {
  SalesOrder,
  SalesOrderItem,
  DeliveryNote,
  DeliveryNoteItem,
  SalesInvoice,
  SalesPayment,
} from '@/shared/types/entity'

export const soRepo = new InMemoryRepository<SalesOrder>(
  initialSalesOrders,
  'website_customer_sales_orders'
)

export const soItemRepo = new InMemoryRepository<SalesOrderItem>(
  initialSalesOrderItems,
  'website_customer_sales_order_items'
)

export const dnRepo = new InMemoryRepository<DeliveryNote>(
  initialDeliveryNotes,
  'website_customer_delivery_notes'
)

export const dnItemRepo = new InMemoryRepository<DeliveryNoteItem>(
  initialDeliveryNoteItems,
  'website_customer_delivery_note_items'
)

export const salesInvoiceRepo = new InMemoryRepository<SalesInvoice>(
  initialSalesInvoices,
  'website_customer_sales_invoices'
)

export const salesPaymentRepo = new InMemoryRepository<SalesPayment>(
  initialSalesPayments,
  'website_customer_sales_payments'
)

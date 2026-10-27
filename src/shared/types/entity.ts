import type { RoleId } from '@/app/auth/roles'

export interface User {
  id: string
  username: string
  name: string
  role: RoleId
  email: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: string
  code: string
  name: string
  address: string
  phone: string
  email?: string
  notes?: string
  createdAt: string
}

export type SupplierTaxType = 'ppn' | 'non_ppn'

export interface Supplier {
  id: string
  code: string
  name: string
  address: string
  phone: string
  taxType: SupplierTaxType
  createdAt: string
}

export interface Barang {
  id: string
  sku: string
  name: string
  unit: string
  category: string
  isActive: boolean
  createdAt: string
}

export type PurchaseEntity = 'SMA' | 'ST'
export type PaymentTerms = 'cash' | 'tempo'

export interface PurchaseInvoice {
  id: string
  invoiceNumber: string
  supplierInvoiceNumber: string
  supplierId: string
  entity: PurchaseEntity
  paymentTerms: PaymentTerms
  invoiceDate: string
  dueDate: string
  subtotal: number
  taxAmount: number
  totalAmount: number
  notes?: string
  createdAt: string
}

export interface PurchaseItem {
  id: string
  purchaseInvoiceId: string
  barangId: string
  qty: number
  unit: string
  unitPrice: number
  totalPrice: number
  notes?: string
}

export type PaymentMethod = 'CASH' | 'TRANSFER' | 'GIRO'

export interface PurchasePayment {
  id: string
  paymentNumber: string
  purchaseInvoiceId: string
  paymentDate: string
  amount: number
  paymentMethod: PaymentMethod
  referenceNumber?: string
  notes?: string
  createdAt: string
}

export type SalesOrderStatus = 'open' | 'close' | 'cancel'

export interface SalesOrder {
  id: string
  soNumber: string
  customerId: string
  orderDate: string
  status: SalesOrderStatus
  totalAmount: number
  notes?: string
  createdAt: string
}

export interface SalesOrderItem {
  id: string
  salesOrderId: string
  barangId: string | null
  itemName: string
  unit: string
  qty: number
  unitPrice: number
  totalPrice: number
}

export type DeliveryNoteStatus = 'draft' | 'delivered' | 'cancelled'

export interface DeliveryNote {
  id: string
  deliveryNumber: string
  salesOrderId: string
  deliveryDate: string
  recipientName: string
  vehiclePlate: string
  driverName: string
  status: DeliveryNoteStatus
  notes?: string
  createdAt: string
}

export interface DeliveryNoteItem {
  id: string
  deliveryNoteId: string
  salesOrderItemId: string
  qtyDelivered: number
}

export type FakturStatus = 'sudah_faktur' | 'belum_faktur' | 'tanpa_faktur'

export interface SalesInvoice {
  id: string
  invoiceNumber: string
  customerId: string
  deliveryNoteIds: string[]
  paymentTerms: PaymentTerms
  dueDate: string
  fakturStatus: FakturStatus
  invoiceDate: string
  subtotal: number
  taxAmount: number
  totalAmount: number
  notes?: string
  createdAt: string
}

export interface SalesPayment {
  id: string
  paymentNumber: string
  salesInvoiceId: string
  paymentDate: string
  amount: number
  paymentMethod: PaymentMethod
  referenceNumber?: string
  notes?: string
  createdAt: string
}

export interface BillingLetter {
  id: string
  letterNumber: string
  customerId: string
  letterDate: string
  totalOutstandingAmount: number
  notes?: string
  createdAt: string
}

export interface BillingLetterItem {
  id: string
  billingLetterId: string
  salesInvoiceId: string
  invoiceNumber: string
  originalAmount: number
  paidAmount: number
  remainingBalance: number
}

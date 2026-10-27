import type {
  SalesOrder,
  SalesOrderItem,
  DeliveryNote,
  DeliveryNoteItem,
  SalesInvoice,
  SalesPayment,
} from '@/shared/types/entity'

export const initialSalesOrders: SalesOrder[] = [
  {
    id: 'so-1',
    soNumber: 'SO/SMA/2026/0001',
    customerId: 'cust-1', // PT Maju Bersama Sukses
    orderDate: '2026-01-12',
    status: 'open',
    totalAmount: 36000000,
    notes: 'Pengiriman bertahap sesuai kesiapan gudang proyek',
    createdAt: '2026-01-12T09:00:00Z',
  },
  {
    id: 'so-2',
    soNumber: 'SO/SMA/2026/0002',
    customerId: 'cust-2', // CV Sinar Jaya Abadi
    orderDate: '2026-01-14',
    status: 'close',
    totalAmount: 18000000,
    notes: 'Pesanan telah selesai dikirim penuh',
    createdAt: '2026-01-14T10:00:00Z',
  },
]

export const initialSalesOrderItems: SalesOrderItem[] = [
  // SO-1 items: 200 batang Besi D13 + 100 batang Pipa Hollow
  {
    id: 'soitem-1',
    salesOrderId: 'so-1',
    barangId: 'brg-1',
    itemName: 'Besi Beton Ulir D13 SNI',
    unit: 'BATANG',
    qty: 200,
    unitPrice: 120000,
    totalPrice: 24000000,
  },
  {
    id: 'soitem-2',
    salesOrderId: 'so-1',
    barangId: 'brg-3',
    itemName: 'Pipa Hollow Galvanis 4x4 Tebal 1.8mm',
    unit: 'BATANG',
    qty: 50,
    unitPrice: 240000,
    totalPrice: 12000000,
  },
  // SO-2 items: 150 batang Besi D13
  {
    id: 'soitem-3',
    salesOrderId: 'so-2',
    barangId: 'brg-1',
    itemName: 'Besi Beton Ulir D13 SNI',
    unit: 'BATANG',
    qty: 150,
    unitPrice: 120000,
    totalPrice: 18000000,
  },
]

export const initialDeliveryNotes: DeliveryNote[] = [
  // Pengiriman bertahap tahap 1 untuk SO-1: 100 batang besi D13 (dari 200)
  {
    id: 'dn-1',
    deliveryNumber: 'SJ/SMA/2026/0001',
    salesOrderId: 'so-1',
    deliveryDate: '2026-01-13',
    recipientName: 'Pak Joko (Site Manager)',
    vehiclePlate: 'B 9123 KDA',
    driverName: 'Bambang',
    status: 'delivered',
    notes: 'Pengiriman tahap 1 proyek Cikarang',
    createdAt: '2026-01-13T08:00:00Z',
  },
  // Pengiriman penuh untuk SO-2: 150 batang
  {
    id: 'dn-2',
    deliveryNumber: 'SJ/SMA/2026/0002',
    salesOrderId: 'so-2',
    deliveryDate: '2026-01-15',
    recipientName: 'Ibu Ratna',
    vehiclePlate: 'D 8844 AB',
    driverName: 'Suryo',
    status: 'delivered',
    notes: 'Pengiriman langsung ke gudang Bandung',
    createdAt: '2026-01-15T09:00:00Z',
  },
]

export const initialDeliveryNoteItems: DeliveryNoteItem[] = [
  {
    id: 'dnitem-1',
    deliveryNoteId: 'dn-1',
    salesOrderItemId: 'soitem-1',
    qtyDelivered: 100, // Dari pesanan 200
  },
  {
    id: 'dnitem-2',
    deliveryNoteId: 'dn-2',
    salesOrderItemId: 'soitem-3',
    qtyDelivered: 150, // Penuh 150
  },
]

export const initialSalesInvoices: SalesInvoice[] = [
  // Invoice dibuat dari dn-2
  {
    id: 'sinv-1',
    invoiceNumber: 'INV/SMA/2026/0001',
    customerId: 'cust-2',
    deliveryNoteIds: ['dn-2'],
    paymentTerms: 'tempo',
    dueDate: '2026-02-15',
    fakturStatus: 'sudah_faktur',
    invoiceDate: '2026-01-16',
    subtotal: 18000000,
    taxAmount: 1980000, // 11% PPN
    totalAmount: 19980000,
    notes: 'Tagihan pengiriman pipa dan besi',
    createdAt: '2026-01-16T10:00:00Z',
  },
]

export const initialSalesPayments: SalesPayment[] = [
  {
    id: 'spay-1',
    paymentNumber: 'SPAY/2026/0001',
    salesInvoiceId: 'sinv-1',
    paymentDate: '2026-01-20',
    amount: 10000000, // DP 10 jt
    paymentMethod: 'TRANSFER',
    referenceNumber: 'TRF-MANDIRI-449102',
    notes: 'Uang muka tahap 1',
    createdAt: '2026-01-20T14:00:00Z',
  },
]

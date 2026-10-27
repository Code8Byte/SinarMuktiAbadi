import type { PurchaseInvoice, PurchaseItem, PurchasePayment } from '@/shared/types/entity'

export const initialPurchaseInvoices: PurchaseInvoice[] = [
  {
    id: 'pinv-1',
    invoiceNumber: 'PINV/SMA/2026/0001',
    supplierInvoiceNumber: 'INV-BPN-991',
    supplierId: 'supp-1', // PT Baja Prima Nusantara (PPN)
    entity: 'SMA',
    paymentTerms: 'tempo',
    invoiceDate: '2026-01-10',
    dueDate: '2026-02-10',
    subtotal: 50000000,
    taxAmount: 5500000, // 11% PPN
    totalAmount: 55500000,
    notes: 'Pengadaan material proyek kuartal 1',
    createdAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'pinv-2',
    invoiceNumber: 'PINV/SMA/2026/0002',
    supplierInvoiceNumber: 'MSL/INV/2026/102',
    supplierId: 'supp-2', // CV Multi Sarana Logam (PPN)
    entity: 'ST', // Pembelian dialokasikan untuk ST!
    paymentTerms: 'cash',
    invoiceDate: '2026-01-15',
    dueDate: '2026-01-15',
    subtotal: 20000000,
    taxAmount: 2200000,
    totalAmount: 22200000,
    notes: 'Pengadaan stok kebutuhan ST',
    createdAt: '2026-01-15T11:30:00Z',
  },
  {
    id: 'pinv-3',
    invoiceNumber: 'PINV/SMA/2026/0003',
    supplierInvoiceNumber: 'SBT-8891',
    supplierId: 'supp-3', // UD Sumber Berkah Teknik (Non-PPN)
    entity: 'SMA',
    paymentTerms: 'tempo',
    invoiceDate: '2026-01-20',
    dueDate: '2026-02-20',
    subtotal: 15000000,
    taxAmount: 0, // Non-PPN
    totalAmount: 15000000,
    notes: 'Aksesoris dan kawat bendrat',
    createdAt: '2026-01-20T14:00:00Z',
  },
]

export const initialPurchaseItems: PurchaseItem[] = [
  {
    id: 'pitem-1',
    purchaseInvoiceId: 'pinv-1',
    barangId: 'brg-1',
    qty: 500,
    unit: 'BATANG',
    unitPrice: 100000,
    totalPrice: 50000000,
    notes: 'Besi Beton Ulir D13 SNI',
  },
  {
    id: 'pitem-2',
    purchaseInvoiceId: 'pinv-2',
    barangId: 'brg-3',
    qty: 100,
    unit: 'BATANG',
    unitPrice: 200000,
    totalPrice: 20000000,
    notes: 'Pipa Hollow Galvanis',
  },
  {
    id: 'pitem-3',
    purchaseInvoiceId: 'pinv-3',
    barangId: 'brg-5',
    qty: 50,
    unit: 'ROLL',
    unitPrice: 300000,
    totalPrice: 15000000,
    notes: 'Kawat bendrat',
  },
]

export const initialPurchasePayments: PurchasePayment[] = [
  {
    id: 'ppay-1',
    paymentNumber: 'PPAY/2026/0001',
    purchaseInvoiceId: 'pinv-1',
    paymentDate: '2026-01-12',
    amount: 20000000, // DP partial payment
    paymentMethod: 'TRANSFER',
    referenceNumber: 'TRF-BCA-102938',
    notes: 'Pembayaran uang muka DP 20 jt',
    createdAt: '2026-01-12T14:00:00Z',
  },
  {
    id: 'ppay-2',
    paymentNumber: 'PPAY/2026/0002',
    purchaseInvoiceId: 'pinv-2',
    paymentDate: '2026-01-15',
    amount: 22200000, // Full auto-payment for cash
    paymentMethod: 'CASH',
    referenceNumber: 'CASH-AUTO-002',
    notes: 'Pelunasan otomatis termin tunai (cash)',
    createdAt: '2026-01-15T11:30:00Z',
  },
]

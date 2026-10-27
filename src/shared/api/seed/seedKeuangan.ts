import type { BillingLetter, BillingLetterItem } from '@/shared/types/entity'

export const initialBillingLetters: BillingLetter[] = [
  {
    id: 'bl-1',
    letterNumber: 'ST/SMA/2026/0001',
    customerId: 'cust-2',
    letterDate: '2026-01-25',
    totalOutstandingAmount: 9980000,
    notes: 'Surat penagihan sisa invoice jatuh tempo akhir bulan Januari',
    createdAt: '2026-01-25T10:00:00Z',
  },
]

export const initialBillingLetterItems: BillingLetterItem[] = [
  {
    id: 'blitem-1',
    billingLetterId: 'bl-1',
    salesInvoiceId: 'sinv-1',
    invoiceNumber: 'INV/SMA/2026/0001',
    originalAmount: 19980000,
    paidAmount: 10000000,
    remainingBalance: 9980000,
  },
]

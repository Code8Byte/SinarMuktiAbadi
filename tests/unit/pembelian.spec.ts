import { describe, it, expect, beforeEach } from 'vitest'
import { pembelianService } from '@/modules/pembelian/services/pembelianService'

describe('pembelianService (Fase 3: Pembelian SMA)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('calculates 11% PPN for PPN suppliers', async () => {
    // supp-1 is PPN
    const invoice = await pembelianService.createInvoice({
      supplierId: 'supp-1',
      supplierInvoiceNumber: 'INV-TEST-PPN-001',
      entity: 'SMA',
      paymentTerms: 'tempo',
      invoiceDate: '2026-02-01',
      dueDate: '2026-03-01',
      items: [
        {
          barangId: 'brg-1',
          qty: 10,
          unit: 'BATANG',
          unitPrice: 100000, // Subtotal = 1.000.000
        },
      ],
    })

    expect(invoice.subtotal).toBe(1000000)
    expect(invoice.taxAmount).toBe(110000)
    expect(invoice.totalAmount).toBe(1110000)
    expect(invoice.paymentSummary.status).toBe('belum_lunas')
    expect(invoice.paymentSummary.remainingBalance).toBe(1110000)
  })

  it('sets PPN to 0 for Non-PPN suppliers', async () => {
    // supp-3 is Non-PPN
    const invoice = await pembelianService.createInvoice({
      supplierId: 'supp-3',
      supplierInvoiceNumber: 'INV-TEST-NONPPN-001',
      entity: 'SMA',
      paymentTerms: 'tempo',
      invoiceDate: '2026-02-01',
      dueDate: '2026-03-01',
      items: [
        {
          barangId: 'brg-5',
          qty: 5,
          unit: 'ROLL',
          unitPrice: 200000, // Subtotal = 1.000.000
        },
      ],
    })

    expect(invoice.subtotal).toBe(1000000)
    expect(invoice.taxAmount).toBe(0)
    expect(invoice.totalAmount).toBe(1000000)
  })

  it('automatically marks cash invoice as fully paid with payment record', async () => {
    const cashInvoice = await pembelianService.createInvoice({
      supplierId: 'supp-3',
      supplierInvoiceNumber: 'INV-CASH-TEST',
      entity: 'ST',
      paymentTerms: 'cash',
      invoiceDate: '2026-02-05',
      dueDate: '2026-02-05',
      items: [
        {
          barangId: 'brg-2',
          qty: 2,
          unit: 'BATANG',
          unitPrice: 500000,
        },
      ],
    })

    expect(cashInvoice.paymentTerms).toBe('cash')
    expect(cashInvoice.paymentSummary.status).toBe('lunas')
    expect(cashInvoice.paymentSummary.totalPaid).toBe(1000000)
    expect(cashInvoice.paymentSummary.remainingBalance).toBe(0)
    expect(cashInvoice.payments.length).toBe(1)
    expect(cashInvoice.payments[0].paymentMethod).toBe('CASH')
  })

  it('records partial payment (DP) and derives status correctly', async () => {
    const tempoInvoice = await pembelianService.createInvoice({
      supplierId: 'supp-3',
      supplierInvoiceNumber: 'INV-TEMPO-DP-TEST',
      entity: 'SMA',
      paymentTerms: 'tempo',
      invoiceDate: '2026-02-10',
      dueDate: '2026-03-10',
      items: [
        {
          barangId: 'brg-1',
          qty: 10,
          unit: 'BATANG',
          unitPrice: 100000, // Total = 1.000.000
        },
      ],
    })

    expect(tempoInvoice.paymentSummary.status).toBe('belum_lunas')

    // Record partial DP payment of Rp 400.000
    await pembelianService.recordPayment(tempoInvoice.id, {
      amount: 400000,
      paymentDate: '2026-02-11',
      paymentMethod: 'TRANSFER',
      referenceNumber: 'TRF-DP-01',
    })

    const updated = await pembelianService.getInvoiceById(tempoInvoice.id)
    expect(updated?.paymentSummary.status).toBe('dp')
    expect(updated?.paymentSummary.totalPaid).toBe(400000)
    expect(updated?.paymentSummary.remainingBalance).toBe(600000)
  })

  it('aggregates supplier debt summary correctly', async () => {
    const summary = await pembelianService.getSupplierDebtSummary()
    expect(summary.length).toBeGreaterThan(0)
    expect(summary.every((s) => s.totalBilled >= s.totalPaid)).toBe(true)
  })
})

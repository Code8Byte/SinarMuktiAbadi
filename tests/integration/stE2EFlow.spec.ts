import { describe, it, expect, beforeEach } from 'vitest'
import { customerService } from '@/modules/customers'
import { salesOrderService, deliveryNoteService, salesInvoiceService } from '@/modules/penjualan'
import { billingLetterService } from '@/modules/keuangan'
import { stConfig } from '@/app/variants/st.config'

describe('Integration: Complete ST Business Lifecycle E2E', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('validates ST configuration invariants', () => {
    expect(stConfig.id).toBe('st')
    expect(stConfig.features.hasPurchaseModule).toBe(false)
    expect(stConfig.features.hasMasterBarang).toBe(false)
    expect(stConfig.features.hasTaxFaktur).toBe(false)
    expect(stConfig.soItemMode).toBe('manual')
    expect(stConfig.invoiceFaktur).toBe('none')
    expect(stConfig.enabledModules).not.toContain('pembelian')
    expect(stConfig.enabledModules).not.toContain('barang')
    expect(stConfig.enabledModules).not.toContain('suppliers')
  })

  it('executes ST sales order with manual free-text items and no tax invoice', async () => {
    // 1. Customer Creation
    const customer = await customerService.createCustomer({
      code: 'CUST-ST-01',
      name: 'Toko Bangunan Sumber Rejeki',
      address: 'Jl. Raya Ciputat No. 8',
      phone: '081399887766',
    })

    // 2. SO Creation with Manual Free-Text Items (No Master Barang required)
    const so = await salesOrderService.createSalesOrder(
      {
        customerId: customer.id,
        orderDate: '2026-03-01',
        notes: 'Pesanan kain custom printing',
        items: [
          {
            barangId: null,
            itemName: 'Kain Drill Sablon Motif Khusus',
            unit: 'METER',
            qty: 200,
            unitPrice: 45_000,
          },
        ],
      },
      'manual',
      'ST'
    )
    expect(so.soNumber).toMatch(/^SO\/ST\/\d{4}\/\d{4}$/)
    expect(so.status).toBe('open')
    expect(so.items[0].barangId).toBeNull()
    expect(so.items[0].itemName).toBe('Kain Drill Sablon Motif Khusus')
    expect(so.totalAmount).toBe(9_000_000)

    // 3. Delivery Note
    const dn = await deliveryNoteService.createDeliveryNote(
      {
        salesOrderId: so.id,
        deliveryDate: '2026-03-02',
        recipientName: 'Pak Hendra (Toko)',
        vehiclePlate: 'B 4321 ST',
        driverName: 'Danu',
        items: [{ salesOrderItemId: so.items[0].id, qtyDelivered: 200 }],
      },
      'ST'
    )
    expect(dn.deliveryNumber).toMatch(/^SJ\/ST\/\d{4}\/\d{4}$/)
    expect(dn.items[0].qtyDelivered).toBe(200)

    // SO should be closed
    const closedSo = await salesOrderService.getSalesOrderById(so.id)
    expect(closedSo?.status).toBe('close')

    // 4. Sales Invoice (ST: always without tax invoice / tanpa_faktur)
    const invoice = await salesInvoiceService.createSalesInvoice(
      {
        customerId: customer.id,
        deliveryNoteIds: [dn.id],
        paymentTerms: 'tempo',
        dueDate: '2026-03-31',
        fakturStatus: 'tanpa_faktur',
        invoiceDate: '2026-03-03',
      },
      'ST'
    )
    expect(invoice.invoiceNumber).toMatch(/^INV\/ST\/\d{4}\/\d{4}$/)
    expect(invoice.subtotal).toBe(9_000_000)
    expect(invoice.taxAmount).toBe(0) // No tax for ST
    expect(invoice.totalAmount).toBe(9_000_000)
    expect(invoice.fakturStatus).toBe('tanpa_faktur')
    expect(invoice.paymentSummary.status).toBe('belum_lunas')

    // 5. Billing Letter for ST
    const billingLetter = await billingLetterService.createBillingLetter(
      {
        customerId: customer.id,
        letterDate: '2026-03-15',
        invoiceIds: [invoice.id],
        notes: 'Tagihan bulan Maret untuk ST',
      },
      'ST'
    )
    expect(billingLetter.letterNumber).toMatch(/^ST\/ST\/\d{4}\/\d{4}$/)
    expect(billingLetter.totalOutstandingAmount).toBe(9_000_000)
    expect(billingLetter.items.length).toBe(1)

    // 6. Pay Invoice Full
    await salesInvoiceService.recordPayment(invoice.id, {
      paymentDate: '2026-03-20',
      amount: 9_000_000,
      paymentMethod: 'TRANSFER',
      referenceNumber: 'TRF-ST-LUNAS',
    })

    const finalInvoice = await salesInvoiceService.getInvoiceById(invoice.id)
    expect(finalInvoice?.paymentSummary.status).toBe('lunas')
    expect(finalInvoice?.paymentSummary.remainingBalance).toBe(0)
  })
})

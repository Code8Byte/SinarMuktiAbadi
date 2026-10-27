import { describe, it, expect, beforeEach } from 'vitest'
import { billingLetterService } from '@/modules/keuangan/services/billingLetterService'
import { customerService } from '@/modules/customers'
import { salesOrderService, deliveryNoteService, salesInvoiceService } from '@/modules/penjualan'

describe('BillingLetterService', () => {
  let testCustomerId: string
  let unpaidInvoiceId: string
  let fullyPaidInvoiceId: string

  beforeEach(async () => {
    localStorage.clear()

    // 1. Create a customer
    const cust = await customerService.createCustomer({
      code: 'CUST-TEST-BL',
      name: 'PT Mitra Uji Tagihan',
      address: 'Jl. Testing No. 99',
      phone: '081234567890',
    })
    testCustomerId = cust.id

    // 2. Create SO 1 and deliver it
    const so1 = await salesOrderService.createSalesOrder(
      {
        customerId: testCustomerId,
        orderDate: '2026-10-01',
        items: [
          {
            barangId: null,
            itemName: 'Kain Katun Rayon',
            qty: 10,
            unit: 'yard',
            unitPrice: 100_000,
          },
        ],
      },
      'manual',
      'SMA'
    )

    const dn1 = await deliveryNoteService.createDeliveryNote(
      {
        salesOrderId: so1.id,
        deliveryDate: '2026-10-02',
        recipientName: 'Gudang Pabrik',
        vehiclePlate: 'B 1111 AA',
        driverName: 'Sopir A',
        items: [{ salesOrderItemId: so1.items[0].id, qtyDelivered: 10 }],
      },
      'SMA'
    )

    const inv1 = await salesInvoiceService.createSalesInvoice(
      {
        customerId: testCustomerId,
        deliveryNoteIds: [dn1.id],
        paymentTerms: 'tempo',
        dueDate: '2026-10-31',
        fakturStatus: 'tanpa_faktur',
        invoiceDate: '2026-10-03',
      },
      'SMA'
    )
    unpaidInvoiceId = inv1.id

    // 3. Create SO 2, deliver it, create invoice, and pay fully
    const so2 = await salesOrderService.createSalesOrder(
      {
        customerId: testCustomerId,
        orderDate: '2026-10-04',
        items: [
          {
            barangId: null,
            itemName: 'Kain Twill Stretch',
            qty: 5,
            unit: 'yard',
            unitPrice: 100_000,
          },
        ],
      },
      'manual',
      'SMA'
    )

    const dn2 = await deliveryNoteService.createDeliveryNote(
      {
        salesOrderId: so2.id,
        deliveryDate: '2026-10-05',
        recipientName: 'Gudang Pusat',
        vehiclePlate: 'B 2222 BB',
        driverName: 'Sopir B',
        items: [{ salesOrderItemId: so2.items[0].id, qtyDelivered: 5 }],
      },
      'SMA'
    )

    const inv2 = await salesInvoiceService.createSalesInvoice(
      {
        customerId: testCustomerId,
        deliveryNoteIds: [dn2.id],
        paymentTerms: 'tempo',
        dueDate: '2026-10-31',
        fakturStatus: 'tanpa_faktur',
        invoiceDate: '2026-10-06',
      },
      'SMA'
    )
    fullyPaidInvoiceId = inv2.id

    // Pay invoice 2 fully
    await salesInvoiceService.recordPayment(inv2.id, {
      amount: inv2.totalAmount,
      paymentDate: '2026-10-07',
      paymentMethod: 'TRANSFER',
      referenceNumber: 'TRF-1001',
    })
  })

  it('fails when creating a billing letter with empty invoices array', async () => {
    await expect(
      billingLetterService.createBillingLetter({
        customerId: testCustomerId,
        letterDate: '2026-10-15',
        invoiceIds: [],
      })
    ).rejects.toThrow('Pilih minimal satu invoice yang belum lunas')
  })

  it('fails when customer is not found', async () => {
    await expect(
      billingLetterService.createBillingLetter({
        customerId: 'non-existent-cust',
        letterDate: '2026-10-15',
        invoiceIds: [unpaidInvoiceId],
      })
    ).rejects.toThrow('Customer tidak ditemukan')
  })

  it('fails when selecting only already-paid invoices', async () => {
    await expect(
      billingLetterService.createBillingLetter({
        customerId: testCustomerId,
        letterDate: '2026-10-15',
        invoiceIds: [fullyPaidInvoiceId],
      })
    ).rejects.toThrow('Semua invoice yang dipilih telah lunas')
  })

  it('successfully creates a billing letter for unpaid invoices and captures snapshot', async () => {
    const letter = await billingLetterService.createBillingLetter(
      {
        customerId: testCustomerId,
        letterDate: '2026-10-15',
        invoiceIds: [unpaidInvoiceId],
        notes: 'Tagihan resmi tahap 1',
      },
      'SMA'
    )

    expect(letter).toBeDefined()
    expect(letter.customerName).toBe('PT Mitra Uji Tagihan')
    expect(letter.letterNumber).toMatch(/^ST\/SMA\/\d{4}\/\d{4}$/)
    expect(letter.totalOutstandingAmount).toBe(1_000_000)
    expect(letter.items.length).toBe(1)
    expect(letter.items[0].remainingBalance).toBe(1_000_000)
    expect(letter.notes).toBe('Tagihan resmi tahap 1')

    // Retrieve by ID
    const retrieved = await billingLetterService.getBillingLetterById(letter.id)
    expect(retrieved).not.toBeNull()
    expect(retrieved?.id).toBe(letter.id)
    expect(retrieved?.items.length).toBe(1)
  })

  it('calculates customer receivable summary correctly', async () => {
    const summaries = await billingLetterService.getCustomerReceivableSummary()
    const customerSummary = summaries.find((s) => s.customerId === testCustomerId)

    expect(customerSummary).toBeDefined()
    expect(customerSummary?.totalInvoices).toBe(2)
    expect(customerSummary?.totalBilled).toBe(1_500_000)
    expect(customerSummary?.totalPaid).toBe(500_000)
    expect(customerSummary?.totalOutstanding).toBe(1_000_000)
    expect(customerSummary?.unpaidInvoicesCount).toBe(1)
  })
})

import { describe, it, expect, beforeEach } from 'vitest'
import { supplierService } from '@/modules/suppliers'
import { barangService } from '@/modules/barang'
import { pembelianService } from '@/modules/pembelian'
import { customerService } from '@/modules/customers'
import { salesOrderService, deliveryNoteService, salesInvoiceService } from '@/modules/penjualan'
import { billingLetterService } from '@/modules/keuangan'

describe('Integration: Complete SMA Business Lifecycle E2E', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('executes full procurement, catalog, sales, fulfillment, billing and reporting flow', async () => {
    // 1. Supplier Creation (PPN Supplier)
    const supplier = await supplierService.createSupplier({
      code: 'SUPP-E2E-1',
      name: 'PT Pabrik Baja Nusantara',
      address: 'Kawasan Industri Cilegon',
      phone: '0254-889911',
      taxType: 'ppn',
    })
    expect(supplier.id).toBeDefined()
    expect(supplier.taxType).toBe('ppn')

    // 2. Master Barang Setup
    const barang1 = await barangService.createBarang({
      sku: 'BRG-E2E-01',
      name: 'Besi Beton Ulir D16',
      unit: 'BATANG',
      category: 'Besi & Baja',
      isActive: true,
    })
    expect(barang1.sku).toBe('BRG-E2E-01')

    // 3. Purchase Invoice (Procurement for SMA)
    // 100 batang @ Rp 150.000 = Rp 15.000.000 + 11% PPN (Rp 1.650.000) = Rp 16.650.000
    const purchaseInv = await pembelianService.createInvoice({
      supplierId: supplier.id,
      supplierInvoiceNumber: 'INV-PBN-2026-99',
      entity: 'SMA',
      paymentTerms: 'tempo',
      invoiceDate: '2026-03-01',
      dueDate: '2026-03-31',
      items: [
        {
          barangId: barang1.id,
          qty: 100,
          unit: 'BATANG',
          unitPrice: 150_000,
        },
      ],
    })
    expect(purchaseInv.subtotal).toBe(15_000_000)
    expect(purchaseInv.taxAmount).toBe(1_650_000)
    expect(purchaseInv.totalAmount).toBe(16_650_000)
    expect(purchaseInv.paymentSummary.status).toBe('belum_lunas')

    // 4. Record Supplier Payment (DP 50%)
    await pembelianService.recordPayment(purchaseInv.id, {
      paymentDate: '2026-03-05',
      amount: 8_325_000,
      paymentMethod: 'TRANSFER',
      referenceNumber: 'TRF-DP-01',
    })

    const checkPurchase = await pembelianService.getInvoiceById(purchaseInv.id)
    expect(checkPurchase?.paymentSummary.status).toBe('dp')
    expect(checkPurchase?.paymentSummary.remainingBalance).toBe(8_325_000)

    // 5. Customer Creation
    const customer = await customerService.createCustomer({
      code: 'CUST-E2E-1',
      name: 'PT Kontraktor Megah Jaya',
      address: 'Jl. Jenderal Sudirman Kav 21',
      phone: '021-555029',
    })
    expect(customer.id).toBeDefined()

    // 6. Sales Order (Catalog Mode for SMA)
    // Order 60 batang @ Rp 180.000 = Rp 10.800.000
    const so = await salesOrderService.createSalesOrder(
      {
        customerId: customer.id,
        orderDate: '2026-03-10',
        items: [
          {
            barangId: barang1.id,
            itemName: barang1.name,
            unit: barang1.unit,
            qty: 60,
            unitPrice: 180_000,
          },
        ],
      },
      'catalog',
      'SMA'
    )
    expect(so.status).toBe('open')
    expect(so.items.length).toBe(1)
    const soItemId = so.items[0].id

    // 7. Delivery Note 1 (Phased delivery: 40 units)
    const dn1 = await deliveryNoteService.createDeliveryNote(
      {
        salesOrderId: so.id,
        deliveryDate: '2026-03-11',
        recipientName: 'Mandor Proyek',
        vehiclePlate: 'B 8899 CD',
        driverName: 'Pak Agus',
        items: [{ salesOrderItemId: soItemId, qtyDelivered: 40 }],
      },
      'SMA'
    )
    expect(dn1.items[0].qtyDelivered).toBe(40)

    // SO should still be open
    const soAfterDn1 = await salesOrderService.getSalesOrderById(so.id)
    expect(soAfterDn1?.status).toBe('open')
    expect(soAfterDn1?.fulfillment.items[0].remainingQty).toBe(20)

    // SO cannot be canceled after delivery note exists
    await expect(salesOrderService.cancelSalesOrder(so.id)).rejects.toThrow(
      /sudah memiliki surat jalan/
    )

    // 8. Delivery Note 2 (Complete delivery: remaining 20 units)
    const dn2 = await deliveryNoteService.createDeliveryNote(
      {
        salesOrderId: so.id,
        deliveryDate: '2026-03-12',
        recipientName: 'Mandor Proyek',
        vehiclePlate: 'B 8899 CD',
        driverName: 'Pak Agus',
        items: [{ salesOrderItemId: soItemId, qtyDelivered: 20 }],
      },
      'SMA'
    )
    expect(dn2.items[0].qtyDelivered).toBe(20)

    // SO should now be auto-closed
    const soAfterDn2 = await salesOrderService.getSalesOrderById(so.id)
    expect(soAfterDn2?.status).toBe('close')
    expect(soAfterDn2?.fulfillment.isAllFulfilled).toBe(true)

    // 9. Sales Invoice Generation (Combined dn1 + dn2)
    // Subtotal = 60 * 180.000 = 10.800.000. With PPN 11% = 1.188.000. Total = 11.988.000
    const salesInv = await salesInvoiceService.createSalesInvoice(
      {
        customerId: customer.id,
        deliveryNoteIds: [dn1.id, dn2.id],
        paymentTerms: 'tempo',
        dueDate: '2026-04-12',
        fakturStatus: 'sudah_faktur',
        invoiceDate: '2026-03-13',
      },
      'SMA'
    )
    expect(salesInv.subtotal).toBe(10_800_000)
    expect(salesInv.taxAmount).toBe(1_188_000)
    expect(salesInv.totalAmount).toBe(11_988_000)
    expect(salesInv.paymentSummary.status).toBe('belum_lunas')
    expect(salesInv.paymentSummary.remainingBalance).toBe(11_988_000)

    // 10. Record Customer Partial Payment (DP Rp 5.000.000)
    await salesInvoiceService.recordPayment(salesInv.id, {
      paymentDate: '2026-03-15',
      amount: 5_000_000,
      paymentMethod: 'TRANSFER',
      referenceNumber: 'TRF-CUST-DP',
    })

    const checkSalesInv = await salesInvoiceService.getInvoiceById(salesInv.id)
    expect(checkSalesInv?.paymentSummary.status).toBe('dp')
    expect(checkSalesInv?.paymentSummary.remainingBalance).toBe(6_988_000)

    // 11. Billing Letter (Surat Tagihan) Generation for Outstanding Balance
    const billingLetter = await billingLetterService.createBillingLetter(
      {
        customerId: customer.id,
        letterDate: '2026-03-20',
        invoiceIds: [salesInv.id],
        notes: 'Surat Tagihan Jatuh Tempo',
      },
      'SMA'
    )
    expect(billingLetter.totalOutstandingAmount).toBe(6_988_000)
    expect(billingLetter.letterNumber).toMatch(/^ST\/SMA\/\d{4}\/\d{4}$/)
    expect(billingLetter.items[0].remainingBalance).toBe(6_988_000)

    // 12. Full Settlement by Customer
    await salesInvoiceService.recordPayment(salesInv.id, {
      paymentDate: '2026-03-25',
      amount: 6_988_000,
      paymentMethod: 'TRANSFER',
      referenceNumber: 'TRF-CUST-LUNAS',
    })

    const fullyPaidInv = await salesInvoiceService.getInvoiceById(salesInv.id)
    expect(fullyPaidInv?.paymentSummary.status).toBe('lunas')
    expect(fullyPaidInv?.paymentSummary.remainingBalance).toBe(0)

    // Trying to generate another billing letter should fail because invoice is already paid
    await expect(
      billingLetterService.createBillingLetter(
        {
          customerId: customer.id,
          letterDate: '2026-03-26',
          invoiceIds: [salesInv.id],
        },
        'SMA'
      )
    ).rejects.toThrow(/telah lunas/)
  })
})

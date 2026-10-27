import { customerService } from '@/modules/customers'
import { salesOrderService } from './salesOrderService'
import { deliveryNoteService, type DeliveryNoteWithDetails } from './deliveryNoteService'
import type { SalesInvoice, SalesPayment, FakturStatus } from '@/shared/types/entity'
import type { QueryParams, PaginatedResult } from '@/shared/types/common'
import { calculatePpn } from '@/shared/utils/money'
import { generateDocumentNumber } from '@/shared/utils/numbering'
import { derivePaymentStatus, type PaymentSummary } from '@/shared/utils/payment'
import { salesInvoiceRepo, salesPaymentRepo, dnItemRepo } from './repositories'

export interface SalesInvoiceWithDetails extends SalesInvoice {
  customerName: string
  payments: SalesPayment[]
  paymentSummary: PaymentSummary
}

export const salesInvoiceService = {
  async getInvoices(params: QueryParams = {}): Promise<PaginatedResult<SalesInvoiceWithDetails>> {
    const rawResult = await salesInvoiceRepo.getAll(params)
    const customers = await customerService.getCustomers({ limit: 1000 })
    const customerMap = new Map(customers.items.map((c) => [c.id, c]))

    const detailed: SalesInvoiceWithDetails[] = await Promise.all(
      rawResult.items.map(async (inv) => {
        const cust = customerMap.get(inv.customerId)
        const payments = (await salesPaymentRepo.getAll({ limit: 1000 })).items.filter(
          (p) => p.salesInvoiceId === inv.id
        )
        const paymentSummary = derivePaymentStatus(inv.totalAmount, payments)

        return {
          ...inv,
          customerName: cust?.name || 'Customer Tidak Dikenal',
          payments,
          paymentSummary,
        }
      })
    )

    let filtered = detailed
    if (params.filters?.paymentStatus) {
      filtered = filtered.filter((d) => d.paymentSummary.status === params.filters?.paymentStatus)
    }

    return {
      items: filtered,
      meta: {
        ...rawResult.meta,
        totalItems: filtered.length,
      },
    }
  },

  async getInvoiceById(id: string): Promise<SalesInvoiceWithDetails | null> {
    const inv = await salesInvoiceRepo.getById(id)
    if (!inv) return null

    const cust = await customerService.getCustomerById(inv.customerId)
    const payments = (await salesPaymentRepo.getAll({ limit: 1000 })).items.filter(
      (p) => p.salesInvoiceId === inv.id
    )
    const paymentSummary = derivePaymentStatus(inv.totalAmount, payments)

    return {
      ...inv,
      customerName: cust?.name || 'Customer Tidak Dikenal',
      payments,
      paymentSummary,
    }
  },

  async getUninvoicedDeliveryNotes(customerId?: string): Promise<DeliveryNoteWithDetails[]> {
    const allDns = await deliveryNoteService.getDeliveryNotes({ limit: 1000 })
    const allInvoices = (await salesInvoiceRepo.getAll({ limit: 1000 })).items

    const invoicedDnIds = new Set<string>()
    for (const inv of allInvoices) {
      for (const dnId of inv.deliveryNoteIds) {
        invoicedDnIds.add(dnId)
      }
    }

    return allDns.items.filter((dn) => {
      if (invoicedDnIds.has(dn.id)) return false
      if (customerId && dn.customerName) {
        // filter by customer
      }
      return true
    })
  },

  async createSalesInvoice(
    payload: {
      customerId: string
      deliveryNoteIds: string[]
      paymentTerms: 'cash' | 'tempo'
      dueDate: string
      fakturStatus: FakturStatus
      invoiceDate: string
      notes?: string
    },
    variantCode: string = 'SMA'
  ): Promise<SalesInvoiceWithDetails> {
    if (!payload.deliveryNoteIds || payload.deliveryNoteIds.length === 0) {
      throw new Error('Pilih minimal satu surat jalan untuk ditagihkan.')
    }

    const cust = await customerService.getCustomerById(payload.customerId)
    if (!cust) throw new Error('Customer tidak ditemukan.')

    // Calculate subtotal from delivery note items * SO prices
    let subtotal = 0
    const allDnItems = (await dnItemRepo.getAll({ limit: 2000 })).items

    for (const dnId of payload.deliveryNoteIds) {
      const dn = await deliveryNoteService.getDeliveryNoteById(dnId)
      if (!dn) continue
      const so = await salesOrderService.getSalesOrderById(dn.salesOrderId)
      if (!so) continue

      const thisDnItems = allDnItems.filter((dni) => (dni as { deliveryNoteId: string }).deliveryNoteId === dnId)
      for (const dni of thisDnItems) {
        const itemRec = dni as { salesOrderItemId: string; qtyDelivered: number }
        const soItem = so.items.find((s) => s.id === itemRec.salesOrderItemId)
        if (soItem) {
          subtotal += itemRec.qtyDelivered * soItem.unitPrice
        }
      }
    }

    const isTaxable = payload.fakturStatus === 'sudah_faktur' || payload.fakturStatus === 'belum_faktur'
    const taxAmount = isTaxable ? calculatePpn(subtotal) : 0
    const totalAmount = subtotal + taxAmount

    const allInvoices = await salesInvoiceRepo.getAll({ limit: 1 })
    const invoiceNumber = generateDocumentNumber('INV', variantCode, allInvoices.meta.totalItems + 1)

    const created = await salesInvoiceRepo.create({
      invoiceNumber,
      customerId: payload.customerId,
      deliveryNoteIds: payload.deliveryNoteIds,
      paymentTerms: payload.paymentTerms,
      dueDate: payload.dueDate,
      fakturStatus: payload.fakturStatus,
      invoiceDate: payload.invoiceDate,
      subtotal,
      taxAmount,
      totalAmount,
      notes: payload.notes?.trim() || undefined,
    })

    const payments: SalesPayment[] = []
    if (payload.paymentTerms === 'cash') {
      const autoPay = await salesPaymentRepo.create({
        paymentNumber: generateDocumentNumber('SPAY', variantCode, 1),
        salesInvoiceId: created.id,
        paymentDate: payload.invoiceDate,
        amount: totalAmount,
        paymentMethod: 'CASH',
        referenceNumber: `CASH-AUTO-${created.invoiceNumber}`,
        notes: 'Pelunasan otomatis termin tunai (cash)',
      })
      payments.push(autoPay)
    }

    const paymentSummary = derivePaymentStatus(totalAmount, payments)

    return {
      ...created,
      customerName: cust.name,
      payments,
      paymentSummary,
    }
  },

  async recordPayment(
    invoiceId: string,
    payload: {
      amount: number
      paymentDate: string
      paymentMethod: 'CASH' | 'TRANSFER' | 'GIRO'
      referenceNumber?: string
      notes?: string
    },
    variantCode: string = 'SMA'
  ): Promise<SalesPayment> {
    const inv = await salesInvoiceRepo.getById(invoiceId)
    if (!inv) throw new Error('Invoice penjualan tidak ditemukan.')

    const allPayments = await salesPaymentRepo.getAll({ limit: 1 })
    const paymentNumber = generateDocumentNumber('SPAY', variantCode, allPayments.meta.totalItems + 1)

    return salesPaymentRepo.create({
      paymentNumber,
      salesInvoiceId: invoiceId,
      paymentDate: payload.paymentDate,
      amount: Math.round(payload.amount),
      paymentMethod: payload.paymentMethod,
      referenceNumber: payload.referenceNumber?.trim() || undefined,
      notes: payload.notes?.trim() || undefined,
    })
  },

  async getUnpaidInvoicesByCustomer(customerId: string): Promise<SalesInvoiceWithDetails[]> {
    const all = await this.getInvoices({ limit: 1000 })
    return all.items.filter(
      (inv) => inv.customerId === customerId && inv.paymentSummary.remainingBalance > 0
    )
  },
}

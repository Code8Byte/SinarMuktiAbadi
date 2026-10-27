import { InMemoryRepository } from '@/shared/api/inMemoryRepository'
import {
  initialPurchaseInvoices,
  initialPurchaseItems,
  initialPurchasePayments,
} from '@/shared/api/seed/seedPembelian'
import { supplierService } from '@/modules/suppliers'
import type { PurchaseInvoice, PurchaseItem, PurchasePayment } from '@/shared/types/entity'
import type { QueryParams, PaginatedResult } from '@/shared/types/common'
import { calculatePpn } from '@/shared/utils/money'
import { generateDocumentNumber } from '@/shared/utils/numbering'
import { derivePaymentStatus, type PaymentSummary } from '@/shared/utils/payment'

const invoiceRepo = new InMemoryRepository<PurchaseInvoice>(
  initialPurchaseInvoices,
  'website_customer_purchase_invoices'
)
const itemRepo = new InMemoryRepository<PurchaseItem>(
  initialPurchaseItems,
  'website_customer_purchase_items'
)
const paymentRepo = new InMemoryRepository<PurchasePayment>(
  initialPurchasePayments,
  'website_customer_purchase_payments'
)

export interface CreatePurchaseInvoicePayload {
  supplierId: string
  supplierInvoiceNumber: string
  entity: 'SMA' | 'ST'
  paymentTerms: 'cash' | 'tempo'
  invoiceDate: string
  dueDate: string
  notes?: string
  items: Array<{
    barangId: string
    qty: number
    unit: string
    unitPrice: number
    notes?: string
  }>
}

export interface PurchaseInvoiceWithDetails extends PurchaseInvoice {
  supplierName: string
  supplierTaxType: string
  items: PurchaseItem[]
  payments: PurchasePayment[]
  paymentSummary: PaymentSummary
}

export const pembelianService = {
  async getInvoices(params: QueryParams = {}): Promise<PaginatedResult<PurchaseInvoiceWithDetails>> {
    const rawResult = await invoiceRepo.getAll(params)
    const suppliers = await supplierService.getSuppliers({ limit: 100 })
    const supplierMap = new Map(suppliers.items.map((s) => [s.id, s]))

    const detailedItems: PurchaseInvoiceWithDetails[] = await Promise.all(
      rawResult.items.map(async (inv) => {
        const supp = supplierMap.get(inv.supplierId)
        const items = (await itemRepo.getAll({ limit: 1000 })).items.filter(
          (i) => i.purchaseInvoiceId === inv.id
        )
        const payments = (await paymentRepo.getAll({ limit: 1000 })).items.filter(
          (p) => p.purchaseInvoiceId === inv.id
        )
        const paymentSummary = derivePaymentStatus(inv.totalAmount, payments)

        return {
          ...inv,
          supplierName: supp?.name || 'Supplier Tidak Dikenal',
          supplierTaxType: supp?.taxType || 'non_ppn',
          items,
          payments,
          paymentSummary,
        }
      })
    )

    // Optional filter by payment status if requested in params
    let filtered = detailedItems
    if (params.filters?.paymentStatus) {
      filtered = filtered.filter((d) => d.paymentSummary.status === params.filters?.paymentStatus)
    }
    if (params.filters?.entity) {
      filtered = filtered.filter((d) => d.entity === params.filters?.entity)
    }

    return {
      items: filtered,
      meta: {
        ...rawResult.meta,
        totalItems: filtered.length,
      },
    }
  },

  async getInvoiceById(id: string): Promise<PurchaseInvoiceWithDetails | null> {
    const inv = await invoiceRepo.getById(id)
    if (!inv) return null

    const supp = await supplierService.getSupplierById(inv.supplierId)
    const items = (await itemRepo.getAll({ limit: 1000 })).items.filter(
      (i) => i.purchaseInvoiceId === inv.id
    )
    const payments = (await paymentRepo.getAll({ limit: 1000 })).items.filter(
      (p) => p.purchaseInvoiceId === inv.id
    )
    const paymentSummary = derivePaymentStatus(inv.totalAmount, payments)

    return {
      ...inv,
      supplierName: supp?.name || 'Supplier Tidak Dikenal',
      supplierTaxType: supp?.taxType || 'non_ppn',
      items,
      payments,
      paymentSummary,
    }
  },

  async createInvoice(payload: CreatePurchaseInvoicePayload): Promise<PurchaseInvoiceWithDetails> {
    const supp = await supplierService.getSupplierById(payload.supplierId)
    if (!supp) {
      throw new Error('Supplier yang dipilih tidak ditemukan.')
    }

    if (!payload.items || payload.items.length === 0) {
      throw new Error('Invoice pembelian harus memiliki minimal 1 item barang.')
    }

    // Calculate subtotal
    const subtotal = payload.items.reduce(
      (acc, item) => acc + Math.round(item.qty * item.unitPrice),
      0
    )
    const taxAmount = supp.taxType === 'ppn' ? calculatePpn(subtotal) : 0
    const totalAmount = subtotal + taxAmount

    const allInvoices = await invoiceRepo.getAll({ limit: 1 })
    const invoiceNumber = generateDocumentNumber('PINV', 'SMA', allInvoices.meta.totalItems + 1)

    const createdInvoice = await invoiceRepo.create({
      invoiceNumber,
      supplierInvoiceNumber: payload.supplierInvoiceNumber.trim(),
      supplierId: payload.supplierId,
      entity: payload.entity,
      paymentTerms: payload.paymentTerms,
      invoiceDate: payload.invoiceDate,
      dueDate: payload.dueDate,
      subtotal,
      taxAmount,
      totalAmount,
      notes: payload.notes?.trim() || undefined,
    })

    // Create item records
    const createdItems: PurchaseItem[] = []
    for (const item of payload.items) {
      const createdItem = await itemRepo.create({
        purchaseInvoiceId: createdInvoice.id,
        barangId: item.barangId,
        qty: Math.max(1, Math.round(item.qty)),
        unit: item.unit,
        unitPrice: Math.round(item.unitPrice),
        totalPrice: Math.round(item.qty * item.unitPrice),
        notes: item.notes,
      })
      createdItems.push(createdItem)
    }

    // Auto-record payment if cash
    const payments: PurchasePayment[] = []
    if (payload.paymentTerms === 'cash') {
      const autoPay = await paymentRepo.create({
        paymentNumber: generateDocumentNumber('PPAY', 'SMA', 1),
        purchaseInvoiceId: createdInvoice.id,
        paymentDate: payload.invoiceDate,
        amount: totalAmount,
        paymentMethod: 'CASH',
        referenceNumber: `AUTO-CASH-${createdInvoice.invoiceNumber}`,
        notes: 'Pelunasan otomatis termin tunai (cash)',
      })
      payments.push(autoPay)
    }

    const paymentSummary = derivePaymentStatus(totalAmount, payments)

    return {
      ...createdInvoice,
      supplierName: supp.name,
      supplierTaxType: supp.taxType,
      items: createdItems,
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
    }
  ): Promise<PurchasePayment> {
    const inv = await invoiceRepo.getById(invoiceId)
    if (!inv) throw new Error('Invoice pembelian tidak ditemukan.')

    const allPayments = await paymentRepo.getAll({ limit: 1 })
    const paymentNumber = generateDocumentNumber('PPAY', 'SMA', allPayments.meta.totalItems + 1)

    return paymentRepo.create({
      paymentNumber,
      purchaseInvoiceId: invoiceId,
      paymentDate: payload.paymentDate,
      amount: Math.round(payload.amount),
      paymentMethod: payload.paymentMethod,
      referenceNumber: payload.referenceNumber?.trim() || undefined,
      notes: payload.notes?.trim() || undefined,
    })
  },

  async getSupplierDebtSummary(): Promise<
    Array<{
      supplierId: string
      supplierCode: string
      supplierName: string
      totalInvoices: number
      totalBilled: number
      totalPaid: number
      totalOutstanding: number
    }>
  > {
    const allDetailed = await this.getInvoices({ limit: 1000 })
    const summaryMap = new Map<
      string,
      {
        supplierId: string
        supplierCode: string
        supplierName: string
        totalInvoices: number
        totalBilled: number
        totalPaid: number
        totalOutstanding: number
      }
    >()

    for (const inv of allDetailed.items) {
      const current = summaryMap.get(inv.supplierId) || {
        supplierId: inv.supplierId,
        supplierCode: '',
        supplierName: inv.supplierName,
        totalInvoices: 0,
        totalBilled: 0,
        totalPaid: 0,
        totalOutstanding: 0,
      }

      current.totalInvoices += 1
      current.totalBilled += inv.totalAmount
      current.totalPaid += inv.paymentSummary.totalPaid
      current.totalOutstanding += inv.paymentSummary.remainingBalance
      summaryMap.set(inv.supplierId, current)
    }

    return Array.from(summaryMap.values())
  },
}

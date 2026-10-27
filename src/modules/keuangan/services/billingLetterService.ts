import { InMemoryRepository } from '@/shared/api/inMemoryRepository'
import {
  initialBillingLetters,
  initialBillingLetterItems,
} from '@/shared/api/seed/seedKeuangan'
import { customerService } from '@/modules/customers'
import { salesInvoiceService } from '@/modules/penjualan'
import type { BillingLetter, BillingLetterItem } from '@/shared/types/entity'
import type { QueryParams, PaginatedResult } from '@/shared/types/common'
import { generateDocumentNumber } from '@/shared/utils/numbering'

const blRepo = new InMemoryRepository<BillingLetter>(
  initialBillingLetters,
  'website_customer_billing_letters'
)
const blItemRepo = new InMemoryRepository<BillingLetterItem>(
  initialBillingLetterItems,
  'website_customer_billing_letter_items'
)

export interface BillingLetterWithDetails extends BillingLetter {
  customerName: string
  customerAddress: string
  customerPhone: string
  items: BillingLetterItem[]
}

export const billingLetterService = {
  async getBillingLetters(params: QueryParams = {}): Promise<PaginatedResult<BillingLetterWithDetails>> {
    const rawResult = await blRepo.getAll(params)
    const customers = await customerService.getCustomers({ limit: 1000 })
    const customerMap = new Map(customers.items.map((c) => [c.id, c]))

    const detailed: BillingLetterWithDetails[] = await Promise.all(
      rawResult.items.map(async (bl) => {
        const cust = customerMap.get(bl.customerId)
        const items = (await blItemRepo.getAll({ limit: 1000 })).items.filter(
          (i) => i.billingLetterId === bl.id
        )

        return {
          ...bl,
          customerName: cust?.name || 'Customer Tidak Dikenal',
          customerAddress: cust?.address || '-',
          customerPhone: cust?.phone || '-',
          items,
        }
      })
    )

    return {
      items: detailed,
      meta: {
        ...rawResult.meta,
        totalItems: detailed.length,
      },
    }
  },

  async getBillingLetterById(id: string): Promise<BillingLetterWithDetails | null> {
    const bl = await blRepo.getById(id)
    if (!bl) return null

    const cust = await customerService.getCustomerById(bl.customerId)
    const items = (await blItemRepo.getAll({ limit: 1000 })).items.filter(
      (i) => i.billingLetterId === bl.id
    )

    return {
      ...bl,
      customerName: cust?.name || 'Customer Tidak Dikenal',
      customerAddress: cust?.address || '-',
      customerPhone: cust?.phone || '-',
      items,
    }
  },

  async createBillingLetter(
    payload: {
      customerId: string
      letterDate: string
      invoiceIds: string[]
      notes?: string
    },
    variantCode: string = 'SMA'
  ): Promise<BillingLetterWithDetails> {
    const cust = await customerService.getCustomerById(payload.customerId)
    if (!cust) throw new Error('Customer tidak ditemukan.')

    if (!payload.invoiceIds || payload.invoiceIds.length === 0) {
      throw new Error('Pilih minimal satu invoice yang belum lunas untuk dimasukkan ke surat tagihan.')
    }

    // Retrieve selected invoices and verify they are unpaid
    const allInvoices = await salesInvoiceService.getInvoices({ limit: 1000 })
    const selectedInvoices = allInvoices.items.filter(
      (inv) => payload.invoiceIds.includes(inv.id) && inv.customerId === payload.customerId
    )

    if (selectedInvoices.length === 0) {
      throw new Error('Tidak ada invoice belum lunas yang valid untuk customer ini.')
    }

    const itemsToCreate: Array<Omit<BillingLetterItem, 'id' | 'billingLetterId'>> = []
    let totalOutstanding = 0

    for (const inv of selectedInvoices) {
      const remaining = inv.paymentSummary.remainingBalance
      if (remaining <= 0) {
        continue // skip already paid invoices
      }

      totalOutstanding += remaining
      itemsToCreate.push({
        salesInvoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        originalAmount: inv.totalAmount,
        paidAmount: inv.paymentSummary.totalPaid,
        remainingBalance: remaining,
      })
    }

    if (itemsToCreate.length === 0) {
      throw new Error('Semua invoice yang dipilih telah lunas.')
    }

    const allLetters = await blRepo.getAll({ limit: 1 })
    const letterNumber = generateDocumentNumber('ST', variantCode, allLetters.meta.totalItems + 1)

    const createdLetter = await blRepo.create({
      letterNumber,
      customerId: payload.customerId,
      letterDate: payload.letterDate,
      totalOutstandingAmount: totalOutstanding,
      notes: payload.notes?.trim() || undefined,
    })

    const createdItems: BillingLetterItem[] = []
    for (const itemPayload of itemsToCreate) {
      const createdItem = await blItemRepo.create({
        billingLetterId: createdLetter.id,
        ...itemPayload,
      })
      createdItems.push(createdItem)
    }

    return {
      ...createdLetter,
      customerName: cust.name,
      customerAddress: cust.address,
      customerPhone: cust.phone,
      items: createdItems,
    }
  },

  async getCustomerReceivableSummary(): Promise<
    Array<{
      customerId: string
      customerCode: string
      customerName: string
      totalInvoices: number
      totalBilled: number
      totalPaid: number
      totalOutstanding: number
      unpaidInvoicesCount: number
    }>
  > {
    const allInvoices = await salesInvoiceService.getInvoices({ limit: 1000 })
    const customers = await customerService.getCustomers({ limit: 1000 })

    const summaryMap = new Map<
      string,
      {
        customerId: string
        customerCode: string
        customerName: string
        totalInvoices: number
        totalBilled: number
        totalPaid: number
        totalOutstanding: number
        unpaidInvoicesCount: number
      }
    >()

    for (const cust of customers.items) {
      summaryMap.set(cust.id, {
        customerId: cust.id,
        customerCode: cust.code,
        customerName: cust.name,
        totalInvoices: 0,
        totalBilled: 0,
        totalPaid: 0,
        totalOutstanding: 0,
        unpaidInvoicesCount: 0,
      })
    }

    for (const inv of allInvoices.items) {
      const current = summaryMap.get(inv.customerId)
      if (current) {
        current.totalInvoices += 1
        current.totalBilled += inv.totalAmount
        current.totalPaid += inv.paymentSummary.totalPaid
        current.totalOutstanding += inv.paymentSummary.remainingBalance
        if (inv.paymentSummary.remainingBalance > 0) {
          current.unpaidInvoicesCount += 1
        }
      }
    }

    return Array.from(summaryMap.values())
  },
}

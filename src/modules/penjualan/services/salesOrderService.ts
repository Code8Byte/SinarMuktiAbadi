import { customerService } from '@/modules/customers'
import { getSoItemStrategy } from '../strategies'
import type { SalesOrder, SalesOrderItem, SalesOrderStatus } from '@/shared/types/entity'
import type { QueryParams, PaginatedResult } from '@/shared/types/common'
import { generateDocumentNumber } from '@/shared/utils/numbering'
import { soRepo, soItemRepo, dnRepo, dnItemRepo } from './repositories'

export interface ItemFulfillmentSummary {
  soItem: SalesOrderItem
  orderedQty: number
  deliveredQty: number
  remainingQty: number
  isFulfilled: boolean
}

export interface SalesOrderWithDetails extends SalesOrder {
  customerName: string
  items: SalesOrderItem[]
  fulfillment: {
    items: ItemFulfillmentSummary[]
    isAllFulfilled: boolean
    hasAnyDeliveryNote: boolean
    deliveryNotesCount: number
  }
}

export const salesOrderService = {
  async getSalesOrders(params: QueryParams = {}): Promise<PaginatedResult<SalesOrderWithDetails>> {
    const rawResult = await soRepo.getAll(params)
    const customers = await customerService.getCustomers({ limit: 1000 })
    const customerMap = new Map(customers.items.map((c) => [c.id, c]))

    const detailed: SalesOrderWithDetails[] = await Promise.all(
      rawResult.items.map(async (so) => {
        const cust = customerMap.get(so.customerId)
        const items = (await soItemRepo.getAll({ limit: 1000 })).items.filter(
          (i) => i.salesOrderId === so.id
        )
        const fulfillment = await this.calculateFulfillment(so.id, items)

        return {
          ...so,
          customerName: cust?.name || 'Customer Tidak Dikenal',
          items,
          fulfillment,
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

  async getSalesOrderById(id: string): Promise<SalesOrderWithDetails | null> {
    const so = await soRepo.getById(id)
    if (!so) return null

    const cust = await customerService.getCustomerById(so.customerId)
    const items = (await soItemRepo.getAll({ limit: 1000 })).items.filter(
      (i) => i.salesOrderId === so.id
    )
    const fulfillment = await this.calculateFulfillment(so.id, items)

    return {
      ...so,
      customerName: cust?.name || 'Customer Tidak Dikenal',
      items,
      fulfillment,
    }
  },

  async calculateFulfillment(soId: string, items: SalesOrderItem[]) {
    const allDns = (await dnRepo.getAll({ limit: 1000 })).items.filter(
      (dn) => (dn as { salesOrderId: string; status: string }).salesOrderId === soId && (dn as { status: string }).status !== 'cancelled'
    )
    const dnIds = new Set(allDns.map((dn) => (dn as { id: string }).id))

    const allDnItems = (await dnItemRepo.getAll({ limit: 2000 })).items.filter(
      (dni) => dnIds.has((dni as { deliveryNoteId: string }).deliveryNoteId)
    )

    const deliveredMap = new Map<string, number>()
    for (const dni of allDnItems) {
      const itemRecord = dni as { salesOrderItemId: string; qtyDelivered: number }
      const current = deliveredMap.get(itemRecord.salesOrderItemId) || 0
      deliveredMap.set(itemRecord.salesOrderItemId, current + itemRecord.qtyDelivered)
    }

    const itemsSummary: ItemFulfillmentSummary[] = items.map((it) => {
      const delivered = deliveredMap.get(it.id) || 0
      const remaining = Math.max(0, it.qty - delivered)
      return {
        soItem: it,
        orderedQty: it.qty,
        deliveredQty: delivered,
        remainingQty: remaining,
        isFulfilled: remaining === 0,
      }
    })

    const isAllFulfilled = itemsSummary.length > 0 && itemsSummary.every((i) => i.isFulfilled)

    return {
      items: itemsSummary,
      isAllFulfilled,
      hasAnyDeliveryNote: allDns.length > 0,
      deliveryNotesCount: allDns.length,
    }
  },

  async createSalesOrder(
    payload: {
      customerId: string
      orderDate: string
      notes?: string
      items: Array<{
        barangId: string | null
        itemName: string
        unit: string
        qty: number
        unitPrice: number
      }>
    },
    variantMode: 'catalog' | 'manual',
    variantCode: string = 'SMA'
  ): Promise<SalesOrderWithDetails> {
    const strategy = getSoItemStrategy(variantMode)

    // 1. Check capability rule (e.g. SMA cannot create SO if no barang exists)
    const canCreate = await strategy.canCreateSo()
    if (!canCreate.allowed) {
      throw new Error(canCreate.reason || 'Tidak diizinkan membuat SO.')
    }

    // 2. Validate items using the strategy
    const itemValidation = strategy.validateItems(payload.items)
    if (!itemValidation.valid) {
      throw new Error(itemValidation.error)
    }

    const cust = await customerService.getCustomerById(payload.customerId)
    if (!cust) throw new Error('Customer tidak ditemukan.')

    const totalAmount = payload.items.reduce(
      (acc, it) => acc + Math.round(it.qty * it.unitPrice),
      0
    )

    const allSos = await soRepo.getAll({ limit: 1 })
    const soNumber = generateDocumentNumber('SO', variantCode, allSos.meta.totalItems + 1)

    const createdSo = await soRepo.create({
      soNumber,
      customerId: payload.customerId,
      orderDate: payload.orderDate,
      status: 'open',
      totalAmount,
      notes: payload.notes?.trim() || undefined,
    })

    const createdItems: SalesOrderItem[] = []
    for (const it of payload.items) {
      const createdItem = await soItemRepo.create({
        salesOrderId: createdSo.id,
        barangId: it.barangId,
        itemName: it.itemName.trim(),
        unit: it.unit.trim().toUpperCase(),
        qty: Math.max(1, Math.round(it.qty)),
        unitPrice: Math.round(it.unitPrice),
        totalPrice: Math.round(it.qty * it.unitPrice),
      })
      createdItems.push(createdItem)
    }

    return {
      ...createdSo,
      customerName: cust.name,
      items: createdItems,
      fulfillment: {
        items: createdItems.map((i) => ({
          soItem: i,
          orderedQty: i.qty,
          deliveredQty: 0,
          remainingQty: i.qty,
          isFulfilled: false,
        })),
        isAllFulfilled: false,
        hasAnyDeliveryNote: false,
        deliveryNotesCount: 0,
      },
    }
  },

  async cancelSalesOrder(soId: string): Promise<SalesOrder> {
    const so = await soRepo.getById(soId)
    if (!so) throw new Error('Sales Order tidak ditemukan.')

    // Rule: Cancel is only allowed if no delivery notes exist!
    const allDns = (await dnRepo.getAll({ limit: 1000 })).items.filter(
      (dn) => (dn as { salesOrderId: string; status: string }).salesOrderId === soId && (dn as { status: string }).status !== 'cancelled'
    )
    if (allDns.length > 0) {
      throw new Error('SO tidak dapat dibatalkan karena sudah memiliki surat jalan aktif.')
    }

    return soRepo.update(soId, { status: 'cancel' })
  },

  async updateSoStatus(soId: string, status: SalesOrderStatus): Promise<SalesOrder> {
    return soRepo.update(soId, { status })
  },
}

import { salesOrderService } from './salesOrderService'
import type { DeliveryNote, DeliveryNoteItem } from '@/shared/types/entity'
import type { QueryParams, PaginatedResult } from '@/shared/types/common'
import { generateDocumentNumber } from '@/shared/utils/numbering'
import { dnRepo, dnItemRepo } from './repositories'

export interface CreateDeliveryNotePayload {
  salesOrderId: string
  deliveryDate: string
  recipientName: string
  vehiclePlate: string
  driverName: string
  notes?: string
  items: Array<{
    salesOrderItemId: string
    qtyDelivered: number
  }>
}

export interface DeliveryNoteWithDetails extends DeliveryNote {
  soNumber: string
  customerName: string
  items: Array<DeliveryNoteItem & { itemName: string; unit: string }>
}

export const deliveryNoteService = {
  async getDeliveryNotes(params: QueryParams = {}): Promise<PaginatedResult<DeliveryNoteWithDetails>> {
    const rawResult = await dnRepo.getAll(params)
    const detailed: DeliveryNoteWithDetails[] = await Promise.all(
      rawResult.items.map(async (dn) => {
        const so = await salesOrderService.getSalesOrderById(dn.salesOrderId)
        const allDnItems = (await dnItemRepo.getAll({ limit: 1000 })).items.filter(
          (dni) => dni.deliveryNoteId === dn.id
        )

        const itemsWithDetails = allDnItems.map((dni) => {
          const soItem = so?.items.find((it) => it.id === dni.salesOrderItemId)
          return {
            ...dni,
            itemName: soItem?.itemName || 'Item',
            unit: soItem?.unit || 'UNIT',
          }
        })

        return {
          ...dn,
          soNumber: so?.soNumber || '-',
          customerName: so?.customerName || '-',
          items: itemsWithDetails,
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

  async getDeliveryNoteById(id: string): Promise<DeliveryNoteWithDetails | null> {
    const dn = await dnRepo.getById(id)
    if (!dn) return null

    const so = await salesOrderService.getSalesOrderById(dn.salesOrderId)
    const allDnItems = (await dnItemRepo.getAll({ limit: 1000 })).items.filter(
      (dni) => dni.deliveryNoteId === dn.id
    )

    const itemsWithDetails = allDnItems.map((dni) => {
      const soItem = so?.items.find((it) => it.id === dni.salesOrderItemId)
      return {
        ...dni,
        itemName: soItem?.itemName || 'Item',
        unit: soItem?.unit || 'UNIT',
      }
    })

    return {
      ...dn,
      soNumber: so?.soNumber || '-',
      customerName: so?.customerName || '-',
      items: itemsWithDetails,
    }
  },

  async createDeliveryNote(
    payload: CreateDeliveryNotePayload,
    variantCode: string = 'SMA'
  ): Promise<DeliveryNoteWithDetails> {
    const so = await salesOrderService.getSalesOrderById(payload.salesOrderId)
    if (!so) throw new Error('Sales Order tidak ditemukan.')

    if (so.status === 'cancel') {
      throw new Error('Tidak dapat membuat surat jalan untuk SO yang telah dibatalkan.')
    }
    if (so.status === 'close') {
      throw new Error('Sales Order ini sudah selesai (close).')
    }

    if (!payload.items || payload.items.length === 0) {
      throw new Error('Surat jalan harus memuat minimal 1 item pengiriman.')
    }

    // STRICT BUSINESS RULE: Delivery quantity cannot exceed SO remaining quantity
    for (const it of payload.items) {
      const targetSummary = so.fulfillment.items.find((s) => s.soItem.id === it.salesOrderItemId)
      if (!targetSummary) {
        throw new Error('Item pengiriman tidak ditemukan dalam daftar pesanan SO.')
      }

      if (it.qtyDelivered <= 0) {
        continue // skip 0 deliveries if in multi-item form
      }

      if (it.qtyDelivered > targetSummary.remainingQty) {
        throw new Error(
          `Kuantitas kirim '${targetSummary.soItem.itemName}' (${it.qtyDelivered}) melebihi sisa pesanan yang dapat dikirim (${targetSummary.remainingQty}).`
        )
      }
    }

    const activeDeliveredItems = payload.items.filter((i) => i.qtyDelivered > 0)
    if (activeDeliveredItems.length === 0) {
      throw new Error('Minimal harus ada satu item dengan kuantitas kirim lebih dari 0.')
    }

    const allDns = await dnRepo.getAll({ limit: 1 })
    const deliveryNumber = generateDocumentNumber('SJ', variantCode, allDns.meta.totalItems + 1)

    const createdDn = await dnRepo.create({
      deliveryNumber,
      salesOrderId: payload.salesOrderId,
      deliveryDate: payload.deliveryDate,
      recipientName: payload.recipientName.trim(),
      vehiclePlate: payload.vehiclePlate.trim().toUpperCase(),
      driverName: payload.driverName.trim(),
      status: 'delivered',
      notes: payload.notes?.trim() || undefined,
    })

    const createdItems: Array<DeliveryNoteItem & { itemName: string; unit: string }> = []
    for (const it of activeDeliveredItems) {
      const createdItem = await dnItemRepo.create({
        deliveryNoteId: createdDn.id,
        salesOrderItemId: it.salesOrderItemId,
        qtyDelivered: Math.round(it.qtyDelivered),
      })
      const soItem = so.items.find((s) => s.id === it.salesOrderItemId)
      createdItems.push({
        ...createdItem,
        itemName: soItem?.itemName || 'Item',
        unit: soItem?.unit || 'UNIT',
      })
    }

    // Check if SO is now completely fulfilled, auto-close if so
    const updatedFulfillment = await salesOrderService.calculateFulfillment(so.id, so.items)
    if (updatedFulfillment.isAllFulfilled) {
      await salesOrderService.updateSoStatus(so.id, 'close')
    }

    return {
      ...createdDn,
      soNumber: so.soNumber,
      customerName: so.customerName,
      items: createdItems,
    }
  },
}

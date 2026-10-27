import { describe, it, expect, beforeEach } from 'vitest'
import { salesOrderService } from '@/modules/penjualan/services/salesOrderService'
import { deliveryNoteService } from '@/modules/penjualan/services/deliveryNoteService'
import { getSoItemStrategy } from '@/modules/penjualan/strategies'

describe('Penjualan Module (Fase 4: SO, Surat Jalan, Strategy)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('SO Item Strategies (SMA vs ST)', () => {
    it('SMA Catalog Strategy validates catalog barang existence', async () => {
      const strategy = getSoItemStrategy('catalog')
      const capability = await strategy.canCreateSo()
      expect(capability.allowed).toBe(true)

      // Rejects item without barangId
      const validation = strategy.validateItems([
        {
          barangId: null,
          itemName: 'Item Tanpa Master',
          unit: 'PCS',
          qty: 10,
          unitPrice: 50000,
        },
      ])
      expect(validation.valid).toBe(false)
      expect(validation.error).toMatch(/katalog master/)
    })

    it('ST Manual Strategy accepts manually typed items without barangId', async () => {
      const strategy = getSoItemStrategy('manual')
      const capability = await strategy.canCreateSo()
      expect(capability.allowed).toBe(true)

      const validation = strategy.validateItems([
        {
          barangId: null,
          itemName: 'Besi Pipa Khusus Pesanan Manual',
          unit: 'LONJOR',
          qty: 15,
          unitPrice: 75000,
        },
      ])
      expect(validation.valid).toBe(true)
    })
  })

  describe('Delivery Note (Surat Jalan) Allocation Rules', () => {
    it('strictly forbids delivering more quantity than ordered in SO', async () => {
      // Create a fresh SO for 100 units
      const so = await salesOrderService.createSalesOrder(
        {
          customerId: 'cust-1',
          orderDate: '2026-02-01',
          items: [
            {
              barangId: 'brg-1',
              itemName: 'Besi Beton Ulir',
              unit: 'BATANG',
              qty: 100,
              unitPrice: 100000,
            },
          ],
        },
        'catalog',
        'SMA'
      )

      const targetItemId = so.items[0].id

      // Attempting to deliver 150 (exceeds 100) must throw
      await expect(
        deliveryNoteService.createDeliveryNote(
          {
            salesOrderId: so.id,
            deliveryDate: '2026-02-02',
            recipientName: 'Pak Joko',
            vehiclePlate: 'B 1234 CD',
            driverName: 'Sopir A',
            items: [{ salesOrderItemId: targetItemId, qtyDelivered: 150 }],
          },
          'SMA'
        )
      ).rejects.toThrow(/melebihi sisa pesanan/)
    })

    it('supports multiple phased delivery notes and auto-closes SO when complete', async () => {
      // Create SO with 50 units
      const so = await salesOrderService.createSalesOrder(
        {
          customerId: 'cust-1',
          orderDate: '2026-02-01',
          items: [
            {
              barangId: 'brg-1',
              itemName: 'Besi Beton Ulir D13',
              unit: 'BATANG',
              qty: 50,
              unitPrice: 100000,
            },
          ],
        },
        'catalog',
        'SMA'
      )
      const itemId = so.items[0].id

      // Phase 1: Deliver 30 units
      const dn1 = await deliveryNoteService.createDeliveryNote(
        {
          salesOrderId: so.id,
          deliveryDate: '2026-02-02',
          recipientName: 'Gudang Proyek',
          vehiclePlate: 'B 1234 CD',
          driverName: 'Sopir 1',
          items: [{ salesOrderItemId: itemId, qtyDelivered: 30 }],
        },
        'SMA'
      )
      expect(dn1.items[0].qtyDelivered).toBe(30)

      // SO status should still be 'open'
      const check1 = await salesOrderService.getSalesOrderById(so.id)
      expect(check1?.status).toBe('open')
      expect(check1?.fulfillment.items[0].remainingQty).toBe(20)

      // Phase 2: Deliver remaining 20 units
      await deliveryNoteService.createDeliveryNote(
        {
          salesOrderId: so.id,
          deliveryDate: '2026-02-03',
          recipientName: 'Gudang Proyek',
          vehiclePlate: 'B 5678 EF',
          driverName: 'Sopir 2',
          items: [{ salesOrderItemId: itemId, qtyDelivered: 20 }],
        },
        'SMA'
      )

      // SO status must now automatically be 'close'
      const check2 = await salesOrderService.getSalesOrderById(so.id)
      expect(check2?.status).toBe('close')
      expect(check2?.fulfillment.isAllFulfilled).toBe(true)
      expect(check2?.fulfillment.items[0].remainingQty).toBe(0)
    })

    it('prevents SO cancellation if delivery notes have already been created', async () => {
      // dn-1 is already attached to so-1 in seed
      await expect(salesOrderService.cancelSalesOrder('so-1')).rejects.toThrow(
        /sudah memiliki surat jalan/
      )
    })
  })
})

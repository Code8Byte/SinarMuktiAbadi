import { describe, it, expect, beforeEach } from 'vitest'
import { userService } from '@/modules/users/services/userService'
import { customerService } from '@/modules/customers/services/customerService'
import { supplierService } from '@/modules/suppliers/services/supplierService'
import { barangService } from '@/modules/barang/services/barangService'

describe('Master Data Services (Fase 2)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('userService', () => {
    it('returns list of users with pagination', async () => {
      const res = await userService.getUsers()
      expect(res.items.length).toBeGreaterThan(0)
      expect(res.meta.totalItems).toBeGreaterThan(0)
    })

    it('creates a new user successfully and prevents duplicate username', async () => {
      const newUser = await userService.createUser({
        username: 'staffbaru',
        name: 'Staff Baru Test',
        email: 'staffbaru@test.com',
        role: 'staf_penjualan',
        isActive: true,
      })
      expect(newUser.id).toBeDefined()
      expect(newUser.username).toBe('staffbaru')

      // Attempt duplicate username
      await expect(
        userService.createUser({
          username: 'staffbaru',
          name: 'Duplikat',
          email: 'dup@test.com',
          role: 'viewer',
          isActive: true,
        })
      ).rejects.toThrow('sudah digunakan')
    })
  })

  describe('customerService', () => {
    it('creates and finds customer by search term', async () => {
      const created = await customerService.createCustomer({
        code: 'CUST-TEST-99',
        name: 'PT Percobaan Solusi',
        phone: '08123456789',
        address: 'Jl. Percobaan No. 99',
      })
      expect(created.id).toBeDefined()

      const searchRes = await customerService.getCustomers({ search: 'Percobaan' })
      expect(searchRes.items.some((c) => c.code === 'CUST-TEST-99')).toBe(true)
    })

    it('updates customer details', async () => {
      const list = await customerService.getCustomers()
      const target = list.items[0]
      const updated = await customerService.updateCustomer(target.id, {
        notes: 'Catatan diperbarui untuk tes',
      })
      expect(updated.notes).toBe('Catatan diperbarui untuk tes')
    })
  })

  describe('supplierService', () => {
    it('creates supplier with ppn tax type', async () => {
      const supp = await supplierService.createSupplier({
        code: 'SUPP-TEST',
        name: 'PT Vendor Baja',
        phone: '021-998877',
        address: 'Kawasan Industri',
        taxType: 'ppn',
      })
      expect(supp.taxType).toBe('ppn')
    })
  })

  describe('barangService', () => {
    it('verifies catalog availability via hasAnyBarang', async () => {
      const hasBarang = await barangService.hasAnyBarang()
      expect(hasBarang).toBe(true)
    })

    it('creates new barang with SKU', async () => {
      const created = await barangService.createBarang({
        sku: 'BRG-TEST-99',
        name: 'Besi Ulir Khusus D16',
        unit: 'BATANG',
        category: 'Baja & Besi',
        isActive: true,
      })
      expect(created.sku).toBe('BRG-TEST-99')

      const found = await barangService.getBarangById(created.id)
      expect(found?.name).toBe('Besi Ulir Khusus D16')
    })
  })
})

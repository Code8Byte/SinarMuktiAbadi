import { InMemoryRepository } from '@/shared/api/inMemoryRepository'
import { initialBarang } from '@/shared/api/seed/seedBarang'
import type { Barang } from '@/shared/types/entity'
import type { QueryParams, PaginatedResult } from '@/shared/types/common'

const barangRepo = new InMemoryRepository<Barang>(initialBarang, 'website_customer_barang')

export const barangService = {
  async getBarang(params?: QueryParams): Promise<PaginatedResult<Barang>> {
    return barangRepo.getAll(params)
  },

  async getBarangById(id: string): Promise<Barang | null> {
    return barangRepo.getById(id)
  },

  async createBarang(payload: Omit<Barang, 'id' | 'createdAt'>): Promise<Barang> {
    return barangRepo.create(payload)
  },

  async updateBarang(id: string, payload: Partial<Barang>): Promise<Barang> {
    return barangRepo.update(id, payload)
  },

  async deleteBarang(id: string): Promise<boolean> {
    return barangRepo.delete(id)
  },

  async hasAnyBarang(): Promise<boolean> {
    const res = await barangRepo.getAll({ limit: 1 })
    return res.meta.totalItems > 0
  },
}

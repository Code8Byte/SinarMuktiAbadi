import { InMemoryRepository } from '@/shared/api/inMemoryRepository'
import { initialSuppliers } from '@/shared/api/seed/seedSuppliers'
import type { Supplier } from '@/shared/types/entity'
import type { QueryParams, PaginatedResult } from '@/shared/types/common'

const supplierRepo = new InMemoryRepository<Supplier>(initialSuppliers, 'website_customer_suppliers')

export const supplierService = {
  async getSuppliers(params?: QueryParams): Promise<PaginatedResult<Supplier>> {
    return supplierRepo.getAll(params)
  },

  async getSupplierById(id: string): Promise<Supplier | null> {
    return supplierRepo.getById(id)
  },

  async createSupplier(payload: Omit<Supplier, 'id' | 'createdAt'>): Promise<Supplier> {
    return supplierRepo.create(payload)
  },

  async updateSupplier(id: string, payload: Partial<Supplier>): Promise<Supplier> {
    return supplierRepo.update(id, payload)
  },

  async deleteSupplier(id: string): Promise<boolean> {
    return supplierRepo.delete(id)
  },
}

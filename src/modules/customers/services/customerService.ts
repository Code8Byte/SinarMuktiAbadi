import { InMemoryRepository } from '@/shared/api/inMemoryRepository'
import { initialCustomers } from '@/shared/api/seed/seedCustomers'
import type { Customer } from '@/shared/types/entity'
import type { QueryParams, PaginatedResult } from '@/shared/types/common'

const customerRepo = new InMemoryRepository<Customer>(initialCustomers, 'website_customer_customers')

export const customerService = {
  async getCustomers(params?: QueryParams): Promise<PaginatedResult<Customer>> {
    return customerRepo.getAll(params)
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    return customerRepo.getById(id)
  },

  async createCustomer(payload: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    return customerRepo.create(payload)
  },

  async updateCustomer(id: string, payload: Partial<Customer>): Promise<Customer> {
    return customerRepo.update(id, payload)
  },

  async deleteCustomer(id: string): Promise<boolean> {
    return customerRepo.delete(id)
  },
}

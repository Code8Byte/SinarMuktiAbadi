import type { QueryParams, PaginatedResult } from '@/shared/types/common'

export interface IRepository<T extends { id: string }> {
  getAll(params?: QueryParams): Promise<PaginatedResult<T>>
  getById(id: string): Promise<T | null>
  create(payload: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>
  update(id: string, payload: Partial<T>): Promise<T>
  delete(id: string): Promise<boolean>
}

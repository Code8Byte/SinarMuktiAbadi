import type { IRepository } from './repository.interface'
import type { QueryParams, PaginatedResult } from '@/shared/types/common'

export class InMemoryRepository<T extends { id: string; createdAt?: string; updatedAt?: string }>
  implements IRepository<T>
{
  private items: T[] = []
  private storageKey?: string

  constructor(seedData: T[] = [], storageKey?: string) {
    this.storageKey = storageKey
    if (this.storageKey) {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        try {
          this.items = JSON.parse(stored)
          return
        } catch {
          // fallback to seed
        }
      }
    }
    this.items = [...seedData]
    this.save()
  }

  private save(): void {
    if (this.storageKey) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items))
    }
  }

  async getAll(params: QueryParams = {}): Promise<PaginatedResult<T>> {
    let result = [...this.items]

    // 1. Search (scans all string fields)
    if (params.search && params.search.trim()) {
      const query = params.search.toLowerCase().trim()
      result = result.filter((item) =>
        Object.values(item).some((val) =>
          typeof val === 'string' && val.toLowerCase().includes(query)
        )
      )
    }

    // 2. Custom Filters
    if (params.filters) {
      for (const [key, filterVal] of Object.entries(params.filters)) {
        if (filterVal !== undefined && filterVal !== null && filterVal !== '') {
          result = result.filter((item) => (item as Record<string, unknown>)[key] === filterVal)
        }
      }
    }

    // 3. Sorting
    if (params.sortBy) {
      const field = params.sortBy as keyof T
      const order = params.sortOrder === 'desc' ? -1 : 1
      result.sort((a, b) => {
        const valA = a[field]
        const valB = b[field]
        if (valA === valB) return 0
        if (valA === undefined || valA === null) return 1
        if (valB === undefined || valB === null) return -1
        return valA > valB ? order : -order
      })
    }

    // 4. Pagination
    const page = Math.max(1, params.page || 1)
    const limit = Math.max(1, params.limit || 10)
    const totalItems = result.length
    const totalPages = Math.ceil(totalItems / limit) || 1
    const offset = (page - 1) * limit
    const paginatedItems = result.slice(offset, offset + limit)

    return {
      items: paginatedItems,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    }
  }

  async getById(id: string): Promise<T | null> {
    const found = this.items.find((item) => item.id === id)
    return found ? { ...found } : null
  }

  async create(payload: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const now = new Date().toISOString()
    const id = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    const created = {
      ...payload,
      id,
      createdAt: now,
      updatedAt: now,
    } as unknown as T

    this.items.unshift(created)
    this.save()
    return { ...created }
  }

  async update(id: string, payload: Partial<T>): Promise<T> {
    const index = this.items.findIndex((item) => item.id === id)
    if (index === -1) {
      throw new Error(`Item dengan ID '${id}' tidak ditemukan.`)
    }
    const updated = {
      ...this.items[index],
      ...payload,
      updatedAt: new Date().toISOString(),
    }
    this.items[index] = updated
    this.save()
    return { ...updated }
  }

  async delete(id: string): Promise<boolean> {
    const index = this.items.findIndex((item) => item.id === id)
    if (index === -1) return false
    this.items.splice(index, 1)
    this.save()
    return true
  }

  // Helper for tests/resetting
  reset(seedData: T[] = []): void {
    this.items = [...seedData]
    this.save()
  }
}

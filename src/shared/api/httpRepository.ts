import type { IRepository } from './repository.interface'
import type { QueryParams, PaginatedResult } from '@/shared/types/common'
import { httpClient, type HttpClient } from './httpClient'

export class HttpRepository<T extends { id: string }> implements IRepository<T> {
  constructor(
    private resourceEndpoint: string,
    private client: HttpClient = httpClient
  ) {}

  async getAll(params: QueryParams = {}): Promise<PaginatedResult<T>> {
    const queryParams: Record<string, string | number | boolean | undefined> = {
      page: params.page,
      limit: params.limit,
      search: params.search,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      ...params.filters,
    }

    return this.client.get<PaginatedResult<T>>(this.resourceEndpoint, queryParams)
  }

  async getById(id: string): Promise<T | null> {
    try {
      return await this.client.get<T>(`${this.resourceEndpoint}/${id}`)
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'status' in err && (err as { status: number }).status === 404) {
        return null
      }
      throw err
    }
  }

  async create(payload: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    return this.client.post<T>(this.resourceEndpoint, payload)
  }

  async update(id: string, payload: Partial<T>): Promise<T> {
    return this.client.put<T>(`${this.resourceEndpoint}/${id}`, payload)
  }

  async delete(id: string): Promise<boolean> {
    await this.client.delete(`${this.resourceEndpoint}/${id}`)
    return true
  }
}

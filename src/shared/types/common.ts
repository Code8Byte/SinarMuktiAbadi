export interface PaginationMeta {
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

export interface PaginatedResult<T> {
  items: T[]
  meta: PaginationMeta
}

export interface QueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters?: Record<string, unknown>
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  meta?: PaginationMeta
  error?: {
    code: string
    message: string
    details?: unknown
  }
}

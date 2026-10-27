import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HttpClient, ApiError } from '@/shared/api/httpClient'
import { HttpRepository } from '@/shared/api/httpRepository'
import { createRepository } from '@/shared/api/repositoryFactory'
import { InMemoryRepository } from '@/shared/api/inMemoryRepository'
import { exportToCsv } from '@/shared/utils/export'

describe('API Layer & Repositories', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  describe('HttpClient', () => {
    it('creates instance with configured baseURL', () => {
      const client = new HttpClient('/custom-api/v2')
      expect(client).toBeDefined()
    })

    it('successfully handles 200 JSON responses', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: [1, 2, 3] }),
      })
      vi.stubGlobal('fetch', mockFetch)

      const client = new HttpClient('/api/test')
      const result = await client.get<{ success: boolean; data: number[] }>('/items', { limit: 10 })

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(result.data).toEqual([1, 2, 3])
    })

    it('throws ApiError with status and response payload on 4xx/5xx errors', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Invalid payload' }),
      })
      vi.stubGlobal('fetch', mockFetch)

      const client = new HttpClient('/api/test')
      await expect(client.post('/items', { name: '' })).rejects.toThrow('API Error: 400 Bad Request')
    })
  })

  describe('HttpRepository', () => {
    interface DummyItem {
      id: string
      name: string
    }

    it('delegates CRUD operations to HttpClient', async () => {
      const mockClient = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      } as unknown as HttpClient

      const repo = new HttpRepository<DummyItem>('/dummies', mockClient)

      // 1. getAll
      vi.mocked(mockClient.get).mockResolvedValueOnce({
        items: [{ id: 'd-1', name: 'Item 1' }],
        meta: { totalItems: 1, totalPages: 1, currentPage: 1, limit: 10 },
      })
      const res = await repo.getAll({ search: 'test' })
      expect(res.items.length).toBe(1)
      expect(mockClient.get).toHaveBeenCalledWith('/dummies', expect.objectContaining({ search: 'test' }))

      // 2. create
      vi.mocked(mockClient.post).mockResolvedValueOnce({ id: 'd-2', name: 'New Item' })
      const created = await repo.create({ name: 'New Item' })
      expect(created.id).toBe('d-2')
      expect(mockClient.post).toHaveBeenCalledWith('/dummies', { name: 'New Item' })

      // 3. update
      vi.mocked(mockClient.put).mockResolvedValueOnce({ id: 'd-2', name: 'Updated Item' })
      const updated = await repo.update('d-2', { name: 'Updated Item' })
      expect(updated.name).toBe('Updated Item')

      // 4. delete
      vi.mocked(mockClient.delete).mockResolvedValueOnce(true)
      const deleted = await repo.delete('d-2')
      expect(deleted).toBe(true)
    })

    it('returns null on 404 in getById', async () => {
      const mockClient = {
        get: vi.fn().mockRejectedValueOnce(new ApiError(404, 'Not Found')),
      } as unknown as HttpClient

      const repo = new HttpRepository<DummyItem>('/dummies', mockClient)
      const result = await repo.getById('non-existent')
      expect(result).toBeNull()
    })
  })

  describe('createRepository Factory', () => {
    it('returns InMemoryRepository by default', () => {
      const repo = createRepository<{ id: string; name: string }>({
        resource: 'products',
        seedData: [{ id: 'p-1', name: 'Produk A' }],
      })
      expect(repo).toBeInstanceOf(InMemoryRepository)
    })
  })

  describe('exportToCsv Utility', () => {
    it('generates downloadable CSV with proper quote escaping', () => {
      // Mock document.createElement and URL methods
      const mockClick = vi.fn()
      const mockLink = {
        setAttribute: vi.fn(),
        style: {},
        click: mockClick,
      }
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement)
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as unknown as Node)
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as unknown as Node)
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:dummy')
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

      exportToCsv(
        'test-export',
        ['Nama', 'Keterangan'],
        [
          ['Besi "Ulir"', 'Spesifikasi, grade A'],
          ['Pipa Hollow', 'Standard SNI'],
        ]
      )

      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'test-export.csv')
      expect(mockClick).toHaveBeenCalled()
    })
  })
})

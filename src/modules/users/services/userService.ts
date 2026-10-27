import { InMemoryRepository } from '@/shared/api/inMemoryRepository'
import { initialUsers } from '@/shared/api/seed/seedUsers'
import type { User } from '@/shared/types/entity'
import type { QueryParams, PaginatedResult } from '@/shared/types/common'

const userRepo = new InMemoryRepository<User>(initialUsers, 'website_customer_users')

export const userService = {
  async getUsers(params?: QueryParams): Promise<PaginatedResult<User>> {
    return userRepo.getAll(params)
  },

  async getUserById(id: string): Promise<User | null> {
    return userRepo.getById(id)
  },

  async createUser(payload: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    // Validate uniqueness of username
    const existing = await userRepo.getAll({ search: payload.username })
    const duplicate = existing.items.find(
      (u) => u.username.toLowerCase() === payload.username.toLowerCase()
    )
    if (duplicate) {
      throw new Error(`Username '${payload.username}' sudah digunakan.`)
    }
    return userRepo.create(payload)
  },

  async updateUser(id: string, payload: Partial<User>): Promise<User> {
    if (payload.username) {
      const existing = await userRepo.getAll({ search: payload.username })
      const duplicate = existing.items.find(
        (u) => u.username.toLowerCase() === payload.username?.toLowerCase() && u.id !== id
      )
      if (duplicate) {
        throw new Error(`Username '${payload.username}' sudah digunakan oleh pengguna lain.`)
      }
    }
    return userRepo.update(id, payload)
  },

  async toggleUserActive(id: string, active: boolean): Promise<User> {
    return userRepo.update(id, { isActive: active })
  },
}

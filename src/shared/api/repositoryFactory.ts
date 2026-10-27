import type { IRepository } from './repository.interface'
import { InMemoryRepository } from './inMemoryRepository'
import { HttpRepository } from './httpRepository'

export interface RepositoryOptions<T> {
  resource: string
  seedData?: T[]
  storageKey?: string
}

export function createRepository<T extends { id: string }>(
  options: RepositoryOptions<T>
): IRepository<T> {
  const driver = (import.meta.env.VITE_API_DRIVER as string) || 'in-memory'

  if (driver === 'http') {
    return new HttpRepository<T>(options.resource)
  }

  return new InMemoryRepository<T>(options.seedData || [], options.storageKey || `repo_${options.resource}`)
}

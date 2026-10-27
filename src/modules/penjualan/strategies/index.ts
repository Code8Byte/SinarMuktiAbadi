import type { SoItemStrategy } from './soItemStrategy.interface'
import { CatalogItemStrategy } from './catalogItemStrategy'
import { ManualItemStrategy } from './manualItemStrategy'

export * from './soItemStrategy.interface'
export * from './catalogItemStrategy'
export * from './manualItemStrategy'

export function getSoItemStrategy(mode: 'catalog' | 'manual'): SoItemStrategy {
  return mode === 'manual' ? new ManualItemStrategy() : new CatalogItemStrategy()
}

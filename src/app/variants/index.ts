import type { VariantConfig, VariantId } from './types'
import { smaConfig } from './sma.config'
import { stConfig } from './st.config'

export * from './types'

export function getVariantId(): VariantId {
  const envVariant = import.meta.env.VITE_APP_VARIANT as string | undefined
  return envVariant === 'st' ? 'st' : 'sma'
}

export function getActiveVariantConfig(): VariantConfig {
  const variant = getVariantId()
  return variant === 'st' ? stConfig : smaConfig
}

export const activeVariant: VariantConfig = getActiveVariantConfig()

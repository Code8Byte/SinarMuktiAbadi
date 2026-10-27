import { activeVariant, type VariantConfig } from '@/app/variants'

export function useVariantConfig(): {
  config: VariantConfig
  isModuleEnabled: (moduleId: string) => boolean
} {
  function isModuleEnabled(moduleId: string): boolean {
    return activeVariant.enabledModules.includes(moduleId as never)
  }

  return {
    config: activeVariant,
    isModuleEnabled,
  }
}

import { useAuthStore } from '@/modules/auth/stores/authStore'
import type { PermissionId } from '@/app/auth/permissions'

export function usePermission() {
  const authStore = useAuthStore()

  function can(permission: PermissionId): boolean {
    return authStore.hasPermission(permission)
  }

  function canAll(permissions: PermissionId[]): boolean {
    return permissions.every((p) => authStore.hasPermission(p))
  }

  function canAny(permissions: PermissionId[]): boolean {
    return permissions.some((p) => authStore.hasPermission(p))
  }

  return {
    can,
    canAll,
    canAny,
    permissions: authStore.permissions,
  }
}

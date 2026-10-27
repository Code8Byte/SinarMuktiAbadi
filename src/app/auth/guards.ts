import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/modules/auth/stores/authStore'
import type { PermissionId } from './permissions'

export async function authNavigationGuard(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
): Promise<void> {
  const authStore = useAuthStore()

  // 1. Allow public routes
  if (to.meta.public) {
    if (authStore.isAuthenticated && to.path === '/login') {
      next('/dashboard')
      return
    }
    next()
    return
  }

  // 2. Check authentication
  if (!authStore.isAuthenticated) {
    next({
      path: '/login',
      query: { redirect: to.fullPath !== '/dashboard' ? to.fullPath : undefined },
    })
    return
  }

  // 3. Check route permissions
  const requiredPermissions = (to.meta.permissions as PermissionId[] | undefined) || []
  if (requiredPermissions.length > 0) {
    const hasAll = requiredPermissions.every((perm) => authStore.hasPermission(perm))
    if (!hasAll) {
      next('/403')
      return
    }
  }

  next()
}

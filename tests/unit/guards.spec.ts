import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { authNavigationGuard } from '@/app/auth/guards'
import { useAuthStore, DEMO_USERS } from '@/modules/auth/stores/authStore'
import type { RouteLocationNormalized } from 'vue-router'

describe('authNavigationGuard RBAC and access control', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  function mockRoute(overrides: Partial<RouteLocationNormalized>): RouteLocationNormalized {
    return {
      path: '/test',
      fullPath: '/test',
      name: 'Test',
      params: {},
      query: {},
      hash: '',
      matched: [],
      meta: {},
      redirectedFrom: undefined,
      ...overrides,
    } as RouteLocationNormalized
  }

  it('allows public routes when unauthenticated', async () => {
    const to = mockRoute({ path: '/login', meta: { public: true } })
    const from = mockRoute({ path: '/' })
    const next = vi.fn()

    await authNavigationGuard(to, from, next)
    expect(next).toHaveBeenCalledWith()
  })

  it('redirects unauthenticated users to /login for protected routes', async () => {
    const to = mockRoute({ path: '/penjualan/so', fullPath: '/penjualan/so', meta: {} })
    const from = mockRoute({ path: '/' })
    const next = vi.fn()

    await authNavigationGuard(to, from, next)
    expect(next).toHaveBeenCalledWith({
      path: '/login',
      query: { redirect: '/penjualan/so' },
    })
  })

  it('redirects unauthorized user to /403 if permission is missing', async () => {
    const authStore = useAuthStore()
    // Login as viewer (viewer has no 'users.create' permission)
    authStore.user = DEMO_USERS.viewer
    authStore.token = 'mock-viewer-token'

    const to = mockRoute({
      path: '/users/create',
      meta: { permissions: ['users.create'] },
    })
    const from = mockRoute({ path: '/dashboard' })
    const next = vi.fn()

    await authNavigationGuard(to, from, next)
    expect(next).toHaveBeenCalledWith('/403')
  })

  it('allows user with proper permission to proceed', async () => {
    const authStore = useAuthStore()
    // Login as admin
    authStore.user = DEMO_USERS.admin
    authStore.token = 'mock-admin-token'

    const to = mockRoute({
      path: '/users',
      meta: { permissions: ['users.view'] },
    })
    const from = mockRoute({ path: '/dashboard' })
    const next = vi.fn()

    await authNavigationGuard(to, from, next)
    expect(next).toHaveBeenCalledWith()
  })
})

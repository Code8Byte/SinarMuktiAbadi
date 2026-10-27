import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RoleId } from '@/app/auth/roles'
import { ROLE_PERMISSIONS, type PermissionId } from '@/app/auth/permissions'
import {
  getStoredUser,
  getStoredToken,
  setStoredSession,
  clearStoredSession,
  type SessionUser,
} from '@/app/auth/session'

export const DEMO_USERS: Record<string, SessionUser> = {
  owner: {
    id: 'usr-1',
    username: 'owner',
    name: 'Budi Santoso (Owner)',
    role: 'owner',
    email: 'owner@sinarmukti.com',
  },
  admin: {
    id: 'usr-2',
    username: 'admin',
    name: 'Ahmad Fauzi (Admin)',
    role: 'admin',
    email: 'admin@sinarmukti.com',
  },
  sales: {
    id: 'usr-3',
    username: 'sales',
    name: 'Dewi Lestari (Sales)',
    role: 'staf_penjualan',
    email: 'sales@sinarmukti.com',
  },
  purchasing: {
    id: 'usr-4',
    username: 'purchasing',
    name: 'Hendra Setiawan (Purchasing)',
    role: 'staf_pembelian',
    email: 'purchasing@sinarmukti.com',
  },
  finance: {
    id: 'usr-5',
    username: 'finance',
    name: 'Siti Rahma (Finance)',
    role: 'keuangan',
    email: 'finance@sinarmukti.com',
  },
  viewer: {
    id: 'usr-6',
    username: 'viewer',
    name: 'Agus Gunawan (Viewer)',
    role: 'viewer',
    email: 'viewer@sinarmukti.com',
  },
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<SessionUser | null>(getStoredUser())
  const token = ref<string | null>(getStoredToken())

  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const currentRole = computed<RoleId | null>(() => user.value?.role ?? null)

  const permissions = computed<readonly PermissionId[]>(() => {
    if (!user.value) return []
    return ROLE_PERMISSIONS[user.value.role] || []
  })

  function hasPermission(permission: PermissionId): boolean {
    if (!user.value) return false
    return permissions.value.includes(permission)
  }

  async function login(usernameInput: string, _passwordInput: string): Promise<boolean> {
    const matched = DEMO_USERS[usernameInput.toLowerCase()]
    if (!matched) {
      throw new Error('Username tidak ditemukan. Coba: owner, admin, sales, purchasing, finance, atau viewer.')
    }

    const mockToken = `mock-token-${matched.id}-${Date.now()}`
    user.value = matched
    token.value = mockToken
    setStoredSession(matched, mockToken)
    return true
  }

  function logout(): void {
    user.value = null
    token.value = null
    clearStoredSession()
  }

  return {
    user,
    token,
    isAuthenticated,
    currentRole,
    permissions,
    hasPermission,
    login,
    logout,
  }
})

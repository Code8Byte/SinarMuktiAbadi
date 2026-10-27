import type { RoleId } from './roles'

export interface SessionUser {
  id: string
  username: string
  name: string
  role: RoleId
  email: string
}

const SESSION_KEY = 'website_customer_session_user'
const TOKEN_KEY = 'website_customer_auth_token'

export function getStoredUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SessionUser
  } catch {
    return null
  }
}

export function setStoredSession(user: SessionUser, token: string): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearStoredSession(): void {
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(TOKEN_KEY)
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

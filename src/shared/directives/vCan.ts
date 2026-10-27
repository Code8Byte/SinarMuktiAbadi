import type { Directive, DirectiveBinding } from 'vue'
import { useAuthStore } from '@/modules/auth/stores/authStore'
import type { PermissionId } from '@/app/auth/permissions'

export const vCan: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<PermissionId | PermissionId[]>) {
    checkPermission(el, binding)
  },
  updated(el: HTMLElement, binding: DirectiveBinding<PermissionId | PermissionId[]>) {
    checkPermission(el, binding)
  },
}

function checkPermission(el: HTMLElement, binding: DirectiveBinding<PermissionId | PermissionId[]>): void {
  const authStore = useAuthStore()
  const { value } = binding

  if (!value) return

  let hasAccess = false
  if (Array.isArray(value)) {
    hasAccess = value.some((perm) => authStore.hasPermission(perm))
  } else {
    hasAccess = authStore.hasPermission(value)
  }

  if (!hasAccess) {
    el.style.display = 'none'
  } else {
    el.style.display = ''
  }
}

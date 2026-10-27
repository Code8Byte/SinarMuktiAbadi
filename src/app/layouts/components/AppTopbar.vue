<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/stores/authStore'
import { useVariantConfig } from '@/shared/composables/useVariantConfig'
import { LogOut, UserCircle } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const { config } = useVariantConfig()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <header class="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
    <div class="flex items-center gap-3">
      <span class="text-sm font-semibold text-slate-800 hidden sm:inline-block">
        {{ config.companyFullName }}
      </span>
      <span
        class="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider"
        :class="config.id === 'sma' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'"
      >
        {{ config.id.toUpperCase() }}
      </span>
    </div>

    <!-- User Profile & Logout -->
    <div class="flex items-center gap-4">
      <div v-if="authStore.user" class="flex items-center gap-2.5 text-right">
        <UserCircle class="w-8 h-8 text-slate-400" />
        <div class="hidden sm:block">
          <p class="text-xs font-semibold text-slate-900 leading-tight">{{ authStore.user.name }}</p>
          <span class="text-[10px] font-medium text-slate-500 capitalize bg-slate-100 px-1.5 py-0.2 rounded">
            {{ authStore.user.role.replace('_', ' ') }}
          </span>
        </div>
      </div>

      <button
        type="button"
        title="Keluar dari sistem"
        class="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        @click="handleLogout"
      >
        <LogOut class="w-4 h-4" />
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore, DEMO_USERS } from '../stores/authStore'
import { useVariantConfig } from '@/shared/composables/useVariantConfig'
import { Building2, LogIn, AlertCircle } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { config } = useVariantConfig()

const username = ref('admin')
const password = ref('password123')
const errorMessage = ref('')
const isLoading = ref(false)

async function handleLogin() {
  errorMessage.value = ''
  isLoading.value = true
  try {
    await authStore.login(username.value, password.value)
    const redirectPath = (route.query.redirect as string) || '/dashboard'
    await router.push(redirectPath)
  } catch (err: unknown) {
    if (err instanceof Error) {
      errorMessage.value = err.message
    } else {
      errorMessage.value = 'Terjadi kesalahan saat login.'
    }
  } finally {
    isLoading.value = false
  }
}

function selectDemoUser(demoKey: string) {
  username.value = demoKey
  password.value = 'password123'
  handleLogin()
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-100 p-4 sm:p-6">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      <!-- Header -->
      <div class="bg-slate-900 p-6 text-white text-center relative">
        <div class="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
          <Building2 class="w-6 h-6 text-sky-400" />
        </div>
        <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-2"
              :class="config.id === 'sma' ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'">
          Varian: {{ config.companyFullName }}
        </span>
        <h1 class="text-xl font-bold">{{ config.appName }}</h1>
        <p class="text-slate-400 text-xs mt-1">Sistem Manajemen Operasional & Keuangan</p>
      </div>

      <!-- Form -->
      <div class="p-6">
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle class="w-4 h-4 shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <form class="space-y-4" @submit.prevent="handleLogin">
          <div>
            <label class="block text-xs font-medium text-slate-700 mb-1">Username</label>
            <input
              v-model="username"
              type="text"
              required
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Masukkan username"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-700 mb-1">Password</label>
            <input
              v-model="password"
              type="password"
              required
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Masukkan password"
            />
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <LogIn class="w-4 h-4" />
            <span>{{ isLoading ? 'Memproses...' : 'Masuk ke Sistem' }}</span>
          </button>
        </form>

        <!-- Demo Accounts Quick Switch -->
        <div class="mt-6 pt-5 border-t border-slate-200">
          <p class="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
            Pilih Cepat Akun Demo (Uji Role):
          </p>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <button
              v-for="(demo, key) in DEMO_USERS"
              :key="key"
              type="button"
              class="p-2 border border-slate-200 hover:border-sky-400 hover:bg-sky-50 rounded-lg text-left transition-colors"
              @click="selectDemoUser(key)"
            >
              <div class="font-medium text-slate-800">{{ key }}</div>
              <div class="text-[10px] text-slate-500 capitalize">{{ demo.role.replace('_', ' ') }}</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

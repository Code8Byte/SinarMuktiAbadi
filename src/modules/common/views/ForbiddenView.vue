<script setup lang="ts">
import { ShieldAlert } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/dashboard')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-100 p-6">
    <div class="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
      <div class="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <ShieldAlert class="w-8 h-8" />
      </div>
      <h1 class="text-2xl font-bold text-slate-900 mb-2">Akses Ditolak (403)</h1>
      <p class="text-slate-600 mb-6 text-sm">
        Akun Anda tidak memiliki izin untuk membuka halaman ini. Silakan hubungi Administrator jika Anda memerlukan akses.
      </p>
      <button
        class="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-sm transition-colors"
        @click="goHome"
      >
        Kembali ke Dashboard
      </button>
    </div>
  </div>
</template>

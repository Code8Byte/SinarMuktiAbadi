<script setup lang="ts">
import { FileQuestion } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/dashboard')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-100 p-6">
    <div class="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
      <div class="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <FileQuestion class="w-8 h-8" />
      </div>
      <h1 class="text-2xl font-bold text-slate-900 mb-2">Halaman Tidak Ditemukan (404)</h1>
      <p class="text-slate-600 mb-6 text-sm">
        Halaman yang Anda tuju tidak ditemukan atau telah dipindahkan.
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

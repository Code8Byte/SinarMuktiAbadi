<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Component } from 'vue'

export interface QuickActionItem {
  label: string
  route: string
  icon: Component
  permission?: string
}

defineProps<{
  title: string
  actions: QuickActionItem[]
}>()

const router = useRouter()

function navigate(path: string) {
  router.push(path)
}
</script>

<template>
  <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
    <h3 class="text-sm font-semibold text-slate-800 mb-4">{{ title }}</h3>
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <button
        v-for="action in actions"
        :key="action.label"
        type="button"
        class="flex flex-col items-center justify-center p-3.5 rounded-lg border border-slate-100 hover:border-sky-300 hover:bg-sky-50 text-slate-700 hover:text-sky-700 transition-all text-center gap-2 group"
        @click="navigate(action.route)"
      >
        <component :is="action.icon" class="w-5 h-5 text-slate-500 group-hover:text-sky-600 transition-colors" />
        <span class="text-xs font-medium">{{ action.label }}</span>
      </button>
    </div>
  </div>
</template>

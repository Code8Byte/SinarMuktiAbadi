<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  title: string
  value: string | number
  subtitle?: string
  icon?: Component
  colorClass?: string
}>()
</script>

<template>
  <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs font-medium text-slate-500 uppercase tracking-wider">{{ title }}</p>
        <p class="text-2xl font-bold text-slate-900 mt-1">{{ value }}</p>
        <p v-if="subtitle" class="text-xs text-slate-500 mt-1">{{ subtitle }}</p>
      </div>
      <div v-if="icon" class="w-12 h-12 rounded-xl flex items-center justify-center" :class="colorClass || 'bg-sky-50 text-sky-600'">
        <component :is="icon" class="w-6 h-6" />
      </div>
    </div>
  </div>
</template>

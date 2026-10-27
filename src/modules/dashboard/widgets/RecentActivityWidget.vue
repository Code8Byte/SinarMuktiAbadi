<script setup lang="ts">
import { Clock } from 'lucide-vue-next'

export interface ActivityItem {
  id: string
  title: string
  subtitle: string
  time: string
  badgeText?: string
  badgeColor?: string
}

defineProps<{
  title: string
  items: ActivityItem[]
}>()
</script>

<template>
  <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-semibold text-slate-800">{{ title }}</h3>
      <Clock class="w-4 h-4 text-slate-400" />
    </div>

    <div v-if="items.length === 0" class="py-8 text-center text-slate-400 text-xs">
      Belum ada aktivitas terbaru tercatat.
    </div>

    <div v-else class="divide-y divide-slate-100">
      <div v-for="item in items" :key="item.id" class="py-3 flex items-center justify-between gap-3 text-xs">
        <div>
          <p class="font-medium text-slate-800">{{ item.title }}</p>
          <p class="text-slate-500 text-[11px] mt-0.5">{{ item.subtitle }} • {{ item.time }}</p>
        </div>
        <span
          v-if="item.badgeText"
          class="px-2 py-0.5 rounded text-[10px] font-semibold"
          :class="item.badgeColor || 'bg-slate-100 text-slate-700'"
        >
          {{ item.badgeText }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    status: string
    label?: string
  }>(),
  {
    label: '',
  }
)

const colorClass = computed(() => {
  switch (props.status.toLowerCase()) {
    case 'lunas':
    case 'close':
    case 'delivered':
    case 'sudah_faktur':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'dp':
    case 'open':
    case 'belum_faktur':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'belum_lunas':
    case 'cancel':
    case 'cancelled':
      return 'bg-red-50 text-red-700 border-red-200'
    case 'overpaid':
      return 'bg-purple-50 text-purple-700 border-purple-200'
    case 'tanpa_faktur':
    case 'draft':
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200'
  }
})

const displayLabel = computed(() => {
  if (props.label) return props.label
  return props.status.replace(/_/g, ' ').toUpperCase()
})
</script>

<template>
  <span
    class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border"
    :class="colorClass"
  >
    {{ displayLabel }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    type?: 'info' | 'success' | 'warning' | 'error'
    title?: string
    message?: string
  }>(),
  {
    type: 'info',
    title: '',
    message: '',
  }
)

const config = computed(() => {
  switch (props.type) {
    case 'success':
      return {
        bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        icon: CheckCircle,
        iconColor: 'text-emerald-500',
      }
    case 'warning':
      return {
        bg: 'bg-amber-50 border-amber-200 text-amber-800',
        icon: AlertTriangle,
        iconColor: 'text-amber-500',
      }
    case 'error':
      return {
        bg: 'bg-red-50 border-red-200 text-red-800',
        icon: AlertCircle,
        iconColor: 'text-red-500',
      }
    case 'info':
    default:
      return {
        bg: 'bg-sky-50 border-sky-200 text-sky-800',
        icon: Info,
        iconColor: 'text-sky-500',
      }
  }
})
</script>

<template>
  <div class="p-4 rounded-xl border flex items-start gap-3 text-xs" :class="config.bg">
    <component :is="config.icon" class="w-5 h-5 shrink-0 mt-0.5" :class="config.iconColor" />
    <div class="flex-1">
      <h4 v-if="title" class="font-bold mb-0.5">{{ title }}</h4>
      <p class="leading-relaxed">{{ message }}</p>
      <slot />
    </div>
  </div>
</template>

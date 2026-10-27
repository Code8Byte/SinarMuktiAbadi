<script setup lang="ts">
import { Loader2, Inbox, AlertCircle } from 'lucide-vue-next'

export interface TableColumn {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
  width?: string
}

withDefaults(
  defineProps<{
    columns: TableColumn[]
    items: Record<string, unknown>[]
    loading?: boolean
    error?: string
    emptyMessage?: string
  }>(),
  {
    loading: false,
    error: '',
    emptyMessage: 'Tidak ada data ditemukan.',
  }
)
</script>

<template>
  <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
    <!-- Loading State -->
    <div v-if="loading" class="py-16 text-center text-slate-500">
      <Loader2 class="w-8 h-8 animate-spin mx-auto mb-2 text-sky-600" />
      <p class="text-xs">Memuat data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="py-12 text-center text-red-600 px-4">
      <AlertCircle class="w-8 h-8 mx-auto mb-2 text-red-500" />
      <p class="text-xs font-semibold">{{ error }}</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="items.length === 0" class="py-16 text-center text-slate-400">
      <Inbox class="w-10 h-10 mx-auto mb-2 text-slate-300" />
      <p class="text-xs font-medium">{{ emptyMessage }}</p>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              class="px-4 py-3"
              :class="{
                'text-right': col.align === 'right',
                'text-center': col.align === 'center',
                'text-left': !col.align || col.align === 'left',
              }"
              :style="col.width ? { width: col.width } : undefined"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-slate-700">
          <tr
            v-for="(item, index) in items"
            :key="index"
            class="hover:bg-slate-50/80 transition-colors"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              class="px-4 py-3"
              :class="{
                'text-right': col.align === 'right',
                'text-center': col.align === 'center',
                'text-left': !col.align || col.align === 'left',
              }"
            >
              <slot :name="col.key" :item="item" :value="item[col.key]">
                {{ item[col.key] ?? '-' }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

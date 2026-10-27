<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { barangService } from '@/modules/barang'
import type { Barang } from '@/shared/types/entity'
import AppDataTable, { type TableColumn } from '@/shared/components/table/AppDataTable.vue'
import { Search, Package } from 'lucide-vue-next'

const items = ref<Barang[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')

const columns: TableColumn[] = [
  { key: 'sku', label: 'Kode / SKU Barang', width: '150px' },
  { key: 'name', label: 'Nama Barang' },
  { key: 'unit', label: 'Satuan', width: '100px', align: 'center' },
  { key: 'category', label: 'Kategori', width: '150px' },
]

async function loadData() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await barangService.getBarang({
      search: searchQuery.value,
      limit: 1000,
    })
    items.value = res.items
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal memuat rekap barang'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="space-y-4">
    <!-- Summary -->
    <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <span class="text-xs text-slate-500 font-medium">Total Katalog Barang Tersedia</span>
        <p class="text-lg font-extrabold text-slate-900 mt-0.5">{{ items.length }} Item</p>
        <span class="text-[11px] text-slate-400">Barang siap untuk transaksi penjualan</span>
      </div>
      <div class="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
        <Package class="w-5 h-5" />
      </div>
    </div>

    <!-- Search Bar -->
    <div class="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3">
      <div class="relative flex-1">
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari kode atau nama barang..."
          class="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
          @input="loadData"
        />
      </div>
    </div>

    <!-- Data Table -->
    <AppDataTable
      :columns="columns"
      :items="items as unknown as Record<string, unknown>[]"
      :loading="isLoading"
      :error="errorMessage"
      empty-message="Belum ada data barang."
    >
      <template #sku="{ value }">
        <span class="font-mono text-xs font-semibold text-slate-800">{{ value }}</span>
      </template>

      <template #name="{ value }">
        <span class="font-medium text-slate-900 text-xs">{{ value }}</span>
      </template>

      <template #unit="{ value }">
        <span class="inline-block px-2 py-0.5 bg-slate-100 rounded text-slate-700 text-xs font-semibold">
          {{ value }}
        </span>
      </template>

      <template #category="{ value }">
        <span class="text-slate-600 text-xs">{{ (value as string) || '-' }}</span>
      </template>
    </AppDataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { barangService } from '../services/barangService'
import BarangFormModal from '../components/BarangFormModal.vue'
import AppDataTable, { type TableColumn } from '@/shared/components/table/AppDataTable.vue'
import AppStatusBadge from '@/shared/components/badge/AppStatusBadge.vue'
import type { Barang } from '@/shared/types/entity'
import { Plus, Search, Edit2, Trash2 } from 'lucide-vue-next'

const barangList = ref<Barang[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')
const isModalOpen = ref(false)
const selectedBarang = ref<Barang | null>(null)

const columns: TableColumn[] = [
  { key: 'sku', label: 'SKU', width: '130px' },
  { key: 'name', label: 'Nama Barang & Spesifikasi' },
  { key: 'category', label: 'Kategori', width: '150px' },
  { key: 'unit', label: 'Satuan', width: '100px' },
  { key: 'isActive', label: 'Status', width: '110px' },
  { key: 'actions', label: 'Aksi', align: 'right', width: '100px' },
]

async function loadBarang() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await barangService.getBarang({ search: searchQuery.value })
    barangList.value = res.items
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal memuat barang'
  } finally {
    isLoading.value = false
  }
}

function openCreateModal() {
  selectedBarang.value = null
  isModalOpen.value = true
}

function openEditModal(item: Barang) {
  selectedBarang.value = item
  isModalOpen.value = true
}

async function handleSaveBarang(payload: Omit<Barang, 'id' | 'createdAt'>) {
  try {
    if (selectedBarang.value) {
      await barangService.updateBarang(selectedBarang.value.id, payload)
    } else {
      await barangService.createBarang(payload)
    }
    isModalOpen.value = false
    await loadBarang()
  } catch (err: unknown) {
    alert(err instanceof Error ? err.message : 'Gagal menyimpan barang')
  }
}

async function handleDelete(item: Barang) {
  if (confirm(`Apakah Anda yakin ingin menghapus barang '${item.name}'?`)) {
    try {
      await barangService.deleteBarang(item.id)
      await loadBarang()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus barang')
    }
  }
}

onMounted(() => {
  loadBarang()
})
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-slate-900">Master & Rekap Barang (SMA)</h1>
        <p class="text-xs text-slate-500">Katalog barang dagangan yang siap digunakan pada Sales Order</p>
      </div>

      <button
        v-can="'barang.create'"
        type="button"
        class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        @click="openCreateModal"
      >
        <Plus class="w-4 h-4" />
        Tambah Barang
      </button>
    </div>

    <!-- Search Bar -->
    <div class="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-2">
      <Search class="w-4 h-4 text-slate-400 shrink-0" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Cari SKU, nama barang, atau kategori..."
        class="w-full text-xs bg-transparent focus:outline-none text-slate-800"
        @input="loadBarang"
      />
    </div>

    <!-- Data Table -->
    <AppDataTable
      :columns="columns"
      :items="barangList as unknown as Record<string, unknown>[]"
      :loading="isLoading"
      :error="errorMessage"
      empty-message="Tidak ada data barang yang sesuai."
    >
      <template #sku="{ value }">
        <span class="font-mono text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
          {{ value }}
        </span>
      </template>

      <template #category="{ value }">
        <span class="text-slate-600 font-medium text-xs">
          {{ value }}
        </span>
      </template>

      <template #isActive="{ value }">
        <AppStatusBadge :status="value ? 'lunas' : 'cancel'" :label="value ? 'Aktif' : 'Non-Aktif'" />
      </template>

      <template #actions="{ item }">
        <div class="flex items-center justify-end gap-1.5">
          <button
            v-can="'barang.edit'"
            type="button"
            class="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded"
            title="Ubah barang"
            @click="openEditModal(item as unknown as Barang)"
          >
            <Edit2 class="w-3.5 h-3.5" />
          </button>

          <button
            v-can="'barang.delete'"
            type="button"
            class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="Hapus barang"
            @click="handleDelete(item as unknown as Barang)"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </template>
    </AppDataTable>

    <!-- Modal Form -->
    <BarangFormModal
      :is-open="isModalOpen"
      :barang-to-edit="selectedBarang"
      @close="isModalOpen = false"
      @saved="handleSaveBarang"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supplierService } from '../services/supplierService'
import SupplierFormModal from '../components/SupplierFormModal.vue'
import AppDataTable, { type TableColumn } from '@/shared/components/table/AppDataTable.vue'
import AppStatusBadge from '@/shared/components/badge/AppStatusBadge.vue'
import type { Supplier } from '@/shared/types/entity'
import { Plus, Search, Edit2, Trash2 } from 'lucide-vue-next'

const suppliers = ref<Supplier[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')
const isModalOpen = ref(false)
const selectedSupplier = ref<Supplier | null>(null)

const columns: TableColumn[] = [
  { key: 'code', label: 'Kode', width: '120px' },
  { key: 'name', label: 'Nama Supplier' },
  { key: 'taxType', label: 'Perpajakan', width: '130px' },
  { key: 'phone', label: 'Telepon', width: '140px' },
  { key: 'address', label: 'Alamat' },
  { key: 'actions', label: 'Aksi', align: 'right', width: '100px' },
]

async function loadSuppliers() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await supplierService.getSuppliers({ search: searchQuery.value })
    suppliers.value = res.items
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal memuat supplier'
  } finally {
    isLoading.value = false
  }
}

function openCreateModal() {
  selectedSupplier.value = null
  isModalOpen.value = true
}

function openEditModal(supplier: Supplier) {
  selectedSupplier.value = supplier
  isModalOpen.value = true
}

async function handleSaveSupplier(payload: Omit<Supplier, 'id' | 'createdAt'>) {
  try {
    if (selectedSupplier.value) {
      await supplierService.updateSupplier(selectedSupplier.value.id, payload)
    } else {
      await supplierService.createSupplier(payload)
    }
    isModalOpen.value = false
    await loadSuppliers()
  } catch (err: unknown) {
    alert(err instanceof Error ? err.message : 'Gagal menyimpan supplier')
  }
}

async function handleDelete(supplier: Supplier) {
  if (confirm(`Apakah Anda yakin ingin menghapus supplier '${supplier.name}'?`)) {
    try {
      await supplierService.deleteSupplier(supplier.id)
      await loadSuppliers()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus supplier')
    }
  }
}

onMounted(() => {
  loadSuppliers()
})
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-slate-900">Master Data Supplier (SMA)</h1>
        <p class="text-xs text-slate-500">Daftar pemasok barang dan status PPN untuk penerbitan invoice pembelian</p>
      </div>

      <button
        v-can="'suppliers.create'"
        type="button"
        class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        @click="openCreateModal"
      >
        <Plus class="w-4 h-4" />
        Tambah Supplier
      </button>
    </div>

    <!-- Search Bar -->
    <div class="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-2">
      <Search class="w-4 h-4 text-slate-400 shrink-0" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Cari nama, kode, atau alamat supplier..."
        class="w-full text-xs bg-transparent focus:outline-none text-slate-800"
        @input="loadSuppliers"
      />
    </div>

    <!-- Data Table -->
    <AppDataTable
      :columns="columns"
      :items="suppliers as unknown as Record<string, unknown>[]"
      :loading="isLoading"
      :error="errorMessage"
      empty-message="Tidak ada data supplier yang sesuai."
    >
      <template #code="{ value }">
        <span class="font-mono text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
          {{ value }}
        </span>
      </template>

      <template #taxType="{ value }">
        <AppStatusBadge
          :status="value === 'ppn' ? 'sudah_faktur' : 'tanpa_faktur'"
          :label="value === 'ppn' ? 'PPN (11%)' : 'Non-PPN'"
        />
      </template>

      <template #actions="{ item }">
        <div class="flex items-center justify-end gap-1.5">
          <button
            v-can="'suppliers.edit'"
            type="button"
            class="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded"
            title="Ubah supplier"
            @click="openEditModal(item as unknown as Supplier)"
          >
            <Edit2 class="w-3.5 h-3.5" />
          </button>

          <button
            v-can="'suppliers.delete'"
            type="button"
            class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="Hapus supplier"
            @click="handleDelete(item as unknown as Supplier)"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </template>
    </AppDataTable>

    <!-- Modal Form -->
    <SupplierFormModal
      :is-open="isModalOpen"
      :supplier-to-edit="selectedSupplier"
      @close="isModalOpen = false"
      @saved="handleSaveSupplier"
    />
  </div>
</template>

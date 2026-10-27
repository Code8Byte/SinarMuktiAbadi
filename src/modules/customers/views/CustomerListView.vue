<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { customerService } from '../services/customerService'
import CustomerFormModal from '../components/CustomerFormModal.vue'
import AppDataTable, { type TableColumn } from '@/shared/components/table/AppDataTable.vue'
import type { Customer } from '@/shared/types/entity'
import { Plus, Search, Edit2, Trash2 } from 'lucide-vue-next'

const customers = ref<Customer[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')
const isModalOpen = ref(false)
const selectedCustomer = ref<Customer | null>(null)

const columns: TableColumn[] = [
  { key: 'code', label: 'Kode', width: '120px' },
  { key: 'name', label: 'Nama Customer' },
  { key: 'phone', label: 'Telepon', width: '140px' },
  { key: 'address', label: 'Alamat' },
  { key: 'actions', label: 'Aksi', align: 'right', width: '100px' },
]

async function loadCustomers() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await customerService.getCustomers({ search: searchQuery.value })
    customers.value = res.items
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal memuat customer'
  } finally {
    isLoading.value = false
  }
}

function openCreateModal() {
  selectedCustomer.value = null
  isModalOpen.value = true
}

function openEditModal(customer: Customer) {
  selectedCustomer.value = customer
  isModalOpen.value = true
}

async function handleSaveCustomer(payload: Omit<Customer, 'id' | 'createdAt'>) {
  try {
    if (selectedCustomer.value) {
      await customerService.updateCustomer(selectedCustomer.value.id, payload)
    } else {
      await customerService.createCustomer(payload)
    }
    isModalOpen.value = false
    await loadCustomers()
  } catch (err: unknown) {
    alert(err instanceof Error ? err.message : 'Gagal menyimpan customer')
  }
}

async function handleDelete(customer: Customer) {
  if (confirm(`Apakah Anda yakin ingin menghapus data customer '${customer.name}'?`)) {
    try {
      await customerService.deleteCustomer(customer.id)
      await loadCustomers()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus customer')
    }
  }
}

onMounted(() => {
  loadCustomers()
})
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-slate-900">Master Data Customer</h1>
        <p class="text-xs text-slate-500">Daftar pelanggan aktif untuk transaksi Sales Order dan penagihan</p>
      </div>

      <button
        v-can="'customers.create'"
        type="button"
        class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        @click="openCreateModal"
      >
        <Plus class="w-4 h-4" />
        Tambah Customer
      </button>
    </div>

    <!-- Search Bar -->
    <div class="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-2">
      <Search class="w-4 h-4 text-slate-400 shrink-0" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Cari kode, nama, telepon, atau alamat customer..."
        class="w-full text-xs bg-transparent focus:outline-none text-slate-800"
        @input="loadCustomers"
      />
    </div>

    <!-- Data Table -->
    <AppDataTable
      :columns="columns"
      :items="customers as unknown as Record<string, unknown>[]"
      :loading="isLoading"
      :error="errorMessage"
      empty-message="Tidak ada data customer yang sesuai."
    >
      <template #code="{ value }">
        <span class="font-mono text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
          {{ value }}
        </span>
      </template>

      <template #actions="{ item }">
        <div class="flex items-center justify-end gap-1.5">
          <button
            v-can="'customers.edit'"
            type="button"
            class="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded"
            title="Ubah customer"
            @click="openEditModal(item as unknown as Customer)"
          >
            <Edit2 class="w-3.5 h-3.5" />
          </button>

          <button
            v-can="'customers.delete'"
            type="button"
            class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="Hapus customer"
            @click="handleDelete(item as unknown as Customer)"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </template>
    </AppDataTable>

    <!-- Modal Form -->
    <CustomerFormModal
      :is-open="isModalOpen"
      :customer-to-edit="selectedCustomer"
      @close="isModalOpen = false"
      @saved="handleSaveCustomer"
    />
  </div>
</template>

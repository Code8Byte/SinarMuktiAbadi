<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { deliveryNoteService, type DeliveryNoteWithDetails } from '../services/deliveryNoteService'
import AppDataTable, { type TableColumn } from '@/shared/components/table/AppDataTable.vue'
import AppStatusBadge from '@/shared/components/badge/AppStatusBadge.vue'
import { formatDate } from '@/shared/utils/date'
import { Search, Eye, Truck } from 'lucide-vue-next'

const router = useRouter()

const notes = ref<DeliveryNoteWithDetails[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')

const columns: TableColumn[] = [
  { key: 'deliveryNumber', label: 'No. Surat Jalan', width: '150px' },
  { key: 'soNumber', label: 'Rujukan SO', width: '140px' },
  { key: 'customerName', label: 'Customer' },
  { key: 'deliveryDate', label: 'Tgl Kirim', width: '110px' },
  { key: 'driverName', label: 'Sopir / Armada', width: '140px' },
  { key: 'recipientName', label: 'Penerima', width: '130px' },
  { key: 'status', label: 'Status', width: '100px' },
  { key: 'actions', label: 'Aksi', align: 'right', width: '70px' },
]

async function loadDeliveryNotes() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await deliveryNoteService.getDeliveryNotes({ search: searchQuery.value })
    notes.value = res.items
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal memuat surat jalan'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadDeliveryNotes()
})
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-slate-900">Surat Jalan (Pengiriman Bertahap)</h1>
        <p class="text-xs text-slate-500">Pencatatan bukti fisik pengiriman barang pesanan pelanggan</p>
      </div>

      <button
        v-can="'penjualan.delivery.create'"
        type="button"
        class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        @click="router.push('/penjualan/surat-jalan/create')"
      >
        <Truck class="w-4 h-4" />
        Buat Surat Jalan
      </button>
    </div>

    <!-- Search Bar -->
    <div class="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-2">
      <Search class="w-4 h-4 text-slate-400 shrink-0" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Cari no. surat jalan, no. SO, customer, sopir..."
        class="w-full text-xs bg-transparent focus:outline-none text-slate-800"
        @input="loadDeliveryNotes"
      />
    </div>

    <!-- Table -->
    <AppDataTable
      :columns="columns"
      :items="notes as unknown as Record<string, unknown>[]"
      :loading="isLoading"
      :error="errorMessage"
      empty-message="Tidak ada data surat jalan yang sesuai."
    >
      <template #deliveryNumber="{ value }">
        <span class="font-mono font-semibold text-sky-800 text-xs">{{ value }}</span>
      </template>

      <template #soNumber="{ value }">
        <span class="font-mono text-slate-600 text-xs">{{ value }}</span>
      </template>

      <template #deliveryDate="{ value }">
        <span class="text-slate-600">{{ formatDate(value as string) }}</span>
      </template>

      <template #driverName="{ item }">
        <div>
          <span class="font-medium text-slate-800">{{ (item as unknown as DeliveryNoteWithDetails).driverName }}</span>
          <span class="text-[10px] text-slate-400 block font-mono">
            {{ (item as unknown as DeliveryNoteWithDetails).vehiclePlate }}
          </span>
        </div>
      </template>

      <template #status="{ value }">
        <AppStatusBadge :status="value as string" />
      </template>

      <template #actions="{ item }">
        <button
          type="button"
          class="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded"
          title="Lihat surat jalan"
          @click="router.push(`/penjualan/surat-jalan/${(item as unknown as DeliveryNoteWithDetails).id}`)"
        >
          <Eye class="w-3.5 h-3.5" />
        </button>
      </template>
    </AppDataTable>
  </div>
</template>

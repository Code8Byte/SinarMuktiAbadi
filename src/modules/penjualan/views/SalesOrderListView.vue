<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { salesOrderService, type SalesOrderWithDetails } from '../services/salesOrderService'
import { barangService } from '@/modules/barang'
import { useVariantConfig } from '@/shared/composables/useVariantConfig'
import AppDataTable, { type TableColumn } from '@/shared/components/table/AppDataTable.vue'
import AppStatusBadge from '@/shared/components/badge/AppStatusBadge.vue'
import { formatRupiah } from '@/shared/utils/money'
import { formatDate } from '@/shared/utils/date'
import { Plus, Search, Eye, AlertTriangle } from 'lucide-vue-next'

const router = useRouter()
const { config } = useVariantConfig()

const orders = ref<SalesOrderWithDetails[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')
const filterStatus = ref('')
const canCreateSo = ref(true)
const cannotCreateReason = ref('')

const columns: TableColumn[] = [
  { key: 'soNumber', label: 'No. SO', width: '150px' },
  { key: 'customerName', label: 'Customer' },
  { key: 'orderDate', label: 'Tanggal', width: '110px' },
  { key: 'totalAmount', label: 'Total Pesanan', align: 'right' },
  { key: 'fulfillment', label: 'Status Pengiriman', width: '160px' },
  { key: 'status', label: 'Status SO', width: '110px' },
  { key: 'actions', label: 'Aksi', align: 'right', width: '80px' },
]

async function checkSoCreationCapability() {
  if (config.soItemMode === 'catalog') {
    const hasBarang = await barangService.hasAnyBarang()
    if (!hasBarang) {
      canCreateSo.value = false
      cannotCreateReason.value = 'Belum ada barang diinput di modul pembelian. Input barang terlebih dahulu.'
      return
    }
  }
  canCreateSo.value = true
}

async function loadSalesOrders() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await salesOrderService.getSalesOrders({
      search: searchQuery.value,
      filters: { status: filterStatus.value || undefined },
    })
    orders.value = res.items
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal memuat Sales Order'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await checkSoCreationCapability()
  await loadSalesOrders()
})
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-slate-900">Sales Order (SO) - {{ config.companyFullName }}</h1>
        <p class="text-xs text-slate-500">
          Pesanan penjualan pelanggan (Mode: {{ config.soItemMode === 'catalog' ? 'Pilih Master Barang' : 'Ketik Manual Bebas' }})
        </p>
      </div>

      <div class="flex flex-col sm:flex-row items-end gap-1">
        <button
          v-can="'penjualan.so.create'"
          type="button"
          :disabled="!canCreateSo"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          :class="canCreateSo ? 'bg-sky-600 hover:bg-sky-700' : 'bg-slate-400'"
          @click="router.push('/penjualan/so/create')"
        >
          <Plus class="w-4 h-4" />
          Buat Sales Order
        </button>
        <span v-if="!canCreateSo" class="text-[10px] text-amber-600 font-medium flex items-center gap-1">
          <AlertTriangle class="w-3 h-3" />
          {{ cannotCreateReason }}
        </span>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
      <div class="relative flex-1 w-full">
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari no. SO, nama customer..."
          class="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
          @input="loadSalesOrders"
        />
      </div>

      <select
        v-model="filterStatus"
        class="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 w-full sm:w-auto"
        @change="loadSalesOrders"
      >
        <option value="">Semua Status SO</option>
        <option value="open">Open (Aktif)</option>
        <option value="close">Close (Selesai)</option>
        <option value="cancel">Cancel (Batal)</option>
      </select>
    </div>

    <!-- Table -->
    <AppDataTable
      :columns="columns"
      :items="orders as unknown as Record<string, unknown>[]"
      :loading="isLoading"
      :error="errorMessage"
      empty-message="Tidak ada data Sales Order yang sesuai."
    >
      <template #soNumber="{ value }">
        <span class="font-mono font-semibold text-sky-800 text-xs">
          {{ value }}
        </span>
      </template>

      <template #orderDate="{ value }">
        <span class="text-slate-600">{{ formatDate(value as string) }}</span>
      </template>

      <template #totalAmount="{ value }">
        <span class="font-bold text-slate-900">{{ formatRupiah(value as number) }}</span>
      </template>

      <template #fulfillment="{ item }">
        <div class="space-y-1">
          <span
            class="px-2 py-0.5 rounded text-[10px] font-bold"
            :class="(item as unknown as SalesOrderWithDetails).fulfillment.isAllFulfilled
              ? 'bg-emerald-100 text-emerald-800'
              : (item as unknown as SalesOrderWithDetails).fulfillment.hasAnyDeliveryNote
                ? 'bg-sky-100 text-sky-800'
                : 'bg-slate-100 text-slate-600'"
          >
            {{
              (item as unknown as SalesOrderWithDetails).fulfillment.isAllFulfilled
                ? 'Selesai Terkirim'
                : (item as unknown as SalesOrderWithDetails).fulfillment.hasAnyDeliveryNote
                  ? `${(item as unknown as SalesOrderWithDetails).fulfillment.deliveryNotesCount} Surat Jalan`
                  : 'Belum Ada Kiriman'
            }}
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
          title="Lihat rincian SO"
          @click="router.push(`/penjualan/so/${(item as unknown as SalesOrderWithDetails).id}`)"
        >
          <Eye class="w-3.5 h-3.5" />
        </button>
      </template>
    </AppDataTable>
  </div>
</template>

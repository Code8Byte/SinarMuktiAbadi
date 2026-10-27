<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { salesInvoiceService, type SalesInvoiceWithDetails } from '../services/salesInvoiceService'
import { useVariantConfig } from '@/shared/composables/useVariantConfig'
import AppDataTable, { type TableColumn } from '@/shared/components/table/AppDataTable.vue'
import AppStatusBadge from '@/shared/components/badge/AppStatusBadge.vue'
import { formatRupiah } from '@/shared/utils/money'
import { formatDate } from '@/shared/utils/date'
import { Plus, Search, Eye } from 'lucide-vue-next'

const router = useRouter()
const { config } = useVariantConfig()

const invoices = ref<SalesInvoiceWithDetails[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')
const filterStatus = ref('')

const columns: TableColumn[] = [
  { key: 'invoiceNumber', label: 'No. Invoice', width: '150px' },
  { key: 'customerName', label: 'Customer' },
  { key: 'invoiceDate', label: 'Tanggal', width: '110px' },
  { key: 'paymentTerms', label: 'Termin', width: '90px' },
  ...(config.invoiceFaktur === 'tracked'
    ? [{ key: 'fakturStatus', label: 'Status Faktur', width: '120px' }]
    : []),
  { key: 'totalAmount', label: 'Total Tagihan', align: 'right' },
  { key: 'remainingBalance', label: 'Sisa Piutang', align: 'right' },
  { key: 'status', label: 'Status Piutang', width: '120px' },
  { key: 'actions', label: 'Aksi', align: 'right', width: '70px' },
]

async function loadInvoices() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await salesInvoiceService.getInvoices({
      search: searchQuery.value,
      filters: { paymentStatus: filterStatus.value || undefined },
    })
    invoices.value = res.items
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal memuat invoice penjualan'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadInvoices()
})
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-slate-900">Invoice Penjualan - {{ config.companyFullName }}</h1>
        <p class="text-xs text-slate-500">Penerbitan faktur tagihan penjualan dari surat jalan bertahap</p>
      </div>

      <button
        v-can="'penjualan.invoice.create'"
        type="button"
        class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        @click="router.push('/penjualan/invoice/create')"
      >
        <Plus class="w-4 h-4" />
        Terbitkan Invoice
      </button>
    </div>

    <!-- Filters Bar -->
    <div class="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
      <div class="relative flex-1 w-full">
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari no. invoice, customer..."
          class="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
          @input="loadInvoices"
        />
      </div>

      <select
        v-model="filterStatus"
        class="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 w-full sm:w-auto"
        @change="loadInvoices"
      >
        <option value="">Semua Status Piutang</option>
        <option value="belum_lunas">Belum Lunas</option>
        <option value="dp">DP (Parsial)</option>
        <option value="lunas">Lunas</option>
      </select>
    </div>

    <!-- Table -->
    <AppDataTable
      :columns="columns"
      :items="invoices as unknown as Record<string, unknown>[]"
      :loading="isLoading"
      :error="errorMessage"
      empty-message="Tidak ada data invoice penjualan yang sesuai."
    >
      <template #invoiceNumber="{ value }">
        <span class="font-mono font-semibold text-slate-900 text-xs">{{ value }}</span>
      </template>

      <template #invoiceDate="{ value }">
        <span class="text-slate-600">{{ formatDate(value as string) }}</span>
      </template>

      <template #paymentTerms="{ value }">
        <span class="uppercase text-[11px] font-medium text-slate-700">{{ value }}</span>
      </template>

      <template #fakturStatus="{ value }">
        <AppStatusBadge :status="value as string" />
      </template>

      <template #totalAmount="{ value }">
        <span class="font-bold text-slate-900">{{ formatRupiah(value as number) }}</span>
      </template>

      <template #remainingBalance="{ item }">
        <span class="font-semibold text-red-600">
          {{ formatRupiah((item as unknown as SalesInvoiceWithDetails).paymentSummary.remainingBalance) }}
        </span>
      </template>

      <template #status="{ item }">
        <AppStatusBadge :status="(item as unknown as SalesInvoiceWithDetails).paymentSummary.status" />
      </template>

      <template #actions="{ item }">
        <button
          type="button"
          class="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded"
          title="Lihat detail invoice"
          @click="router.push(`/penjualan/invoice/${(item as unknown as SalesInvoiceWithDetails).id}`)"
        >
          <Eye class="w-3.5 h-3.5" />
        </button>
      </template>
    </AppDataTable>
  </div>
</template>

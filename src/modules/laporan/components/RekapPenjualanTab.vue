<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { salesInvoiceService, type SalesInvoiceWithDetails } from '@/modules/penjualan'
import AppDataTable, { type TableColumn } from '@/shared/components/table/AppDataTable.vue'
import AppStatusBadge from '@/shared/components/badge/AppStatusBadge.vue'
import { formatRupiah } from '@/shared/utils/money'
import { formatDate } from '@/shared/utils/date'
import { Search, DollarSign, Receipt, CreditCard } from 'lucide-vue-next'

const invoices = ref<SalesInvoiceWithDetails[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')
const filterStatus = ref('')

const columns: TableColumn[] = [
  { key: 'invoiceNumber', label: 'No. Invoice', width: '150px' },
  { key: 'customerName', label: 'Customer' },
  { key: 'invoiceDate', label: 'Tgl Faktur', width: '110px' },
  { key: 'dueDate', label: 'Jatuh Tempo', width: '110px' },
  { key: 'totalAmount', label: 'Total Penjualan', align: 'right' },
  { key: 'totalPaid', label: 'Diterima', align: 'right' },
  { key: 'remainingBalance', label: 'Sisa Piutang', align: 'right' },
  { key: 'status', label: 'Status Piutang', width: '120px' },
]

const totalOmzet = computed(() => invoices.value.reduce((sum, inv) => sum + inv.totalAmount, 0))
const totalDiterima = computed(() => invoices.value.reduce((sum, inv) => sum + inv.paymentSummary.totalPaid, 0))
const totalPiutang = computed(() => invoices.value.reduce((sum, inv) => sum + inv.paymentSummary.remainingBalance, 0))

async function loadData() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await salesInvoiceService.getInvoices({
      search: searchQuery.value,
      filters: { paymentStatus: filterStatus.value || undefined },
    })
    invoices.value = res.items
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal memuat rekap penjualan'
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
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs text-slate-500 font-medium">Total Omzet Terfaktur</span>
          <p class="text-lg font-extrabold text-slate-900 mt-0.5">{{ formatRupiah(totalOmzet) }}</p>
          <span class="text-[11px] text-slate-400">{{ invoices.length }} faktur penjualan</span>
        </div>
        <div class="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
          <Receipt class="w-5 h-5" />
        </div>
      </div>

      <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs text-slate-500 font-medium">Kas Diterima (Lunas/DP)</span>
          <p class="text-lg font-extrabold text-emerald-600 mt-0.5">{{ formatRupiah(totalDiterima) }}</p>
          <span class="text-[11px] text-slate-400">Penerimaan kas masuk</span>
        </div>
        <div class="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <DollarSign class="w-5 h-5" />
        </div>
      </div>

      <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs text-slate-500 font-medium">Sisa Piutang Berjalan</span>
          <p class="text-lg font-extrabold text-red-600 mt-0.5">{{ formatRupiah(totalPiutang) }}</p>
          <span class="text-[11px] text-slate-400">Total tagihan belum lunas</span>
        </div>
        <div class="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
          <CreditCard class="w-5 h-5" />
        </div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
      <div class="relative flex-1 w-full">
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari no invoice atau customer..."
          class="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
          @input="loadData"
        />
      </div>

      <select
        v-model="filterStatus"
        class="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 w-full sm:w-auto"
        @change="loadData"
      >
        <option value="">Semua Status Pelunasan</option>
        <option value="belum_lunas">Belum Lunas</option>
        <option value="dp">DP / Sebagian</option>
        <option value="lunas">Lunas</option>
      </select>
    </div>

    <!-- Data Table -->
    <AppDataTable
      :columns="columns"
      :items="invoices as unknown as Record<string, unknown>[]"
      :loading="isLoading"
      :error="errorMessage"
      empty-message="Tidak ada transaksi penjualan pada kriteria ini."
    >
      <template #invoiceNumber="{ value }">
        <span class="font-mono font-semibold text-slate-900 text-xs">{{ value }}</span>
      </template>

      <template #customerName="{ value }">
        <span class="font-medium text-slate-800 text-xs">{{ value }}</span>
      </template>

      <template #invoiceDate="{ value }">
        <span class="text-slate-600 text-xs">{{ formatDate(value as string) }}</span>
      </template>

      <template #dueDate="{ value }">
        <span class="text-slate-600 text-xs">{{ formatDate(value as string) }}</span>
      </template>

      <template #totalAmount="{ value }">
        <span class="font-bold text-slate-900 text-xs">{{ formatRupiah(value as number) }}</span>
      </template>

      <template #totalPaid="{ item }">
        <span class="font-medium text-emerald-600 text-xs">
          {{ formatRupiah((item as unknown as SalesInvoiceWithDetails).paymentSummary.totalPaid) }}
        </span>
      </template>

      <template #remainingBalance="{ item }">
        <span class="font-bold text-red-600 text-xs">
          {{ formatRupiah((item as unknown as SalesInvoiceWithDetails).paymentSummary.remainingBalance) }}
        </span>
      </template>

      <template #status="{ item }">
        <AppStatusBadge :status="(item as unknown as SalesInvoiceWithDetails).paymentSummary.status" />
      </template>
    </AppDataTable>
  </div>
</template>

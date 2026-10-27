<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { pembelianService, type PurchaseInvoiceWithDetails } from '@/modules/pembelian'
import AppDataTable, { type TableColumn } from '@/shared/components/table/AppDataTable.vue'
import AppStatusBadge from '@/shared/components/badge/AppStatusBadge.vue'
import { formatRupiah } from '@/shared/utils/money'
import { formatDate } from '@/shared/utils/date'
import { Search, ShoppingBag, CreditCard, Building2 } from 'lucide-vue-next'

const invoices = ref<PurchaseInvoiceWithDetails[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')
const filterEntity = ref('')
const filterStatus = ref('')

const columns: TableColumn[] = [
  { key: 'invoiceNumber', label: 'No. Faktur', width: '150px' },
  { key: 'supplierName', label: 'Supplier' },
  { key: 'entity', label: 'Entitas', align: 'center', width: '90px' },
  { key: 'invoiceDate', label: 'Tgl Faktur', width: '110px' },
  { key: 'dueDate', label: 'Jatuh Tempo', width: '110px' },
  { key: 'totalAmount', label: 'Total Faktur', align: 'right' },
  { key: 'totalPaid', label: 'Telah Dibayar', align: 'right' },
  { key: 'remainingBalance', label: 'Sisa Hutang', align: 'right' },
  { key: 'status', label: 'Status Hutang', width: '120px' },
]

const filteredInvoices = computed(() => {
  return invoices.value.filter((inv) => {
    if (filterEntity.value && inv.entity !== filterEntity.value) return false
    if (filterStatus.value && inv.paymentSummary.status !== filterStatus.value) return false
    return true
  })
})

const totalPembelian = computed(() =>
  filteredInvoices.value.reduce((sum, inv) => sum + inv.totalAmount, 0)
)
const totalHutang = computed(() =>
  filteredInvoices.value.reduce((sum, inv) => sum + inv.paymentSummary.remainingBalance, 0)
)
const totalDibayar = computed(() =>
  filteredInvoices.value.reduce((sum, inv) => sum + inv.paymentSummary.totalPaid, 0)
)

async function loadData() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await pembelianService.getInvoices({
      search: searchQuery.value,
    })
    invoices.value = res.items
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal memuat rekap pembelian'
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
          <span class="text-xs text-slate-500 font-medium">Total Nilai Pembelian</span>
          <p class="text-lg font-extrabold text-slate-900 mt-0.5">{{ formatRupiah(totalPembelian) }}</p>
          <span class="text-[11px] text-slate-400">{{ filteredInvoices.length }} faktur supplier</span>
        </div>
        <div class="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
          <ShoppingBag class="w-5 h-5" />
        </div>
      </div>

      <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs text-slate-500 font-medium">Kas Terbayar ke Supplier</span>
          <p class="text-lg font-extrabold text-emerald-600 mt-0.5">{{ formatRupiah(totalDibayar) }}</p>
          <span class="text-[11px] text-slate-400">Pembayaran tunai & transfer</span>
        </div>
        <div class="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <Building2 class="w-5 h-5" />
        </div>
      </div>

      <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs text-slate-500 font-medium">Sisa Hutang Usaha</span>
          <p class="text-lg font-extrabold text-red-600 mt-0.5">{{ formatRupiah(totalHutang) }}</p>
          <span class="text-[11px] text-slate-400">Kewajiban tempo berjalan</span>
        </div>
        <div class="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
          <CreditCard class="w-5 h-5" />
        </div>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
      <div class="relative flex-1 w-full">
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari no invoice atau supplier..."
          class="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
          @input="loadData"
        />
      </div>

      <select
        v-model="filterEntity"
        class="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 w-full sm:w-auto"
      >
        <option value="">Semua Entitas</option>
        <option value="SMA">Entitas SMA</option>
        <option value="ST">Entitas ST</option>
      </select>

      <select
        v-model="filterStatus"
        class="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 w-full sm:w-auto"
      >
        <option value="">Semua Status Hutang</option>
        <option value="belum_lunas">Belum Lunas</option>
        <option value="dp">DP / Sebagian</option>
        <option value="lunas">Lunas</option>
      </select>
    </div>

    <!-- Data Table -->
    <AppDataTable
      :columns="columns"
      :items="filteredInvoices as unknown as Record<string, unknown>[]"
      :loading="isLoading"
      :error="errorMessage"
      empty-message="Tidak ada catatan pembelian pada kriteria ini."
    >
      <template #invoiceNumber="{ value }">
        <span class="font-mono font-semibold text-slate-900 text-xs">{{ value }}</span>
      </template>

      <template #supplierName="{ value }">
        <span class="font-medium text-slate-800 text-xs">{{ value }}</span>
      </template>

      <template #entity="{ value }">
        <span
          class="inline-block px-2 py-0.5 rounded text-[11px] font-bold"
          :class="value === 'SMA' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'"
        >
          {{ value }}
        </span>
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
          {{ formatRupiah((item as unknown as PurchaseInvoiceWithDetails).paymentSummary.totalPaid) }}
        </span>
      </template>

      <template #remainingBalance="{ item }">
        <span class="font-bold text-red-600 text-xs">
          {{ formatRupiah((item as unknown as PurchaseInvoiceWithDetails).paymentSummary.remainingBalance) }}
        </span>
      </template>

      <template #status="{ item }">
        <AppStatusBadge :status="(item as unknown as PurchaseInvoiceWithDetails).paymentSummary.status" />
      </template>
    </AppDataTable>
  </div>
</template>

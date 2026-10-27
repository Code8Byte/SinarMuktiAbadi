<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { billingLetterService } from '@/modules/keuangan'
import AppDataTable, { type TableColumn } from '@/shared/components/table/AppDataTable.vue'
import { formatRupiah } from '@/shared/utils/money'
import { Search, FileSpreadsheet, AlertTriangle, Users, Download } from 'lucide-vue-next'
import { exportToCsv } from '@/shared/utils/export'

const router = useRouter()

interface CustomerSummary {
  customerId: string
  customerCode: string
  customerName: string
  totalInvoices: number
  totalBilled: number
  totalPaid: number
  totalOutstanding: number
  unpaidInvoicesCount: number
}

const summaries = ref<CustomerSummary[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')

const columns: TableColumn[] = [
  { key: 'customerCode', label: 'Kode', width: '100px' },
  { key: 'customerName', label: 'Nama Customer' },
  { key: 'totalInvoices', label: 'Total Inv', align: 'center', width: '90px' },
  { key: 'totalBilled', label: 'Total Nilai Faktur', align: 'right' },
  { key: 'totalPaid', label: 'Telah Diterima', align: 'right' },
  { key: 'totalOutstanding', label: 'Sisa Saldo Piutang', align: 'right' },
  { key: 'unpaidInvoicesCount', label: 'Inv Tertunggak', align: 'center', width: '110px' },
  { key: 'actions', label: 'Aksi', align: 'right', width: '130px' },
]

const filteredSummaries = computed(() => {
  if (!searchQuery.value) return summaries.value
  const q = searchQuery.value.toLowerCase()
  return summaries.value.filter(
    (s) => s.customerName.toLowerCase().includes(q) || s.customerCode.toLowerCase().includes(q)
  )
})

const totalPiutangUsaha = computed(() =>
  summaries.value.reduce((sum, s) => sum + s.totalOutstanding, 0)
)
const totalTertunggakCount = computed(() =>
  summaries.value.reduce((sum, s) => sum + s.unpaidInvoicesCount, 0)
)

async function loadData() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    summaries.value = await billingLetterService.getCustomerReceivableSummary()
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal memuat rekap piutang'
  } finally {
    isLoading.value = false
  }
}

function downloadCsv() {
  const headers = ['Kode Customer', 'Nama Customer', 'Total Invoice', 'Total Nilai Faktur', 'Telah Diterima', 'Sisa Saldo Piutang', 'Inv Tertunggak']
  const rows = filteredSummaries.value.map((s) => [
    s.customerCode,
    s.customerName,
    s.totalInvoices,
    s.totalBilled,
    s.totalPaid,
    s.totalOutstanding,
    s.unpaidInvoicesCount,
  ])
  exportToCsv(`rekap-piutang-${new Date().toISOString().slice(0, 10)}`, headers, rows)
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="space-y-4">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs text-slate-500 font-medium">Total Piutang Usaha Belum Lunas</span>
          <p class="text-lg font-extrabold text-red-600 mt-0.5">{{ formatRupiah(totalPiutangUsaha) }}</p>
          <span class="text-[11px] text-slate-400">Total dari seluruh customer</span>
        </div>
        <div class="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
          <AlertTriangle class="w-5 h-5" />
        </div>
      </div>

      <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs text-slate-500 font-medium">Faktur Tertunggak</span>
          <p class="text-lg font-extrabold text-slate-900 mt-0.5">{{ totalTertunggakCount }} Invoice</p>
          <span class="text-[11px] text-slate-400">Memerlukan penagihan aktif</span>
        </div>
        <div class="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
          <Users class="w-5 h-5" />
        </div>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3">
      <div class="relative flex-1">
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari kode atau nama customer..."
          class="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
        title="Unduh data dalam format CSV untuk Excel"
        @click="downloadCsv"
      >
        <Download class="w-3.5 h-3.5 text-slate-600" />
        Ekspor CSV
      </button>
    </div>

    <!-- Data Table -->
    <AppDataTable
      :columns="columns"
      :items="filteredSummaries as unknown as Record<string, unknown>[]"
      :loading="isLoading"
      :error="errorMessage"
      empty-message="Tidak ada catatan saldo piutang customer."
    >
      <template #customerCode="{ value }">
        <span class="font-mono text-xs font-semibold text-slate-700">{{ value }}</span>
      </template>

      <template #customerName="{ value }">
        <span class="font-medium text-slate-900 text-xs">{{ value }}</span>
      </template>

      <template #totalInvoices="{ value }">
        <span class="text-slate-600 text-xs">{{ value }} inv</span>
      </template>

      <template #totalBilled="{ value }">
        <span class="font-medium text-slate-700 text-xs">{{ formatRupiah(value as number) }}</span>
      </template>

      <template #totalPaid="{ value }">
        <span class="font-medium text-emerald-600 text-xs">{{ formatRupiah(value as number) }}</span>
      </template>

      <template #totalOutstanding="{ value }">
        <span class="font-bold text-xs" :class="(value as number) > 0 ? 'text-red-600' : 'text-slate-500'">
          {{ formatRupiah(value as number) }}
        </span>
      </template>

      <template #unpaidInvoicesCount="{ value }">
        <span
          class="inline-block px-2 py-0.5 rounded text-xs font-semibold"
          :class="(value as number) > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'"
        >
          {{ value }}
        </span>
      </template>

      <template #actions="{ item }">
        <div class="flex items-center justify-end">
          <button
            v-if="(item as unknown as CustomerSummary).totalOutstanding > 0"
            v-can="'keuangan.billing_letter.create'"
            type="button"
            class="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold rounded"
            title="Buat Surat Tagihan"
            @click="router.push('/keuangan/surat-tagihan/create')"
          >
            <FileSpreadsheet class="w-3.5 h-3.5 text-sky-600" />
            Surat Tagihan
          </button>
        </div>
      </template>
    </AppDataTable>
  </div>
</template>

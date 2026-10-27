<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { pembelianService } from '@/modules/pembelian'
import AppDataTable, { type TableColumn } from '@/shared/components/table/AppDataTable.vue'
import { formatRupiah } from '@/shared/utils/money'
import { CreditCard, Search, ArrowRight } from 'lucide-vue-next'

const router = useRouter()

interface SupplierDebtSummary {
  supplierId: string
  supplierCode: string
  supplierName: string
  totalInvoices: number
  totalBilled: number
  totalPaid: number
  totalOutstanding: number
}

const debtList = ref<SupplierDebtSummary[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')

const columns: TableColumn[] = [
  { key: 'supplierName', label: 'Nama Supplier' },
  { key: 'totalInvoices', label: 'Jml Faktur', width: '100px', align: 'center' },
  { key: 'totalBilled', label: 'Total Tagihan', align: 'right' },
  { key: 'totalPaid', label: 'Total Dibayar', align: 'right' },
  { key: 'totalOutstanding', label: 'Sisa Hutang Berjalan', align: 'right' },
  { key: 'actions', label: 'Aksi', align: 'right', width: '110px' },
]

async function loadDebtSummary() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const data = await pembelianService.getSupplierDebtSummary()
    debtList.value = data
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal memuat rekap hutang supplier'
  } finally {
    isLoading.value = false
  }
}

const filteredDebt = computed(() => {
  if (!searchQuery.value.trim()) return debtList.value
  const q = searchQuery.value.toLowerCase()
  return debtList.value.filter((d) => d.supplierName.toLowerCase().includes(q))
})

const grandTotalBilled = computed(() => debtList.value.reduce((acc, d) => acc + d.totalBilled, 0))
const grandTotalPaid = computed(() => debtList.value.reduce((acc, d) => acc + d.totalPaid, 0))
const grandTotalOutstanding = computed(() => debtList.value.reduce((acc, d) => acc + d.totalOutstanding, 0))

onMounted(() => {
  loadDebtSummary()
})
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-slate-900">Buku Hutang Supplier (SMA)</h1>
        <p class="text-xs text-slate-500">Rekapitulasi sisa kewajiban hutang dagang kepada supplier</p>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        @click="router.push('/pembelian/invoice')"
      >
        Lihat Semua Invoice
        <ArrowRight class="w-4 h-4" />
      </button>
    </div>

    <!-- Summary Metrics -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <p class="text-[10px] font-semibold text-slate-400 uppercase">Akumulasi Faktur Pembelian</p>
        <p class="text-xl font-bold text-slate-900 mt-1">{{ formatRupiah(grandTotalBilled) }}</p>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <p class="text-[10px] font-semibold text-slate-400 uppercase">Total Hutang Telah Dibayar</p>
        <p class="text-xl font-bold text-emerald-600 mt-1">{{ formatRupiah(grandTotalPaid) }}</p>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <p class="text-[10px] font-semibold text-slate-400 uppercase">Total Sisa Hutang Berjalan</p>
        <p class="text-xl font-bold text-red-600 mt-1">{{ formatRupiah(grandTotalOutstanding) }}</p>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-2">
      <Search class="w-4 h-4 text-slate-400 shrink-0" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Cari nama supplier..."
        class="w-full text-xs bg-transparent focus:outline-none text-slate-800"
      />
    </div>

    <!-- Table -->
    <AppDataTable
      :columns="columns"
      :items="filteredDebt as unknown as Record<string, unknown>[]"
      :loading="isLoading"
      :error="errorMessage"
      empty-message="Tidak ada catatan hutang supplier."
    >
      <template #supplierName="{ item }">
        <span class="font-semibold text-slate-900">
          {{ (item as unknown as SupplierDebtSummary).supplierName }}
        </span>
      </template>

      <template #totalInvoices="{ value }">
        <span class="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
          {{ value }} Faktur
        </span>
      </template>

      <template #totalBilled="{ value }">
        <span class="font-medium text-slate-700">{{ formatRupiah(value as number) }}</span>
      </template>

      <template #totalPaid="{ value }">
        <span class="font-medium text-emerald-600">{{ formatRupiah(value as number) }}</span>
      </template>

      <template #totalOutstanding="{ value }">
        <span class="font-bold text-red-600">{{ formatRupiah(value as number) }}</span>
      </template>

      <template #actions>
        <div class="flex items-center justify-end">
          <button
            type="button"
            class="px-2.5 py-1 text-xs text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded font-medium flex items-center gap-1"
            @click="router.push('/pembelian/invoice')"
          >
            <CreditCard class="w-3.5 h-3.5" />
            Faktur
          </button>
        </div>
      </template>
    </AppDataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { pembelianService } from '@/modules/pembelian'
import AppDataTable, { type TableColumn } from '@/shared/components/table/AppDataTable.vue'
import { formatRupiah } from '@/shared/utils/money'
import { Search, CreditCard, Building } from 'lucide-vue-next'

interface SupplierDebt {
  supplierId: string
  supplierCode: string
  supplierName: string
  totalInvoices: number
  totalBilled: number
  totalPaid: number
  totalOutstanding: number
}

const debts = ref<SupplierDebt[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')

const columns: TableColumn[] = [
  { key: 'supplierName', label: 'Nama Supplier' },
  { key: 'totalInvoices', label: 'Total Faktur', align: 'center', width: '110px' },
  { key: 'totalBilled', label: 'Total Pembelian', align: 'right' },
  { key: 'totalPaid', label: 'Telah Dibayar', align: 'right' },
  { key: 'totalOutstanding', label: 'Sisa Hutang Berjalan', align: 'right' },
  { key: 'status', label: 'Status', align: 'center', width: '130px' },
]

const filteredDebts = computed(() => {
  if (!searchQuery.value) return debts.value
  const q = searchQuery.value.toLowerCase()
  return debts.value.filter((d) => d.supplierName.toLowerCase().includes(q))
})

const totalHutangUsaha = computed(() =>
  debts.value.reduce((sum, d) => sum + d.totalOutstanding, 0)
)
const totalPembelianUsaha = computed(() =>
  debts.value.reduce((sum, d) => sum + d.totalBilled, 0)
)

async function loadData() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    debts.value = await pembelianService.getSupplierDebtSummary()
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal memuat rekap hutang supplier'
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
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs text-slate-500 font-medium">Total Hutang Berjalan ke Supplier</span>
          <p class="text-lg font-extrabold text-red-600 mt-0.5">{{ formatRupiah(totalHutangUsaha) }}</p>
          <span class="text-[11px] text-slate-400">Kewajiban pembayaran aktif</span>
        </div>
        <div class="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
          <CreditCard class="w-5 h-5" />
        </div>
      </div>

      <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs text-slate-500 font-medium">Akumulasi Pembelian Supplier</span>
          <p class="text-lg font-extrabold text-slate-900 mt-0.5">{{ formatRupiah(totalPembelianUsaha) }}</p>
          <span class="text-[11px] text-slate-400">Total belanja bahan baku / persediaan</span>
        </div>
        <div class="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
          <Building class="w-5 h-5" />
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
          placeholder="Cari nama supplier..."
          class="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
      </div>
    </div>

    <!-- Data Table -->
    <AppDataTable
      :columns="columns"
      :items="filteredDebts as unknown as Record<string, unknown>[]"
      :loading="isLoading"
      :error="errorMessage"
      empty-message="Tidak ada catatan hutang supplier."
    >
      <template #supplierName="{ value }">
        <span class="font-medium text-slate-900 text-xs">{{ value }}</span>
      </template>

      <template #totalInvoices="{ value }">
        <span class="text-slate-600 text-xs">{{ value }} faktur</span>
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

      <template #status="{ item }">
        <span
          class="inline-block px-2 py-0.5 rounded text-[11px] font-bold"
          :class="(item as unknown as SupplierDebt).totalOutstanding <= 0
            ? 'bg-emerald-100 text-emerald-800'
            : 'bg-red-100 text-red-800'"
        >
          {{ (item as unknown as SupplierDebt).totalOutstanding <= 0 ? 'Lunas' : 'Belum Lunas' }}
        </span>
      </template>
    </AppDataTable>
  </div>
</template>

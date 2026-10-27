<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { billingLetterService, type BillingLetterWithDetails } from '../services/billingLetterService'
import AppDataTable, { type TableColumn } from '@/shared/components/table/AppDataTable.vue'
import { formatRupiah } from '@/shared/utils/money'
import { formatDate } from '@/shared/utils/date'
import { Plus, Search, Eye, Printer, FileText } from 'lucide-vue-next'

const router = useRouter()

const letters = ref<BillingLetterWithDetails[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')

const columns: TableColumn[] = [
  { key: 'letterNumber', label: 'No. Surat Tagihan', width: '180px' },
  { key: 'customerName', label: 'Customer' },
  { key: 'letterDate', label: 'Tanggal Surat', width: '120px' },
  { key: 'invoiceCount', label: 'Jml Invoice', align: 'center', width: '110px' },
  { key: 'totalOutstandingAmount', label: 'Total Tagihan', align: 'right', width: '160px' },
  { key: 'notes', label: 'Catatan' },
  { key: 'actions', label: 'Aksi', align: 'right', width: '110px' },
]

async function loadLetters() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await billingLetterService.getBillingLetters({
      search: searchQuery.value,
    })
    letters.value = res.items
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal memuat surat tagihan'
  } finally {
    isLoading.value = false
  }
}

function goToDetail(id: string) {
  router.push(`/keuangan/surat-tagihan/${id}`)
}

onMounted(() => {
  loadLetters()
})
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-slate-900">Surat Tagihan Customer</h1>
        <p class="text-xs text-slate-500">Penerbitan dan arsip surat penagihan resmi untuk invoice tertunggak</p>
      </div>

      <button
        v-can="'keuangan.billing_letter.create'"
        type="button"
        class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        @click="router.push('/keuangan/surat-tagihan/create')"
      >
        <Plus class="w-4 h-4" />
        Terbitkan Surat Tagihan
      </button>
    </div>

    <!-- Search Bar -->
    <div class="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3">
      <div class="relative flex-1">
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari no. surat atau customer..."
          class="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
          @input="loadLetters"
        />
      </div>
    </div>

    <!-- Table -->
    <AppDataTable
      :columns="columns"
      :items="letters as unknown as Record<string, unknown>[]"
      :loading="isLoading"
      :error="errorMessage"
      empty-message="Belum ada riwayat surat tagihan yang diterbitkan."
    >
      <template #letterNumber="{ item }">
        <button
          type="button"
          class="font-mono font-semibold text-sky-600 hover:underline text-xs flex items-center gap-1.5"
          @click="goToDetail((item as unknown as BillingLetterWithDetails).id)"
        >
          <FileText class="w-3.5 h-3.5" />
          {{ (item as unknown as BillingLetterWithDetails).letterNumber }}
        </button>
      </template>

      <template #customerName="{ item }">
        <span class="font-medium text-slate-900 text-xs">
          {{ (item as unknown as BillingLetterWithDetails).customerName }}
        </span>
      </template>

      <template #letterDate="{ value }">
        <span class="text-slate-600 text-xs">{{ formatDate(value as string) }}</span>
      </template>

      <template #invoiceCount="{ item }">
        <span class="inline-block px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold text-xs">
          {{ (item as unknown as BillingLetterWithDetails).items.length }} invoice
        </span>
      </template>

      <template #totalOutstandingAmount="{ value }">
        <span class="font-bold text-slate-900 text-xs">{{ formatRupiah(value as number) }}</span>
      </template>

      <template #notes="{ value }">
        <span class="text-slate-500 text-xs italic">{{ (value as string) || '-' }}</span>
      </template>

      <template #actions="{ item }">
        <div class="flex items-center justify-end gap-1">
          <button
            type="button"
            class="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-slate-50 rounded"
            title="Lihat Detail Surat"
            @click="goToDetail((item as unknown as BillingLetterWithDetails).id)"
          >
            <Eye class="w-4 h-4" />
          </button>
          <button
            type="button"
            class="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded"
            title="Cetak Surat Tagihan"
            @click="goToDetail((item as unknown as BillingLetterWithDetails).id)"
          >
            <Printer class="w-4 h-4" />
          </button>
        </div>
      </template>
    </AppDataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { salesInvoiceService, type SalesInvoiceWithDetails } from '@/modules/penjualan'
import CustomerPaymentModal from '../components/CustomerPaymentModal.vue'
import AppDataTable, { type TableColumn } from '@/shared/components/table/AppDataTable.vue'
import AppStatusBadge from '@/shared/components/badge/AppStatusBadge.vue'
import { formatRupiah } from '@/shared/utils/money'
import { formatDate } from '@/shared/utils/date'
import { Search, DollarSign, FileSpreadsheet } from 'lucide-vue-next'

const router = useRouter()

const invoices = ref<SalesInvoiceWithDetails[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')
const filterStatus = ref('')

const isPaymentModalOpen = ref(false)
const invoiceToPay = ref<SalesInvoiceWithDetails | null>(null)

const columns: TableColumn[] = [
  { key: 'invoiceNumber', label: 'No. Invoice', width: '150px' },
  { key: 'customerName', label: 'Customer' },
  { key: 'invoiceDate', label: 'Tgl Faktur', width: '110px' },
  { key: 'dueDate', label: 'Jatuh Tempo', width: '110px' },
  { key: 'totalAmount', label: 'Total Tagihan', align: 'right' },
  { key: 'totalPaid', label: 'Telah Dibayar', align: 'right' },
  { key: 'remainingBalance', label: 'Sisa Piutang', align: 'right' },
  { key: 'status', label: 'Status', width: '110px' },
  { key: 'actions', label: 'Aksi', align: 'right', width: '90px' },
]

async function loadPiutang() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await salesInvoiceService.getInvoices({
      search: searchQuery.value,
      filters: { paymentStatus: filterStatus.value || undefined },
    })
    invoices.value = res.items
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal memuat buku piutang'
  } finally {
    isLoading.value = false
  }
}

function openPaymentModal(inv: SalesInvoiceWithDetails) {
  invoiceToPay.value = inv
  isPaymentModalOpen.value = true
}

async function handlePaymentSaved(payload: {
  amount: number
  paymentDate: string
  paymentMethod: 'CASH' | 'TRANSFER' | 'GIRO'
  referenceNumber?: string
  notes?: string
}) {
  if (!invoiceToPay.value) return
  try {
    await salesInvoiceService.recordPayment(invoiceToPay.value.id, payload)
    isPaymentModalOpen.value = false
    await loadPiutang()
  } catch (err: unknown) {
    alert(err instanceof Error ? err.message : 'Gagal mencatat pembayaran piutang')
  }
}

onMounted(() => {
  loadPiutang()
})
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-slate-900">Buku Piutang Usaha (Customer)</h1>
        <p class="text-xs text-slate-500">Pemantauan saldo piutang dan penerimaan kas pembayaran customer</p>
      </div>

      <button
        v-can="'keuangan.billing_letter.create'"
        type="button"
        class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        @click="router.push('/keuangan/surat-tagihan/create')"
      >
        <FileSpreadsheet class="w-4 h-4" />
        Terbitkan Surat Tagihan
      </button>
    </div>

    <!-- Filters Bar -->
    <div class="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
      <div class="relative flex-1 w-full">
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari no. invoice atau customer..."
          class="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
          @input="loadPiutang"
        />
      </div>

      <select
        v-model="filterStatus"
        class="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 w-full sm:w-auto"
        @change="loadPiutang"
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
      empty-message="Tidak ada catatan piutang yang sesuai."
    >
      <template #invoiceNumber="{ value }">
        <span class="font-mono font-semibold text-slate-900 text-xs">{{ value }}</span>
      </template>

      <template #invoiceDate="{ value }">
        <span class="text-slate-600">{{ formatDate(value as string) }}</span>
      </template>

      <template #dueDate="{ value }">
        <span class="text-slate-600">{{ formatDate(value as string) }}</span>
      </template>

      <template #totalAmount="{ value }">
        <span class="font-semibold text-slate-900">{{ formatRupiah(value as number) }}</span>
      </template>

      <template #totalPaid="{ item }">
        <span class="font-medium text-emerald-600">
          {{ formatRupiah((item as unknown as SalesInvoiceWithDetails).paymentSummary.totalPaid) }}
        </span>
      </template>

      <template #remainingBalance="{ item }">
        <span class="font-bold text-red-600">
          {{ formatRupiah((item as unknown as SalesInvoiceWithDetails).paymentSummary.remainingBalance) }}
        </span>
      </template>

      <template #status="{ item }">
        <AppStatusBadge :status="(item as unknown as SalesInvoiceWithDetails).paymentSummary.status" />
      </template>

      <template #actions="{ item }">
        <div class="flex items-center justify-end">
          <button
            v-if="(item as unknown as SalesInvoiceWithDetails).paymentSummary.remainingBalance > 0"
            v-can="'keuangan.piutang.payment'"
            type="button"
            class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
            title="Catat penerimaan uang"
            @click="openPaymentModal(item as unknown as SalesInvoiceWithDetails)"
          >
            <DollarSign class="w-4 h-4" />
          </button>
        </div>
      </template>
    </AppDataTable>

    <!-- Payment Modal -->
    <CustomerPaymentModal
      :is-open="isPaymentModalOpen"
      :invoice="invoiceToPay"
      @close="isPaymentModalOpen = false"
      @saved="handlePaymentSaved"
    />
  </div>
</template>

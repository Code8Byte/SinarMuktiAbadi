<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { pembelianService, type PurchaseInvoiceWithDetails } from '../services/pembelianService'
import PurchasePaymentModal from '../components/PurchasePaymentModal.vue'
import AppDataTable, { type TableColumn } from '@/shared/components/table/AppDataTable.vue'
import AppStatusBadge from '@/shared/components/badge/AppStatusBadge.vue'
import { formatRupiah } from '@/shared/utils/money'
import { formatDate } from '@/shared/utils/date'
import { Plus, Search, Eye, DollarSign } from 'lucide-vue-next'

const router = useRouter()

const invoices = ref<PurchaseInvoiceWithDetails[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')
const filterEntity = ref('')
const filterStatus = ref('')

const isPaymentModalOpen = ref(false)
const invoiceToPay = ref<PurchaseInvoiceWithDetails | null>(null)

const columns: TableColumn[] = [
  { key: 'invoiceNumber', label: 'No. Invoice', width: '150px' },
  { key: 'supplierName', label: 'Supplier' },
  { key: 'entity', label: 'Entitas', width: '90px' },
  { key: 'invoiceDate', label: 'Tanggal', width: '110px' },
  { key: 'paymentTerms', label: 'Termin', width: '90px' },
  { key: 'totalAmount', label: 'Total Faktur', align: 'right' },
  { key: 'remainingBalance', label: 'Sisa Hutang', align: 'right' },
  { key: 'status', label: 'Status Hutang', width: '120px' },
  { key: 'actions', label: 'Aksi', align: 'right', width: '90px' },
]

async function loadInvoices() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await pembelianService.getInvoices({
      search: searchQuery.value,
      filters: {
        entity: filterEntity.value || undefined,
        paymentStatus: filterStatus.value || undefined,
      },
    })
    invoices.value = res.items
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal memuat invoice pembelian'
  } finally {
    isLoading.value = false
  }
}

function openPaymentModal(inv: PurchaseInvoiceWithDetails) {
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
    await pembelianService.recordPayment(invoiceToPay.value.id, payload)
    isPaymentModalOpen.value = false
    await loadInvoices()
  } catch (err: unknown) {
    alert(err instanceof Error ? err.message : 'Gagal mencatat pembayaran')
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
        <h1 class="text-xl font-bold text-slate-900">Invoice Pembelian Supplier (SMA)</h1>
        <p class="text-xs text-slate-500">Pencatatan faktur pengadaan barang supplier untuk entitas SMA dan ST</p>
      </div>

      <button
        v-can="'pembelian.invoice.create'"
        type="button"
        class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        @click="router.push('/pembelian/invoice/create')"
      >
        <Plus class="w-4 h-4" />
        Input Invoice Baru
      </button>
    </div>

    <!-- Filters Bar -->
    <div class="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
      <div class="relative flex-1 w-full">
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari no. invoice, supplier, no. faktur fisik..."
          class="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
          @input="loadInvoices"
        />
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto">
        <select
          v-model="filterEntity"
          class="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700"
          @change="loadInvoices"
        >
          <option value="">Semua Entitas</option>
          <option value="SMA">SMA</option>
          <option value="ST">ST</option>
        </select>

        <select
          v-model="filterStatus"
          class="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700"
          @change="loadInvoices"
        >
          <option value="">Semua Status</option>
          <option value="belum_lunas">Belum Lunas</option>
          <option value="dp">DP (Parsial)</option>
          <option value="lunas">Lunas</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <AppDataTable
      :columns="columns"
      :items="invoices as unknown as Record<string, unknown>[]"
      :loading="isLoading"
      :error="errorMessage"
      empty-message="Tidak ada data invoice pembelian yang sesuai filter."
    >
      <template #invoiceNumber="{ item }">
        <div>
          <span class="font-mono font-semibold text-slate-900 text-xs">
            {{ (item as unknown as PurchaseInvoiceWithDetails).invoiceNumber }}
          </span>
          <p class="text-[10px] text-slate-400 mt-0.5">
            Ref: {{ (item as unknown as PurchaseInvoiceWithDetails).supplierInvoiceNumber }}
          </p>
        </div>
      </template>

      <template #entity="{ value }">
        <span
          class="px-2 py-0.5 rounded text-[10px] font-bold"
          :class="value === 'SMA' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'"
        >
          {{ value }}
        </span>
      </template>

      <template #invoiceDate="{ value }">
        <span class="text-slate-600">{{ formatDate(value as string) }}</span>
      </template>

      <template #paymentTerms="{ value }">
        <span class="uppercase text-[11px] font-medium text-slate-700">{{ value }}</span>
      </template>

      <template #totalAmount="{ value }">
        <span class="font-bold text-slate-900">{{ formatRupiah(value as number) }}</span>
      </template>

      <template #remainingBalance="{ item }">
        <span class="font-semibold text-red-600">
          {{ formatRupiah((item as unknown as PurchaseInvoiceWithDetails).paymentSummary.remainingBalance) }}
        </span>
      </template>

      <template #status="{ item }">
        <AppStatusBadge :status="(item as unknown as PurchaseInvoiceWithDetails).paymentSummary.status" />
      </template>

      <template #actions="{ item }">
        <div class="flex items-center justify-end gap-1">
          <button
            type="button"
            class="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded"
            title="Lihat detail faktur"
            @click="router.push(`/pembelian/invoice/${(item as unknown as PurchaseInvoiceWithDetails).id}`)"
          >
            <Eye class="w-3.5 h-3.5" />
          </button>

          <button
            v-if="(item as unknown as PurchaseInvoiceWithDetails).paymentSummary.remainingBalance > 0"
            v-can="'keuangan.hutang.payment'"
            type="button"
            class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
            title="Catat bayar hutang"
            @click="openPaymentModal(item as unknown as PurchaseInvoiceWithDetails)"
          >
            <DollarSign class="w-3.5 h-3.5" />
          </button>
        </div>
      </template>
    </AppDataTable>

    <!-- Payment Modal -->
    <PurchasePaymentModal
      :is-open="isPaymentModalOpen"
      :invoice="invoiceToPay"
      @close="isPaymentModalOpen = false"
      @saved="handlePaymentSaved"
    />
  </div>
</template>

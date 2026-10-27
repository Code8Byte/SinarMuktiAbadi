<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { salesInvoiceService, type SalesInvoiceWithDetails } from '../services/salesInvoiceService'
import AppStatusBadge from '@/shared/components/badge/AppStatusBadge.vue'
import { formatRupiah } from '@/shared/utils/money'
import { formatDate } from '@/shared/utils/date'
import { ArrowLeft, Printer } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const invoice = ref<SalesInvoiceWithDetails | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')

async function loadDetail() {
  const id = route.params.id as string
  isLoading.value = true
  errorMessage.value = ''
  try {
    const data = await salesInvoiceService.getInvoiceById(id)
    if (!data) throw new Error('Invoice penjualan tidak ditemukan.')
    invoice.value = data
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal memuat detail invoice'
  } finally {
    isLoading.value = false
  }
}

function handlePrint() {
  window.print()
}

onMounted(() => {
  loadDetail()
})
</script>

<template>
  <div v-if="invoice" class="space-y-6 max-w-4xl mx-auto">
    <!-- Header (Hidden on Print) -->
    <div class="flex items-center justify-between print:hidden">
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
          @click="router.push('/penjualan/invoice')"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-bold text-slate-900">{{ invoice.invoiceNumber }}</h1>
            <AppStatusBadge :status="invoice.paymentSummary.status" />
          </div>
          <p class="text-xs text-slate-500 mt-0.5">Customer: {{ invoice.customerName }}</p>
        </div>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        @click="handlePrint"
      >
        <Printer class="w-4 h-4" />
        Cetak Invoice & Faktur
      </button>
    </div>

    <!-- Printable Invoice Document -->
    <div class="bg-white rounded-xl border border-slate-200 p-8 shadow-sm print:border-none print:shadow-none print:p-0 space-y-6">
      <!-- Invoice Header -->
      <div class="flex justify-between items-start border-b border-slate-200 pb-5">
        <div>
          <h2 class="text-lg font-black tracking-wide text-slate-900 uppercase">FAKTUR / INVOICE PENJUALAN</h2>
          <p class="font-mono text-sm font-bold text-sky-700 mt-1">{{ invoice.invoiceNumber }}</p>
          <p v-if="invoice.fakturStatus" class="text-xs text-slate-500 mt-1">
            Status Pajak: <span class="font-semibold uppercase">{{ invoice.fakturStatus.replace('_', ' ') }}</span>
          </p>
        </div>

        <div class="text-right text-xs space-y-1">
          <p><span class="text-slate-400">Tanggal Faktur:</span> <span class="font-bold text-slate-800">{{ formatDate(invoice.invoiceDate) }}</span></p>
          <p><span class="text-slate-400">Jatuh Tempo:</span> <span class="font-bold text-slate-800">{{ formatDate(invoice.dueDate) }}</span></p>
          <p><span class="text-slate-400">Termin:</span> <span class="font-bold text-slate-800 uppercase">{{ invoice.paymentTerms }}</span></p>
        </div>
      </div>

      <!-- Customer Info -->
      <div class="bg-slate-50 p-4 rounded-lg text-xs grid grid-cols-2 gap-4">
        <div>
          <p class="text-[10px] uppercase font-bold text-slate-400">Ditagihkan Kepada:</p>
          <p class="font-bold text-slate-900 text-sm mt-0.5">{{ invoice.customerName }}</p>
        </div>
        <div>
          <p class="text-[10px] uppercase font-bold text-slate-400">Catatan / Referensi:</p>
          <p class="text-slate-700 mt-0.5">{{ invoice.notes || '-' }}</p>
        </div>
      </div>

      <!-- Financial Totals -->
      <div class="border border-slate-200 rounded-lg p-5 max-w-sm ml-auto space-y-2 text-xs">
        <div class="flex justify-between text-slate-600">
          <span>Subtotal Barang</span>
          <span class="font-semibold">{{ formatRupiah(invoice.subtotal) }}</span>
        </div>
        <div class="flex justify-between text-slate-600">
          <span>PPN</span>
          <span class="font-semibold">{{ formatRupiah(invoice.taxAmount) }}</span>
        </div>
        <div class="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-slate-200">
          <span>Total Nilai Tagihan</span>
          <span class="text-sky-700">{{ formatRupiah(invoice.totalAmount) }}</span>
        </div>
        <div class="flex justify-between text-emerald-600 font-medium pt-1">
          <span>Total Telah Dibayar</span>
          <span>{{ formatRupiah(invoice.paymentSummary.totalPaid) }}</span>
        </div>
        <div class="flex justify-between text-red-600 font-bold text-sm pt-1 border-t border-slate-100">
          <span>Sisa Piutang Berjalan</span>
          <span>{{ formatRupiah(invoice.paymentSummary.remainingBalance) }}</span>
        </div>
      </div>

      <!-- Signatures -->
      <div class="grid grid-cols-2 gap-6 text-center text-xs pt-12">
        <div class="space-y-12">
          <p class="font-medium text-slate-500">Penerima Tagihan,</p>
          <p class="font-bold text-slate-900 border-t border-slate-400 pt-1 mx-8">( {{ invoice.customerName }} )</p>
        </div>
        <div class="space-y-12">
          <p class="font-medium text-slate-500">Hormat Kami,</p>
          <p class="font-bold text-slate-900 border-t border-slate-400 pt-1 mx-8">( Bagian Keuangan )</p>
        </div>
      </div>
    </div>
  </div>
</template>

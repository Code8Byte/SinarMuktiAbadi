<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { pembelianService, type PurchaseInvoiceWithDetails } from '../services/pembelianService'
import PurchasePaymentModal from '../components/PurchasePaymentModal.vue'
import AppStatusBadge from '@/shared/components/badge/AppStatusBadge.vue'
import { formatRupiah } from '@/shared/utils/money'
import { formatDate } from '@/shared/utils/date'
import { ArrowLeft, DollarSign, Building2, Calendar, FileText } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const invoice = ref<PurchaseInvoiceWithDetails | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')
const isPaymentModalOpen = ref(false)

async function loadDetail() {
  const id = route.params.id as string
  isLoading.value = true
  errorMessage.value = ''
  try {
    const data = await pembelianService.getInvoiceById(id)
    if (!data) throw new Error('Invoice pembelian tidak ditemukan.')
    invoice.value = data
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal memuat detail invoice'
  } finally {
    isLoading.value = false
  }
}

async function handleSavePayment(payload: {
  amount: number
  paymentDate: string
  paymentMethod: 'CASH' | 'TRANSFER' | 'GIRO'
  referenceNumber?: string
  notes?: string
}) {
  if (!invoice.value) return
  try {
    await pembelianService.recordPayment(invoice.value.id, payload)
    isPaymentModalOpen.value = false
    await loadDetail()
  } catch (err: unknown) {
    alert(err instanceof Error ? err.message : 'Gagal mencatat pembayaran')
  }
}

onMounted(() => {
  loadDetail()
})
</script>

<template>
  <div v-if="invoice" class="space-y-6 max-w-5xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
          @click="router.push('/pembelian/invoice')"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-bold text-slate-900">{{ invoice.invoiceNumber }}</h1>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                  :class="invoice.entity === 'SMA' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'">
              Entitas: {{ invoice.entity }}
            </span>
            <AppStatusBadge :status="invoice.paymentSummary.status" />
          </div>
          <p class="text-xs text-slate-500 mt-0.5">No. Faktur Fisik: {{ invoice.supplierInvoiceNumber }}</p>
        </div>
      </div>

      <button
        v-if="invoice.paymentSummary.remainingBalance > 0"
        v-can="'keuangan.hutang.payment'"
        type="button"
        class="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        @click="isPaymentModalOpen = true"
      >
        <DollarSign class="w-4 h-4" />
        Catat Pembayaran Hutang
      </button>
    </div>

    <!-- Info Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-start gap-3">
        <Building2 class="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div class="text-xs">
          <p class="text-slate-400 font-semibold uppercase text-[10px]">Supplier</p>
          <p class="font-bold text-slate-900 mt-0.5">{{ invoice.supplierName }}</p>
          <span class="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded font-medium">
            {{ invoice.supplierTaxType.toUpperCase() }}
          </span>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-start gap-3">
        <Calendar class="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div class="text-xs">
          <p class="text-slate-400 font-semibold uppercase text-[10px]">Tanggal & Termin</p>
          <p class="font-bold text-slate-900 mt-0.5">Faktur: {{ formatDate(invoice.invoiceDate) }}</p>
          <p class="text-slate-500 text-[11px]">Jatuh Tempo: {{ formatDate(invoice.dueDate) }} ({{ invoice.paymentTerms.toUpperCase() }})</p>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-start gap-3">
        <FileText class="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div class="text-xs">
          <p class="text-slate-400 font-semibold uppercase text-[10px]">Status Pembayaran</p>
          <p class="font-bold text-slate-900 mt-0.5">Total: {{ formatRupiah(invoice.totalAmount) }}</p>
          <p class="text-red-600 text-[11px] font-semibold">Sisa: {{ formatRupiah(invoice.paymentSummary.remainingBalance) }}</p>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div class="px-5 py-3 border-b border-slate-200 bg-slate-50 font-bold text-xs text-slate-800">
        Rincian Barang yang Diterima
      </div>
      <table class="w-full text-left text-xs">
        <thead class="bg-slate-50/50 text-slate-500 border-b border-slate-200 font-semibold text-[11px]">
          <tr>
            <th class="px-4 py-2.5">No</th>
            <th class="px-4 py-2.5">Barang</th>
            <th class="px-4 py-2.5 text-right">Qty</th>
            <th class="px-4 py-2.5">Satuan</th>
            <th class="px-4 py-2.5 text-right">Harga Satuan</th>
            <th class="px-4 py-2.5 text-right">Total Harga</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="(it, idx) in invoice.items" :key="it.id">
            <td class="px-4 py-2.5 text-slate-400">{{ idx + 1 }}</td>
            <td class="px-4 py-2.5 font-medium text-slate-800">{{ it.notes || it.barangId }}</td>
            <td class="px-4 py-2.5 text-right font-semibold">{{ it.qty }}</td>
            <td class="px-4 py-2.5 text-slate-600">{{ it.unit }}</td>
            <td class="px-4 py-2.5 text-right font-medium">{{ formatRupiah(it.unitPrice) }}</td>
            <td class="px-4 py-2.5 text-right font-bold text-slate-900">{{ formatRupiah(it.totalPrice) }}</td>
          </tr>
        </tbody>
        <tfoot class="bg-slate-50 text-xs border-t border-slate-200">
          <tr>
            <td colspan="5" class="px-4 py-2 text-right text-slate-600">Subtotal</td>
            <td class="px-4 py-2 text-right font-semibold">{{ formatRupiah(invoice.subtotal) }}</td>
          </tr>
          <tr>
            <td colspan="5" class="px-4 py-2 text-right text-slate-600">PPN</td>
            <td class="px-4 py-2 text-right font-semibold">{{ formatRupiah(invoice.taxAmount) }}</td>
          </tr>
          <tr class="font-bold text-slate-900">
            <td colspan="5" class="px-4 py-2.5 text-right">Total Tagihan</td>
            <td class="px-4 py-2.5 text-right text-sky-700 text-sm">{{ formatRupiah(invoice.totalAmount) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Payments Table -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div class="px-5 py-3 border-b border-slate-200 bg-slate-50 font-bold text-xs text-slate-800">
        Riwayat Pembayaran Hutang
      </div>
      <div v-if="invoice.payments.length === 0" class="py-8 text-center text-xs text-slate-400">
        Belum ada pembayaran yang dicatat untuk invoice ini.
      </div>
      <table v-else class="w-full text-left text-xs">
        <thead class="bg-slate-50/50 text-slate-500 border-b border-slate-200 font-semibold text-[11px]">
          <tr>
            <th class="px-4 py-2.5">No. Bukti Bayar</th>
            <th class="px-4 py-2.5">Tanggal</th>
            <th class="px-4 py-2.5">Metode</th>
            <th class="px-4 py-2.5">Referensi</th>
            <th class="px-4 py-2.5 text-right">Nominal</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="pay in invoice.payments" :key="pay.id">
            <td class="px-4 py-2.5 font-mono font-medium text-slate-800">{{ pay.paymentNumber }}</td>
            <td class="px-4 py-2.5 text-slate-600">{{ formatDate(pay.paymentDate) }}</td>
            <td class="px-4 py-2.5">
              <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                {{ pay.paymentMethod }}
              </span>
            </td>
            <td class="px-4 py-2.5 text-slate-500">{{ pay.referenceNumber || '-' }}</td>
            <td class="px-4 py-2.5 text-right font-bold text-emerald-600">{{ formatRupiah(pay.amount) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <PurchasePaymentModal
      :is-open="isPaymentModalOpen"
      :invoice="invoice"
      @close="isPaymentModalOpen = false"
      @saved="handleSavePayment"
    />
  </div>
</template>

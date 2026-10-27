<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { billingLetterService, type BillingLetterWithDetails } from '../services/billingLetterService'
import { useVariantConfig } from '@/shared/composables/useVariantConfig'
import { formatRupiah } from '@/shared/utils/money'
import { formatDate } from '@/shared/utils/date'
import { ArrowLeft, Printer, AlertCircle } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { config } = useVariantConfig()

const letter = ref<BillingLetterWithDetails | null>(null)
const isLoading = ref(true)
const errorMessage = ref('')

async function loadData() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const id = route.params.id as string
    const res = await billingLetterService.getBillingLetterById(id)
    if (!res) {
      errorMessage.value = 'Surat tagihan tidak ditemukan.'
    } else {
      letter.value = res
    }
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal memuat detail surat tagihan'
  } finally {
    isLoading.value = false
  }
}

function handlePrint() {
  window.print()
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-4 pb-12">
    <!-- Non-printed Toolbar -->
    <div class="flex items-center justify-between print:hidden">
      <button
        type="button"
        class="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800"
        @click="router.push('/keuangan/surat-tagihan')"
      >
        <ArrowLeft class="w-4 h-4" />
        Kembali ke Daftar Surat Tagihan
      </button>

      <div class="flex items-center gap-2">
        <button
          v-can="'keuangan.billing_letter.print'"
          type="button"
          class="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          @click="handlePrint"
        >
          <Printer class="w-4 h-4" />
          Cetak Surat Tagihan (PDF)
        </button>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="errorMessage" class="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2.5 text-red-700 text-xs">
      <AlertCircle class="w-4 h-4" />
      <span>{{ errorMessage }}</span>
    </div>

    <div v-else-if="isLoading" class="p-12 text-center text-xs text-slate-400">
      Memuat dokumen surat tagihan...
    </div>

    <!-- Document Paper -->
    <div
      v-else-if="letter"
      class="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 shadow-sm print:shadow-none print:border-none print:p-0 print:m-0"
    >
      <!-- Letterhead (KOP) -->
      <div class="border-b-2 border-slate-900 pb-4 mb-6">
        <div class="flex items-start justify-between">
          <div>
            <h1 class="text-xl font-extrabold text-slate-900 tracking-tight">
              {{ config.companyFullName }}
            </h1>
            <p class="text-xs text-slate-600 mt-0.5">
              Distribusi & Perdagangan Tekstil • Jakarta, Indonesia
            </p>
            <p class="text-[11px] text-slate-500">
              Telp: (021) 555-0199 • Email: finance@{{ config.id }}.co.id
            </p>
          </div>
          <div class="text-right">
            <span class="inline-block px-3 py-1 bg-slate-100 text-slate-800 text-xs font-bold rounded">
              SURAT TAGIHAN
            </span>
          </div>
        </div>
      </div>

      <!-- Letter Info & Recipient -->
      <div class="grid grid-cols-2 gap-6 text-xs mb-6">
        <div>
          <span class="text-slate-400 uppercase tracking-wider text-[10px] font-semibold block mb-1">Kepada Yth:</span>
          <p class="font-bold text-slate-900 text-sm">{{ letter.customerName }}</p>
          <p class="text-slate-600 whitespace-pre-line mt-0.5">{{ letter.customerAddress }}</p>
          <p class="text-slate-500 mt-1">Telp: {{ letter.customerPhone }}</p>
        </div>

        <div class="text-right space-y-1">
          <div>
            <span class="text-slate-500 font-medium">Nomor Surat: </span>
            <span class="font-mono font-bold text-slate-900">{{ letter.letterNumber }}</span>
          </div>
          <div>
            <span class="text-slate-500 font-medium">Tanggal Diterbitkan: </span>
            <span class="font-semibold text-slate-900">{{ formatDate(letter.letterDate) }}</span>
          </div>
          <div>
            <span class="text-slate-500 font-medium">Perihal: </span>
            <span class="font-semibold text-slate-900">Pemberitahuan Pelunasan Faktur</span>
          </div>
        </div>
      </div>

      <!-- Letter Body Introduction -->
      <div class="text-xs text-slate-700 leading-relaxed mb-4">
        <p>Dengan hormat,</p>
        <p class="mt-1">
          Berdasarkan catatan pembukuan kami, bersama surat ini kami sampaikan rincian faktur penjualan yang masih memiliki sisa pembayaran tertunggak sebagai berikut:
        </p>
      </div>

      <!-- Table of Invoices -->
      <div class="border border-slate-300 rounded mb-6 overflow-hidden">
        <table class="w-full text-xs">
          <thead class="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold text-left">
            <tr>
              <th class="w-10 px-3 py-2 text-center">No</th>
              <th class="px-3 py-2">No. Invoice</th>
              <th class="px-3 py-2 text-right">Nilai Faktur</th>
              <th class="px-3 py-2 text-right">Telah Dibayar</th>
              <th class="px-3 py-2 text-right">Sisa Tagihan</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="(item, idx) in letter.items" :key="item.id">
              <td class="px-3 py-2 text-center text-slate-500">{{ idx + 1 }}</td>
              <td class="px-3 py-2 font-mono font-bold text-slate-900">{{ item.invoiceNumber }}</td>
              <td class="px-3 py-2 text-right font-medium text-slate-700">{{ formatRupiah(item.originalAmount) }}</td>
              <td class="px-3 py-2 text-right text-emerald-700 font-medium">{{ formatRupiah(item.paidAmount) }}</td>
              <td class="px-3 py-2 text-right font-bold text-red-700">{{ formatRupiah(item.remainingBalance) }}</td>
            </tr>
          </tbody>
          <tfoot class="bg-slate-50 border-t-2 border-slate-300">
            <tr>
              <td colspan="4" class="px-3 py-2.5 text-right font-bold text-slate-900 uppercase">
                Total Tagihan yang Harus Dibayar:
              </td>
              <td class="px-3 py-2.5 text-right font-extrabold text-slate-900 text-sm">
                {{ formatRupiah(letter.totalOutstandingAmount) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Notes & Payment Instruction -->
      <div class="p-4 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 space-y-1.5 mb-8">
        <p class="font-bold text-slate-900">Instruksi Pembayaran:</p>
        <p>Pembayaran dapat ditransfer melalui rekening resmi perusahaan:</p>
        <p class="font-mono font-semibold text-slate-800">• Bank Central Asia (BCA): 8820-192-800 a.n. {{ config.companyFullName }}</p>
        <p v-if="letter.notes" class="italic text-slate-600 pt-1">
          Catatan Tambahan: {{ letter.notes }}
        </p>
      </div>

      <!-- Signatures -->
      <div class="grid grid-cols-2 gap-8 text-xs text-center pt-4">
        <div>
          <p class="text-slate-500 mb-16">Disiapkan oleh,</p>
          <p class="font-bold text-slate-900 border-b border-slate-400 inline-block px-8 pb-1">Bagian Keuangan</p>
          <p class="text-[11px] text-slate-500 mt-0.5">Finance & Accounting</p>
        </div>

        <div>
          <p class="text-slate-500 mb-16">Mengetahui,</p>
          <p class="font-bold text-slate-900 border-b border-slate-400 inline-block px-8 pb-1">Pimpinan Perusahaan</p>
          <p class="text-[11px] text-slate-500 mt-0.5">{{ config.companyFullName }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { customerService } from '@/modules/customers'
import { salesInvoiceService, type SalesInvoiceWithDetails } from '@/modules/penjualan'
import { billingLetterService } from '../services/billingLetterService'
import UnpaidInvoicesPicker from '../components/UnpaidInvoicesPicker.vue'
import { useVariantConfig } from '@/shared/composables/useVariantConfig'
import type { Customer } from '@/shared/types/entity'
import { ArrowLeft, AlertCircle, FileSpreadsheet } from 'lucide-vue-next'

const router = useRouter()
const { config } = useVariantConfig()

const customers = ref<Customer[]>([])
const selectedCustomerId = ref('')
const unpaidInvoices = ref<SalesInvoiceWithDetails[]>([])
const selectedInvoiceIds = ref<string[]>([])
const letterDate = ref(new Date().toISOString().slice(0, 10))
const notes = ref('')

const isLoadingCustomers = ref(false)
const isLoadingInvoices = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

async function loadCustomers() {
  isLoadingCustomers.value = true
  try {
    const res = await customerService.getCustomers({ limit: 1000 })
    customers.value = res.items
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal memuat data customer'
  } finally {
    isLoadingCustomers.value = false
  }
}

async function handleCustomerChange() {
  selectedInvoiceIds.value = []
  unpaidInvoices.value = []
  errorMessage.value = ''
  if (!selectedCustomerId.value) return

  isLoadingInvoices.value = true
  try {
    const res = await salesInvoiceService.getInvoices({
      limit: 1000,
      filters: { customerId: selectedCustomerId.value },
    })
    unpaidInvoices.value = res.items.filter((inv) => inv.paymentSummary.remainingBalance > 0)
    selectedInvoiceIds.value = unpaidInvoices.value.map((inv) => inv.id)
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal memuat invoice customer'
  } finally {
    isLoadingInvoices.value = false
  }
}

async function handleSubmit() {
  if (!selectedCustomerId.value) {
    errorMessage.value = 'Silakan pilih customer terlebih dahulu.'
    return
  }
  if (selectedInvoiceIds.value.length === 0) {
    errorMessage.value = 'Pilih minimal satu invoice tertunggak untuk dibuatkan surat tagihan.'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  try {
    const created = await billingLetterService.createBillingLetter(
      {
        customerId: selectedCustomerId.value,
        letterDate: letterDate.value,
        invoiceIds: selectedInvoiceIds.value,
        notes: notes.value,
      },
      config.id.toUpperCase()
    )
    router.push(`/keuangan/surat-tagihan/${created.id}`)
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal membuat surat tagihan'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  loadCustomers()
})
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-5 pb-12">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <button
        type="button"
        class="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800"
        @click="router.push('/keuangan/surat-tagihan')"
      >
        <ArrowLeft class="w-4 h-4" />
        Kembali ke Daftar Surat Tagihan
      </button>
      <span class="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
        Entitas: {{ config.appName }}
      </span>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div>
        <h1 class="text-xl font-bold text-slate-900">Terbitkan Surat Tagihan Baru</h1>
        <p class="text-xs text-slate-500 mt-1">
          Pilih customer untuk menampilkan invoice tertunggak, lalu tentukan daftar invoice yang akan ditagihkan.
        </p>
      </div>

      <!-- Error Alert -->
      <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-red-700 text-xs">
        <AlertCircle class="w-4 h-4 mt-0.5 shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Customer Selection & Metadata -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1.5">
            Pilih Customer <span class="text-red-500">*</span>
          </label>
          <select
            v-model="selectedCustomerId"
            class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            :disabled="isLoadingCustomers || isSubmitting"
            @change="handleCustomerChange"
          >
            <option value="">-- Pilih Customer --</option>
            <option v-for="c in customers" :key="c.id" :value="c.id">
              {{ c.name }} ({{ c.code }})
            </option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1.5">
            Tanggal Surat Tagihan <span class="text-red-500">*</span>
          </label>
          <input
            v-model="letterDate"
            type="date"
            class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            :disabled="isSubmitting"
          />
        </div>

        <div class="md:col-span-2">
          <label class="block text-xs font-semibold text-slate-700 mb-1.5">
            Catatan / Pesan Tambahan (Opsional)
          </label>
          <input
            v-model="notes"
            type="text"
            placeholder="Contoh: Mohon pelunasan sebelum akhir bulan berjalan ke rekening BCA..."
            class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            :disabled="isSubmitting"
          />
        </div>
      </div>

      <!-- Unpaid Invoices Component -->
      <UnpaidInvoicesPicker
        v-if="selectedCustomerId"
        v-model:selected-ids="selectedInvoiceIds"
        :invoices="unpaidInvoices"
        :is-loading="isLoadingInvoices"
      />

      <!-- Submit Actions -->
      <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          class="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
          :disabled="isSubmitting"
          @click="router.push('/keuangan/surat-tagihan')"
        >
          Batal
        </button>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
          :disabled="isSubmitting || selectedInvoiceIds.length === 0"
          @click="handleSubmit"
        >
          <FileSpreadsheet class="w-4 h-4" />
          {{ isSubmitting ? 'Menerbitkan Surat...' : 'Terbitkan Surat Tagihan' }}
        </button>
      </div>
    </div>
  </div>
</template>

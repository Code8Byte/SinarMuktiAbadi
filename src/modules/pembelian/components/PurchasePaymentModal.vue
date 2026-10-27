<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PurchaseInvoiceWithDetails } from '../services/pembelianService'
import AppInput from '@/shared/components/form/AppInput.vue'
import AppSelect from '@/shared/components/form/AppSelect.vue'
import { formatRupiah, parseRupiah } from '@/shared/utils/money'
import { getTodayIsoDate } from '@/shared/utils/date'
import { X, DollarSign } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  invoice: PurchaseInvoiceWithDetails | null
}>()

const emit = defineEmits<{
  close: []
  saved: [
    payload: {
      amount: number
      paymentDate: string
      paymentMethod: 'CASH' | 'TRANSFER' | 'GIRO'
      referenceNumber?: string
      notes?: string
    },
  ]
}>()

const amountFormatted = ref('')
const paymentDate = ref(getTodayIsoDate())
const paymentMethod = ref<'CASH' | 'TRANSFER' | 'GIRO'>('TRANSFER')
const referenceNumber = ref('')
const notes = ref('')
const errorMessage = ref('')

const methodOptions = [
  { value: 'TRANSFER', label: 'Transfer Bank' },
  { value: 'CASH', label: 'Tunai (Cash)' },
  { value: 'GIRO', label: 'Bilyet Giro / Cek' },
]

watch(
  () => props.isOpen,
  (open) => {
    if (open && props.invoice) {
      errorMessage.value = ''
      amountFormatted.value = String(props.invoice.paymentSummary.remainingBalance)
      paymentDate.value = getTodayIsoDate()
      paymentMethod.value = 'TRANSFER'
      referenceNumber.value = ''
      notes.value = ''
    }
  }
)

function setFullAmount() {
  if (props.invoice) {
    amountFormatted.value = String(props.invoice.paymentSummary.remainingBalance)
  }
}

function handleSubmit() {
  const numericAmount = parseRupiah(amountFormatted.value)
  if (numericAmount <= 0) {
    errorMessage.value = 'Nominal pembayaran harus lebih besar dari Rp 0.'
    return
  }

  emit('saved', {
    amount: numericAmount,
    paymentDate: paymentDate.value,
    paymentMethod: paymentMethod.value,
    referenceNumber: referenceNumber.value.trim() || undefined,
    notes: notes.value.trim() || undefined,
  })
}
</script>

<template>
  <div v-if="isOpen && invoice" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
    <div class="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
        <div>
          <h3 class="text-sm font-bold">Catat Pembayaran Hutang Supplier</h3>
          <p class="text-xs text-slate-400 mt-0.5">{{ invoice.invoiceNumber }} • {{ invoice.supplierName }}</p>
        </div>
        <button type="button" class="text-slate-400 hover:text-white" @click="emit('close')">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Debt Summary Card -->
      <div class="bg-slate-50 border-b border-slate-200 px-6 py-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <p class="text-[10px] text-slate-500 uppercase font-semibold">Total Tagihan</p>
          <p class="font-bold text-slate-800">{{ formatRupiah(invoice.totalAmount) }}</p>
        </div>
        <div>
          <p class="text-[10px] text-slate-500 uppercase font-semibold">Sudah Dibayar</p>
          <p class="font-bold text-emerald-600">{{ formatRupiah(invoice.paymentSummary.totalPaid) }}</p>
        </div>
        <div>
          <p class="text-[10px] text-slate-500 uppercase font-semibold">Sisa Hutang</p>
          <p class="font-bold text-red-600">{{ formatRupiah(invoice.paymentSummary.remainingBalance) }}</p>
        </div>
      </div>

      <!-- Form -->
      <form class="p-6 space-y-4" @submit.prevent="handleSubmit">
        <div v-if="errorMessage" class="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
          {{ errorMessage }}
        </div>

        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="block text-xs font-semibold text-slate-700">Nominal Pembayaran (Rp) *</label>
            <button
              type="button"
              class="text-[11px] font-semibold text-sky-600 hover:text-sky-700 hover:underline"
              @click="setFullAmount"
            >
              Bayar Lunas Sisa
            </button>
          </div>
          <div class="relative">
            <span class="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">Rp</span>
            <input
              v-model="amountFormatted"
              type="number"
              required
              min="1"
              placeholder="0"
              class="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold text-slate-900"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <AppInput v-model="paymentDate" label="Tanggal Bayar" type="date" required />
          <AppSelect v-model="paymentMethod" label="Metode Bayar" :options="methodOptions" required />
        </div>

        <AppInput
          v-model="referenceNumber"
          label="No. Referensi / Bukti Transfer"
          placeholder="TRF-BCA-102938"
        />

        <AppInput
          v-model="notes"
          label="Catatan Pembayaran (Opsional)"
          placeholder="Contoh: Cicilan tahap 1 / DP"
        />

        <!-- Footer -->
        <div class="pt-4 border-t border-slate-200 flex justify-end gap-2">
          <button
            type="button"
            class="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
            @click="emit('close')"
          >
            Batal
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <DollarSign class="w-4 h-4" />
            Simpan Pembayaran
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

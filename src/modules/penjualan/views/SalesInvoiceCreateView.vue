<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { salesInvoiceService } from '../services/salesInvoiceService'
import { customerService } from '@/modules/customers'
import { useVariantConfig } from '@/shared/composables/useVariantConfig'
import type { Customer, FakturStatus } from '@/shared/types/entity'
import type { DeliveryNoteWithDetails } from '../services/deliveryNoteService'
import AppInput from '@/shared/components/form/AppInput.vue'
import AppSelect from '@/shared/components/form/AppSelect.vue'
import { getTodayIsoDate, formatDate } from '@/shared/utils/date'
import { ArrowLeft, Save, CheckSquare, Square } from 'lucide-vue-next'

const router = useRouter()
const { config } = useVariantConfig()

const customers = ref<Customer[]>([])
const availableDns = ref<DeliveryNoteWithDetails[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const customerId = ref('')
const selectedDnIds = ref<string[]>([])
const paymentTerms = ref<'cash' | 'tempo'>('tempo')
const invoiceDate = ref(getTodayIsoDate())
const dueDate = ref(getTodayIsoDate())
const fakturStatus = ref<FakturStatus>(config.invoiceFaktur === 'tracked' ? 'sudah_faktur' : 'tanpa_faktur')
const notes = ref('')

const customerOptions = computed(() => {
  return customers.value.map((c) => ({
    value: c.id,
    label: `${c.code} - ${c.name}`,
  }))
})

const filteredDns = computed(() => {
  if (!customerId.value) return []
  const cust = customers.value.find((c) => c.id === customerId.value)
  return availableDns.value.filter((dn) => dn.customerName === cust?.name)
})

function toggleDnSelection(dnId: string) {
  const idx = selectedDnIds.value.indexOf(dnId)
  if (idx > -1) {
    selectedDnIds.value.splice(idx, 1)
  } else {
    selectedDnIds.value.push(dnId)
  }
}

const termsOptions = [
  { value: 'tempo', label: 'Tempo (Kredit)' },
  { value: 'cash', label: 'Tunai (Cash - Otomatis Lunas)' },
]

const fakturOptions = [
  { value: 'sudah_faktur', label: 'Sudah Faktur (PPN 11%)' },
  { value: 'belum_faktur', label: 'Belum Faktur (Kena PPN)' },
  { value: 'tanpa_faktur', label: 'Tanpa Faktur (Non-PPN)' },
]

async function handleSubmit() {
  errorMessage.value = ''
  if (!customerId.value) {
    errorMessage.value = 'Silakan pilih customer.'
    return
  }
  if (selectedDnIds.value.length === 0) {
    errorMessage.value = 'Silakan pilih minimal 1 surat jalan yang akan ditagihkan.'
    return
  }

  isLoading.value = true
  try {
    await salesInvoiceService.createSalesInvoice(
      {
        customerId: customerId.value,
        deliveryNoteIds: selectedDnIds.value,
        paymentTerms: paymentTerms.value,
        dueDate: dueDate.value,
        fakturStatus: fakturStatus.value,
        invoiceDate: invoiceDate.value,
        notes: notes.value,
      },
      config.id.toUpperCase()
    )
    router.push('/penjualan/invoice')
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal membuat invoice penjualan'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  const [custRes, dns] = await Promise.all([
    customerService.getCustomers({ limit: 200 }),
    salesInvoiceService.getUninvoicedDeliveryNotes(),
  ])
  customers.value = custRes.items
  availableDns.value = dns
})
</script>

<template>
  <div class="space-y-6 max-w-5xl mx-auto">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
        @click="router.back()"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      <div>
        <h1 class="text-xl font-bold text-slate-900">Terbitkan Invoice Penjualan Baru</h1>
        <p class="text-xs text-slate-500">{{ config.companyFullName }}</p>
      </div>
    </div>

    <form class="space-y-6" @submit.prevent="handleSubmit">
      <div v-if="errorMessage" class="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
        {{ errorMessage }}
      </div>

      <!-- General Info -->
      <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AppSelect
            v-model="customerId"
            label="Pilih Customer"
            :options="customerOptions"
            placeholder="Pilih pelanggan..."
            required
            @update:model-value="selectedDnIds = []"
          />

          <AppSelect
            v-model="paymentTerms"
            label="Termin Pembayaran"
            :options="termsOptions"
            required
          />

          <!-- Faktur Status for SMA only -->
          <AppSelect
            v-if="config.invoiceFaktur === 'tracked'"
            v-model="fakturStatus"
            label="Status Faktur Pajak (SMA)"
            :options="fakturOptions"
            required
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <AppInput v-model="invoiceDate" label="Tanggal Invoice" type="date" required />
          <AppInput
            v-if="paymentTerms === 'tempo'"
            v-model="dueDate"
            label="Tanggal Jatuh Tempo"
            type="date"
            required
          />
        </div>

        <AppInput v-model="notes" label="Catatan Tambahan (Opsional)" placeholder="Nomor PO customer, instruksi transfer bank, dsb" />
      </div>

      <!-- Uninvoiced Delivery Notes Selection -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div class="px-5 py-3 border-b border-slate-200 bg-slate-50 font-bold text-xs text-slate-800 flex justify-between items-center">
          <span>Pilih Surat Jalan yang Belum Ditagihkan</span>
          <span class="text-[11px] text-slate-500">{{ selectedDnIds.length }} Surat Jalan Terpilih</span>
        </div>

        <div v-if="!customerId" class="p-8 text-center text-xs text-slate-400">
          Silakan pilih customer terlebih dahulu untuk memuat daftar surat jalan yang belum ditagihkan.
        </div>

        <div v-else-if="filteredDns.length === 0" class="p-8 text-center text-xs text-slate-400">
          Tidak ada surat jalan yang siap ditagihkan untuk customer ini.
        </div>

        <div v-else class="divide-y divide-slate-100">
          <div
            v-for="dn in filteredDns"
            :key="dn.id"
            class="p-4 flex items-center justify-between hover:bg-slate-50/80 cursor-pointer transition-colors"
            @click="toggleDnSelection(dn.id)"
          >
            <div class="flex items-center gap-3">
              <CheckSquare v-if="selectedDnIds.includes(dn.id)" class="w-5 h-5 text-sky-600 shrink-0" />
              <Square v-else class="w-5 h-5 text-slate-300 shrink-0" />
              <div>
                <p class="font-mono text-xs font-bold text-slate-900">{{ dn.deliveryNumber }}</p>
                <p class="text-[11px] text-slate-500 mt-0.5">
                  Rujukan: {{ dn.soNumber }} • Tgl Kirim: {{ formatDate(dn.deliveryDate) }} • Penerima: {{ dn.recipientName }}
                </p>
              </div>
            </div>

            <div class="text-right text-xs">
              <span class="text-slate-600 font-semibold">{{ dn.items.length }} Item Terkirim</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-3">
        <button
          type="button"
          class="px-5 py-2.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
          @click="router.back()"
        >
          Batal
        </button>
        <button
          type="submit"
          :disabled="isLoading || selectedDnIds.length === 0"
          class="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
        >
          <Save class="w-4 h-4" />
          {{ isLoading ? 'Menyimpan...' : 'Terbitkan Invoice' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { pembelianService } from '../services/pembelianService'
import { supplierService } from '@/modules/suppliers'
import { barangService } from '@/modules/barang'
import type { Supplier, Barang } from '@/shared/types/entity'
import AppInput from '@/shared/components/form/AppInput.vue'
import AppSelect from '@/shared/components/form/AppSelect.vue'
import PurchaseItemRowsEditor, { type ItemRow } from '../components/PurchaseItemRowsEditor.vue'
import { formatRupiah, calculatePpn } from '@/shared/utils/money'
import { getTodayIsoDate } from '@/shared/utils/date'
import { ArrowLeft, Save } from 'lucide-vue-next'

const router = useRouter()

const suppliers = ref<Supplier[]>([])
const barangList = ref<Barang[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const supplierId = ref('')
const supplierInvoiceNumber = ref('')
const entity = ref<'SMA' | 'ST'>('SMA')
const paymentTerms = ref<'cash' | 'tempo'>('tempo')
const invoiceDate = ref(getTodayIsoDate())
const dueDate = ref(getTodayIsoDate())
const notes = ref('')

const items = ref<ItemRow[]>([
  { barangId: '', qty: 1, unit: 'BATANG', unitPrice: 0 },
])

const selectedSupplier = computed(() => {
  return suppliers.value.find((s) => s.id === supplierId.value) || null
})

const supplierOptions = computed(() => {
  return suppliers.value.map((s) => ({
    value: s.id,
    label: `${s.name} (${s.taxType === 'ppn' ? 'PPN' : 'Non-PPN'})`,
  }))
})

const entityOptions = [
  { value: 'SMA', label: 'SMA - PT Sinar Mukti Abadi' },
  { value: 'ST', label: 'ST - Unit Usaha ST' },
]

const termsOptions = [
  { value: 'tempo', label: 'Tempo (Kredit)' },
  { value: 'cash', label: 'Tunai (Cash - Langsung Lunas)' },
]

const subtotal = computed(() => {
  return items.value.reduce((acc, row) => acc + (row.qty * row.unitPrice || 0), 0)
})

const taxAmount = computed(() => {
  if (selectedSupplier.value?.taxType === 'ppn') {
    return calculatePpn(subtotal.value)
  }
  return 0
})

const totalAmount = computed(() => subtotal.value + taxAmount.value)

function onBarangChange(index: number) {
  const row = items.value[index]
  const matched = barangList.value.find((b) => b.id === row.barangId)
  if (matched) {
    row.unit = matched.unit
  }
}

function addItemRow() {
  items.value.push({ barangId: '', qty: 1, unit: 'BATANG', unitPrice: 0 })
}

function removeItemRow(index: number) {
  if (items.value.length > 1) {
    items.value.splice(index, 1)
  }
}

async function handleSubmit() {
  errorMessage.value = ''
  if (!supplierId.value) {
    errorMessage.value = 'Silakan pilih supplier.'
    return
  }
  if (!supplierInvoiceNumber.value.trim()) {
    errorMessage.value = 'Nomor invoice fisik supplier wajib diisi.'
    return
  }
  const invalidItem = items.value.find((i) => !i.barangId || i.qty <= 0 || i.unitPrice <= 0)
  if (invalidItem) {
    errorMessage.value = 'Setiap item wajib memilih barang, kuantitas > 0, dan harga > 0.'
    return
  }

  isLoading.value = true
  try {
    await pembelianService.createInvoice({
      supplierId: supplierId.value,
      supplierInvoiceNumber: supplierInvoiceNumber.value.trim(),
      entity: entity.value,
      paymentTerms: paymentTerms.value,
      invoiceDate: invoiceDate.value,
      dueDate: dueDate.value,
      notes: notes.value,
      items: items.value,
    })
    router.push('/pembelian/invoice')
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal menyimpan invoice.'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  const [suppRes, brgRes] = await Promise.all([
    supplierService.getSuppliers({ limit: 100 }),
    barangService.getBarang({ limit: 200 }),
  ])
  suppliers.value = suppRes.items
  barangList.value = brgRes.items
})
</script>

<template>
  <div class="space-y-6 max-w-5xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
          @click="router.back()"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div>
          <h1 class="text-xl font-bold text-slate-900">Buat Invoice Pembelian Baru</h1>
          <p class="text-xs text-slate-500">Pencatatan faktur pengadaan barang supplier untuk SMA dan ST</p>
        </div>
      </div>
    </div>

    <form class="space-y-6" @submit.prevent="handleSubmit">
      <div v-if="errorMessage" class="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
        {{ errorMessage }}
      </div>

      <!-- Invoice Header Info -->
      <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AppSelect
            v-model="supplierId"
            label="Pilih Supplier"
            :options="supplierOptions"
            placeholder="Pilih pemasok..."
            required
          />

          <AppInput
            v-model="supplierInvoiceNumber"
            label="No. Faktur Fisik Supplier"
            placeholder="Contoh: INV-BPN-991"
            required
          />

          <AppSelect
            v-model="entity"
            label="Alokasi Entitas"
            :options="entityOptions"
            required
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          <AppSelect
            v-model="paymentTerms"
            label="Termin Pembayaran"
            :options="termsOptions"
            required
          />

          <AppInput v-model="invoiceDate" label="Tanggal Faktur" type="date" required />

          <AppInput
            v-if="paymentTerms === 'tempo'"
            v-model="dueDate"
            label="Tanggal Jatuh Tempo"
            type="date"
            required
          />
        </div>
      </div>

      <!-- Item Rows -->
      <PurchaseItemRowsEditor
        :items="items"
        :barang-list="barangList"
        @add-row="addItemRow"
        @remove-row="removeItemRow"
        @barang-change="onBarangChange"
      />

      <!-- Totals Card -->
      <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 max-w-sm ml-auto space-y-2 text-xs">
        <div class="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span class="font-semibold">{{ formatRupiah(subtotal) }}</span>
        </div>
        <div class="flex justify-between text-slate-600">
          <span>PPN ({{ selectedSupplier?.taxType === 'ppn' ? '11%' : '0%' }})</span>
          <span class="font-semibold">{{ formatRupiah(taxAmount) }}</span>
        </div>
        <div class="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-slate-200">
          <span>Total Faktur</span>
          <span class="text-sky-700">{{ formatRupiah(totalAmount) }}</span>
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
          :disabled="isLoading"
          class="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <Save class="w-4 h-4" />
          {{ isLoading ? 'Menyimpan...' : 'Simpan Invoice Pembelian' }}
        </button>
      </div>
    </form>
  </div>
</template>

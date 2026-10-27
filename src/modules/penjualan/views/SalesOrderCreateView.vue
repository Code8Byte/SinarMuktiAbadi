<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { salesOrderService } from '../services/salesOrderService'
import { customerService } from '@/modules/customers'
import { barangService } from '@/modules/barang'
import { useVariantConfig } from '@/shared/composables/useVariantConfig'
import type { Customer, Barang } from '@/shared/types/entity'
import AppInput from '@/shared/components/form/AppInput.vue'
import AppSelect from '@/shared/components/form/AppSelect.vue'
import SoItemRowsEditor, { type FormRow } from '../components/SoItemRowsEditor.vue'
import { formatRupiah } from '@/shared/utils/money'
import { getTodayIsoDate } from '@/shared/utils/date'
import { ArrowLeft, Save } from 'lucide-vue-next'

const router = useRouter()
const { config } = useVariantConfig()

const customers = ref<Customer[]>([])
const barangList = ref<Barang[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const customerId = ref('')
const orderDate = ref(getTodayIsoDate())
const notes = ref('')

const items = ref<FormRow[]>([
  { barangId: null, itemName: '', unit: 'PCS', qty: 1, unitPrice: 0 },
])

const customerOptions = computed(() => {
  return customers.value.map((c) => ({
    value: c.id,
    label: `${c.code} - ${c.name}`,
  }))
})

const totalAmount = computed(() => {
  return items.value.reduce((acc, row) => acc + (row.qty * row.unitPrice || 0), 0)
})

function onCatalogBarangSelected(index: number) {
  const row = items.value[index]
  const matched = barangList.value.find((b) => b.id === row.barangId)
  if (matched) {
    row.itemName = matched.name
    row.unit = matched.unit
  }
}

function addItemRow() {
  items.value.push({ barangId: null, itemName: '', unit: 'PCS', qty: 1, unitPrice: 0 })
}

function removeItemRow(index: number) {
  if (items.value.length > 1) {
    items.value.splice(index, 1)
  }
}

async function handleSubmit() {
  errorMessage.value = ''
  if (!customerId.value) {
    errorMessage.value = 'Silakan pilih customer.'
    return
  }

  isLoading.value = true
  try {
    await salesOrderService.createSalesOrder(
      {
        customerId: customerId.value,
        orderDate: orderDate.value,
        notes: notes.value,
        items: items.value,
      },
      config.soItemMode,
      config.id.toUpperCase()
    )
    router.push('/penjualan/so')
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal membuat Sales Order.'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  const custRes = await customerService.getCustomers({ limit: 200 })
  customers.value = custRes.items

  if (config.soItemMode === 'catalog') {
    const brgRes = await barangService.getBarang({ limit: 500 })
    barangList.value = brgRes.items
  }
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
          <h1 class="text-xl font-bold text-slate-900">Buat Sales Order Baru</h1>
          <p class="text-xs text-slate-500">
            {{ config.companyFullName }} • Mode Item:
            <span class="font-semibold uppercase text-sky-700">{{ config.soItemMode }}</span>
          </p>
        </div>
      </div>
    </div>

    <form class="space-y-6" @submit.prevent="handleSubmit">
      <div v-if="errorMessage" class="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
        {{ errorMessage }}
      </div>

      <!-- Order Info -->
      <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AppSelect
            v-model="customerId"
            label="Pilih Customer"
            :options="customerOptions"
            placeholder="Pilih pelanggan..."
            required
          />
          <AppInput v-model="orderDate" label="Tanggal Pesanan" type="date" required />
        </div>
        <AppInput v-model="notes" label="Catatan Tambahan (Opsional)" placeholder="Lokasi pengiriman, PO customer, dsb" />
      </div>

      <!-- Order Items Component -->
      <SoItemRowsEditor
        :items="items"
        :barang-list="barangList"
        :so-item-mode="config.soItemMode"
        @add-row="addItemRow"
        @remove-row="removeItemRow"
        @catalog-barang-selected="onCatalogBarangSelected"
      />

      <!-- Total Summary -->
      <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 max-w-xs ml-auto flex justify-between items-center text-xs">
        <span class="font-bold text-slate-700">Total Nilai SO:</span>
        <span class="font-bold text-sky-700 text-sm">{{ formatRupiah(totalAmount) }}</span>
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
          {{ isLoading ? 'Menyimpan...' : 'Terbitkan Sales Order' }}
        </button>
      </div>
    </form>
  </div>
</template>

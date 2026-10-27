<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { salesOrderService, type SalesOrderWithDetails } from '../services/salesOrderService'
import { deliveryNoteService } from '../services/deliveryNoteService'
import { useVariantConfig } from '@/shared/composables/useVariantConfig'
import AppInput from '@/shared/components/form/AppInput.vue'
import AppSelect from '@/shared/components/form/AppSelect.vue'
import { getTodayIsoDate } from '@/shared/utils/date'
import { ArrowLeft, Save } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const { config } = useVariantConfig()

const activeSos = ref<SalesOrderWithDetails[]>([])
const selectedSoId = ref((route.query.soId as string) || '')
const deliveryDate = ref(getTodayIsoDate())
const recipientName = ref('')
const vehiclePlate = ref('')
const driverName = ref('')
const notes = ref('')

const isLoading = ref(false)
const errorMessage = ref('')

interface FormDeliveryItem {
  salesOrderItemId: string
  itemName: string
  unit: string
  orderedQty: number
  deliveredSoFar: number
  remainingQty: number
  qtyDelivered: number
}

const deliveryItems = ref<FormDeliveryItem[]>([])

const selectedSo = computed(() => {
  return activeSos.value.find((s) => s.id === selectedSoId.value) || null
})

const soOptions = computed(() => {
  return activeSos.value.map((s) => ({
    value: s.id,
    label: `${s.soNumber} - ${s.customerName} (Sisa kirim ada)`,
  }))
})

function onSoChange() {
  if (!selectedSo.value) {
    deliveryItems.value = []
    return
  }

  deliveryItems.value = selectedSo.value.fulfillment.items.map((it) => ({
    salesOrderItemId: it.soItem.id,
    itemName: it.soItem.itemName,
    unit: it.soItem.unit,
    orderedQty: it.orderedQty,
    deliveredSoFar: it.deliveredQty,
    remainingQty: it.remainingQty,
    qtyDelivered: it.remainingQty, // Default to remaining for convenience
  }))
}

async function handleSubmit() {
  errorMessage.value = ''
  if (!selectedSoId.value) {
    errorMessage.value = 'Silakan pilih Sales Order.'
    return
  }
  if (!recipientName.value.trim() || !vehiclePlate.value.trim() || !driverName.value.trim()) {
    errorMessage.value = 'Nama penerima, plat armada, dan nama sopir wajib diisi.'
    return
  }

  const validItems = deliveryItems.value.filter((i) => i.qtyDelivered > 0)
  if (validItems.length === 0) {
    errorMessage.value = 'Minimal harus ada 1 item dengan kuantitas kirim > 0.'
    return
  }

  // Frontend guard against over-delivery
  for (const it of validItems) {
    if (it.qtyDelivered > it.remainingQty) {
      errorMessage.value = `Kuantitas kirim '${it.itemName}' (${it.qtyDelivered}) melebihi sisa pesanan (${it.remainingQty}).`
      return
    }
  }

  isLoading.value = true
  try {
    await deliveryNoteService.createDeliveryNote(
      {
        salesOrderId: selectedSoId.value,
        deliveryDate: deliveryDate.value,
        recipientName: recipientName.value,
        vehiclePlate: vehiclePlate.value,
        driverName: driverName.value,
        notes: notes.value,
        items: validItems.map((i) => ({
          salesOrderItemId: i.salesOrderItemId,
          qtyDelivered: i.qtyDelivered,
        })),
      },
      config.id.toUpperCase()
    )
    router.push('/penjualan/surat-jalan')
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal membuat surat jalan'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  const res = await salesOrderService.getSalesOrders({ filters: { status: 'open' }, limit: 200 })
  // Filter only SOs that have remaining unfulfilled items
  activeSos.value = res.items.filter((s) => !s.fulfillment.isAllFulfilled)

  if (selectedSoId.value) {
    onSoChange()
  }
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
        <h1 class="text-xl font-bold text-slate-900">Terbitkan Surat Jalan Baru</h1>
        <p class="text-xs text-slate-500">Pengiriman fisik bertahap barang pesanan pelanggan</p>
      </div>
    </div>

    <form class="space-y-6" @submit.prevent="handleSubmit">
      <div v-if="errorMessage" class="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
        {{ errorMessage }}
      </div>

      <!-- SO Selection & Info -->
      <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AppSelect
            v-model="selectedSoId"
            label="Pilih Rujukan Sales Order (SO)"
            :options="soOptions"
            placeholder="Pilih SO terbuka..."
            required
            @update:model-value="onSoChange"
          />
          <AppInput v-model="deliveryDate" label="Tanggal Pengiriman" type="date" required />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          <AppInput v-model="driverName" label="Nama Sopir / Kurir" placeholder="Bambang" required />
          <AppInput v-model="vehiclePlate" label="Plat Nomor Kendaraan" placeholder="B 1234 ABC" required />
          <AppInput v-model="recipientName" label="Nama Penerima di Lokasi" placeholder="Pak Joko (Gudang)" required />
        </div>

        <AppInput v-model="notes" label="Catatan Pengiriman (Opsional)" placeholder="Jam sampai, instruksi bongkar muat..." />
      </div>

      <!-- Items Allocation Table -->
      <div v-if="selectedSo" class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div class="px-5 py-3 border-b border-slate-200 bg-slate-50 font-bold text-xs text-slate-800">
          Alokasi Kuantitas Pengiriman Tahap Ini
        </div>

        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50/50 text-slate-500 border-b border-slate-200 font-semibold text-[11px]">
            <tr>
              <th class="px-4 py-2.5">Item Barang</th>
              <th class="px-4 py-2.5 text-right">Pesanan SO</th>
              <th class="px-4 py-2.5 text-right">Sudah Terkirim</th>
              <th class="px-4 py-2.5 text-right">Maksimal Boleh Kirim</th>
              <th class="px-4 py-2.5 text-right w-44">Kirim Sekarang</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="it in deliveryItems" :key="it.salesOrderItemId">
              <td class="px-4 py-3 font-medium text-slate-900">{{ it.itemName }}</td>
              <td class="px-4 py-3 text-right text-slate-600">{{ it.orderedQty }} {{ it.unit }}</td>
              <td class="px-4 py-3 text-right text-slate-600">{{ it.deliveredSoFar }} {{ it.unit }}</td>
              <td class="px-4 py-3 text-right font-bold text-sky-700">{{ it.remainingQty }} {{ it.unit }}</td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <input
                    v-model.number="it.qtyDelivered"
                    type="number"
                    min="0"
                    :max="it.remainingQty"
                    class="w-24 px-2 py-1 text-xs border border-slate-300 rounded text-right font-bold text-slate-900 focus:ring-1 focus:ring-sky-500"
                  />
                  <span class="text-[11px] text-slate-500">{{ it.unit }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
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
          :disabled="isLoading || !selectedSo"
          class="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
        >
          <Save class="w-4 h-4" />
          {{ isLoading ? 'Menyimpan...' : 'Simpan & Terbitkan Surat Jalan' }}
        </button>
      </div>
    </form>
  </div>
</template>

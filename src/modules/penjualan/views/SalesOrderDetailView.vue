<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { salesOrderService, type SalesOrderWithDetails } from '../services/salesOrderService'
import AppStatusBadge from '@/shared/components/badge/AppStatusBadge.vue'
import { formatRupiah } from '@/shared/utils/money'
import { formatDate } from '@/shared/utils/date'
import { ArrowLeft, Truck, Ban, Calendar, User, FileText } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const order = ref<SalesOrderWithDetails | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')

async function loadDetail() {
  const id = route.params.id as string
  isLoading.value = true
  errorMessage.value = ''
  try {
    const data = await salesOrderService.getSalesOrderById(id)
    if (!data) throw new Error('Sales Order tidak ditemukan.')
    order.value = data
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal memuat SO'
  } finally {
    isLoading.value = false
  }
}

async function handleCancelSo() {
  if (!order.value) return
  if (!confirm(`Batalkan Sales Order '${order.value.soNumber}'? Tindakan ini tidak dapat diurungkan.`)) {
    return
  }

  try {
    await salesOrderService.cancelSalesOrder(order.value.id)
    await loadDetail()
  } catch (err: unknown) {
    alert(err instanceof Error ? err.message : 'Gagal membatalkan SO.')
  }
}

onMounted(() => {
  loadDetail()
})
</script>

<template>
  <div v-if="order" class="space-y-6 max-w-5xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
          @click="router.push('/penjualan/so')"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-bold text-slate-900">{{ order.soNumber }}</h1>
            <AppStatusBadge :status="order.status" />
          </div>
          <p class="text-xs text-slate-500 mt-0.5">Customer: {{ order.customerName }}</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="order.status === 'open' && !order.fulfillment.isAllFulfilled"
          v-can="'penjualan.delivery.create'"
          type="button"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          @click="router.push(`/penjualan/surat-jalan/create?soId=${order.id}`)"
        >
          <Truck class="w-4 h-4" />
          Kirim Barang (Surat Jalan)
        </button>

        <button
          v-if="order.status === 'open' && !order.fulfillment.hasAnyDeliveryNote"
          v-can="'penjualan.so.cancel'"
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-lg transition-colors"
          @click="handleCancelSo"
        >
          <Ban class="w-4 h-4" />
          Batalkan SO
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-start gap-3">
        <User class="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div class="text-xs">
          <p class="text-slate-400 font-semibold uppercase text-[10px]">Customer</p>
          <p class="font-bold text-slate-900 mt-0.5">{{ order.customerName }}</p>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-start gap-3">
        <Calendar class="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div class="text-xs">
          <p class="text-slate-400 font-semibold uppercase text-[10px]">Tanggal Pesanan</p>
          <p class="font-bold text-slate-900 mt-0.5">{{ formatDate(order.orderDate) }}</p>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-start gap-3">
        <FileText class="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div class="text-xs">
          <p class="text-slate-400 font-semibold uppercase text-[10px]">Total Nilai Pesanan</p>
          <p class="font-bold text-sky-700 text-sm mt-0.5">{{ formatRupiah(order.totalAmount) }}</p>
        </div>
      </div>
    </div>

    <!-- Fulfillment Table -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div class="px-5 py-3 border-b border-slate-200 bg-slate-50 font-bold text-xs text-slate-800 flex justify-between items-center">
        <span>Pemenuhan Item & Pengiriman Bertahap</span>
        <span class="text-[11px] font-medium text-slate-500">
          {{ order.fulfillment.deliveryNotesCount }} Surat Jalan Diterbitkan
        </span>
      </div>

      <table class="w-full text-left text-xs">
        <thead class="bg-slate-50/50 text-slate-500 border-b border-slate-200 font-semibold text-[11px]">
          <tr>
            <th class="px-4 py-2.5">Nama Item</th>
            <th class="px-4 py-2.5 text-right">Qty Pesanan</th>
            <th class="px-4 py-2.5 text-right">Terkirim</th>
            <th class="px-4 py-2.5 text-right">Sisa Kirim</th>
            <th class="px-4 py-2.5 text-right">Harga Satuan</th>
            <th class="px-4 py-2.5 text-right">Total Nilai</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="it in order.fulfillment.items" :key="it.soItem.id">
            <td class="px-4 py-2.5 font-medium text-slate-900">{{ it.soItem.itemName }}</td>
            <td class="px-4 py-2.5 text-right font-semibold">{{ it.orderedQty }} {{ it.soItem.unit }}</td>
            <td class="px-4 py-2.5 text-right font-semibold text-emerald-600">
              {{ it.deliveredQty }} {{ it.soItem.unit }}
            </td>
            <td class="px-4 py-2.5 text-right font-semibold" :class="it.remainingQty > 0 ? 'text-amber-600' : 'text-slate-400'">
              {{ it.remainingQty }} {{ it.soItem.unit }}
            </td>
            <td class="px-4 py-2.5 text-right text-slate-600">{{ formatRupiah(it.soItem.unitPrice) }}</td>
            <td class="px-4 py-2.5 text-right font-bold text-slate-900">{{ formatRupiah(it.soItem.totalPrice) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

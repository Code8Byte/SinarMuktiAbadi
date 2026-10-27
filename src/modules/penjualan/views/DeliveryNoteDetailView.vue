<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { deliveryNoteService, type DeliveryNoteWithDetails } from '../services/deliveryNoteService'
import { formatDate } from '@/shared/utils/date'
import { ArrowLeft, Printer } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const note = ref<DeliveryNoteWithDetails | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')

async function loadDetail() {
  const id = route.params.id as string
  isLoading.value = true
  errorMessage.value = ''
  try {
    const data = await deliveryNoteService.getDeliveryNoteById(id)
    if (!data) throw new Error('Surat jalan tidak ditemukan.')
    note.value = data
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal memuat surat jalan'
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
  <div v-if="note" class="space-y-6 max-w-4xl mx-auto">
    <!-- Header Controls (Hidden on print) -->
    <div class="flex items-center justify-between print:hidden">
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
          @click="router.push('/penjualan/surat-jalan')"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div>
          <h1 class="text-xl font-bold text-slate-900">{{ note.deliveryNumber }}</h1>
          <p class="text-xs text-slate-500">Rujukan SO: {{ note.soNumber }}</p>
        </div>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        @click="handlePrint"
      >
        <Printer class="w-4 h-4" />
        Cetak Dokumen Surat Jalan
      </button>
    </div>

    <!-- Printable Surat Jalan Document -->
    <div class="bg-white rounded-xl border border-slate-200 p-8 shadow-sm print:border-none print:shadow-none print:p-0 space-y-6">
      <!-- Doc Header -->
      <div class="flex justify-between items-start border-b border-slate-200 pb-5">
        <div>
          <h2 class="text-lg font-black tracking-wide text-slate-900 uppercase">SURAT JALAN PENGIRIMAN</h2>
          <p class="font-mono text-sm font-bold text-sky-700 mt-1">{{ note.deliveryNumber }}</p>
          <p class="text-xs text-slate-500 mt-1">No. Rujukan SO: {{ note.soNumber }}</p>
        </div>

        <div class="text-right text-xs space-y-1">
          <p><span class="text-slate-400">Tanggal:</span> <span class="font-bold text-slate-800">{{ formatDate(note.deliveryDate) }}</span></p>
          <p><span class="text-slate-400">Plat Armada:</span> <span class="font-mono font-bold text-slate-800">{{ note.vehiclePlate }}</span></p>
          <p><span class="text-slate-400">Sopir:</span> <span class="font-bold text-slate-800">{{ note.driverName }}</span></p>
        </div>
      </div>

      <!-- Recipient & Destination -->
      <div class="bg-slate-50 p-4 rounded-lg text-xs grid grid-cols-2 gap-4">
        <div>
          <p class="text-[10px] uppercase font-bold text-slate-400">Penerima Barang:</p>
          <p class="font-bold text-slate-900 text-sm mt-0.5">{{ note.recipientName }}</p>
          <p class="text-slate-600 mt-0.5">Customer: {{ note.customerName }}</p>
        </div>
        <div>
          <p class="text-[10px] uppercase font-bold text-slate-400">Catatan Khusus Pengiriman:</p>
          <p class="text-slate-700 mt-0.5">{{ note.notes || '-' }}</p>
        </div>
      </div>

      <!-- Item Table -->
      <table class="w-full text-left text-xs border border-slate-200">
        <thead class="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10px]">
          <tr>
            <th class="px-4 py-2.5 w-12 text-center">No</th>
            <th class="px-4 py-2.5">Nama Barang / Spesifikasi</th>
            <th class="px-4 py-2.5 text-right w-32">Kuantitas Dikirim</th>
            <th class="px-4 py-2.5 w-24">Satuan</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="(it, idx) in note.items" :key="it.id">
            <td class="px-4 py-3 text-center text-slate-400 font-medium">{{ idx + 1 }}</td>
            <td class="px-4 py-3 font-semibold text-slate-900">{{ it.itemName }}</td>
            <td class="px-4 py-3 text-right font-black text-sm text-slate-900">{{ it.qtyDelivered }}</td>
            <td class="px-4 py-3 uppercase text-slate-600 font-medium">{{ it.unit }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Signatures -->
      <div class="grid grid-cols-3 gap-6 text-center text-xs pt-12">
        <div class="space-y-12">
          <p class="font-medium text-slate-500">Penerima,</p>
          <p class="font-bold text-slate-900 border-t border-slate-400 pt-1 mx-4">({{ note.recipientName }})</p>
        </div>
        <div class="space-y-12">
          <p class="font-medium text-slate-500">Sopir / Pengirim,</p>
          <p class="font-bold text-slate-900 border-t border-slate-400 pt-1 mx-4">({{ note.driverName }})</p>
        </div>
        <div class="space-y-12">
          <p class="font-medium text-slate-500">Gudang / Petugas,</p>
          <p class="font-bold text-slate-900 border-t border-slate-400 pt-1 mx-4">(.......................)</p>
        </div>
      </div>
    </div>
  </div>
</template>

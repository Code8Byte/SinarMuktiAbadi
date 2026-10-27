<script setup lang="ts">
import { computed } from 'vue'
import type { SalesInvoiceWithDetails } from '@/modules/penjualan'
import { formatRupiah } from '@/shared/utils/money'
import { formatDate } from '@/shared/utils/date'
import { CheckSquare, Square } from 'lucide-vue-next'

const props = defineProps<{
  invoices: SalesInvoiceWithDetails[]
  selectedIds: string[]
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:selectedIds', value: string[]): void
}>()

const isAllSelected = computed(() => {
  return props.invoices.length > 0 && props.selectedIds.length === props.invoices.length
})

const selectedTotal = computed(() => {
  return props.invoices
    .filter((inv) => props.selectedIds.includes(inv.id))
    .reduce((sum, inv) => sum + inv.paymentSummary.remainingBalance, 0)
})

function toggleSelectAll() {
  if (isAllSelected.value) {
    emit('update:selectedIds', [])
  } else {
    emit('update:selectedIds', props.invoices.map((inv) => inv.id))
  }
}

function toggleInvoice(id: string) {
  const current = [...props.selectedIds]
  const idx = current.indexOf(id)
  if (idx >= 0) {
    current.splice(idx, 1)
  } else {
    current.push(id)
  }
  emit('update:selectedIds', current)
}
</script>

<template>
  <div class="space-y-3 pt-2 border-t border-slate-100">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <h2 class="text-sm font-bold text-slate-900">Daftar Invoice Belum Lunas</h2>
        <span class="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-medium">
          {{ invoices.length }} Tertunggak
        </span>
      </div>

      <button
        v-if="invoices.length > 0"
        type="button"
        class="inline-flex items-center gap-1.5 text-xs text-sky-600 hover:text-sky-800 font-semibold"
        @click="toggleSelectAll"
      >
        <component :is="isAllSelected ? CheckSquare : Square" class="w-4 h-4" />
        {{ isAllSelected ? 'Batalkan Semua' : 'Pilih Semua' }}
      </button>
    </div>

    <div v-if="isLoading" class="py-8 text-center text-xs text-slate-400">
      Memeriksa catatan invoice customer...
    </div>

    <div
      v-else-if="invoices.length === 0"
      class="p-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl"
    >
      <p class="text-xs font-medium text-slate-600">Tidak ada invoice tertunggak untuk customer ini.</p>
      <p class="text-xs text-slate-400 mt-1">Semua invoice customer ini telah lunas atau belum ada invoice penjualan.</p>
    </div>

    <div v-else class="border border-slate-200 rounded-lg overflow-hidden">
      <table class="w-full text-xs">
        <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-left">
          <tr>
            <th class="w-10 px-3 py-2.5 text-center">Pilih</th>
            <th class="px-3 py-2.5">No. Invoice</th>
            <th class="px-3 py-2.5">Tgl Faktur</th>
            <th class="px-3 py-2.5">Jatuh Tempo</th>
            <th class="px-3 py-2.5 text-right">Nilai Faktur</th>
            <th class="px-3 py-2.5 text-right">Telah Dibayar</th>
            <th class="px-3 py-2.5 text-right">Sisa Tagihan</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="inv in invoices"
            :key="inv.id"
            class="hover:bg-slate-50 cursor-pointer transition-colors"
            @click="toggleInvoice(inv.id)"
          >
            <td class="px-3 py-2 text-center" @click.stop="toggleInvoice(inv.id)">
              <input
                type="checkbox"
                :checked="selectedIds.includes(inv.id)"
                class="rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                @change="toggleInvoice(inv.id)"
              />
            </td>
            <td class="px-3 py-2 font-mono font-semibold text-slate-900">{{ inv.invoiceNumber }}</td>
            <td class="px-3 py-2 text-slate-600">{{ formatDate(inv.invoiceDate) }}</td>
            <td class="px-3 py-2 text-slate-600">{{ formatDate(inv.dueDate) }}</td>
            <td class="px-3 py-2 text-right font-medium text-slate-700">{{ formatRupiah(inv.totalAmount) }}</td>
            <td class="px-3 py-2 text-right text-emerald-600 font-medium">{{ formatRupiah(inv.paymentSummary.totalPaid) }}</td>
            <td class="px-3 py-2 text-right font-bold text-red-600">{{ formatRupiah(inv.paymentSummary.remainingBalance) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Summary Panel -->
    <div v-if="invoices.length > 0" class="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 gap-3">
      <div class="text-xs text-slate-600">
        Terpilih <span class="font-bold text-slate-900">{{ selectedIds.length }}</span> dari
        <span class="font-bold text-slate-900">{{ invoices.length }}</span> invoice tertunggak
      </div>
      <div class="text-right">
        <span class="text-xs text-slate-500 block">Total Tagihan Surat Ini:</span>
        <span class="text-base font-extrabold text-slate-900">{{ formatRupiah(selectedTotal) }}</span>
      </div>
    </div>
  </div>
</template>

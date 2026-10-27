<script setup lang="ts">
import type { Barang } from '@/shared/types/entity'
import { Plus, Trash2 } from 'lucide-vue-next'

export interface ItemRow {
  barangId: string
  qty: number
  unit: string
  unitPrice: number
  notes?: string
}

const props = defineProps<{
  items: ItemRow[]
  barangList: Barang[]
}>()

const emit = defineEmits<{
  (e: 'add-row'): void
  (e: 'remove-row', index: number): void
  (e: 'barang-change', index: number): void
}>()

function onBarangSelect(index: number) {
  emit('barang-change', index)
}
</script>

<template>
  <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-bold text-slate-800">Daftar Item Barang Masuk</h3>
      <button
        type="button"
        class="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
        @click="emit('add-row')"
      >
        <Plus class="w-4 h-4" />
        Tambah Baris Item
      </button>
    </div>

    <div class="space-y-3">
      <div
        v-for="(row, idx) in props.items"
        :key="idx"
        class="p-3 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
      >
        <div class="sm:col-span-5">
          <label class="block text-[11px] font-semibold text-slate-700 mb-1">Barang *</label>
          <select
            v-model="row.barangId"
            required
            class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded focus:ring-1 focus:ring-sky-500"
            @change="onBarangSelect(idx)"
          >
            <option value="" disabled>Pilih barang dari master...</option>
            <option v-for="b in props.barangList" :key="b.id" :value="b.id">
              {{ b.sku }} - {{ b.name }}
            </option>
          </select>
        </div>

        <div class="sm:col-span-2">
          <label class="block text-[11px] font-semibold text-slate-700 mb-1">Qty *</label>
          <input
            v-model.number="row.qty"
            type="number"
            min="1"
            required
            class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded text-right font-medium"
          />
        </div>

        <div class="sm:col-span-2">
          <label class="block text-[11px] font-semibold text-slate-700 mb-1">Satuan</label>
          <input
            v-model="row.unit"
            type="text"
            class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded uppercase font-medium"
          />
        </div>

        <div class="sm:col-span-2">
          <label class="block text-[11px] font-semibold text-slate-700 mb-1">Harga Satuan (Rp) *</label>
          <input
            v-model.number="row.unitPrice"
            type="number"
            min="0"
            required
            placeholder="Ketik harga..."
            class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded text-right font-semibold text-slate-900"
          />
        </div>

        <div class="sm:col-span-1 flex justify-center pb-1">
          <button
            type="button"
            :disabled="props.items.length <= 1"
            class="text-slate-400 hover:text-red-600 disabled:opacity-20"
            @click="emit('remove-row', idx)"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

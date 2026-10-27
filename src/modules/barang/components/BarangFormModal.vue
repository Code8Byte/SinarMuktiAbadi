<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Barang } from '@/shared/types/entity'
import AppInput from '@/shared/components/form/AppInput.vue'
import AppSelect from '@/shared/components/form/AppSelect.vue'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  barangToEdit: Barang | null
}>()

const emit = defineEmits<{
  close: []
  saved: [barang: Omit<Barang, 'id' | 'createdAt'>]
}>()

const sku = ref('')
const name = ref('')
const unit = ref('BATANG')
const category = ref('Baja & Besi')
const isActive = ref(true)
const errorMessage = ref('')

const unitOptions = [
  { value: 'BATANG', label: 'BATANG' },
  { value: 'PCS', label: 'PCS' },
  { value: 'LEMBAR', label: 'LEMBAR' },
  { value: 'ROLL', label: 'ROLL' },
  { value: 'KG', label: 'KG' },
  { value: 'BOX', label: 'BOX' },
  { value: 'METER', label: 'METER' },
]

const categoryOptions = [
  { value: 'Baja & Besi', label: 'Baja & Besi' },
  { value: 'Pipa & Hollow', label: 'Pipa & Hollow' },
  { value: 'Plat Baja', label: 'Plat Baja' },
  { value: 'Kawat & Aksesoris', label: 'Kawat & Aksesoris' },
  { value: 'Lain-lain', label: 'Lain-lain' },
]

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      errorMessage.value = ''
      if (props.barangToEdit) {
        sku.value = props.barangToEdit.sku
        name.value = props.barangToEdit.name
        unit.value = props.barangToEdit.unit
        category.value = props.barangToEdit.category
        isActive.value = props.barangToEdit.isActive
      } else {
        sku.value = `BRG-${String(Math.floor(100 + Math.random() * 900))}`
        name.value = ''
        unit.value = 'BATANG'
        category.value = 'Baja & Besi'
        isActive.value = true
      }
    }
  }
)

function handleSubmit() {
  if (!sku.value.trim() || !name.value.trim() || !unit.value.trim()) {
    errorMessage.value = 'SKU, Nama Barang, dan Satuan wajib diisi.'
    return
  }

  emit('saved', {
    sku: sku.value.trim().toUpperCase(),
    name: name.value.trim(),
    unit: unit.value.trim().toUpperCase(),
    category: category.value,
    isActive: isActive.value,
  })
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
    <div class="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
      <!-- Modal Header -->
      <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
        <h3 class="text-sm font-bold">
          {{ barangToEdit ? 'Ubah Data Barang' : 'Tambah Master Barang Baru (SMA)' }}
        </h3>
        <button type="button" class="text-slate-400 hover:text-white" @click="emit('close')">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Body -->
      <form class="p-6 space-y-4" @submit.prevent="handleSubmit">
        <div v-if="errorMessage" class="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
          {{ errorMessage }}
        </div>

        <div class="grid grid-cols-2 gap-3">
          <AppInput v-model="sku" label="SKU / Kode Barang" placeholder="BRG-001" required />
          <AppSelect v-model="unit" label="Satuan Kuantitas" :options="unitOptions" required />
        </div>

        <AppInput v-model="name" label="Nama Barang / Spesifikasi" placeholder="Besi Beton Ulir D13 SNI" required />

        <AppSelect v-model="category" label="Kategori Barang" :options="categoryOptions" required />

        <div class="flex items-center gap-2 pt-2">
          <input
            id="barang-active-toggle"
            v-model="isActive"
            type="checkbox"
            class="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
          />
          <label for="barang-active-toggle" class="text-xs font-medium text-slate-700">
            Barang Aktif (Dapat dipilih pada formulir SO SMA)
          </label>
        </div>

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
            class="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Simpan Barang
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

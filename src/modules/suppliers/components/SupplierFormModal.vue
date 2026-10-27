<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Supplier, SupplierTaxType } from '@/shared/types/entity'
import AppInput from '@/shared/components/form/AppInput.vue'
import AppSelect from '@/shared/components/form/AppSelect.vue'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  supplierToEdit: Supplier | null
}>()

const emit = defineEmits<{
  close: []
  saved: [supplier: Omit<Supplier, 'id' | 'createdAt'>]
}>()

const name = ref('')
const code = ref('')
const phone = ref('')
const address = ref('')
const taxType = ref<SupplierTaxType>('ppn')
const errorMessage = ref('')

const taxOptions = [
  { value: 'ppn', label: 'Supplier PPN (Faktur Pajak 11%)' },
  { value: 'non_ppn', label: 'Supplier Non-PPN (Tanpa Pajak)' },
]

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      errorMessage.value = ''
      if (props.supplierToEdit) {
        name.value = props.supplierToEdit.name
        code.value = props.supplierToEdit.code
        phone.value = props.supplierToEdit.phone
        address.value = props.supplierToEdit.address
        taxType.value = props.supplierToEdit.taxType
      } else {
        name.value = ''
        code.value = `SUPP-${String(Math.floor(100 + Math.random() * 900))}`
        phone.value = ''
        address.value = ''
        taxType.value = 'ppn'
      }
    }
  }
)

function handleSubmit() {
  if (!name.value.trim() || !code.value.trim() || !phone.value.trim() || !address.value.trim()) {
    errorMessage.value = 'Semua field wajib diisi.'
    return
  }

  emit('saved', {
    name: name.value.trim(),
    code: code.value.trim().toUpperCase(),
    phone: phone.value.trim(),
    address: address.value.trim(),
    taxType: taxType.value,
  })
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
    <div class="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
      <!-- Modal Header -->
      <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
        <h3 class="text-sm font-bold">
          {{ supplierToEdit ? 'Ubah Data Supplier' : 'Tambah Supplier Baru (SMA)' }}
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
          <AppInput v-model="code" label="Kode Supplier" placeholder="SUPP-001" required />
          <AppInput v-model="phone" label="No. Telepon / Fax" placeholder="021-..." required />
        </div>

        <AppInput v-model="name" label="Nama Supplier / Pemasok" placeholder="PT Baja Prima Nusantara" required />

        <AppSelect
          v-model="taxType"
          label="Tipe Perpajakan Supplier"
          :options="taxOptions"
          required
        />

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">
            Alamat Kantor / Pabrik <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="address"
            rows="2"
            required
            placeholder="Jl. Industri No. ..."
            class="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
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
            Simpan Supplier
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Customer } from '@/shared/types/entity'
import AppInput from '@/shared/components/form/AppInput.vue'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  customerToEdit: Customer | null
}>()

const emit = defineEmits<{
  close: []
  saved: [customer: Omit<Customer, 'id' | 'createdAt'>]
}>()

const name = ref('')
const code = ref('')
const phone = ref('')
const address = ref('')
const email = ref('')
const notes = ref('')
const errorMessage = ref('')

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      errorMessage.value = ''
      if (props.customerToEdit) {
        name.value = props.customerToEdit.name
        code.value = props.customerToEdit.code
        phone.value = props.customerToEdit.phone
        address.value = props.customerToEdit.address
        email.value = props.customerToEdit.email || ''
        notes.value = props.customerToEdit.notes || ''
      } else {
        name.value = ''
        code.value = `CUST-${String(Math.floor(100 + Math.random() * 900))}`
        phone.value = ''
        address.value = ''
        email.value = ''
        notes.value = ''
      }
    }
  }
)

function handleSubmit() {
  if (!name.value.trim() || !code.value.trim() || !phone.value.trim() || !address.value.trim()) {
    errorMessage.value = 'Nama, Kode, Telepon, dan Alamat wajib diisi.'
    return
  }

  emit('saved', {
    name: name.value.trim(),
    code: code.value.trim().toUpperCase(),
    phone: phone.value.trim(),
    address: address.value.trim(),
    email: email.value.trim() || undefined,
    notes: notes.value.trim() || undefined,
  })
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
    <div class="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
      <!-- Modal Header -->
      <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
        <h3 class="text-sm font-bold">
          {{ customerToEdit ? 'Ubah Data Customer' : 'Tambah Customer Baru' }}
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
          <AppInput v-model="code" label="Kode Customer" placeholder="CUST-001" required />
          <AppInput v-model="phone" label="No. Telepon / HP" placeholder="021-..." required />
        </div>

        <AppInput v-model="name" label="Nama Perusahaan / Toko" placeholder="PT Maju Bersama" required />

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">
            Alamat Lengkap <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="address"
            rows="2"
            required
            placeholder="Jl. Raya No. ..."
            class="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <AppInput v-model="email" label="Email (Opsional)" type="email" placeholder="kontak@perusahaan.com" />
        <AppInput v-model="notes" label="Catatan Tambahan (Opsional)" placeholder="Termin, PIC gudang, dll" />

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
            Simpan Customer
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

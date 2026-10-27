<script setup lang="ts">
import { ref, watch } from 'vue'
import type { User } from '@/shared/types/entity'
import type { RoleId } from '@/app/auth/roles'
import { ROLE_DEFINITIONS } from '@/app/auth/roles'
import { useVariantConfig } from '@/shared/composables/useVariantConfig'
import AppInput from '@/shared/components/form/AppInput.vue'
import AppSelect from '@/shared/components/form/AppSelect.vue'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  userToEdit: User | null
}>()

const emit = defineEmits<{
  close: []
  saved: [user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>]
}>()

const { config } = useVariantConfig()

const name = ref('')
const username = ref('')
const email = ref('')
const role = ref<RoleId>('staf_penjualan')
const isActive = ref(true)
const errorMessage = ref('')

const roleOptions = Object.values(ROLE_DEFINITIONS)
  .filter((r) => config.roles.includes(r.id))
  .map((r) => ({
    value: r.id,
    label: `${r.label} (${r.description})`,
  }))

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      errorMessage.value = ''
      if (props.userToEdit) {
        name.value = props.userToEdit.name
        username.value = props.userToEdit.username
        email.value = props.userToEdit.email
        role.value = props.userToEdit.role
        isActive.value = props.userToEdit.isActive
      } else {
        name.value = ''
        username.value = ''
        email.value = ''
        role.value = 'staf_penjualan'
        isActive.value = true
      }
    }
  }
)

function handleSubmit() {
  if (!name.value.trim() || !username.value.trim() || !email.value.trim()) {
    errorMessage.value = 'Semua field wajib diisi.'
    return
  }

  emit('saved', {
    name: name.value.trim(),
    username: username.value.trim().toLowerCase(),
    email: email.value.trim(),
    role: role.value,
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
          {{ userToEdit ? 'Ubah Data Pengguna' : 'Tambah Pengguna Baru' }}
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

        <AppInput v-model="name" label="Nama Lengkap" placeholder="Contoh: Budi Santoso" required />
        <AppInput v-model="username" label="Username Login" placeholder="Contoh: budi" required />
        <AppInput v-model="email" label="Email Resmi" type="email" placeholder="budi@perusahaan.com" required />

        <AppSelect
          v-model="role"
          label="Peran (Role Akses)"
          :options="roleOptions"
          required
        />

        <div class="flex items-center gap-2 pt-2">
          <input
            id="user-active-toggle"
            v-model="isActive"
            type="checkbox"
            class="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
          />
          <label for="user-active-toggle" class="text-xs font-medium text-slate-700">
            Akun Aktif (Dapat login ke sistem)
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
            Simpan Pengguna
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

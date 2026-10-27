<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { userService } from '../services/userService'
import UserFormModal from '../components/UserFormModal.vue'
import AppDataTable, { type TableColumn } from '@/shared/components/table/AppDataTable.vue'
import AppStatusBadge from '@/shared/components/badge/AppStatusBadge.vue'
import type { User } from '@/shared/types/entity'
import { Plus, Search, Edit2, CheckCircle2, XCircle } from 'lucide-vue-next'

const users = ref<User[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')
const isModalOpen = ref(false)
const selectedUser = ref<User | null>(null)

const columns: TableColumn[] = [
  { key: 'name', label: 'Nama Pengguna' },
  { key: 'username', label: 'Username' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role Akses' },
  { key: 'isActive', label: 'Status' },
  { key: 'actions', label: 'Aksi', align: 'right' },
]

async function loadUsers() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await userService.getUsers({ search: searchQuery.value })
    users.value = res.items
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal memuat pengguna'
  } finally {
    isLoading.value = false
  }
}

function openCreateModal() {
  selectedUser.value = null
  isModalOpen.value = true
}

function openEditModal(user: User) {
  selectedUser.value = user
  isModalOpen.value = true
}

async function handleSaveUser(payload: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    if (selectedUser.value) {
      await userService.updateUser(selectedUser.value.id, payload)
    } else {
      await userService.createUser(payload)
    }
    isModalOpen.value = false
    await loadUsers()
  } catch (err: unknown) {
    alert(err instanceof Error ? err.message : 'Gagal menyimpan pengguna')
  }
}

async function toggleStatus(user: User) {
  try {
    await userService.toggleUserActive(user.id, !user.isActive)
    await loadUsers()
  } catch (err: unknown) {
    alert(err instanceof Error ? err.message : 'Gagal mengubah status pengguna')
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-slate-900">Manajemen Pengguna</h1>
        <p class="text-xs text-slate-500">Daftar pengguna sistem dan penugasan peran akses</p>
      </div>

      <button
        v-can="'users.create'"
        type="button"
        class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        @click="openCreateModal"
      >
        <Plus class="w-4 h-4" />
        Tambah Pengguna
      </button>
    </div>

    <!-- Search Bar -->
    <div class="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-2">
      <Search class="w-4 h-4 text-slate-400 shrink-0" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Cari nama, username, email, atau role..."
        class="w-full text-xs bg-transparent focus:outline-none text-slate-800"
        @input="loadUsers"
      />
    </div>

    <!-- Data Table -->
    <AppDataTable
      :columns="columns"
      :items="users as unknown as Record<string, unknown>[]"
      :loading="isLoading"
      :error="errorMessage"
      empty-message="Tidak ada data pengguna yang sesuai pencarian."
    >
      <template #role="{ value }">
        <span class="font-medium text-slate-800 uppercase tracking-wide text-[11px]">
          {{ String(value).replace('_', ' ') }}
        </span>
      </template>

      <template #isActive="{ value }">
        <AppStatusBadge :status="value ? 'lunas' : 'cancel'" :label="value ? 'Aktif' : 'Non-Aktif'" />
      </template>

      <template #actions="{ item }">
        <div class="flex items-center justify-end gap-1.5">
          <button
            v-can="'users.edit'"
            type="button"
            class="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded"
            title="Ubah data pengguna"
            @click="openEditModal(item as unknown as User)"
          >
            <Edit2 class="w-3.5 h-3.5" />
          </button>

          <button
            v-can="'users.delete'"
            type="button"
            class="p-1.5 rounded"
            :class="(item as unknown as User).isActive ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'"
            :title="(item as unknown as User).isActive ? 'Nonaktifkan akun' : 'Aktifkan akun'"
            @click="toggleStatus(item as unknown as User)"
          >
            <XCircle v-if="(item as unknown as User).isActive" class="w-3.5 h-3.5" />
            <CheckCircle2 v-else class="w-3.5 h-3.5" />
          </button>
        </div>
      </template>
    </AppDataTable>

    <!-- Modal Form -->
    <UserFormModal
      :is-open="isModalOpen"
      :user-to-edit="selectedUser"
      @close="isModalOpen = false"
      @saved="handleSaveUser"
    />
  </div>
</template>

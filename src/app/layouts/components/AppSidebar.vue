<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePermission } from '@/shared/composables/usePermission'
import { useVariantConfig } from '@/shared/composables/useVariantConfig'
import type { PermissionId } from '@/app/auth/permissions'
import {
  LayoutDashboard,
  ShoppingCart,
  Truck,
  Receipt,
  Package,
  Users,
  Building,
  CreditCard,
  Wallet,
  FileSpreadsheet,
  BarChart3,
  Layers,
} from 'lucide-vue-next'

interface NavMenuItem {
  title: string
  path: string
  icon: typeof LayoutDashboard
  permission?: PermissionId
  moduleId?: string
}

interface NavSection {
  title: string
  items: NavMenuItem[]
}

const route = useRoute()
const router = useRouter()
const { can } = usePermission()
const { config, isModuleEnabled } = useVariantConfig()

const rawSections: NavSection[] = [
  {
    title: 'Utama',
    items: [
      {
        title: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
        moduleId: 'dashboard',
      },
    ],
  },
  {
    title: 'Penjualan',
    items: [
      {
        title: 'Sales Order (SO)',
        path: '/penjualan/so',
        icon: ShoppingCart,
        permission: 'penjualan.so.view',
        moduleId: 'penjualan',
      },
      {
        title: 'Surat Jalan',
        path: '/penjualan/surat-jalan',
        icon: Truck,
        permission: 'penjualan.delivery.view',
        moduleId: 'penjualan',
      },
      {
        title: 'Invoice Penjualan',
        path: '/penjualan/invoice',
        icon: Receipt,
        permission: 'penjualan.invoice.view',
        moduleId: 'penjualan',
      },
    ],
  },
  {
    title: 'Pembelian',
    items: [
      {
        title: 'Invoice Pembelian',
        path: '/pembelian/invoice',
        icon: Receipt,
        permission: 'pembelian.invoice.view',
        moduleId: 'pembelian',
      },
    ],
  },
  {
    title: 'Keuangan',
    items: [
      {
        title: 'Piutang Customer',
        path: '/keuangan/piutang',
        icon: Wallet,
        permission: 'keuangan.piutang.view',
        moduleId: 'keuangan',
      },
      {
        title: 'Hutang Supplier',
        path: '/keuangan/hutang',
        icon: CreditCard,
        permission: 'keuangan.hutang.view',
        moduleId: 'pembelian', // Hutang is bound to purchase capabilities
      },
      {
        title: 'Surat Tagihan',
        path: '/keuangan/surat-tagihan',
        icon: FileSpreadsheet,
        permission: 'keuangan.billing_letter.view',
        moduleId: 'keuangan',
      },
    ],
  },
  {
    title: 'Master Data',
    items: [
      {
        title: 'Customer',
        path: '/customers',
        icon: Users,
        permission: 'customers.view',
        moduleId: 'customers',
      },
      {
        title: 'Supplier',
        path: '/suppliers',
        icon: Building,
        permission: 'suppliers.view',
        moduleId: 'suppliers',
      },
      {
        title: 'Barang',
        path: '/barang',
        icon: Package,
        permission: 'barang.view',
        moduleId: 'barang',
      },
    ],
  },
  {
    title: 'Sistem & Laporan',
    items: [
      {
        title: 'Manajemen Pengguna',
        path: '/users',
        icon: Users,
        permission: 'users.view',
        moduleId: 'users',
      },
      {
        title: 'Rekapitulasi Laporan',
        path: '/laporan',
        icon: BarChart3,
        moduleId: 'laporan',
      },
    ],
  },
]

const visibleSections = computed(() => {
  return rawSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        // 1. Must be enabled by variant
        if (item.moduleId && !isModuleEnabled(item.moduleId)) return false
        // 2. User must have permission (if defined)
        if (item.permission && !can(item.permission)) return false
        return true
      }),
    }))
    .filter((section) => section.items.length > 0)
})

function isCurrent(itemPath: string): boolean {
  if (itemPath === '/dashboard') {
    return route.path.startsWith('/dashboard')
  }
  return route.path.startsWith(itemPath)
}

function navigateTo(path: string) {
  router.push(path)
}
</script>

<template>
  <aside class="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen">
    <!-- Brand Header -->
    <div class="h-16 flex items-center gap-3 px-5 border-b border-slate-800">
      <div class="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow">
        <Layers class="w-5 h-5" />
      </div>
      <div>
        <h2 class="text-xs font-bold text-white tracking-wide uppercase leading-tight">{{ config.companyFullName }}</h2>
        <span class="text-[10px] text-sky-400 font-medium">Sistem Operasional</span>
      </div>
    </div>

    <!-- Navigation Links -->
    <nav class="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
      <div v-for="section in visibleSections" :key="section.title">
        <p class="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          {{ section.title }}
        </p>
        <div class="space-y-1">
          <button
            v-for="item in section.items"
            :key="item.path"
            type="button"
            class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left"
            :class="isCurrent(item.path)
              ? 'bg-sky-600 text-white shadow-sm'
              : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'"
            @click="navigateTo(item.path)"
          >
            <component :is="item.icon" class="w-4 h-4 shrink-0" />
            <span class="truncate">{{ item.title }}</span>
          </button>
        </div>
      </div>
    </nav>
  </aside>
</template>

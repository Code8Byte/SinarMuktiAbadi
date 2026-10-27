<script setup lang="ts">
import { ref, computed } from 'vue'
import { useVariantConfig } from '@/shared/composables/useVariantConfig'
import RekapPenjualanTab from '../components/RekapPenjualanTab.vue'
import RekapPiutangTab from '../components/RekapPiutangTab.vue'
import RekapPembelianTab from '../components/RekapPembelianTab.vue'
import RekapHutangTab from '../components/RekapHutangTab.vue'
import RekapBarangTab from '../components/RekapBarangTab.vue'
import {
  TrendingUp,
  Wallet,
  ShoppingBag,
  CreditCard,
  Package,
} from 'lucide-vue-next'

const { config } = useVariantConfig()

type TabKey = 'penjualan' | 'piutang' | 'pembelian' | 'hutang' | 'barang'

const activeTab = ref<TabKey>('penjualan')

interface TabDefinition {
  key: TabKey
  label: string
  icon: typeof TrendingUp
  available: boolean
}

const availableTabs = computed<TabDefinition[]>(() => {
  const allTabs: TabDefinition[] = [
    {
      key: 'penjualan',
      label: 'Rekap Penjualan',
      icon: TrendingUp,
      available: true,
    },
    {
      key: 'piutang',
      label: 'Rekap Piutang Customer',
      icon: Wallet,
      available: true,
    },
    {
      key: 'pembelian',
      label: 'Rekap Pembelian',
      icon: ShoppingBag,
      available: config.features.hasPurchaseModule,
    },
    {
      key: 'hutang',
      label: 'Rekap Hutang Supplier',
      icon: CreditCard,
      available: config.features.hasPurchaseModule,
    },
    {
      key: 'barang',
      label: 'Rekap Katalog Barang',
      icon: Package,
      available: config.features.hasMasterBarang,
    },
  ]
  return allTabs.filter((t) => t.available)
})
</script>

<template>
  <div class="space-y-5 pb-12">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-slate-900">Rekapitulasi Laporan Transaksi</h1>
        <p class="text-xs text-slate-500">
          Ringkasan eksekutif transaksi operasional terintegrasi — {{ config.companyFullName }}
        </p>
      </div>

      <span class="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full w-fit">
        Entitas Aktif: {{ config.appName }}
      </span>
    </div>

    <!-- Tab Navigation -->
    <div class="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
      <button
        v-for="tab in availableTabs"
        :key="tab.key"
        type="button"
        class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
        :class="activeTab === tab.key
          ? 'bg-slate-900 text-white shadow-sm'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
        @click="activeTab = tab.key"
      >
        <component :is="tab.icon" class="w-4 h-4" />
        {{ tab.label }}
      </button>
    </div>

    <!-- Active Tab Content -->
    <div>
      <RekapPenjualanTab v-if="activeTab === 'penjualan'" />
      <RekapPiutangTab v-else-if="activeTab === 'piutang'" />
      <RekapPembelianTab v-else-if="activeTab === 'pembelian' && config.features.hasPurchaseModule" />
      <RekapHutangTab v-else-if="activeTab === 'hutang' && config.features.hasPurchaseModule" />
      <RekapBarangTab v-else-if="activeTab === 'barang' && config.features.hasMasterBarang" />
    </div>
  </div>
</template>

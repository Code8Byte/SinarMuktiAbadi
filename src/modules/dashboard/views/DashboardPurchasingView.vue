<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ShoppingCart, Package, Building, PlusCircle } from 'lucide-vue-next'
import SummaryCard from '../widgets/SummaryCard.vue'
import QuickActionWidget from '../widgets/QuickActionWidget.vue'
import RecentActivityWidget from '../widgets/RecentActivityWidget.vue'
import { pembelianService } from '@/modules/pembelian'
import { barangService } from '@/modules/barang'
import { supplierService } from '@/modules/suppliers'

const invoicesCount = ref(0)
const barangCount = ref(0)
const suppliersCount = ref(0)

const quickActions = [
  { label: 'Input Invoice Pembelian', route: '/pembelian/invoice', icon: ShoppingCart },
  { label: 'Input Barang dari Faktur', route: '/barang', icon: PlusCircle },
  { label: 'Daftar Supplier', route: '/suppliers', icon: Building },
]

interface ActivityItem {
  id: string
  title: string
  subtitle: string
  time: string
  badgeText: string
  badgeColor: string
}

const recentActivities = ref<ActivityItem[]>([])

async function loadPurchasingMetrics() {
  try {
    const [invRes, brgRes, suppRes] = await Promise.all([
      pembelianService.getInvoices({ limit: 1000 }),
      barangService.getBarang({ limit: 1000 }),
      supplierService.getSuppliers({ limit: 1000 }),
    ])

    invoicesCount.value = invRes.items.length
    barangCount.value = brgRes.items.length
    suppliersCount.value = suppRes.meta.totalItems

    recentActivities.value = invRes.items.slice(0, 4).map((inv) => ({
      id: inv.id,
      title: `${inv.invoiceNumber} Masuk`,
      subtitle: `${inv.supplierName} (${inv.entity})`,
      time: inv.invoiceDate,
      badgeText: inv.paymentTerms.toUpperCase(),
      badgeColor: inv.paymentTerms === 'cash' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
    }))
  } catch (err) {
    console.error('Failed to load purchasing metrics', err)
  }
}

onMounted(() => {
  loadPurchasingMetrics()
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl font-bold text-slate-900">Dashboard Pengadaan & Pembelian (SMA)</h1>
      <p class="text-xs text-slate-500 mt-0.5">Pengelolaan faktur supplier dan katalog barang masuk</p>
    </div>

    <!-- Summary Metrics -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <SummaryCard
        title="Faktur Pembelian Tercatat"
        :value="String(invoicesCount)"
        subtitle="Entitas SMA & ST"
        :icon="ShoppingCart"
        color-class="bg-sky-50 text-sky-600"
      />
      <SummaryCard
        title="Total Item Barang Terdaftar"
        :value="String(barangCount)"
        subtitle="Siap untuk Sales Order"
        :icon="Package"
        color-class="bg-emerald-50 text-emerald-600"
      />
      <SummaryCard
        title="Jumlah Supplier Aktif"
        :value="String(suppliersCount)"
        subtitle="Mitra pengadaan terdaftar"
        :icon="Building"
        color-class="bg-purple-50 text-purple-600"
      />
    </div>

    <!-- Actions & Activities -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1">
        <QuickActionWidget title="Aksi Staf Pembelian" :actions="quickActions" />
      </div>
      <div class="lg:col-span-2">
        <RecentActivityWidget title="Faktur Pembelian Terkini" :items="recentActivities" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { TrendingUp, ShoppingBag, Users, AlertCircle, FileText, Truck, Receipt } from 'lucide-vue-next'
import SummaryCard from '../widgets/SummaryCard.vue'
import QuickActionWidget from '../widgets/QuickActionWidget.vue'
import RecentActivityWidget from '../widgets/RecentActivityWidget.vue'
import { salesInvoiceService, salesOrderService } from '@/modules/penjualan'
import { customerService } from '@/modules/customers'
import { pembelianService } from '@/modules/pembelian'
import { useVariantConfig } from '@/shared/composables/useVariantConfig'
import { formatRupiah } from '@/shared/utils/money'

const { config } = useVariantConfig()

const totalSales = ref(0)
const totalReceivable = ref(0)
const totalPurchases = ref(0)
const totalCustomersCount = ref(0)
const invoiceCount = ref(0)
const unpaidInvoiceCount = ref(0)

const quickActions = [
  { label: 'Buat Sales Order', route: '/penjualan/so', icon: FileText },
  { label: 'Surat Jalan Baru', route: '/penjualan/surat-jalan', icon: Truck },
  { label: 'Terbitkan Invoice', route: '/penjualan/invoice', icon: Receipt },
  { label: 'Manajemen Pengguna', route: '/users', icon: Users },
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

async function loadDashboardData() {
  try {
    const [invoicesRes, customersRes, soRes] = await Promise.all([
      salesInvoiceService.getInvoices({ limit: 1000 }),
      customerService.getCustomers({ limit: 1000 }),
      salesOrderService.getSalesOrders({ limit: 5 }),
    ])

    invoiceCount.value = invoicesRes.items.length
    totalSales.value = invoicesRes.items.reduce((sum, inv) => sum + inv.totalAmount, 0)
    totalReceivable.value = invoicesRes.items.reduce((sum, inv) => sum + inv.paymentSummary.remainingBalance, 0)
    unpaidInvoiceCount.value = invoicesRes.items.filter((inv) => inv.paymentSummary.remainingBalance > 0).length
    totalCustomersCount.value = customersRes.meta.totalItems

    if (config.features.hasPurchaseModule) {
      const purchaseRes = await pembelianService.getInvoices({ limit: 1000 })
      totalPurchases.value = purchaseRes.items.reduce((sum, p) => sum + p.totalAmount, 0)
    }

    recentActivities.value = soRes.items.slice(0, 4).map((so) => ({
      id: so.id,
      title: `${so.soNumber} Dibuat`,
      subtitle: so.customerName,
      time: so.orderDate,
      badgeText: so.status.toUpperCase(),
      badgeColor: so.status === 'close'
        ? 'bg-emerald-50 text-emerald-700'
        : so.status === 'open'
        ? 'bg-sky-50 text-sky-700'
        : 'bg-red-50 text-red-700',
    }))
  } catch (err) {
    console.error('Failed to load admin dashboard metrics', err)
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div>
        <h1 class="text-xl font-bold text-slate-900">Dashboard Eksekutif & Admin</h1>
        <p class="text-xs text-slate-500 mt-0.5">
          Ringkasan performa operasional dan kesehatan finansial — {{ config.companyFullName }}
        </p>
      </div>
    </div>

    <!-- Summary Metrics -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        title="Total Penjualan Terfaktur"
        :value="formatRupiah(totalSales)"
        :subtitle="`${invoiceCount} faktur penjualan`"
        :icon="TrendingUp"
        color-class="bg-emerald-50 text-emerald-600"
      />
      <SummaryCard
        title="Total Piutang Berjalan"
        :value="formatRupiah(totalReceivable)"
        :subtitle="`${unpaidInvoiceCount} invoice belum lunas`"
        :icon="AlertCircle"
        color-class="bg-amber-50 text-amber-600"
      />
      <SummaryCard
        title="Total Nilai Pengadaan"
        :value="config.features.hasPurchaseModule ? formatRupiah(totalPurchases) : '-'"
        :subtitle="config.features.hasPurchaseModule ? 'Faktur supplier SMA' : 'Modul dinonaktifkan'"
        :icon="ShoppingBag"
        color-class="bg-sky-50 text-sky-600"
      />
      <SummaryCard
        title="Total Pelanggan Aktif"
        :value="String(totalCustomersCount)"
        subtitle="Pelanggan terdaftar"
        :icon="Users"
        color-class="bg-purple-50 text-purple-600"
      />
    </div>

    <!-- Actions & Activities -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1">
        <QuickActionWidget title="Aksi Cepat Operasional" :actions="quickActions" />
      </div>
      <div class="lg:col-span-2">
        <RecentActivityWidget title="Pesanan Penjualan Terkini" :items="recentActivities" />
      </div>
    </div>
  </div>
</template>

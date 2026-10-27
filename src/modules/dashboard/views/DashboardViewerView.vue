<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BarChart3, TrendingUp, CheckCircle, FileText } from 'lucide-vue-next'
import SummaryCard from '../widgets/SummaryCard.vue'
import RecentActivityWidget from '../widgets/RecentActivityWidget.vue'
import { salesInvoiceService, salesOrderService, deliveryNoteService } from '@/modules/penjualan'
import { useVariantConfig } from '@/shared/composables/useVariantConfig'
import { formatRupiah } from '@/shared/utils/money'

const { config } = useVariantConfig()

const totalOmzet = ref(0)
const totalSoCount = ref(0)
const totalDeliveryCount = ref(0)

interface ActivityItem {
  id: string
  title: string
  subtitle: string
  time: string
  badgeText: string
  badgeColor: string
}

const recentActivities = ref<ActivityItem[]>([])

async function loadViewerMetrics() {
  try {
    const [invRes, soRes, dnRes] = await Promise.all([
      salesInvoiceService.getInvoices({ limit: 1000 }),
      salesOrderService.getSalesOrders({ limit: 1000 }),
      deliveryNoteService.getDeliveryNotes({ limit: 1000 }),
    ])

    totalOmzet.value = invRes.items.reduce((sum, inv) => sum + inv.totalAmount, 0)
    totalSoCount.value = soRes.meta.totalItems
    totalDeliveryCount.value = dnRes.meta.totalItems

    recentActivities.value = invRes.items.slice(0, 4).map((inv) => ({
      id: inv.id,
      title: `${inv.invoiceNumber} • ${formatRupiah(inv.totalAmount)}`,
      subtitle: `${inv.customerName} (${inv.paymentSummary.status})`,
      time: inv.invoiceDate,
      badgeText: inv.paymentSummary.status.toUpperCase(),
      badgeColor: inv.paymentSummary.status === 'lunas'
        ? 'bg-emerald-50 text-emerald-700'
        : 'bg-amber-50 text-amber-700',
    }))
  } catch (err) {
    console.error('Failed to load viewer metrics', err)
  }
}

onMounted(() => {
  loadViewerMetrics()
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl font-bold text-slate-900">Dashboard Ringkasan (Viewer / Auditor)</h1>
      <p class="text-xs text-slate-500 mt-0.5">
        Akses pengamatan kinerja transaksi dan rekapitulasi bisnis — {{ config.companyFullName }}
      </p>
    </div>

    <!-- Summary Metrics -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        title="Akumulasi Omzet Penjualan"
        :value="formatRupiah(totalOmzet)"
        subtitle="Total faktur terbit"
        :icon="TrendingUp"
        color-class="bg-emerald-50 text-emerald-600"
      />
      <SummaryCard
        title="Total Transaksi SO"
        :value="String(totalSoCount)"
        subtitle="Sales Order tercatat"
        :icon="FileText"
        color-class="bg-sky-50 text-sky-600"
      />
      <SummaryCard
        title="Surat Jalan Terbit"
        :value="String(totalDeliveryCount)"
        subtitle="Pemenuhan pengiriman barang"
        :icon="CheckCircle"
        color-class="bg-purple-50 text-purple-600"
      />
      <SummaryCard
        title="Modul Laporan Tersedia"
        :value="config.features.hasPurchaseModule ? '5 Kategori' : '2 Kategori'"
        :subtitle="config.features.hasPurchaseModule ? 'Penjualan, Piutang, Pembelian, Hutang, Barang' : 'Penjualan & Piutang'"
        :icon="BarChart3"
        color-class="bg-amber-50 text-amber-600"
      />
    </div>

    <div>
      <RecentActivityWidget title="Log Transaksi Terkini" :items="recentActivities" />
    </div>
  </div>
</template>

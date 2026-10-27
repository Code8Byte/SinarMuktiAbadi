<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { CreditCard, Wallet, FileSpreadsheet, CheckCircle } from 'lucide-vue-next'
import SummaryCard from '../widgets/SummaryCard.vue'
import QuickActionWidget from '../widgets/QuickActionWidget.vue'
import RecentActivityWidget from '../widgets/RecentActivityWidget.vue'
import { salesInvoiceService } from '@/modules/penjualan'
import { pembelianService } from '@/modules/pembelian'
import { billingLetterService } from '@/modules/keuangan'
import { useVariantConfig } from '@/shared/composables/useVariantConfig'
import { formatRupiah } from '@/shared/utils/money'

const { config } = useVariantConfig()

const totalPiutang = ref(0)
const unpaidInvoiceCount = ref(0)
const totalKasDiterima = ref(0)
const totalHutang = ref(0)
const letterCount = ref(0)

const quickActions = [
  { label: 'Buku Piutang Customer', route: '/keuangan/piutang', icon: Wallet },
  { label: 'Terbitkan Surat Tagihan', route: '/keuangan/surat-tagihan', icon: FileSpreadsheet },
  { label: 'Buku Hutang Supplier', route: '/keuangan/hutang', icon: CreditCard },
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

async function loadFinanceMetrics() {
  try {
    const [salesInvRes, blRes] = await Promise.all([
      salesInvoiceService.getInvoices({ limit: 1000 }),
      billingLetterService.getBillingLetters({ limit: 1000 }),
    ])

    totalPiutang.value = salesInvRes.items.reduce((sum, inv) => sum + inv.paymentSummary.remainingBalance, 0)
    unpaidInvoiceCount.value = salesInvRes.items.filter((inv) => inv.paymentSummary.remainingBalance > 0).length
    totalKasDiterima.value = salesInvRes.items.reduce((sum, inv) => sum + inv.paymentSummary.totalPaid, 0)
    letterCount.value = blRes.meta.totalItems

    if (config.features.hasPurchaseModule) {
      const debtSummary = await pembelianService.getSupplierDebtSummary()
      totalHutang.value = debtSummary.reduce((sum, d) => sum + d.totalOutstanding, 0)
    }

    recentActivities.value = blRes.items.slice(0, 4).map((bl) => ({
      id: bl.id,
      title: `${bl.letterNumber} Diterbitkan`,
      subtitle: `${bl.customerName} • ${formatRupiah(bl.totalOutstandingAmount)}`,
      time: bl.letterDate,
      badgeText: `${bl.items.length} INV`,
      badgeColor: 'bg-amber-50 text-amber-700',
    }))
  } catch (err) {
    console.error('Failed to load finance metrics', err)
  }
}

onMounted(() => {
  loadFinanceMetrics()
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl font-bold text-slate-900">Dashboard Keuangan</h1>
      <p class="text-xs text-slate-500 mt-0.5">Pengawasan piutang usaha, pelunasan bertahap, dan penagihan</p>
    </div>

    <!-- Summary Metrics -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        title="Total Piutang Berjalan"
        :value="formatRupiah(totalPiutang)"
        :subtitle="`${unpaidInvoiceCount} Invoice aktif`"
        :icon="Wallet"
        color-class="bg-amber-50 text-amber-600"
      />
      <SummaryCard
        title="Surat Tagihan Terbit"
        :value="`${letterCount} Dokumen`"
        subtitle="Riwayat penagihan resmi"
        :icon="FileSpreadsheet"
        color-class="bg-red-50 text-red-600"
      />
      <SummaryCard
        title="Total Hutang Dagang"
        :value="config.features.hasPurchaseModule ? formatRupiah(totalHutang) : '-'"
        :subtitle="config.features.hasPurchaseModule ? 'Hutang supplier SMA' : 'Modul dinonaktifkan'"
        :icon="CreditCard"
        color-class="bg-sky-50 text-sky-600"
      />
      <SummaryCard
        title="Penerimaan Kas Masuk"
        :value="formatRupiah(totalKasDiterima)"
        subtitle="Akumulasi pembayaran piutang"
        :icon="CheckCircle"
        color-class="bg-emerald-50 text-emerald-600"
      />
    </div>

    <!-- Actions & Activities -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1">
        <QuickActionWidget title="Aksi Staf Keuangan" :actions="quickActions" />
      </div>
      <div class="lg:col-span-2">
        <RecentActivityWidget title="Surat Tagihan Terkini" :items="recentActivities" />
      </div>
    </div>
  </div>
</template>

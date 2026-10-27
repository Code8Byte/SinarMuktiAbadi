<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FileText, Truck, Users, CheckCircle2, Clock } from 'lucide-vue-next'
import SummaryCard from '../widgets/SummaryCard.vue'
import QuickActionWidget from '../widgets/QuickActionWidget.vue'
import RecentActivityWidget from '../widgets/RecentActivityWidget.vue'
import { salesOrderService, deliveryNoteService } from '@/modules/penjualan'
import { customerService } from '@/modules/customers'

const openSoCount = ref(0)
const closedSoCount = ref(0)
const deliveryNotesCount = ref(0)
const customersCount = ref(0)

const quickActions = [
  { label: 'Buat SO Baru', route: '/penjualan/so', icon: FileText },
  { label: 'Buat Surat Jalan', route: '/penjualan/surat-jalan', icon: Truck },
  { label: 'Tambah Customer', route: '/customers', icon: Users },
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

async function loadSalesMetrics() {
  try {
    const [soRes, dnRes, custRes] = await Promise.all([
      salesOrderService.getSalesOrders({ limit: 1000 }),
      deliveryNoteService.getDeliveryNotes({ limit: 1000 }),
      customerService.getCustomers({ limit: 1000 }),
    ])

    openSoCount.value = soRes.items.filter((so) => so.status === 'open').length
    closedSoCount.value = soRes.items.filter((so) => so.status === 'close').length
    deliveryNotesCount.value = dnRes.items.length
    customersCount.value = custRes.meta.totalItems

    recentActivities.value = dnRes.items.slice(0, 4).map((dn) => ({
      id: dn.id,
      title: `${dn.deliveryNumber} Terbit`,
      subtitle: `${dn.customerName} • Penerima: ${dn.recipientName}`,
      time: dn.deliveryDate,
      badgeText: dn.status.toUpperCase(),
      badgeColor: 'bg-sky-50 text-sky-700',
    }))
  } catch (err) {
    console.error('Failed to load sales dashboard metrics', err)
  }
}

onMounted(() => {
  loadSalesMetrics()
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl font-bold text-slate-900">Dashboard Penjualan</h1>
      <p class="text-xs text-slate-500 mt-0.5">Pemantauan pesanan penjualan (SO) dan pemenuhan surat jalan</p>
    </div>

    <!-- Summary Metrics -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        title="Sales Order Terbuka"
        :value="String(openSoCount)"
        subtitle="Menunggu pemenuhan surat jalan"
        :icon="Clock"
        color-class="bg-amber-50 text-amber-600"
      />
      <SummaryCard
        title="Total Surat Jalan Terbit"
        :value="String(deliveryNotesCount)"
        subtitle="Dokumen pengiriman barang"
        :icon="Truck"
        color-class="bg-sky-50 text-sky-600"
      />
      <SummaryCard
        title="SO Selesai Penuh"
        :value="String(closedSoCount)"
        subtitle="Pemenuhan 100%"
        :icon="CheckCircle2"
        color-class="bg-emerald-50 text-emerald-600"
      />
      <SummaryCard
        title="Total Pelanggan Terdaftar"
        :value="String(customersCount)"
        subtitle="Data master pelanggan"
        :icon="Users"
        color-class="bg-purple-50 text-purple-600"
      />
    </div>

    <!-- Actions & Activities -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1">
        <QuickActionWidget title="Aksi Staf Penjualan" :actions="quickActions" />
      </div>
      <div class="lg:col-span-2">
        <RecentActivityWidget title="Pengiriman Surat Jalan Terkini" :items="recentActivities" />
      </div>
    </div>
  </div>
</template>

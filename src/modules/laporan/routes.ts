import type { RouteRecordRaw } from 'vue-router'

export const laporanRoutes: RouteRecordRaw = {
  path: '/laporan',
  name: 'RekapLaporan',
  component: () => import('./views/RekapLaporanView.vue'),
  meta: {
    permissions: ['laporan.penjualan.view'],
  },
}

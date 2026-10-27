import type { RouteRecordRaw } from 'vue-router'

export const barangRoutes: RouteRecordRaw = {
  path: '/barang',
  name: 'BarangList',
  component: () => import('./views/BarangListView.vue'),
  meta: {
    permissions: ['barang.view'],
  },
}

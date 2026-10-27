import type { RouteRecordRaw } from 'vue-router'

export const suppliersRoutes: RouteRecordRaw = {
  path: '/suppliers',
  name: 'SupplierList',
  component: () => import('./views/SupplierListView.vue'),
  meta: {
    permissions: ['suppliers.view'],
  },
}

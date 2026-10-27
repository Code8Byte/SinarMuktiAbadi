import type { RouteRecordRaw } from 'vue-router'

export const customersRoutes: RouteRecordRaw = {
  path: '/customers',
  name: 'CustomerList',
  component: () => import('./views/CustomerListView.vue'),
  meta: {
    permissions: ['customers.view'],
  },
}

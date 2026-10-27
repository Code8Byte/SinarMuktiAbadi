import type { RouteRecordRaw } from 'vue-router'

export const pembelianRoutes: RouteRecordRaw = {
  path: '/pembelian',
  meta: {
    permissions: ['pembelian.invoice.view'],
  },
  children: [
    {
      path: 'invoice',
      name: 'PurchaseInvoiceList',
      component: () => import('./views/PurchaseInvoiceListView.vue'),
      meta: {
        permissions: ['pembelian.invoice.view'],
      },
    },
    {
      path: 'invoice/create',
      name: 'PurchaseInvoiceCreate',
      component: () => import('./views/PurchaseInvoiceCreateView.vue'),
      meta: {
        permissions: ['pembelian.invoice.create'],
      },
    },
    {
      path: 'invoice/:id',
      name: 'PurchaseInvoiceDetail',
      component: () => import('./views/PurchaseInvoiceDetailView.vue'),
      meta: {
        permissions: ['pembelian.invoice.view'],
      },
    },
  ],
}

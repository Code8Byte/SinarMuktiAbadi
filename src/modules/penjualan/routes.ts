import type { RouteRecordRaw } from 'vue-router'

export const penjualanRoutes: RouteRecordRaw = {
  path: '/penjualan',
  meta: {
    permissions: ['penjualan.so.view'],
  },
  children: [
    {
      path: 'so',
      name: 'SalesOrderList',
      component: () => import('./views/SalesOrderListView.vue'),
      meta: { permissions: ['penjualan.so.view'] },
    },
    {
      path: 'so/create',
      name: 'SalesOrderCreate',
      component: () => import('./views/SalesOrderCreateView.vue'),
      meta: { permissions: ['penjualan.so.create'] },
    },
    {
      path: 'so/:id',
      name: 'SalesOrderDetail',
      component: () => import('./views/SalesOrderDetailView.vue'),
      meta: { permissions: ['penjualan.so.view'] },
    },
    {
      path: 'surat-jalan',
      name: 'DeliveryNoteList',
      component: () => import('./views/DeliveryNoteListView.vue'),
      meta: { permissions: ['penjualan.delivery.view'] },
    },
    {
      path: 'surat-jalan/create',
      name: 'DeliveryNoteCreate',
      component: () => import('./views/DeliveryNoteCreateView.vue'),
      meta: { permissions: ['penjualan.delivery.create'] },
    },
    {
      path: 'surat-jalan/:id',
      name: 'DeliveryNoteDetail',
      component: () => import('./views/DeliveryNoteDetailView.vue'),
      meta: { permissions: ['penjualan.delivery.view'] },
    },
    {
      path: 'invoice',
      name: 'SalesInvoiceList',
      component: () => import('./views/SalesInvoiceListView.vue'),
      meta: { permissions: ['penjualan.invoice.view'] },
    },
    {
      path: 'invoice/create',
      name: 'SalesInvoiceCreate',
      component: () => import('./views/SalesInvoiceCreateView.vue'),
      meta: { permissions: ['penjualan.invoice.create'] },
    },
    {
      path: 'invoice/:id',
      name: 'SalesInvoiceDetail',
      component: () => import('./views/SalesInvoiceDetailView.vue'),
      meta: { permissions: ['penjualan.invoice.view'] },
    },
  ],
}

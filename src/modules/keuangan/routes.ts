import type { RouteRecordRaw } from 'vue-router'

export const keuanganRoutes: RouteRecordRaw = {
  path: '/keuangan',
  meta: {
    permissions: ['keuangan.piutang.view'],
  },
  children: [
    {
      path: 'piutang',
      name: 'PiutangList',
      component: () => import('./views/PiutangListView.vue'),
      meta: {
        permissions: ['keuangan.piutang.view'],
      },
    },
    {
      path: 'hutang',
      name: 'HutangList',
      component: () => import('./views/HutangListView.vue'),
      meta: {
        permissions: ['keuangan.hutang.view'],
      },
    },
    {
      path: 'surat-tagihan',
      name: 'BillingLetterList',
      component: () => import('./views/BillingLetterListView.vue'),
      meta: {
        permissions: ['keuangan.billing_letter.view'],
      },
    },
    {
      path: 'surat-tagihan/create',
      name: 'BillingLetterCreate',
      component: () => import('./views/BillingLetterCreateView.vue'),
      meta: {
        permissions: ['keuangan.billing_letter.create'],
      },
    },
    {
      path: 'surat-tagihan/:id',
      name: 'BillingLetterDetail',
      component: () => import('./views/BillingLetterDetailPrintView.vue'),
      meta: {
        permissions: ['keuangan.billing_letter.view'],
      },
    },
  ],
}

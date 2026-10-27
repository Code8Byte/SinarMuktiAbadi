import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/modules/auth'

export const dashboardRoutes: RouteRecordRaw = {
  path: '/dashboard',
  meta: {
    moduleId: 'dashboard',
    menu: {
      title: 'Dashboard',
      icon: 'LayoutDashboard',
      order: 1,
    },
  },
  children: [
    {
      path: '',
      name: 'DashboardIndex',
      redirect: () => {
        const authStore = useAuthStore()
        const role = authStore.currentRole
        if (role === 'staf_penjualan') return '/dashboard/sales'
        if (role === 'staf_pembelian') return '/dashboard/purchasing'
        if (role === 'keuangan') return '/dashboard/finance'
        if (role === 'viewer') return '/dashboard/viewer'
        return '/dashboard/admin'
      },
    },
    {
      path: 'admin',
      name: 'DashboardAdmin',
      component: () => import('./views/DashboardAdminView.vue'),
      meta: {
        title: 'Dashboard Admin',
        permissions: ['dashboard.admin.view'],
      },
    },
    {
      path: 'sales',
      name: 'DashboardSales',
      component: () => import('./views/DashboardSalesView.vue'),
      meta: {
        title: 'Dashboard Penjualan',
        permissions: ['dashboard.sales.view'],
      },
    },
    {
      path: 'purchasing',
      name: 'DashboardPurchasing',
      component: () => import('./views/DashboardPurchasingView.vue'),
      meta: {
        title: 'Dashboard Pembelian',
        permissions: ['dashboard.purchasing.view'],
      },
    },
    {
      path: 'finance',
      name: 'DashboardFinance',
      component: () => import('./views/DashboardFinanceView.vue'),
      meta: {
        title: 'Dashboard Keuangan',
        permissions: ['dashboard.finance.view'],
      },
    },
    {
      path: 'viewer',
      name: 'DashboardViewer',
      component: () => import('./views/DashboardViewerView.vue'),
      meta: {
        title: 'Dashboard Viewer',
        permissions: ['dashboard.viewer.view'],
      },
    },
  ],
}

import type { RouteRecordRaw } from 'vue-router'
import { activeVariant, type VariantConfig, type ModuleId } from '@/app/variants'
import { authRoutes } from '@/modules/auth'
import { dashboardRoutes } from '@/modules/dashboard'
import { usersRoutes } from '@/modules/users'
import { customersRoutes } from '@/modules/customers'
import { suppliersRoutes } from '@/modules/suppliers'
import { barangRoutes } from '@/modules/barang'
import { pembelianRoutes } from '@/modules/pembelian'
import { penjualanRoutes } from '@/modules/penjualan'
import { keuanganRoutes } from '@/modules/keuangan'
import { laporanRoutes } from '@/modules/laporan'
import { commonRoutes } from './routes.common'

export const MODULE_ROUTE_MAP: Record<ModuleId, RouteRecordRaw> = {
  dashboard: dashboardRoutes,
  users: usersRoutes,
  customers: customersRoutes,
  suppliers: suppliersRoutes,
  barang: barangRoutes,
  pembelian: pembelianRoutes,
  penjualan: penjualanRoutes,
  keuangan: keuanganRoutes,
  laporan: laporanRoutes,
}

export function buildRoutes(config: VariantConfig = activeVariant): RouteRecordRaw[] {
  // Collect routes of modules that are enabled in this variant
  const layoutChildren: RouteRecordRaw[] = [
    {
      path: '',
      redirect: '/dashboard',
    },
  ]

  for (const moduleId of config.enabledModules) {
    const routeDef = MODULE_ROUTE_MAP[moduleId]
    if (routeDef) {
      layoutChildren.push(routeDef)
    }
  }

  const appLayoutRoute: RouteRecordRaw = {
    path: '/',
    component: () => import('@/app/layouts/AppLayout.vue'),
    children: layoutChildren,
  }

  return [
    appLayoutRoute,
    ...authRoutes,
    ...commonRoutes,
  ]
}

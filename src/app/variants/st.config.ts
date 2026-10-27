import type { VariantConfig } from './types'

export const stConfig: VariantConfig = {
  id: 'st',
  appName: 'Web Penjualan ST',
  companyFullName: 'ST',
  enabledModules: [
    'dashboard',
    'users',
    'customers',
    'penjualan',
    'keuangan',
    'laporan',
  ],
  soItemMode: 'manual',
  invoiceFaktur: 'none',
  roles: ['owner', 'admin', 'staf_penjualan', 'keuangan', 'viewer'],
  features: {
    hasPurchaseModule: false,
    hasMasterBarang: false,
    hasTaxFaktur: false,
    allowManualSoItem: true,
  },
}

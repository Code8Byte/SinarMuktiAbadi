import type { VariantConfig } from './types'

export const smaConfig: VariantConfig = {
  id: 'sma',
  appName: 'Web Penjualan & Pembelian PT SMA',
  companyFullName: 'PT Sinar Mukti Abadi',
  enabledModules: [
    'dashboard',
    'users',
    'customers',
    'suppliers',
    'barang',
    'pembelian',
    'penjualan',
    'keuangan',
    'laporan',
  ],
  soItemMode: 'catalog',
  invoiceFaktur: 'tracked',
  roles: ['owner', 'admin', 'staf_penjualan', 'staf_pembelian', 'keuangan', 'viewer'],
  features: {
    hasPurchaseModule: true,
    hasMasterBarang: true,
    hasTaxFaktur: true,
    allowManualSoItem: false,
  },
}

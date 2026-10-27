export type VariantId = 'sma' | 'st'

export type ModuleId =
  | 'dashboard'
  | 'users'
  | 'customers'
  | 'suppliers'
  | 'barang'
  | 'pembelian'
  | 'penjualan'
  | 'keuangan'
  | 'laporan'

export interface VariantFeatures {
  hasPurchaseModule: boolean
  hasMasterBarang: boolean
  hasTaxFaktur: boolean
  allowManualSoItem: boolean
}

export interface VariantConfig {
  id: VariantId
  appName: string
  companyFullName: string
  enabledModules: ModuleId[]
  soItemMode: 'catalog' | 'manual'
  invoiceFaktur: 'tracked' | 'none'
  roles: string[]
  features: VariantFeatures
}

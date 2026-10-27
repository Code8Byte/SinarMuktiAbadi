export type RoleId =
  | 'owner'
  | 'admin'
  | 'staf_penjualan'
  | 'staf_pembelian'
  | 'keuangan'
  | 'viewer'

export interface RoleDefinition {
  id: RoleId
  label: string
  description: string
  dashboardRoute: string
}

export const ROLE_DEFINITIONS: Record<RoleId, RoleDefinition> = {
  owner: {
    id: 'owner',
    label: 'Pemilik (Owner)',
    description: 'Akses penuh ke semua modul, laporan, dan konfigurasi',
    dashboardRoute: '/dashboard/admin',
  },
  admin: {
    id: 'admin',
    label: 'Administrator',
    description: 'Akses penuh operasional dan manajemen pengguna',
    dashboardRoute: '/dashboard/admin',
  },
  staf_penjualan: {
    id: 'staf_penjualan',
    label: 'Staf Penjualan',
    description: 'Mengelola customer, SO, surat jalan, dan invoice penjualan',
    dashboardRoute: '/dashboard/sales',
  },
  staf_pembelian: {
    id: 'staf_pembelian',
    label: 'Staf Pembelian',
    description: 'Mengelola supplier, invoice pembelian, dan barang (SMA)',
    dashboardRoute: '/dashboard/purchasing',
  },
  keuangan: {
    id: 'keuangan',
    label: 'Staf Keuangan',
    description: 'Mengelola hutang, piutang, pembayaran, dan surat tagihan',
    dashboardRoute: '/dashboard/finance',
  },
  viewer: {
    id: 'viewer',
    label: 'Viewer / Auditor',
    description: 'Akses read-only ke dashboard dan rekapitulasi',
    dashboardRoute: '/dashboard/viewer',
  },
}

export const ALL_ROLES: RoleId[] = Object.keys(ROLE_DEFINITIONS) as RoleId[]

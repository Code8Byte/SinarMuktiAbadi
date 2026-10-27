import type { RoleId } from './roles'

export type PermissionId =
  // Dashboard
  | 'dashboard.admin.view'
  | 'dashboard.sales.view'
  | 'dashboard.purchasing.view'
  | 'dashboard.finance.view'
  | 'dashboard.viewer.view'
  // Users
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  // Customers
  | 'customers.view'
  | 'customers.create'
  | 'customers.edit'
  | 'customers.delete'
  // Suppliers (SMA)
  | 'suppliers.view'
  | 'suppliers.create'
  | 'suppliers.edit'
  | 'suppliers.delete'
  // Barang (SMA)
  | 'barang.view'
  | 'barang.create'
  | 'barang.edit'
  | 'barang.delete'
  // Pembelian (SMA)
  | 'pembelian.invoice.view'
  | 'pembelian.invoice.create'
  | 'pembelian.invoice.edit'
  | 'pembelian.invoice.delete'
  // Penjualan - SO
  | 'penjualan.so.view'
  | 'penjualan.so.create'
  | 'penjualan.so.edit'
  | 'penjualan.so.cancel'
  | 'penjualan.so.close'
  // Penjualan - Surat Jalan
  | 'penjualan.delivery.view'
  | 'penjualan.delivery.create'
  | 'penjualan.delivery.print'
  | 'penjualan.delivery.cancel'
  // Penjualan - Invoice
  | 'penjualan.invoice.view'
  | 'penjualan.invoice.create'
  | 'penjualan.invoice.print'
  | 'penjualan.invoice.edit'
  // Keuangan - Hutang
  | 'keuangan.hutang.view'
  | 'keuangan.hutang.payment'
  // Keuangan - Piutang
  | 'keuangan.piutang.view'
  | 'keuangan.piutang.payment'
  // Keuangan - Surat Tagihan
  | 'keuangan.billing_letter.view'
  | 'keuangan.billing_letter.create'
  | 'keuangan.billing_letter.print'
  // Laporan
  | 'laporan.penjualan.view'
  | 'laporan.pembelian.view'
  | 'laporan.barang.view'
  | 'laporan.keuangan.view'

export const ROLE_PERMISSIONS: Record<RoleId, readonly PermissionId[]> = {
  owner: [
    'dashboard.admin.view',
    'dashboard.sales.view',
    'dashboard.purchasing.view',
    'dashboard.finance.view',
    'dashboard.viewer.view',
    'users.view',
    'users.create',
    'users.edit',
    'users.delete',
    'customers.view',
    'customers.create',
    'customers.edit',
    'customers.delete',
    'suppliers.view',
    'suppliers.create',
    'suppliers.edit',
    'suppliers.delete',
    'barang.view',
    'barang.create',
    'barang.edit',
    'barang.delete',
    'pembelian.invoice.view',
    'pembelian.invoice.create',
    'pembelian.invoice.edit',
    'pembelian.invoice.delete',
    'penjualan.so.view',
    'penjualan.so.create',
    'penjualan.so.edit',
    'penjualan.so.cancel',
    'penjualan.so.close',
    'penjualan.delivery.view',
    'penjualan.delivery.create',
    'penjualan.delivery.print',
    'penjualan.delivery.cancel',
    'penjualan.invoice.view',
    'penjualan.invoice.create',
    'penjualan.invoice.print',
    'penjualan.invoice.edit',
    'keuangan.hutang.view',
    'keuangan.hutang.payment',
    'keuangan.piutang.view',
    'keuangan.piutang.payment',
    'keuangan.billing_letter.view',
    'keuangan.billing_letter.create',
    'keuangan.billing_letter.print',
    'laporan.penjualan.view',
    'laporan.pembelian.view',
    'laporan.barang.view',
    'laporan.keuangan.view',
  ],
  admin: [
    'dashboard.admin.view',
    'dashboard.sales.view',
    'dashboard.purchasing.view',
    'dashboard.finance.view',
    'dashboard.viewer.view',
    'users.view',
    'users.create',
    'users.edit',
    'customers.view',
    'customers.create',
    'customers.edit',
    'customers.delete',
    'suppliers.view',
    'suppliers.create',
    'suppliers.edit',
    'suppliers.delete',
    'barang.view',
    'barang.create',
    'barang.edit',
    'barang.delete',
    'pembelian.invoice.view',
    'pembelian.invoice.create',
    'pembelian.invoice.edit',
    'pembelian.invoice.delete',
    'penjualan.so.view',
    'penjualan.so.create',
    'penjualan.so.edit',
    'penjualan.so.cancel',
    'penjualan.so.close',
    'penjualan.delivery.view',
    'penjualan.delivery.create',
    'penjualan.delivery.print',
    'penjualan.delivery.cancel',
    'penjualan.invoice.view',
    'penjualan.invoice.create',
    'penjualan.invoice.print',
    'keuangan.hutang.view',
    'keuangan.hutang.payment',
    'keuangan.piutang.view',
    'keuangan.piutang.payment',
    'keuangan.billing_letter.view',
    'keuangan.billing_letter.create',
    'keuangan.billing_letter.print',
    'laporan.penjualan.view',
    'laporan.pembelian.view',
    'laporan.barang.view',
    'laporan.keuangan.view',
  ],
  staf_penjualan: [
    'dashboard.sales.view',
    'dashboard.viewer.view',
    'customers.view',
    'customers.create',
    'customers.edit',
    'barang.view',
    'penjualan.so.view',
    'penjualan.so.create',
    'penjualan.so.edit',
    'penjualan.so.cancel',
    'penjualan.so.close',
    'penjualan.delivery.view',
    'penjualan.delivery.create',
    'penjualan.delivery.print',
    'penjualan.invoice.view',
    'penjualan.invoice.create',
    'penjualan.invoice.print',
    'keuangan.piutang.view',
    'laporan.penjualan.view',
  ],
  staf_pembelian: [
    'dashboard.purchasing.view',
    'dashboard.viewer.view',
    'suppliers.view',
    'suppliers.create',
    'suppliers.edit',
    'barang.view',
    'barang.create',
    'barang.edit',
    'pembelian.invoice.view',
    'pembelian.invoice.create',
    'pembelian.invoice.edit',
    'keuangan.hutang.view',
    'laporan.pembelian.view',
    'laporan.barang.view',
  ],
  keuangan: [
    'dashboard.finance.view',
    'dashboard.viewer.view',
    'customers.view',
    'suppliers.view',
    'barang.view',
    'pembelian.invoice.view',
    'penjualan.so.view',
    'penjualan.delivery.view',
    'penjualan.invoice.view',
    'penjualan.invoice.print',
    'keuangan.hutang.view',
    'keuangan.hutang.payment',
    'keuangan.piutang.view',
    'keuangan.piutang.payment',
    'keuangan.billing_letter.view',
    'keuangan.billing_letter.create',
    'keuangan.billing_letter.print',
    'laporan.penjualan.view',
    'laporan.pembelian.view',
    'laporan.barang.view',
    'laporan.keuangan.view',
  ],
  viewer: [
    'dashboard.viewer.view',
    'customers.view',
    'suppliers.view',
    'barang.view',
    'pembelian.invoice.view',
    'penjualan.so.view',
    'penjualan.delivery.view',
    'penjualan.invoice.view',
    'keuangan.hutang.view',
    'keuangan.piutang.view',
    'keuangan.billing_letter.view',
    'laporan.penjualan.view',
    'laporan.pembelian.view',
    'laporan.barang.view',
    'laporan.keuangan.view',
  ],
}

export function roleHasPermission(role: RoleId, permission: PermissionId): boolean {
  const permissions = ROLE_PERMISSIONS[role] || []
  return permissions.includes(permission)
}

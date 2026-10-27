import type { SoItemStrategy, FormSoItem } from './soItemStrategy.interface'
import { barangService } from '@/modules/barang'

export class CatalogItemStrategy implements SoItemStrategy {
  readonly mode = 'catalog'

  async canCreateSo(): Promise<{ allowed: boolean; reason?: string }> {
    const hasBarang = await barangService.hasAnyBarang()
    if (!hasBarang) {
      return {
        allowed: false,
        reason: 'Sales Order tidak dapat dibuat karena belum ada barang yang diinput di modul pembelian.',
      }
    }
    return { allowed: true }
  }

  validateItems(items: FormSoItem[]): { valid: boolean; error?: string } {
    if (!items || items.length === 0) {
      return { valid: false, error: 'Sales Order minimal harus memiliki 1 item barang.' }
    }

    for (let i = 0; i < items.length; i++) {
      const it = items[i]
      if (!it.barangId) {
        return { valid: false, error: `Item baris ke-${i + 1}: wajib memilih barang dari katalog master.` }
      }
      if (it.qty <= 0) {
        return { valid: false, error: `Item baris ke-${i + 1}: kuantitas harus lebih besar dari 0.` }
      }
      if (it.unitPrice <= 0) {
        return { valid: false, error: `Item baris ke-${i + 1}: harga satuan harus lebih besar dari 0.` }
      }
    }

    return { valid: true }
  }
}

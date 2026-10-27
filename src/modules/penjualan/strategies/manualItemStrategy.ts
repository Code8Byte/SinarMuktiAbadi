import type { SoItemStrategy, FormSoItem } from './soItemStrategy.interface'

export class ManualItemStrategy implements SoItemStrategy {
  readonly mode = 'manual'

  async canCreateSo(): Promise<{ allowed: boolean; reason?: string }> {
    // ST allows SO creation anytime with manual items
    return { allowed: true }
  }

  validateItems(items: FormSoItem[]): { valid: boolean; error?: string } {
    if (!items || items.length === 0) {
      return { valid: false, error: 'Sales Order minimal harus memiliki 1 item barang.' }
    }

    for (let i = 0; i < items.length; i++) {
      const it = items[i]
      if (!it.itemName || !it.itemName.trim()) {
        return { valid: false, error: `Item baris ke-${i + 1}: nama barang wajib diketik manual.` }
      }
      if (!it.unit || !it.unit.trim()) {
        return { valid: false, error: `Item baris ke-${i + 1}: satuan barang wajib diisi.` }
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

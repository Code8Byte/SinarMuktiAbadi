export interface FormSoItem {
  barangId: string | null
  itemName: string
  unit: string
  qty: number
  unitPrice: number
}

export interface SoItemStrategy {
  mode: 'catalog' | 'manual'
  canCreateSo(): Promise<{ allowed: boolean; reason?: string }>
  validateItems(items: FormSoItem[]): { valid: boolean; error?: string }
}

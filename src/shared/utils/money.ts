/**
 * Utility functions for handling Indonesian Rupiah money operations.
 * All amounts are strictly treated as integers (no floating decimals).
 */

export function formatRupiah(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return 'Rp 0'
  const rounded = Math.round(amount)
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(rounded)
}

export function parseRupiah(value: string | number): number {
  if (typeof value === 'number') return Math.round(value)
  if (!value) return 0
  const cleaned = value.replace(/[^0-9-]/g, '')
  const parsed = parseInt(cleaned, 10)
  return isNaN(parsed) ? 0 : parsed
}

export function calculatePpn(subtotal: number, ratePercent = 11): number {
  if (subtotal <= 0) return 0
  return Math.round((subtotal * ratePercent) / 100)
}

export function sumMoney(amounts: number[]): number {
  return amounts.reduce((acc, curr) => acc + (isNaN(curr) ? 0 : Math.round(curr)), 0)
}

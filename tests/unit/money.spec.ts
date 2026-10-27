import { describe, it, expect } from 'vitest'
import { formatRupiah, parseRupiah, calculatePpn, sumMoney } from '@/shared/utils/money'

describe('money.ts utility functions', () => {
  it('formats Indonesian Rupiah properly without decimals', () => {
    const formatted = formatRupiah(1500000)
    // Accept either standard non-breaking space or regular space in IDR format
    expect(formatted.replace(/\s/g, ' ')).toMatch(/Rp 1\.500\.000/)
  })

  it('handles 0 and invalid numbers safely in formatRupiah', () => {
    expect(formatRupiah(0).replace(/\s/g, ' ')).toMatch(/Rp 0/)
    expect(formatRupiah(NaN)).toBe('Rp 0')
  })

  it('parses currency strings into pure integers', () => {
    expect(parseRupiah('Rp 1.500.000')).toBe(1500000)
    expect(parseRupiah('250.000')).toBe(250000)
    expect(parseRupiah('Rp 50.000')).toBe(50000)
    expect(parseRupiah(125000)).toBe(125000)
  })

  it('calculates PPN accurately at default 11%', () => {
    expect(calculatePpn(1000000)).toBe(110000)
    expect(calculatePpn(100000, 11)).toBe(11000)
    expect(calculatePpn(0)).toBe(0)
    expect(calculatePpn(-100)).toBe(0)
  })

  it('sums money array safely', () => {
    expect(sumMoney([100000, 250000, 50000])).toBe(400000)
    expect(sumMoney([])).toBe(0)
  })
})

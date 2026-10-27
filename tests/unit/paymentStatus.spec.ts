import { describe, it, expect } from 'vitest'
import { derivePaymentStatus } from '@/shared/utils/payment'

describe('derivePaymentStatus pure business calculation', () => {
  it('returns belum_lunas when no payments have been made', () => {
    const result = derivePaymentStatus(1000000, [])
    expect(result.status).toBe('belum_lunas')
    expect(result.totalPaid).toBe(0)
    expect(result.remainingBalance).toBe(1000000)
  })

  it('returns dp when partial payments are made', () => {
    const payments = [{ amount: 300000 }, { amount: 200000 }]
    const result = derivePaymentStatus(1000000, payments)
    expect(result.status).toBe('dp')
    expect(result.totalPaid).toBe(500000)
    expect(result.remainingBalance).toBe(500000)
  })

  it('returns lunas when paid in full', () => {
    const payments = [{ amount: 400000 }, { amount: 600000 }]
    const result = derivePaymentStatus(1000000, payments)
    expect(result.status).toBe('lunas')
    expect(result.totalPaid).toBe(1000000)
    expect(result.remainingBalance).toBe(0)
  })

  it('returns overpaid when paid more than invoice amount', () => {
    const payments = [{ amount: 1200000 }]
    const result = derivePaymentStatus(1000000, payments)
    expect(result.status).toBe('overpaid')
    expect(result.totalPaid).toBe(1200000)
    expect(result.remainingBalance).toBe(0)
  })

  it('handles negative or invalid values safely', () => {
    const payments = [{ amount: -50000 }, { amount: 200000 }]
    const result = derivePaymentStatus(500000, payments)
    expect(result.status).toBe('dp')
    expect(result.totalPaid).toBe(200000)
    expect(result.remainingBalance).toBe(300000)
  })
})

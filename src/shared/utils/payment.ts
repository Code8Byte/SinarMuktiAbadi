export type PaymentStatus = 'belum_lunas' | 'dp' | 'lunas' | 'overpaid'

export interface PaymentSummary {
  totalAmount: number
  totalPaid: number
  remainingBalance: number
  status: PaymentStatus
}

/**
 * Pure function to derive payment status and remaining balance.
 * Supports DP (partial payment), full payment, unpaid, and overpayment.
 */
export function derivePaymentStatus(
  totalAmount: number,
  payments: Array<{ amount: number }>
): PaymentSummary {
  const safeTotal = Math.max(0, Math.round(totalAmount))
  const totalPaid = payments.reduce((acc, p) => {
    const val = typeof p.amount === 'number' && !isNaN(p.amount) ? Math.max(0, Math.round(p.amount)) : 0
    return acc + val
  }, 0)

  const remainingBalance = Math.max(0, safeTotal - totalPaid)

  let status: PaymentStatus = 'belum_lunas'
  if (totalPaid === 0) {
    status = 'belum_lunas'
  } else if (totalPaid < safeTotal) {
    status = 'dp'
  } else if (totalPaid === safeTotal) {
    status = 'lunas'
  } else {
    status = 'overpaid'
  }

  return {
    totalAmount: safeTotal,
    totalPaid,
    remainingBalance,
    status,
  }
}

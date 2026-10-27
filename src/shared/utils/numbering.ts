/**
 * Generates formatted document number based on standard business pattern:
 * e.g., SO/SMA/2026/0001 or INV/ST/2026/0042
 */
export function generateDocumentNumber(
  prefix: string,
  variantId: string,
  sequence: number,
  date: Date = new Date()
): string {
  const year = date.getFullYear()
  const code = variantId.toUpperCase()
  const paddedSeq = String(sequence).padStart(4, '0')
  return `${prefix}/${code}/${year}/${paddedSeq}`
}

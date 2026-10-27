/**
 * Utility to export tabular data to a downloadable CSV file.
 * Encoded with UTF-8 BOM so that Microsoft Excel handles special characters correctly.
 */
export function exportToCsv(
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
): void {
  const sanitizeCell = (cell: string | number | boolean | null | undefined): string => {
    if (cell === null || cell === undefined) return '""'
    const str = String(cell)
    // Escape double quotes by doubling them
    const escaped = str.replace(/"/g, '""')
    return `"${escaped}"`
  }

  const csvContent: string[] = []

  // Add header row
  csvContent.push(headers.map(sanitizeCell).join(','))

  // Add data rows
  for (const row of rows) {
    csvContent.push(row.map(sanitizeCell).join(','))
  }

  // UTF-8 BOM + content
  const blob = new Blob(['\uFEFF' + csvContent.join('\r\n')], {
    type: 'text/csv;charset=utf-8;',
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  const cleanFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`
  link.setAttribute('download', cleanFilename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

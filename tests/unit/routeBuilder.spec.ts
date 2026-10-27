import { describe, it, expect } from 'vitest'
import { buildRoutes } from '@/app/router/buildRoutes'
import { smaConfig } from '@/app/variants/sma.config'
import { stConfig } from '@/app/variants/st.config'
import type { RouteRecordRaw } from 'vue-router'

function flattenPaths(routes: RouteRecordRaw[]): string[] {
  const paths: string[] = []
  function traverse(list: RouteRecordRaw[], prefix = '') {
    for (const r of list) {
      const full = `${prefix}/${r.path}`.replace(/\/+/g, '/')
      paths.push(full)
      if (r.children) {
        traverse(r.children, full)
      }
    }
  }
  traverse(routes)
  return paths
}

describe('buildRoutes per-variant isolation', () => {
  it('SMA variant loads purchasing, suppliers, and barang routes', () => {
    const routes = buildRoutes(smaConfig)
    const allPaths = flattenPaths(routes)

    expect(allPaths.some((p) => p.includes('/pembelian'))).toBe(true)
    expect(allPaths.some((p) => p.includes('/suppliers'))).toBe(true)
    expect(allPaths.some((p) => p.includes('/barang'))).toBe(true)
    expect(allPaths.some((p) => p.includes('/penjualan'))).toBe(true)
  })

  it('ST variant DOES NOT load purchasing, suppliers, or barang routes', () => {
    const routes = buildRoutes(stConfig)
    const allPaths = flattenPaths(routes)

    expect(allPaths.some((p) => p.includes('/pembelian'))).toBe(false)
    expect(allPaths.some((p) => p.includes('/suppliers'))).toBe(false)
    expect(allPaths.some((p) => p.includes('/barang'))).toBe(false)
    // Penjualan and keuangan must still be present
    expect(allPaths.some((p) => p.includes('/penjualan'))).toBe(true)
    expect(allPaths.some((p) => p.includes('/keuangan'))).toBe(true)
  })
})

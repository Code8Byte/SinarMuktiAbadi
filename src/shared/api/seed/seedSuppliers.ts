import type { Supplier } from '@/shared/types/entity'

export const initialSuppliers: Supplier[] = [
  {
    id: 'supp-1',
    code: 'SUPP-001',
    name: 'PT Baja Prima Nusantara',
    address: 'Kawasan Industri Krakatau Steel, Cilegon, Banten',
    phone: '0254-392100',
    taxType: 'ppn',
    createdAt: '2026-01-05T08:30:00Z',
  },
  {
    id: 'supp-2',
    code: 'SUPP-002',
    name: 'CV Multi Sarana Logam',
    address: 'Jl. Rungkut Industri III No. 18, Surabaya',
    phone: '031-8439900',
    taxType: 'ppn',
    createdAt: '2026-01-08T10:00:00Z',
  },
  {
    id: 'supp-3',
    code: 'SUPP-003',
    name: 'UD Sumber Berkah Teknik',
    address: 'Jl. Pasar Glodok Lt. Dasar Blok B No. 12, Jakarta Barat',
    phone: '021-6298811',
    taxType: 'non_ppn',
    createdAt: '2026-01-11T13:45:00Z',
  },
]

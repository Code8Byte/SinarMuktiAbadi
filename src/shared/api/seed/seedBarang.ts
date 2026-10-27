import type { Barang } from '@/shared/types/entity'

export const initialBarang: Barang[] = [
  {
    id: 'brg-1',
    sku: 'BRG-001',
    name: 'Besi Beton Ulir D13 SNI',
    unit: 'BATANG',
    category: 'Baja & Besi',
    isActive: true,
    createdAt: '2026-01-06T09:00:00Z',
  },
  {
    id: 'brg-2',
    sku: 'BRG-002',
    name: 'Besi Beton Polos 10mm SNI',
    unit: 'BATANG',
    category: 'Baja & Besi',
    isActive: true,
    createdAt: '2026-01-06T09:15:00Z',
  },
  {
    id: 'brg-3',
    sku: 'BRG-003',
    name: 'Pipa Hollow Galvanis 4x4 Tebal 1.8mm',
    unit: 'BATANG',
    category: 'Pipa & Hollow',
    isActive: true,
    createdAt: '2026-01-08T11:00:00Z',
  },
  {
    id: 'brg-4',
    sku: 'BRG-004',
    name: 'Plat Bordes 3mm 4x8',
    unit: 'LEMBAR',
    category: 'Plat Baja',
    isActive: true,
    createdAt: '2026-01-09T14:30:00Z',
  },
  {
    id: 'brg-5',
    sku: 'BRG-005',
    name: 'Kawat Bendrat Kualitas Super',
    unit: 'ROLL',
    category: 'Kawat & Aksesoris',
    isActive: true,
    createdAt: '2026-01-12T15:00:00Z',
  },
]

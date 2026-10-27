import type { Customer } from '@/shared/types/entity'

export const initialCustomers: Customer[] = [
  {
    id: 'cust-1',
    code: 'CUST-001',
    name: 'PT Maju Bersama Sukses',
    address: 'Jl. Industri Raya No. 45, Kawasan Industri Jababeka, Cikarang',
    phone: '021-89345678',
    email: 'purchasing@majubersama.co.id',
    notes: 'Klien prioritas, termin pembayaran tempo 30 hari',
    createdAt: '2026-01-10T09:00:00Z',
  },
  {
    id: 'cust-2',
    code: 'CUST-002',
    name: 'CV Sinar Jaya Abadi',
    address: 'Jl. Soekarno Hatta No. 120, Bandung',
    phone: '022-7301234',
    email: 'sinarjaya.bdg@gmail.com',
    notes: 'Pembayaran rutin via transfer BCA',
    createdAt: '2026-01-12T10:30:00Z',
  },
  {
    id: 'cust-3',
    code: 'CUST-003',
    name: 'Toko Bangunan Harapan Kita',
    address: 'Jl. Raya Bogor KM 28, Cimanggis, Depok',
    phone: '021-8719988',
    email: 'harapan.kita.tb@yahoo.com',
    notes: 'Pelanggan retail cash / tempo 14 hari',
    createdAt: '2026-01-15T14:15:00Z',
  },
  {
    id: 'cust-4',
    code: 'CUST-004',
    name: 'PT Mandiri Mega Konstruksi',
    address: 'Gedung Wisma Antara Lt. 8, Jl. Medan Merdeka Selatan, Jakarta Pusat',
    phone: '021-3841122',
    email: 'procurement@mandirimega.com',
    notes: 'Proyek gedung komersial, pesanan volume besar',
    createdAt: '2026-01-20T11:00:00Z',
  },
]

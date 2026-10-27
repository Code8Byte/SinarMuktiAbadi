# REST API CONTRACT SPECIFICATION

Dokumen ini mendefinisikan kontrak endpoint REST API antara frontend Vue 3 dan backend (yang saat ini di-abstraksi menggunakan `InMemoryRepository` dan siap beralih ke backend riil).

---

## 1. Standar Amplop Respons (Standard API Envelope)

Semua respons API mengikuti struktur standar berikut:

### 1.1 Respons Sukses (Data Tunggal / Array)
```json
{
  "success": true,
  "data": { ... },
  "message": "Operasi berhasil"
}
```

### 1.2 Respons Sukses dengan Paginasi
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 150,
    "totalPages": 8
  }
}
```

### 1.3 Respons Gagal / Validasi
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data yang dikirim tidak valid",
    "details": {
      "qty": "Kuantitas pengiriman melebihi sisa kuantitas SO"
    }
  }
}
```

---

## 2. Abstraksi Repository Frontend (`IRepository<T>`)

Frontend berinteraksi dengan interface repository:

```ts
export interface QueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters?: Record<string, unknown>
}

export interface PaginatedResult<T> {
  items: T[]
  meta: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export interface IRepository<T extends { id: string }> {
  getAll(params?: QueryParams): Promise<PaginatedResult<T>>
  getById(id: string): Promise<T | null>
  create(payload: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>
  update(id: string, payload: Partial<T>): Promise<T>
  delete(id: string): Promise<boolean>
}
```

---

## 3. Daftar Endpoint RESTful

### 3.1 Otentikasi (`/api/auth`)
| Method | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| `POST` | `/api/auth/login` | Login user, mengembalikan token & user profile | Publik |
| `GET` | `/api/auth/me` | Mengambil data sesi user aktif | Terotentikasi |
| `POST` | `/api/auth/logout` | Mengakhiri sesi pengguna | Terotentikasi |

### 3.2 Manajemen Pengguna (`/api/users`)
| Method | Endpoint | Deskripsi | Permission |
|---|---|---|---|
| `GET` | `/api/users` | List pengguna dengan filter & pagination | `users.view` |
| `GET` | `/api/users/:id` | Rincian data pengguna | `users.view` |
| `POST` | `/api/users` | Membuat akun pengguna baru | `users.create` |
| `PUT` | `/api/users/:id` | Memperbarui data pengguna / role | `users.edit` |
| `DELETE`| `/api/users/:id` | Menonaktifkan pengguna | `users.delete` |

### 3.3 Customer (`/api/customers`)
| Method | Endpoint | Deskripsi | Permission |
|---|---|---|---|
| `GET` | `/api/customers` | List customer | `customers.view` |
| `POST` | `/api/customers` | Tambah customer | `customers.create` |
| `PUT` | `/api/customers/:id` | Update customer | `customers.edit` |
| `DELETE`| `/api/customers/:id` | Hapus customer | `customers.delete` |

### 3.4 Supplier (*Hanya SMA - `/api/suppliers`*)
| Method | Endpoint | Deskripsi | Permission |
|---|---|---|---|
| `GET` | `/api/suppliers` | List supplier (PPN/Non-PPN) | `suppliers.view` |
| `POST` | `/api/suppliers` | Tambah supplier | `suppliers.create` |
| `PUT` | `/api/suppliers/:id` | Update supplier | `suppliers.edit` |
| `DELETE`| `/api/suppliers/:id` | Hapus supplier | `suppliers.delete` |

### 3.5 Master Barang (*Hanya SMA - `/api/barang`*)
| Method | Endpoint | Deskripsi | Permission |
|---|---|---|---|
| `GET` | `/api/barang` | List katalog master barang | `barang.view` |
| `POST` | `/api/barang` | Input barang baru | `barang.create` |
| `PUT` | `/api/barang/:id` | Ubah master barang | `barang.edit` |
| `DELETE`| `/api/barang/:id` | Hapus barang | `barang.delete` |

### 3.6 Pembelian (*Hanya SMA - `/api/pembelian`*)
| Method | Endpoint | Deskripsi | Permission |
|---|---|---|---|
| `GET` | `/api/pembelian/invoices` | List invoice pembelian + filter status lunas/tempo/entitas | `pembelian.invoice.view` |
| `GET` | `/api/pembelian/invoices/:id` | Detail invoice pembelian beserta seluruh item | `pembelian.invoice.view` |
| `POST` | `/api/pembelian/invoices` | Buat invoice pembelian (dengan entitas SMA/ST, cash/tempo) | `pembelian.invoice.create` |
| `POST` | `/api/pembelian/items` | Input barang per item terhubung ke invoice pembelian | `barang.create` |
| `GET` | `/api/pembelian/payments` | Riwayat pembayaran ke supplier | `keuangan.hutang.view` |
| `POST` | `/api/pembelian/payments` | Catat pembayaran hutang supplier (DP / cicilan) | `keuangan.hutang.payment` |

### 3.7 Penjualan (`/api/penjualan`)
| Method | Endpoint | Deskripsi | Permission |
|---|---|---|---|
| `GET` | `/api/penjualan/so` | List Sales Order (open, close, cancel) | `penjualan.so.view` |
| `GET` | `/api/penjualan/so/:id` | Detail SO beserta item & histori surat jalan | `penjualan.so.view` |
| `POST` | `/api/penjualan/so` | Buat SO baru (SMA: validasi barang ada; ST: manual) | `penjualan.so.create` |
| `POST` | `/api/penjualan/so/:id/cancel` | Batalkan SO (validasi: belum ada surat jalan) | `penjualan.so.cancel` |
| `POST` | `/api/penjualan/so/:id/close` | Tutup SO secara manual | `penjualan.so.close` |
| `GET` | `/api/penjualan/delivery-notes` | List surat jalan pengiriman bertahap | `penjualan.delivery.view` |
| `POST` | `/api/penjualan/delivery-notes` | Buat surat jalan baru (validasi: qty <= sisa SO) | `penjualan.delivery.create` |
| `GET` | `/api/penjualan/invoices` | List invoice penjualan | `penjualan.invoice.view` |
| `GET` | `/api/penjualan/invoices/unpaid`| List invoice belum lunas (untuk Surat Tagihan) | `keuangan.billing_letter.create` |
| `POST` | `/api/penjualan/invoices` | Buat invoice dari satu/banyak surat jalan | `penjualan.invoice.create` |
| `GET` | `/api/penjualan/payments` | List pembayaran piutang customer | `keuangan.piutang.view` |
| `POST` | `/api/penjualan/payments` | Catat pembayaran piutang (DP / cicil / lunas) | `keuangan.piutang.payment` |

### 3.8 Keuangan & Surat Tagihan (`/api/keuangan`)
| Method | Endpoint | Deskripsi | Permission |
|---|---|---|---|
| `GET` | `/api/keuangan/billing-letters` | Riwayat dokumen surat tagihan | `keuangan.billing_letter.view` |
| `GET` | `/api/keuangan/billing-letters/:id` | Rincian surat tagihan untuk cetak / PDF | `keuangan.billing_letter.print` |
| `POST` | `/api/keuangan/billing-letters` | Buat surat tagihan baru untuk customer tertentu | `keuangan.billing_letter.create` |

### 3.9 Laporan & Rekapitulasi (`/api/laporan`)
| Method | Endpoint | Deskripsi | Permission |
|---|---|---|---|
| `GET` | `/api/laporan/penjualan` | Rekapitulasi transaksi penjualan per periode | `laporan.penjualan.view` |
| `GET` | `/api/laporan/pembelian` | Rekapitulasi pembelian per supplier & entitas (SMA) | `laporan.pembelian.view` |
| `GET` | `/api/laporan/barang` | Rekapitulasi pergerakan barang (SMA) | `laporan.barang.view` |
| `GET` | `/api/laporan/piutang` | Rekapitulasi buku piutang per customer | `laporan.keuangan.view` |
| `GET` | `/api/laporan/hutang` | Rekapitulasi buku hutang per supplier (SMA) | `laporan.keuangan.view` |

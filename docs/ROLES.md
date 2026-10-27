# MATRIKS ROLE & PERMISSION (RBAC)

Dokumen ini mendefinisikan seluruh peran pengguna (*roles*), daftar izin akses (*permissions*), dan matriks pemetaannya untuk varian **SMA** dan **ST**.

---

## 1. Definisi Peran (Roles)

| Role ID | Nama Tampilan | Deskripsi Tanggung Jawab | Ketersediaan Varian |
|---|---|---|---|
| `owner` | Pemilik (Owner) | Akses tertinggi: seluruh modul, audit laporan lengkap, konfigurasi sistem, dan manajemen user. | SMA & ST |
| `admin` | Administrator | Mengelola seluruh alur operasional bisnis harian, master data, dan user operasional. | SMA & ST |
| `staf_penjualan` | Staf Penjualan (Sales) | Mengelola customer, pembuatan Sales Order (SO), pengiriman bertahap (Surat Jalan), dan pembuatan invoice penjualan. | SMA & ST |
| `staf_pembelian` | Staf Pembelian (Purchasing) | Mengelola supplier, invoice pembelian, dan input master/item barang. | **Hanya SMA** |
| `keuangan` | Keuangan (Finance) | Memantau hutang dan piutang, mencatat pembayaran DP/pelunasan, menerbitkan surat tagihan, dan melihat rekap keuangan. | SMA & ST |
| `viewer` | Pengamat (Viewer / Auditor) | Akses baca saja (*read-only*) ke dashboard rekapitulasi penjualan, pembelian, dan status keuangan. | SMA & ST |

*Catatan: Pada varian ST, role `staf_pembelian` dinonaktifkan secara otomatis pada konfigurasi varian (`st.config.ts`).*

---

## 2. Format & Konvensi Penamaan Permission

Seluruh permission menggunakan format terstandarisasi:
```
<modul>.<submodul/entitas>.<aksi>
```

Aksi standar:
- `view`: Melihat daftar dan rincian data.
- `create`: Menambah atau membuat data baru.
- `edit`: Memperbarui data yang ada.
- `delete`: Menghapus data atau membatalkan status.
- `print`: Mengunduh atau mencetak dokumen resmi (PDF/Print view).
- `manage`: Akses administratif penuh atas entitas tersebut.

---

## 3. Matriks Role x Permission

Simbol:
- `✓` : Memiliki izin
- `-` : Tidak memiliki izin
- `*` : Khusus SMA (pada ST permission ini tidak diaktifkan)

| Modul / Permission ID | Deskripsi Izin | Owner | Admin | Staf Penjualan | Staf Pembelian (*) | Keuangan | Viewer |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Dashboard** | | | | | | | |
| `dashboard.admin.view` | Akses view dashboard admin/owner | ✓ | ✓ | - | - | - | - |
| `dashboard.sales.view` | Akses view dashboard penjualan | ✓ | ✓ | ✓ | - | - | - |
| `dashboard.purchasing.view` (*) | Akses view dashboard pembelian (SMA) | ✓ | ✓ | - | ✓ | - | - |
| `dashboard.finance.view` | Akses view dashboard keuangan | ✓ | ✓ | - | - | ✓ | - |
| `dashboard.viewer.view` | Akses view dashboard analitik ringkas | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Manajemen Pengguna** | | | | | | | |
| `users.view` | Melihat daftar pengguna | ✓ | ✓ | - | - | - | - |
| `users.create` | Membuat akun pengguna baru | ✓ | ✓ | - | - | - | - |
| `users.edit` | Mengubah data / role pengguna | ✓ | ✓ | - | - | - | - |
| `users.delete` | Menonaktifkan akun pengguna | ✓ | - | - | - | - | - |
| **Master Data: Customer** | | | | | | | |
| `customers.view` | Melihat daftar & detail customer | ✓ | ✓ | ✓ | - | ✓ | ✓ |
| `customers.create` | Menambah data customer baru | ✓ | ✓ | ✓ | - | - | - |
| `customers.edit` | Mengubah informasi customer | ✓ | ✓ | ✓ | - | - | - |
| `customers.delete` | Menghapus customer (jika belum ada transaksi) | ✓ | ✓ | - | - | - | - |
| **Master Data: Supplier (*)** | | | | | | | |
| `suppliers.view` | Melihat daftar supplier | ✓ | ✓ | - | ✓ | ✓ | ✓ |
| `suppliers.create` | Menambah supplier baru (PPN/Non-PPN) | ✓ | ✓ | - | ✓ | - | - |
| `suppliers.edit` | Mengubah data supplier | ✓ | ✓ | - | ✓ | - | - |
| `suppliers.delete` | Menghapus supplier | ✓ | ✓ | - | - | - | - |
| **Master & Input Barang (*)** | | | | | | | |
| `barang.view` | Melihat katalog master barang | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `barang.create` | Menginput barang per item dari invoice supplier | ✓ | ✓ | - | ✓ | - | - |
| `barang.edit` | Mengubah nama/kategori barang | ✓ | ✓ | - | ✓ | - | - |
| `barang.delete` | Menghapus data barang | ✓ | ✓ | - | - | - | - |
| **Pembelian (Purchasing) (*)** | | | | | | | |
| `pembelian.invoice.view` | Melihat daftar & detail invoice pembelian | ✓ | ✓ | - | ✓ | ✓ | ✓ |
| `pembelian.invoice.create` | Membuat invoice pembelian (cash/tempo, SMA/ST) | ✓ | ✓ | - | ✓ | - | - |
| `pembelian.invoice.edit` | Mengubah invoice pembelian | ✓ | ✓ | - | ✓ | - | - |
| `pembelian.invoice.delete` | Membatalkan / menghapus invoice pembelian | ✓ | ✓ | - | - | - | - |
| **Penjualan: Sales Order (SO)** | | | | | | | |
| `penjualan.so.view` | Melihat daftar dan rincian SO | ✓ | ✓ | ✓ | - | ✓ | ✓ |
| `penjualan.so.create` | Membuat SO baru (katalog SMA / manual ST) | ✓ | ✓ | ✓ | - | - | - |
| `penjualan.so.edit` | Mengubah draf SO | ✓ | ✓ | ✓ | - | - | - |
| `penjualan.so.cancel` | Membatalkan SO (hanya jika belum ada SJ) | ✓ | ✓ | ✓ | - | - | - |
| `penjualan.so.close` | Menutup SO secara manual | ✓ | ✓ | ✓ | - | - | - |
| **Penjualan: Surat Jalan** | | | | | | | |
| `penjualan.delivery.view` | Melihat daftar & rincian surat jalan | ✓ | ✓ | ✓ | - | ✓ | ✓ |
| `penjualan.delivery.create` | Membuat surat jalan pengiriman bertahap | ✓ | ✓ | ✓ | - | - | - |
| `penjualan.delivery.print` | Mencetak dokumen fisik surat jalan | ✓ | ✓ | ✓ | - | - | - |
| `penjualan.delivery.cancel` | Membatalkan surat jalan | ✓ | ✓ | - | - | - | - |
| **Penjualan: Sales Invoice** | | | | | | | |
| `penjualan.invoice.view` | Melihat daftar & detail invoice penjualan | ✓ | ✓ | ✓ | - | ✓ | ✓ |
| `penjualan.invoice.create` | Menerbitkan invoice dari surat jalan | ✓ | ✓ | ✓ | - | - | - |
| `penjualan.invoice.print` | Mencetak invoice & faktur | ✓ | ✓ | ✓ | - | ✓ | - |
| `penjualan.invoice.edit` | Mengubah invoice penjualan | ✓ | ✓ | - | - | - | - |
| **Keuangan: Hutang (Pembelian) (*)** | | | | | | | |
| `keuangan.hutang.view` | Melihat status & buku hutang supplier | ✓ | ✓ | - | ✓ | ✓ | ✓ |
| `keuangan.hutang.payment` | Mencatat pembayaran ke supplier (DP/cicil) | ✓ | ✓ | - | - | ✓ | - |
| **Keuangan: Piutang (Penjualan)** | | | | | | | |
| `keuangan.piutang.view` | Melihat status piutang customer | ✓ | ✓ | ✓ | - | ✓ | ✓ |
| `keuangan.piutang.payment` | Mencatat pembayaran dari customer (DP/cicil) | ✓ | ✓ | - | - | ✓ | - |
| **Keuangan: Surat Tagihan** | | | | | | | |
| `keuangan.billing_letter.view` | Melihat riwayat surat tagihan | ✓ | ✓ | - | - | ✓ | ✓ |
| `keuangan.billing_letter.create` | Membuat surat tagihan dari invoice belum lunas | ✓ | ✓ | - | - | ✓ | - |
| `keuangan.billing_letter.print` | Mencetak dokumen resmi surat tagihan | ✓ | ✓ | - | - | ✓ | - |
| **Laporan & Rekapitulasi** | | | | | | | |
| `laporan.penjualan.view` | Melihat rekapitulasi penjualan | ✓ | ✓ | ✓ | - | ✓ | ✓ |
| `laporan.pembelian.view` (*) | Melihat rekapitulasi pembelian | ✓ | ✓ | - | ✓ | ✓ | ✓ |
| `laporan.barang.view` (*) | Melihat rekapitulasi pergerakan barang | ✓ | ✓ | - | ✓ | ✓ | ✓ |
| `laporan.keuangan.view` | Melihat rekapitulasi hutang & piutang | ✓ | ✓ | - | - | ✓ | ✓ |

---

## 4. Mekanisme Evaluasi Hak Akses di Frontend

### 4.1 Single Source of Truth (`src/app/auth/permissions.ts`)
Pemetaan role ke permission dideklarasikan murni sebagai konstanta TypeScript:

```ts
export const ROLE_PERMISSIONS: Record<RoleId, readonly PermissionId[]> = {
  owner: ALL_PERMISSIONS,
  admin: ADMIN_PERMISSIONS,
  staf_penjualan: SALES_PERMISSIONS,
  staf_pembelian: PURCHASING_PERMISSIONS,
  keuangan: FINANCE_PERMISSIONS,
  viewer: VIEWER_PERMISSIONS,
}
```

### 4.2 Route Guard
Setiap navigasi halaman diperiksa oleh guard navigasi:
1. Apakah rute membutuhkan otentikasi? Jika belum login, redirect ke `/login?redirect=...`.
2. Apakah rute memerlukan permission tertentu (`meta.permissions`)?
3. Jika user tidak memiliki salah satu permission yang diwajibkan, alihkan ke `/403` (Forbidden).

### 4.3 Template Directive `v-can`
Untuk aksi dalam halaman (misal: tombol Bayar atau tombol Hapus):
```html
<button v-can="'keuangan.piutang.payment'" @click="openPaymentModal">
  Catat Pembayaran
</button>
```

Directive ini otomatis menyembunyikan atau menonaktifkan elemen DOM jika permission tidak terpenuhi, tanpa perlu menulis logika kondisional kotor di dalam template.

# Web Penjualan & Pembelian PT Sinar Mukti Abadi (SMA) dan ST

Aplikasi web manajemen transaksi penjualan dan pembelian yang dirancang khusus untuk dua entitas bisnis: **PT Sinar Mukti Abadi (SMA)** dan **ST**. Dibangun dengan **Vue 3 (Composition API)**, **TypeScript Strict**, **Vite**, **Tailwind CSS**, dan **Pinia**, dengan arsitektur *Single Codebase, Dual Variant* yang dirancang untuk kemudahan pemeliharaan dan pengembangan jangka panjang.

---

## 1. Perbedaan Utama Varian SMA vs ST

| Fitur / Modul | Web SMA (`sma`) | Web ST (`st`) |
|---|:---:|:---:|
| **Modul Pembelian** | **Ada** (Invoice supplier, termin cash/tempo, hutang) | **Tidak Ada** |
| **Master & Input Barang** | **Ada** (Input per item terhubung ke invoice supplier) | **Tidak Ada** |
| **Input Item Sales Order (SO)** | **Katalog** (Dipilih dari master barang yang sudah dibeli) | **Manual** (Nama barang, qty, satuan, harga diketik bebas) |
| **Faktur Pajak pada Invoice** | **Tracked** (`sudah_faktur`, `belum_faktur`, `tanpa_faktur`) | **None** (Selalu tanpa faktur) |
| **Modul Penjualan** | **Ada** (SO -> Surat Jalan Bertahap -> Invoice) | **Ada** (SO -> Surat Jalan Bertahap -> Invoice) |
| **Keuangan (Piutang & Surat Tagihan)** | **Ada** | **Ada** |
| **Buku Hutang Supplier** | **Ada** | **Tidak Ada** |

*Catatan: Pembelian untuk kebutuhan ST dicatat melalui web SMA menggunakan penanda entitas `ST` pada invoice pembelian.*

---

## 2. Prasyarat Sistem

- **Node.js**: v18.0.0 atau lebih tinggi (disarankan v20+ LTS)
- **Package Manager**: `pnpm` (v9+)

---

## 3. Cara Menjalankan Aplikasi

### 3.1 Instalasi Dependensi
```bash
pnpm install
```

### 3.2 Menjalankan Development Server

#### Menjalankan Varian SMA (PT Sinar Mukti Abadi)
```bash
pnpm dev:sma
```
Aplikasi SMA akan berjalan pada `http://localhost:5173` (port default Vite).

#### Menjalankan Varian ST
```bash
pnpm dev:st
```
Aplikasi ST akan berjalan pada `http://localhost:5174` (atau port yang ditentukan).

---

### 3.3 Membangun untuk Produksi (Production Build)

#### Build Varian SMA
```bash
pnpm build:sma
```
Output tersimpan di direktori `dist/sma/`.

#### Build Varian ST
```bash
pnpm build:st
```
Output tersimpan di direktori `dist/st/`.

#### Meninjau Hasil Build (Preview)
```bash
pnpm preview:sma
pnpm preview:st
```

---

## 4. Pengujian dan Pengecekan Kualitas Kode

Sebelum commit kode atau menyelesaikan fase kerja, pastikan seluruh skrip verifikasi berikut berhasil tanpa galat:

```bash
# 1. Pengecekan tipe data TypeScript secara ketat
pnpm typecheck

# 2. Pengecekan linting & formatting (ESLint)
pnpm lint

# 3. Menjalankan seluruh pengujian unit & integrasi (Vitest)
pnpm test

# 4. Memverifikasi build kedua varian
pnpm build:sma
pnpm build:st
```

---

## 5. Akun Pengujian / Role Demo (Mock Auth)

Aplikasi dilengkapi *seed data* untuk simulasi seluruh level hak akses:

| Username | Password | Role | Akses Utama |
|---|---|---|---|
| `owner` | `password123` | `owner` | Seluruh modul + manajemen user + rekap lengkap |
| `admin` | `password123` | `admin` | Seluruh modul operasional harian + manajemen user |
| `sales` | `password123` | `staf_penjualan` | Customer, Sales Order (SO), Surat Jalan, Invoice Penjualan |
| `purchasing` | `password123` | `staf_pembelian` | Supplier, Invoice Pembelian, Input Barang (*SMA only*) |
| `finance` | `password123` | `keuangan` | Hutang, Piutang, Pembayaran, Surat Tagihan, Rekap Keuangan |
| `viewer` | `password123` | `viewer` | Read-only dashboard dan rekapitulasi |

---

## 6. Navigasi Dokumentasi Teknis

Seluruh spesifikasi teknis dan analisis sistem tersedia di folder `docs/`:

1. [docs/ARCHITECTURE.md](file:///C:/Users/Paul/Documents/website%20customer/docs/ARCHITECTURE.md) - Standar arsitektur, isolasi modular, dan strategi multi-varian.
2. [docs/ROLES.md](file:///C:/Users/Paul/Documents/website%20customer/docs/ROLES.md) - Matriks pemetaan Role x Permission (RBAC) dan mekanisme route guard.
3. [docs/DATA_MODEL.md](file:///C:/Users/Paul/Documents/website%20customer/docs/DATA_MODEL.md) - Diagram ER (Mermaid), spesifikasi entitas, dan fungsi kalkulasi murni.
4. [docs/api-contract.md](file:///C:/Users/Paul/Documents/website%20customer/docs/api-contract.md) - Spesifikasi kontrak REST API dan interface repository frontend.
5. [docs/OPEN_QUESTIONS.md](file:///C:/Users/Paul/Documents/website%20customer/docs/OPEN_QUESTIONS.md) - Daftar asumsi bisnis, pertanyaan terbuka, dan default yang dipilih.
6. [docs/FOLDER_STRUCTURE.md](file:///C:/Users/Paul/Documents/website%20customer/docs/FOLDER_STRUCTURE.md) - Rencana struktur folder final feature-based.

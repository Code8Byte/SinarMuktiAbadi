# ARCHITECTURE DOCUMENTATION: WEB PENJUALAN & PEMBELIAN SMA & ST

Dokumen ini mendefinisikan standar arsitektur teknis, pola desain perangkat lunak, dan aturan baku implementasi frontend Vue 3 untuk web aplikasi dua perusahaan: **SMA (PT Sinar Mukti Abadi)** dan **ST**.

---

## 1. Filosofi & Prinsip Desain

Aplikasi ini dirancang untuk **usia pakai panjang (tahunan)** dan **skalabilitas tinggi**. Prinsip intinya:

1. **Explicit over Implicit**: Tidak ada "keajaiban" tersembunyi. Konfigurasi, rute, dan permission dideklarasikan secara gamblang dan type-safe.
2. **Feature Isolation (Modular)**: Setiap domain bisnis (penjualan, pembelian, keuangan, barang, dsb.) berada dalam foldernya masing-masing dengan batasan (boundary) yang ketat.
3. **Pluggable Architecture (Strategy Pattern)**: Perbedaan proses bisnis antara SMA dan ST diisolasi ke dalam konfigurasi varian dan strategi yang dapat disuntikkan (*injected*), bukan melalui percabangan `if (variant === 'st')` yang mengotori komponen visual.
4. **Thin Views, Pure Services**: Komponen Vue (`.vue`) hanya bertugas menyajikan UI dan merespons interaksi pengguna. Seluruh kalkulasi rupiah, aturan validasi, penentuan status, dan kalkulasi sisa kuantitas diekstrak sebagai fungsi murni (*pure functions*) di dalam `services/` atau `utils/` sehingga 100% dapat diuji (*unit testable*) tanpa mount DOM.
5. **Role-Driven by Routing, Not by Template Logic**: Perbedaan hak akses antar role diatur di tingkat routing dan route-guard. Dilarang keras membuat satu file template raksasa berisi rantai `v-if="role === 'admin'"` atau `<component :is="...">` berbasis role.

---

## 2. Mekanisme Multi-Varian (SMA vs ST)

### 2.1 Konfigurasi Varian

Aplikasi dibangun dari satu repositori (*single codebase*). Penentuan target build dikendalikan oleh variabel lingkungan:
```bash
VITE_APP_VARIANT=sma
# atau
VITE_APP_VARIANT=st
```

Konfigurasi varian didefinisikan dalam interface strongly-typed:

```ts
// src/app/variants/types.ts
export type VariantId = 'sma' | 'st'
export type ModuleId =
  | 'dashboard'
  | 'users'
  | 'customers'
  | 'suppliers'
  | 'barang'
  | 'pembelian'
  | 'penjualan'
  | 'keuangan'
  | 'laporan'

export interface VariantConfig {
  id: VariantId
  appName: string
  companyFullName: string
  enabledModules: ModuleId[]          // ST: tidak menyertakan 'pembelian', 'suppliers', 'barang'
  soItemMode: 'catalog' | 'manual'    // SMA: catalog (master barang), ST: manual (ketik bebas)
  invoiceFaktur: 'tracked' | 'none'   // SMA: tracked (faktur pajak), ST: none (tanpa faktur)
  roles: RoleId[]
  features: {
    hasPurchaseModule: boolean
    hasMasterBarang: boolean
    hasTaxFaktur: boolean
    allowManualSoItem: boolean
  }
}
```

### 2.2 Isolasi Strategi Perilaku

Perbedaan spesifik antara SMA dan ST diwujudkan lewat pola strategi:
1. **`SoItemSourceStrategy`**:
   - `CatalogItemSourceStrategy` (SMA): Memvalidasi ketersediaan barang di katalog master, mengambil data satuan dan harga acuan dari pembelian, memvalidasi bahwa barang wajib sudah pernah diinput di modul pembelian.
   - `ManualItemSourceStrategy` (ST): Menyediakan form input teks bebas untuk nama barang, satuan, kuantitas, dan harga satuan tanpa validasi master barang.
2. **`InvoiceFakturStrategy`**:
   - `TrackedFakturStrategy` (SMA): Menyediakan opsi status faktur pajak (`sudah_faktur`, `belum_faktur`, `tanpa_faktur`) dan kalkulasi PPN.
   - `NoneFakturStrategy` (ST): Mengunci status faktur menjadi tanpa faktur dan menghilangkan kolom faktur dari formulir dan tabel.

**Aturan Emas:** Dilarang menggunakan `import.meta.env.VITE_APP_VARIANT` atau `variant === 'st'` di dalam komponen presentasi (`views/` atau `components/`). Komponen hanya membaca konfigurasi varian aktif melalui inject composable `useVariantConfig()` atau mengeksekusi strategi yang telah dipersiapkan.

---

## 3. Struktur Folder Feature-Based

```
src/
├── app/                           # Lapisan fondasi aplikasi inti
│   ├── variants/                  # Konfigurasi varian SMA dan ST
│   │   ├── index.ts               # Loader konfigurasi aktif
│   │   ├── sma.config.ts          # Konfigurasi PT Sinar Mukti Abadi
│   │   ├── st.config.ts           # Konfigurasi ST
│   │   └── types.ts
│   ├── auth/                      # Otentikasi, role, permission
│   │   ├── roles.ts               # Definisi RoleId, label, deskripsi
│   │   ├── permissions.ts         # Definisi PermissionId & matriks role
│   │   ├── guards.ts              # Navigation guard vue-router
│   │   └── session.ts             # Manajemen sesi & token
│   ├── router/                    # Routing engine
│   │   ├── index.ts               # Inisialisasi router
│   │   ├── buildRoutes.ts         # Builder rute dinamis sesuai enabledModules
│   │   └── routes.common.ts       # Rute publik (login, 403, 404)
│   └── layouts/                   # Layout halaman
│       ├── AppLayout.vue          # Layout aplikasi (sidebar, navbar, breadcrumbs)
│       ├── AuthLayout.vue         # Layout halaman login
│       └── components/            # SidebarNav, UserMenu, VariantBadge
│
├── modules/                       # Domain modul bisnis terisolasi
│   ├── auth/                      # Modul login & logout
│   ├── dashboard/                 # Modul dashboard multi-role
│   │   ├── views/                 # View spesifik per role:
│   │   │   ├── DashboardAdminView.vue
│   │   │   ├── DashboardSalesView.vue
│   │   │   ├── DashboardPurchasingView.vue
│   │   │   ├── DashboardFinanceView.vue
│   │   │   └── DashboardViewerView.vue
│   │   ├── widgets/               # Komponen widget reusable (SalesSummary, DebtChart, dsb)
│   │   ├── routes.ts
│   │   └── index.ts
│   ├── users/                     # Manajemen pengguna & role
│   ├── customers/                 # Master data customer
│   ├── suppliers/                 # Master supplier (hanya SMA)
│   ├── barang/                    # Master & rekap barang (hanya SMA)
│   ├── pembelian/                 # Invoice pembelian, input barang, hutang (hanya SMA)
│   ├── penjualan/                 # SO, surat jalan bertahap, invoice penjualan
│   │   ├── strategies/            # Catalog vs Manual item input
│   │   ├── views/
│   │   ├── components/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types.ts
│   │   └── index.ts
│   ├── keuangan/                  # Piutang, hutang, pembayaran, surat tagihan
│   └── laporan/                   # Rekapitulasi penjualan, pembelian, barang, piutang/hutang
│
└── shared/                        # Prasarana & komponen yang dipakai bersama
    ├── api/                       # HTTP client & repository interface (Mock / Real)
    │   ├── client.ts
    │   ├── repository.interface.ts
    │   └── mock/                  # In-memory mock repositories dengan seed data
    ├── components/                # UI kit bersama (design system)
    │   ├── form/                  # FormInput, FormSelect, FormCurrency, FormDate, FormTextarea
    │   ├── table/                 # DataTable, Pagination, TableFilter, TableEmptyState
    │   ├── feedback/              # AlertMessage, LoadingSpinner, ConfirmDialog, ModalDialog
    │   └── badge/                 # StatusBadge, MoneyDisplay
    ├── composables/               # usePermission, useMoney, useDebounce, usePagination
    ├── directives/                # vCan (role/permission directive)
    ├── utils/                     # Fungsi murni teruji:
    │   ├── money.ts               # Format Rupiah, parsing, kalkulasi integer
    │   ├── date.ts                # Format tanggal Indonesia (Intl)
    │   ├── numbering.ts           # Generator nomor dokumen berurut (SO/INV/SJ/ST)
    │   └── payment.ts             # derivePaymentStatus logic
    ├── constants/                 # Enum, label mapping, opsi konstan
    └── types/                     # Tipe global, pagination, response envelope
```

### 3.1 Aturan Dependensi Antar Modul (Module Boundaries)

1. Modul **BEBAS** mengimpor dari `src/shared/*` dan `src/app/*`.
2. Modul **DILARANG** mengimpor file internal dari modul lain secara langsung (misal: `from '@/modules/pembelian/components/ItemRow.vue'`).
3. Jika modul A membutuhkan data atau service dari modul B, komunikasi **WAJIB** melalui pintu gerbang publik `src/modules/B/index.ts`.
4. Jika ada model data yang dipakai bersama (misal: entity `Customer` atau `Barang`), model tersebut ditarik ke dalam domain bersama (`shared/types/` atau re-export resmi via interface).

---

## 4. Mekanisme Routing, RBAC, dan Dashboard Multi-Role

### 4.1 Pemilihan Dashboard di Tingkat Router

Setiap peran kerja (role) memiliki alur kerja (*workflow*) yang berbeda secara fundamental. Oleh karena itu, kita tidak mencampur logika semua role ke dalam satu file `Dashboard.vue`.

Alur kerja routing dashboard:
1. Pengguna membuka URL `/dashboard`.
2. Route guard router mengecek `activeUser.role` saat ini.
3. Router mengalihkan (*redirect*) secara dinamis:
   - `owner` / `admin` -> `/dashboard/admin`
   - `staf_penjualan` -> `/dashboard/sales`
   - `staf_pembelian` -> `/dashboard/purchasing`
   - `keuangan` -> `/dashboard/finance`
   - `viewer` -> `/dashboard/viewer`
4. Setiap sub-rute dashboard memiliki definisi lazy-loaded mandiri dengan verifikasi hak akses (`meta.permissions`).
5. Setiap view dashboard (`DashboardSalesView.vue`, dll.) sangat ramping (di bawah 100 baris kode), hanya menyusun *widget-widget* independen dari folder `modules/dashboard/widgets/`.

```
                    /dashboard
                        │
                        ▼ (Route Guard Router)
             Cek activeUser.role & permission
                        │
      ┌──────────┬──────┴───────┬────────────┬──────────┐
      ▼          ▼              ▼            ▼          ▼
   /admin     /sales       /purchasing   /finance    /viewer
      │          │              │            │          │
   AdminView  SalesView  PurchasingView FinanceView ViewerView
      │          │              │            │          │
 ┌────┴────┐ ┌───┴────┐     ┌───┴────┐   ┌───┴────┐ ┌───┴────┐
 └Widgets..┘ └Widgets.┘     └Widgets.┘   └Widgets.┘ └Widgets.┘
```

### 4.2 Route Meta & Sidebar Otomatis

Setiap modul mendaftarkan rutenya dengan struktur metadata standar:

```ts
// Contoh rute modul penjualan
export const penjualanRoutes: RouteRecordRaw = {
  path: '/penjualan',
  meta: {
    moduleId: 'penjualan',
    menu: {
      title: 'Penjualan',
      icon: 'DocumentTextIcon',
      order: 30,
    },
    permissions: ['penjualan.so.view'],
  },
  children: [
    {
      path: 'so',
      name: 'SalesOrderList',
      component: () => import('./views/SalesOrderListView.vue'),
      meta: {
        menu: { title: 'Sales Order (SO)', order: 1 },
        permissions: ['penjualan.so.view'],
      },
    },
    {
      path: 'surat-jalan',
      name: 'DeliveryNoteList',
      component: () => import('./views/DeliveryNoteListView.vue'),
      meta: {
        menu: { title: 'Surat Jalan', order: 2 },
        permissions: ['penjualan.delivery.view'],
      },
    },
    {
      path: 'invoice',
      name: 'SalesInvoiceList',
      component: () => import('./views/SalesInvoiceListView.vue'),
      meta: {
        menu: { title: 'Invoice Penjualan', order: 3 },
        permissions: ['penjualan.invoice.view'],
      },
    },
  ],
}
```

Menu sidebar dibangun secara dinamis oleh `SidebarNav.vue`:
1. Mengambil seluruh rute aktif hasil kompilasi `buildRoutes()`.
2. Menyaring hanya rute yang memiliki `meta.menu`.
3. Memfilter rute yang diizinkan untuk role pengguna saat ini via `hasPermission()`.
4. Mengurutkan menu berdasarkan `order`.
5. Hasil: Sidebar 100% otomatis, tanpa sebaris pun `v-if="role === ..."` manual!

### 4.3 Pengecekan Granular Aksi: Directive `v-can`

Untuk tombol aksi spesifik (seperti tombol "Buat SO Baru", "Input Pembayaran", "Hapus"), sistem menyediakan directive kustom Vue `v-can`:

```html
<!-- Tombol hanya dirender jika user memiliki permission terkait -->
<button
  v-can="'penjualan.so.create'"
  class="btn-primary"
  @click="openCreateModal"
>
  + Buat SO Baru
</button>
```

Atau dalam script via composable:
```ts
const { can } = usePermission()
if (!can('penjualan.so.create')) {
  // Cegah eksekusi aksi
}
```

---

## 5. Standar Rekayasa & Kualitas Kode

1. **Batasan Panjang Komponen**: Komponen Vue tidak boleh melebihi ~250 baris kode. Komponen yang mendekati batas wajib dipecah menjadi sub-komponen (misal: memisahkan modal form, baris item tabel, widget filter, header rekap).
2. **In-Memory Repository & Api Layer Abstraction**:
   - Seluruh data operasional dikelola melalui kontrak repositori `IRepository<T>` yang mengabstraksi pemanggilan data.
   - Fase awal diimplementasikan dengan `InMemoryRepository<T>` yang menyimpan state dalam memori dan `localStorage` (untuk persistensi sesi dev).
   - Ketika backend REST API siap, tim backend cukup membuat implementasi `HttpRepository<T>` yang mengikuti kontrak yang sama tanpa mengubah kode komponen.
3. **Penyimpanan Uang & Perhitungan**:
   - Nilai uang selalu integer rupiah (misal `1500000` untuk Rp 1.500.000).
   - Format tampilan menggunakan `formatRupiah(amount)` dari `src/shared/utils/money.ts`.
4. **Zero Tolerance Errors**:
   - Kode harus bersih dari `any`. Setiap payload dan entity wajib memiliki tipe TypeScript lengkap.
   - Tidak ada comment `// @ts-ignore` atau `// eslint-disable`.
5. **State Manajemen**:
   - Pinia stores dipakai untuk state yang dibagikan secara global (misal: `useAuthStore`, `useVariantStore`).
   - State formulir lokal dikelola dengan composable lokal pada masing-masing modul.

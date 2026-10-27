# FINAL FOLDER STRUCTURE PLAN (RENCANA STRUKTUR FOLDER)

Struktur direktori dirancang dengan prinsip **Feature-Based Modularization**, batasan modul yang terisolasi (*strict boundaries*), dan kesiapan pengembangan multi-tahun.

```
website-customer/
├── docs/                                  # Dokumentasi teknis & bisnis
│   ├── ARCHITECTURE.md                    # Standar arsitektur & pola desain
│   ├── DATA_MODEL.md                      # Diagram ER & spesifikasi tipe data
│   ├── FOLDER_STRUCTURE.md                # Rencana struktur folder komprehensif
│   ├── OPEN_QUESTIONS.md                  # Daftar asumsi & pertanyaan terbuka
│   ├── ROLES.md                           # Matriks role x permission
│   └── api-contract.md                    # Kontrak REST API & in-memory repo
│
├── public/                                # Static assets (favicon, logos)
│   ├── favicon.ico
│   ├── logo-sma.svg
│   └── logo-st.svg
│
├── src/
│   ├── app/                               # Lapisan Fondasi Aplikasi
│   │   ├── auth/                          # Manajemen otentikasi & RBAC
│   │   │   ├── guards.ts                  # Vue-router auth & permission guards
│   │   │   ├── permissions.ts             # Definisi PermissionId & role mappings
│   │   │   ├── roles.ts                   # Definisi RoleId & label metadata
│   │   │   ├── session.ts                 # Session storage & token helpers
│   │   │   └── types.ts
│   │   ├── layouts/                       # Layout wrapper aplikasi
│   │   │   ├── AppLayout.vue              # Layout utama (sidebar, topbar, body)
│   │   │   ├── AuthLayout.vue             # Layout halaman login
│   │   │   ├── PrintLayout.vue            # Layout khusus cetak (clean PDF/print)
│   │   │   └── components/                # Komponen layout
│   │   │       ├── AppSidebar.vue         # Sidebar navigasi dinamis
│   │   │       ├── AppTopbar.vue          # Header atas, profile, switcher
│   │   │       ├── BreadcrumbNav.vue      # Breadcrumbs navigasi
│   │   │       └── VariantBanner.vue      # Label badge SMA / ST aktif
│   │   ├── router/                        # Routing engine
│   │   │   ├── buildRoutes.ts             # Compiler rute dinamis (filter per enabledModules)
│   │   │   ├── index.ts                   # Router instance & plugin registration
│   │   │   └── routes.common.ts           # Rute publik (login, 403, 404)
│   │   └── variants/                      # Konfigurasi varian perusahaan
│   │       ├── index.ts                   # Resolver konfigurasi aktif
│   │       ├── sma.config.ts              # Konfigurasi PT Sinar Mukti Abadi
│   │       ├── st.config.ts               # Konfigurasi ST
│   │       └── types.ts                   # VariantConfig interface
│   │
│   ├── modules/                           # Domain Modul Bisnis
│   │   ├── auth/                          # Modul Login
│   │   │   ├── views/LoginView.vue
│   │   │   ├── stores/authStore.ts
│   │   │   ├── routes.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── dashboard/                     # Modul Dashboard Multi-Role
│   │   │   ├── views/
│   │   │   │   ├── DashboardAdminView.vue      # View khusus Owner / Admin
│   │   │   │   ├── DashboardSalesView.vue      # View khusus Staf Penjualan
│   │   │   │   ├── DashboardPurchasingView.vue # View khusus Staf Pembelian (SMA)
│   │   │   │   ├── DashboardFinanceView.vue    # View khusus Keuangan
│   │   │   │   └── DashboardViewerView.vue     # View ringkas Viewer
│   │   │   ├── widgets/                   # Widget reusable
│   │   │   │   ├── SalesMetricWidget.vue
│   │   │   │   ├── PurchaseMetricWidget.vue
│   │   │   │   ├── DebtOutstandingWidget.vue
│   │   │   │   ├── ReceivableWidget.vue
│   │   │   │   └── RecentTransactionsWidget.vue
│   │   │   ├── routes.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── users/                         # Manajemen Pengguna
│   │   │   ├── views/
│   │   │   │   ├── UserListView.vue
│   │   │   │   └── UserFormModal.vue
│   │   │   ├── services/userService.ts
│   │   │   ├── stores/userStore.ts
│   │   │   ├── routes.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── customers/                     # Master Data Customer
│   │   │   ├── views/CustomerListView.vue
│   │   │   ├── components/CustomerFormModal.vue
│   │   │   ├── services/customerService.ts
│   │   │   ├── routes.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── suppliers/                     # Master Data Supplier (SMA)
│   │   │   ├── views/SupplierListView.vue
│   │   │   ├── components/SupplierFormModal.vue
│   │   │   ├── services/supplierService.ts
│   │   │   ├── routes.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── barang/                        # Master & Input Barang (SMA)
│   │   │   ├── views/
│   │   │   │   ├── BarangListView.vue
│   │   │   │   └── BarangInputFromInvoiceView.vue
│   │   │   ├── components/BarangFormModal.vue
│   │   │   ├── services/barangService.ts
│   │   │   ├── routes.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── pembelian/                     # Modul Pembelian (SMA)
│   │   │   ├── views/
│   │   │   │   ├── PurchaseInvoiceListView.vue
│   │   │   │   ├── PurchaseInvoiceCreateView.vue
│   │   │   │   ├── PurchaseInvoiceDetailView.vue
│   │   │   │   └── PurchasePaymentHistoryView.vue
│   │   │   ├── components/
│   │   │   │   ├── PurchaseItemRowInput.vue
│   │   │   │   └── PurchasePaymentModal.vue
│   │   │   ├── services/pembelianService.ts
│   │   │   ├── stores/pembelianStore.ts
│   │   │   ├── routes.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── penjualan/                     # Modul Penjualan (SMA & ST)
│   │   │   ├── strategies/                # Isolasi perilaku item SO
│   │   │   │   ├── soItemStrategy.interface.ts
│   │   │   │   ├── catalogItemStrategy.ts # Implementasi SMA (ambil master barang)
│   │   │   │   └── manualItemStrategy.ts  # Implementasi ST (input manual bebas)
│   │   │   ├── views/
│   │   │   │   ├── SalesOrderListView.vue
│   │   │   │   ├── SalesOrderCreateView.vue
│   │   │   │   ├── SalesOrderDetailView.vue
│   │   │   │   ├── DeliveryNoteListView.vue
│   │   │   │   ├── DeliveryNoteCreateView.vue
│   │   │   │   ├── DeliveryNoteDetailView.vue
│   │   │   │   ├── SalesInvoiceListView.vue
│   │   │   │   ├── SalesInvoiceCreateView.vue
│   │   │   │   └── SalesInvoiceDetailView.vue
│   │   │   ├── components/
│   │   │   │   ├── SoItemFormRow.vue
│   │   │   │   ├── DeliveryItemAllocationRow.vue
│   │   │   │   └── SalesPaymentModal.vue
│   │   │   ├── services/
│   │   │   │   ├── salesOrderService.ts
│   │   │   │   ├── deliveryNoteService.ts
│   │   │   │   └── salesInvoiceService.ts
│   │   │   ├── stores/penjualanStore.ts
│   │   │   ├── routes.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── keuangan/                      # Modul Keuangan (Hutang, Piutang, Surat Tagihan)
│   │   │   ├── views/
│   │   │   │   ├── PiutangListView.vue
│   │   │   │   ├── HutangListView.vue     # SMA only
│   │   │   │   ├── BillingLetterListView.vue
│   │   │   │   ├── BillingLetterCreateView.vue
│   │   │   │   └── BillingLetterDetailPrintView.vue
│   │   │   ├── components/
│   │   │   │   ├── PaymentRecordModal.vue
│   │   │   │   └── UnpaidInvoiceSelectorTable.vue
│   │   │   ├── services/
│   │   │   │   ├── piutangService.ts
│   │   │   │   ├── hutangService.ts
│   │   │   │   └── billingLetterService.ts
│   │   │   ├── routes.ts
│   │   │   └── index.ts
│   │   │
│   │   └── laporan/                       # Rekapitulasi & Pelaporan
│   │       ├── views/
│   │       │   ├── RekapPenjualanView.vue
│   │       │   ├── RekapPembelianView.vue # SMA only
│   │       │   ├── RekapBarangView.vue    # SMA only
│   │       │   ├── RekapPiutangView.vue
│   │       │   └── RekapHutangView.vue    # SMA only
│   │       ├── services/laporanService.ts
│   │       ├── routes.ts
│   │       └── index.ts
│   │
│   ├── shared/                            # Prasarana Bersama
│   │   ├── api/                           # Data layer abstraction
│   │   │   ├── repository.interface.ts
│   │   │   ├── inMemoryRepository.ts
│   │   │   └── seed/                      # Mock initial seed data
│   │   │       ├── seedUsers.ts
│   │   │       ├── seedCustomers.ts
│   │   │       ├── seedSuppliers.ts
│   │   │       ├── seedBarang.ts
│   │   │       └── seedTransactions.ts
│   │   ├── components/                    # UI Kit / Design System
│   │   │   ├── form/
│   │   │   │   ├── AppInput.vue
│   │   │   │   ├── AppSelect.vue
│   │   │   │   ├── AppCurrencyInput.vue
│   │   │   │   ├── AppDateInput.vue
│   │   │   │   └── AppTextarea.vue
│   │   │   ├── table/
│   │   │   │   ├── AppDataTable.vue
│   │   │   │   ├── AppPagination.vue
│   │   │   │   └── AppEmptyState.vue
│   │   │   ├── feedback/
│   │   │   │   ├── AppModal.vue
│   │   │   │   ├── AppConfirmDialog.vue
│   │   │   │   ├── AppLoadingSpinner.vue
│   │   │   │   └── AppAlert.vue
│   │   │   └── badge/
│   │   │       ├── AppStatusBadge.vue
│   │   │       └── AppMoneyDisplay.vue
│   │   ├── composables/
│   │   │   ├── usePermission.ts
│   │   │   ├── useVariantConfig.ts
│   │   │   ├── usePagination.ts
│   │   │   └── useDebounce.ts
│   │   ├── directives/
│   │   │   └── vCan.ts
│   │   ├── utils/
│   │   │   ├── money.ts
│   │   │   ├── date.ts
│   │   │   ├── numbering.ts
│   │   │   ├── payment.ts
│   │   │   └── validation.ts
│   │   ├── constants/
│   │   │   ├── business.ts
│   │   │   └── routes.ts
│   │   └── types/
│   │       ├── common.ts
│   │       └── entity.ts
│   │
│   ├── App.vue
│   └── main.ts
│
├── tests/                                 # Unit & Integration tests
│   ├── unit/
│   │   ├── money.spec.ts
│   │   ├── paymentStatus.spec.ts
│   │   ├── deliveryAllocation.spec.ts
│   │   ├── salesOrderValidation.spec.ts
│   │   ├── billingLetter.spec.ts
│   │   └── routeBuilder.spec.ts
│   └── setup.ts
│
├── .env.example
├── .env.sma
├── .env.st
├── eslint.config.js
├── index.html
├── package.json
├── pnpm-lock.yaml
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

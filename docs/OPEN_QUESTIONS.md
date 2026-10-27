# OPEN QUESTIONS & ASSUMPTIONS (DAFTAR ASUMSI & PERTANYAAN TERBUKA)

Dokumen ini mencatat seluruh aturan bisnis yang memiliki ambiguitas, asumsi sementara yang diambil oleh tim engineer, serta default aman yang diimplementasikan melalui konfigurasi yang mudah diubah.

---

## 1. Modul Pembelian & Entitas ST

### Masalah / Ambiguitas
- Catatan bisnis menyebutkan: *"pembelian untuk SMA maupun ST dicatat di web SMA (ST tidak punya modul pembelian). Sediakan field `entitas` (`SMA` | `ST`) pada invoice pembelian."*
- Namun, apakah web ST nantinya perlu melihat data barang atau data hutang hasil pembelian entitas `ST`, ataukah web ST benar-benar 100% independen tanpa modul pembelian/barang sama sekali?
- Pada web ST, SO item diketik manual tanpa master barang. Jika pembelian ST dicatat di SMA, apakah pembelian ST di SMA hanya untuk pencatatan akuntansi/keuangan hutang, atau ada integrasi stok di masa depan?

### Asumsi & Default Aman yang Dipilih
1. **Field `entitas` pada Purchase Invoice**: Default value adalah `SMA`, dengan opsi dropdown `SMA` dan `ST`.
2. **Web ST tetap bersih**: Sesuai brief, varian ST sama sekali tidak memuat modul `pembelian`, `supplier`, maupun `barang`.
3. **Penyimpanan**: Data pembelian untuk entitas ST tersimpan di database pembelian SMA dengan flag `entitas: 'ST'`. Pada laporan/rekap pembelian dan hutang di web SMA, disediakan filter `entitas` (`Semua`, `SMA`, `ST`) sehingga keuangan SMA dapat memisahkan hutang/pembelian milik SMA vs ST.
4. **Konfigurasi**: Opsi entitas didefinisikan dalam `src/shared/constants/business.ts` (`PURCHASE_ENTITIES = ['SMA', 'ST'] as const`).

---

## 2. Status Pelunasan Pembelian / Penjualan Tunai (`cash`)

### Masalah / Ambiguitas
- Apakah invoice dengan termin pembayaran `cash` secara otomatis dibuatkan baris pembayaran lunas saat invoice disimpan, atau harus diinput pembayaran terpisah secara manual?

### Asumsi & Default Aman yang Dipilih
1. **Default**: Saat invoice (pembelian atau penjualan) dibuat dengan termin `cash`, sistem secara otomatis meng-generate satu record pembayaran senilai total invoice pada tanggal yang sama dengan tanggal invoice, dengan metode bayar `CASH`.
2. **Keterlacakan**: Rekord pembayaran tetap dibuat di tabel pembayaran (bukan hanya mengubah status string) agar riwayat kas dan audit trail tetap konsisten.
3. **Konfigurasi**: Disediakan toggle konfigurasi `autoRecordCashPayment: true` di konfigurasi modul keuangan. Jika di kemudian hari user ingin kasir mengonfirmasi penerimaan uang fisik terlebih dahulu sebelum status berubah jadi lunas, toggle ini cukup diubah ke `false`.

---

## 3. Penutupan dan Pembatalan Sales Order (SO Lifecycle)

### Masalah / Ambiguitas
- Kapan status SO berpindah dari `open` ke `close`? Apakah otomatis ketika total akumulasi kuantitas seluruh surat jalan telah memenuhi kuantitas seluruh item SO, ataukah harus diklik tombol "Tutup SO" secara manual oleh staf penjualan?
- Kapan SO boleh di-`cancel`?

### Asumsi & Default Aman yang Dipilih
1. **Auto-Close vs Manual**:
   - Sistem menyediakan fungsi helper `calculateSoFulfillmentStatus(so, deliveryNotes)` yang menghitung persentase pemenuhan.
   - Default sistem: **Hybrid / Opsi Konfigurasi** (`soCloseMode: 'auto' | 'manual'`).
   - Pada mode `'auto'` (default): Ketika surat jalan terakhir disimpan dan total seluruh qty item terkirim >= total qty pesanan, status SO otomatis beralih menjadi `close`. Staf juga tetap dapat menutup manual jika pesanan disepakati selesai lebih awal (misal: sisa barang tidak jadi dikirim).
2. **Pembatalan (`cancel`)**:
   - SO **hanya boleh dibatalkan** jika **belum ada satu pun surat jalan** yang terbit untuk SO tersebut.
   - Jika sudah ada minimal 1 surat jalan (meskipun belum di-invoice), tombol cancel dinonaktifkan dengan tooltip/pesan: *"SO tidak dapat dibatalkan karena sudah memiliki surat jalan. Batalkan/hapus surat jalan terlebih dahulu."* Validasi ini juga diperiksa secara ketat pada service layer `SalesOrderService.cancelSo()`.

---

## 4. Validasi Surat Jalan Terhadap Kuantitas SO

### Masalah / Ambiguitas
- Apakah pengiriman bertahap (multiple delivery notes) mengizinkan toleransi pengiriman lebih (over-delivery, misal barang curah/timbangan) atau kuantitas terkirim harus strictly `<= qty SO`?

### Asumsi & Default Aman yang Dipilih
1. **Strict Non-Overdelivery**: Akumulasi kuantitas terkirim dari seluruh surat jalan aktif untuk suatu item SO **tidak boleh melebihi** kuantitas yang tertera pada SO (`totalDeliveredQty <= soItemQty`).
2. **Validasi Formulir**: Saat staf membuat surat jalan baru, formulir input menampilkan:
   - `Qty Pesanan`
   - `Qty Sebelumnya Terkirim`
   - `Maksimal Boleh Dikirim (Sisa)`
   - Input field dibatasi `max = sisaQty`.
3. **Service Validation**: `DeliveryNoteService` menolak pembuatan surat jalan jika ditemukan item dengan `qtyDelivered > remainingQty`.

---

## 5. Hubungan Surat Jalan ke Sales Invoice

### Masalah / Ambiguitas
- "Invoice dibuat dari satu atau lebih surat jalan."
- Apakah satu surat jalan hanya bisa masuk ke tepat satu invoice, atau bisa di-invoice secara parsial (sebagian item)?
- Apakah beberapa surat jalan yang digabung ke satu invoice harus berasal dari Customer yang sama dan SO yang sama, atau bisa multi-SO asalkan Customer sama?

### Asumsi & Default Aman yang Dipilih
1. **Satu Surat Jalan = Satu Invoice Penuh**: Untuk menjaga kesederhanaan dan kejelasan audit piutang, saat surat jalan dimasukkan ke dalam invoice, seluruh item dalam surat jalan tersebut ditagihkan. Satu surat jalan hanya dapat dikaitkan dengan satu invoice aktif (tidak dapat di-invoice dua kali).
2. **Multi Surat Jalan per Invoice**: Satu invoice dapat menggabungkan beberapa surat jalan, dengan syarat seluruh surat jalan tersebut **berasal dari Customer yang sama**.
3. **Multi-SO vs Single-SO**: Diizinkan menggabungkan surat jalan dari SO yang berbeda sepanjang Customer-nya identik (sering terjadi dalam bisnis distribusi: pengiriman Senin dan Rabu digabung jadi satu invoice di hari Jumat).

---

## 6. Perhitungan PPN & Nilai Pajak

### Masalah / Ambiguitas
- Tarif PPN di Indonesia saat ini 11% (dan berpotensi 12%). Apakah tarif PPN di-hardcode atau configurable?
- Bagaimana pembulatan PPN terhadap nilai rupiah?

### Asumsi & Default Aman yang Dipilih
1. **Konfigurasi Tarif**: Tarif PPN disimpan dalam konstanta konfigurasi `TAX_CONFIG = { defaultPpnRatePercent: 11 }` di `src/shared/constants/business.ts`.
2. **Perhitungan Uang Murni**: Seluruh kalkulasi menggunakan fungsi utilitas teruji `calculatePpn(subtotal, ratePercent)` yang membulatkan ke integer rupiah terdekat (`Math.round`).
3. **Pembelian**: Hanya supplier dengan `taxType === 'ppn'` yang menghasilkan baris PPN pada invoice pembelian.
4. **Penjualan SMA**: Pilihan status faktur:
   - `sudah_faktur`: PPN dihitung dan tercantum.
   - `belum_faktur`: Faktur pajak belum diterbitkan tetapi transaksi kena pajak (PPN dihitung).
   - `tanpa_faktur`: Non-PPN, PPN = 0.
5. **Penjualan ST**: Selalu tanpa faktur (PPN = 0, status faktur tidak ditampilkan).

---

## 7. Status Pembayaran dan Toleransi Selisih (Overpayment / Underpayment)

### Masalah / Ambiguitas
- Bagaimana jika pembayaran melebihi total tagihan (kelebihan bayar)?

### Asumsi & Default Aman yang Dipilih
1. Fungsi murni `derivePaymentStatus(totalAmount, payments)` menghasilkan status:
   - `belum_lunas`: Total bayar === 0
   - `dp`: 0 < Total bayar < Total tagihan
   - `lunas`: Total bayar === Total tagihan
   - `overpaid`: Total bayar > Total tagihan (status khusus agar terdeteksi di audit kas)
2. Sisa tagihan dihitung dengan rumus murni: `remainingBalance = Math.max(0, totalAmount - totalPaidAmount)`.

---

## 8. Surat Tagihan (Billing Letter)

### Masalah / Ambiguitas
- Setelah surat tagihan dibuat, apakah status invoice berubah?
- Jika ada invoice yang terdaftar di surat tagihan A, apakah invoice tersebut boleh masuk ke surat tagihan B di kemudian hari jika belum lunas juga?

### Asumsi & Default Aman yang Dipilih
1. **Non-destructive**: Pembuatan surat tagihan tidak mengubah status utang/piutang invoice (status pelunasan hanya dipengaruhi pembayaran riil).
2. **Fleksibilitas Pembuatan Tagihan**: Invoice yang belum lunas tetap dapat dicetak ulang pada surat tagihan baru (misalnya Surat Tagihan Pengingat ke-2).
3. **Riwayat Snapshot**: Surat tagihan menyimpan snapshot nomor invoice, sisa tagihan pada saat surat dibuat, dan total akumulasi tagihan saat itu, sehingga jika dicetak ulang di masa depan, angka historis tidak berubah secara membingungkan.
4. **Export / Cetak**: Disediakan template cetak bersih siap cetak browser (`window.print`) dengan stylesheet `@media print` rapi berformat standar surat bisnis Indonesia.

---

## 9. Manajemen Stok / Inventori

### Masalah / Ambiguitas
- Modul SMA memiliki master barang dan input barang dari invoice pembelian. Apakah ada pencatatan kartu stok fisik gudang (FIFO/LIFO/Average, gudang, mutasi barang), ataukah sistem saat ini murni pencatatan administratif (SO merujuk ke barang yang pernah diinput di pembelian)?

### Asumsi & Default Aman yang Dipilih
1. **Sesuai Brief**: Sistem berfokus pada alur pencatatan dagang (Pembelian -> Barang -> SO -> Surat Jalan -> Invoice -> Piutang/Hutang).
2. **Validasi SO SMA**: Aturan utama dari brief terpenuhi: *"SO TIDAK BISA dibuat kalau barang belum diinput di modul pembelian."*
3. **Stok Tersedia (Purchased vs Delivered)**: Disiapkan service kalkulasi `getBarangAvailability(barangId)` yang menghitung total qty dibeli dikurangi total qty yang sudah terikat pada SO/surat jalan aktif. Ini disajikan sebagai informasi pada master/rekap barang dan siap diupgrade ke modul gudang penuh di fase mendatang.

---

## 10. Manajemen User & Role Customization

### Masalah / Ambiguitas
- Apakah hak akses role bersifat statis per role atau harus bisa dicentang-centang secara dinamis oleh owner melalui UI?

### Asumsi & Default Aman yang Dipilih
1. **Peta Role-to-Permission Tunggal**: Hak akses dipusatkan pada `src/app/auth/permissions.ts`. Role memiliki permission bawaan yang jelas dan teruji ketat.
2. **Extensible Permission Override**: Model `User` memiliki opsional field `customPermissions?: PermissionId[]` yang memungkinkan `owner` menambahkan permission khusus kepada user tertentu tanpa merombak arsitektur role.

# Panduan Lengkap Deploy BudgetIn ke Vercel dengan Storage Notion

Dokumen ini menjelaskan langkah demi langkah cara menghubungkan database **Notion** sebagai penyimpanan utama (*storage/backend*) dan men-deploy aplikasi ke **Vercel**.

---

## Arsitektur Integrasi
Aplikasi browser (client) tidak boleh memanggil Notion API secara langsung karena token rahasia (`secret_...`) akan bocor dan Notion memblokir request langsung via CORS. 

Proyek ini telah dilengkapi dengan:
- **Serverless API** di `/api/notion.ts` (otomatis berjalan sebagai serverless function di Vercel).
- **Vercel Config** di `vercel.json` untuk routing SPA dan `/api/*`.
- **Notion SDK** (`@notionhq/client`) untuk transaksi data cepat dan aman.

---

## Langkah 1: Buat Integrasi (Bot) di Notion

1. Buka [Notion Developers / Integrations](https://www.notion.so/profile/integrations).
2. Klik tombol **New integration** (+).
3. Beri nama integrasi, contoh: `BudgetIn Bot`.
4. Pilih **Workspace Notion** Anda.
5. Pada bagian *Capabilities*, pastikan izin berikut aktif:
   - Read content
   - Update content
   - Insert content
6. Klik **Submit**.
7. Salin **Internal Integration Secret** (token berawalan `secret_...`). Simpan token ini untuk Vercel.

---

## Langkah 2: Buat 2 Database di Halaman Notion Anda

Buka aplikasi/web Notion, buat halaman baru (misal: *Financial Workspace*), lalu buat 2 tabel/database:

### Database 1: `Budgets` (Pagu Anggaran)
Buat inline table dengan kolom/properti berikut (huruf besar/kecil harus persis):
| Nama Kolom | Tipe Properti di Notion | Keterangan |
| :--- | :--- | :--- |
| **Category** | `Title` (Bawaan kolom pertama) | Nama Kategori (cth: "Food and Beverage") |
| **Period** | `Select` | Periode (cth: "October 2026") |
| **Allocated** | `Number` | Batas nominal pagu (cth: 3000000) |
| **Spent** | `Number` | Total realisasi pengeluaran |
| **Rollover** | `Checkbox` | Opsi rollover sisa anggaran |

### Database 2: `Transactions` (Mutasi Transaksi)
Buat tabel kedua dengan properti:
| Nama Kolom | Tipe Properti di Notion | Keterangan |
| :--- | :--- | :--- |
| **Category** | `Title` (Bawaan kolom pertama) | Nama Kategori |
| **Amount** | `Number` | Nominal transaksi (cth: 150000) |
| **Date** | `Date` | Tanggal transaksi |
| **PaymentMethod**| `Select` | Cash, Rekening Bank, E-Wallet, Kartu Kredit |
| **Provider** | `Rich Text` | Nama bank/e-wallet (cth: GoPay, BCA) |
| **Notes** | `Rich Text` | Catatan transaksi |

---

## Langkah 3: Berikan Izin Akses Database ke Bot Integrasi

Ini langkah yang sering terlewat:
1. Buka halaman database **Budgets** di Notion.
2. Klik tombol titik tiga (**•••**) di pojok kanan atas halaman.
3. Gulir ke bawah dan pilih **Connections** (atau **Add connections**).
4. Cari dan pilih bot yang Anda buat di Langkah 1 (`BudgetIn Bot`).
5. Lakukan hal yang sama untuk database **Transactions**.

---

## Langkah 4: Dapatkan ID Masing-Masing Database Notion

1. Buka database **Budgets** dalam tampilan full-page.
2. Salin URL di browser Anda. Format URL Notion adalah:
   ```
   https://www.notion.so/workspace-name/8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d?v=...
   ```
   Bagian **32 karakter** antara nama workspace dan tanda `?v=` adalah **Database ID**.
3. Lakukan hal yang sama untuk database **Transactions**.

---

## Langkah 5: Deploy ke Vercel

1. Pastikan kode sudah di-push ke repositori GitHub atau GitLab Anda:
   ```bash
   git init
   git add .
   git commit -m "feat: complete BudgetIn with Notion backend"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo-name>.git
   git push -u origin main
   ```
2. Buka dashboard [Vercel](https://vercel.com/) dan login.
3. Klik **Add New...** > **Project**.
4. Import repositori GitHub Anda.
5. Vercel akan otomatis mendeteksi:
   - **Framework Preset**: `Vite`
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
6. Buka dropdown **Environment Variables**, lalu tambahkan 3 key berikut:
   - `NOTION_API_KEY`: token integrasi Anda (`secret_...`)
   - `NOTION_BUDGETS_DB_ID`: ID database Budgets Anda
   - `NOTION_TRANSACTIONS_DB_ID`: ID database Transactions Anda
7. Klik tombol **Deploy**.

---

## Langkah 6: Selesai & Sinkronisasi Data

Setelah deploy selesai (biasanya < 1 menit):
1. Buka domain Vercel Anda (`https://your-app.vercel.app`).
2. Klik tombol **Notion** di navbar atas.
3. Anda dapat mengklik:
   - **Test Koneksi**: Memverifikasi bot Notion aktif dan mengenali database.
   - **Export Local Data ke Notion**: Mengirim seluruh data awal ke database Notion Anda.
   - **Tarik Data dari Notion**: Memuat data terbaru langsung dari Notion.

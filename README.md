# Cartify E-Commerce Platform

---

## 👥 Identitas Kelompok & Pembagian Tugas
**Kelompok 6 - Kelas IF-48 (Fakultas Informatika, Universitas Telkom, 2026)**

| No | Nama Anggota | NIM | Fitur / Modul | Kelas & Interface yang Dibuat |
| :---: | :--- | :---: | :--- | :--- |
| 1 | **Ryan Maulana Bagus Putra** | 103012430029 | Dashboard & Notifikasi | `Dashboard`, `Notification`, `Observer` *(Interface)* |
| 2 | **Rahmatul Akbar Alim** | 103012400172 | Manajemen Pengguna | `User` *(Abstract)*, `Buyer`, `Seller`, `Admin` |
| 3 | **Azmi Hanif Fauzil Islami** | 103012430018 | Manajemen Produk | `Product` *(Abstract)*, `ElectronicProduct`, `FashionProduct`, `FoodProduct`, `Stockable` *(Interface)* |
| 4 | **Pascal Zaidane Athallah** | 103012400033 | Manajemen Transaksi | `Cart`, `OrderItem`, `Transaction`, `Payable` *(Interface)*, `TransactionStatus` *(Enum)* |
| 5 | **Muhammad Rafiul Izzah** | 103012430004 | Ulasan & Rating | `Review`, `RatingCalculator`, `Reviewable` *(Interface)* |

---

## 📂 Dokumentasi & UML Diagram
Seluruh berkas dokumentasi resmi proyek Tugas Besar ini disimpan di dalam folder [`docs/`](./docs/):
- 📄 **Laporan Akhir Tugas Besar (PDF)**: [`Laporan_Tugas_Besar_PBO.pdf`](./docs/Laporan_Tugas_Besar_PBO.pdf)
- 📊 **UML Class Diagram (PDF)**: [`Class_Diagram_Cartify.pdf`](./docs/Class_Diagram_Cartify.pdf)

---

## 🚀 Fitur Utama

### 🛒 Fitur Pembeli (Buyer)
- **Katalog Produk Premium**: Telusuri produk berdasarkan kategori pilihan (Elektronik, Pakaian, Makanan) dengan fitur pencarian dan pengurutan dinamis.
- **Keranjang Belanja Interaktif**: Panel samping keranjang (*offcanvas cart*) yang intuitif dengan fitur tambah/kurang kuantitas secara langsung.
- **Proses Checkout & Pembayaran**: Alur pembayaran terintegrasi untuk melacak total belanjaan, diskon, biaya kurir, serta status pembayaran otomatis.
- **Ulasan & Penilaian Pelanggan**: Tulis ulasan bintang dan komentar untuk produk yang telah dibeli setelah transaksi selesai.

### 🏪 Fitur Penjual (Seller)
- **Pendaftaran Toko (Become Seller)**: Ubah akun pembeli menjadi penjual instan dengan menentukan nama dan kategori spesifik toko.
- **Dashboard Manajemen Toko**: Kelola katalog produk sendiri (tambah produk baru berdasarkan kategori, hapus produk lama) dan pantau total pendapatan serta jumlah produk aktif.
- **Manajemen Pesanan Masuk**: Terima notifikasi pesanan baru, perbarui status pengiriman (*Pending* -> *Shipped* -> *Delivered*), serta balas ulasan pelanggan secara langsung.

### 🛡️ Fitur Admin (Super Admin)
- **Dashboard Monitoring**: Pantau statistik sistem secara real-time seperti total pengguna, total produk, jumlah transaksi, dan pendapatan total platform.
- **Manajemen Pengguna**: Blokir pengguna bermasalah atau hapus produk yang tidak sesuai ketentuan sistem secara instan.

---

## 🛠️ Tech Stack

| Komponen | Teknologi | Keterangan |
| --- | --- | --- |
| **Frontend** | Next.js (React) | Rendering cepat, perutean dinamis, & struktur komponen ramah SEO |
| **Styling** | Vanilla CSS & Tailwind | Desain responsif, modern, dengan sentuhan estetika premium |
| **Backend** | Spring Boot (Java) | Pemrosesan REST API yang aman, andal, dan modular |
| **Database** | MySQL | Penyimpanan relasional terstruktur untuk transaksi & relasi entitas |
| **ORM / JPA** | Hibernate | Pemetaan objek Java ke tabel database secara efisien |
| **Keamanan** | BCrypt Encryption | Enkripsi kata sandi pengguna untuk keamanan maksimal |
| **Autentikasi** | Google Sign-in | Integrasi masuk cepat tanpa kata sandi via Google Auth |

---

## 📦 Panduan Instalasi & Menjalankan Aplikasi

### Persyaratan Sistem
- Node.js (v18 ke atas)
- Java JDK 17
- MySQL Server

### 1. Menjalankan Backend (Spring Boot)
1. Buat database di MySQL lokal Anda:
   ```sql
   CREATE DATABASE cartify_db;
   ```
2. Buka folder `backend/` dan sesuaikan konfigurasi koneksi database di berkas `src/main/resources/application.properties` (seperti username/password database Anda).
3. Jalankan server backend dengan maven wrapper atau script otomatis:
   ```bash
   ./run-backend.bat
   ```
   *Catatan: Backend akan secara otomatis melakukan seeding data dummy awal (admin, seller profesional, produk unggulan, ulasan pembeli) saat pertama kali dijalankan.*

### 2. Menjalankan Frontend (Next.js)
1. Buka terminal baru di folder root proyek.
2. Pasang semua dependensi npm:
   ```bash
   npm install
   ```
3. Jalankan server pengembangan Next.js:
   ```bash
   npm run dev
   ```
4. Buka browser Anda dan akses aplikasi di: `http://localhost:3000`.

---

## 📂 Struktur Proyek
```
cartify/
├── backend/                # Source code Spring Boot Java
│   ├── src/main/java/      # Controller, Model, Repository
│   └── src/main/resources/ # application.properties, Static templates
├── frontend/               # Source code Next.js
│   ├── public/             # Aset gambar lokal (loq.png, pocof9.png, dll.)
│   └── src/app/            # Komponen halaman (shop, product, store, buyer, seller)
├── README.md               # Dokumentasi utama proyek
└── run-backend.bat         # Script cepat menyalakan server backend
```

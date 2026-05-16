# Cartify - Sistem Manajemen E-Commerce Berbasis Objek

Cartify adalah sebuah platform marketplace sederhana yang dibangun menggunakan bahasa pemrograman Java dengan menerapkan prinsip Pemrograman Berorientasi Objek (OOP) secara komprehensif. Proyek ini ditujukan untuk memenuhi Tugas Besar mata kuliah Pemrograman Berorientasi Objek, Program Studi S1 Informatika, Universitas Telkom.

Aplikasi ini mengintegrasikan fondasi arsitektur backend OOP tingkat lanjut seperti *inheritance*, *abstract class*, *interface*, *encapsulation*, dan *polymorphism* dengan antarmuka frontend berbasis Web (HTML, CSS, Bootstrap 5) guna menyajikan simulasi ekosistem marketplace lokal yang modular dan responsif.

---

## 👥 Identitas Kelompok & Pembagian Tugas

**Kelompok 6 - Kelas IF-48**
*Fakultas Informatika, Universitas Telkom (2026)*

| No | Nama Anggota | NIM | Fitur / Modul | Kelas & Interface yang Dibuat |
|----|--------------|-----|---------------|-------------------------------|
| 1 | **Ryan Maulana Bagus Putra** | 103012430029 | Dashboard & Notifikasi | `Dashboard`, `Notification`, `Observer` *(Interface)* |
| 2 | Rahmatul Akbar Alim | 103012400172 | Manajemen Pengguna | `User` *(Abstract)*, `Buyer`, `Seller`, `Admin` |
| 3 | Azmi Hanif Fauzil Islami | 103012430018 | Manajemen Produk | `Product` *(Abstract)*, `ElectronicProduct`, `FashionProduct`, `FoodProduct`, `Stockable` *(Interface)* |
| 4 | Pascal Zaidane Athallah | 103012400033 | Manajemen Transaksi | `Cart`, `OrderItem`, `Transaction`, `Payable` *(Interface)*, `TransactionStatus` *(Enum)* |
| 5 | Muhammad Rafiul Izzah | 103012430004 | Ulasan & Rating | `Review`, `RatingCalculator`, `Reviewable` *(Interface)* |

---

## 🛠️ Spesifikasi & Teknologi

* **Bahasa Pemrograman:** Java SE 17 atau versi yang lebih baru
* **Build Tool & Dependency Manager:** Apache Maven
* **Antarmuka Pengguna (UI):** HTML5, CSS3, dan Framework Bootstrap 5
* **Database Relasional:** MySQL (Simulasi Skema Transaksi Lokal)
* **IDE / Editor:** Visual Studio Code (VSCode) + Java Extension Pack

---

## 📂 Struktur Proyek

Proyek ini dipisah secara modular ke dalam arsitektur Backend (Java) dan Frontend (HTML/CSS UI):

```text
Cartify/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   └── java/
│   │   │       └── com/
│   │   │           └── cartify/
│   │   │               ├── App.java            # Entry Point Utama Aplikasi
│   │   │               ├── Dashboard.java      # Pengelola Ringkasan Akun & Observer
│   │   │               ├── Notification.java   # Model Data Notifikasi Sistem
│   │   │               ├── Observer.java       # Interface Kontrak Observer Pattern
│   │   │               └── User.java           # Model Dummy untuk Keperluan Testing
│   └── pom.xml                                 # Konfigurasi Maven Proyek
├── frontend/
│   ├── index.html                              # UI Halaman Utama / Beranda Pembeli
│   ├── buyer-dashboard.html                    # UI Dashboard Akun Pembeli (Buyer)
│   └── seller-dashboard.html                   # UI Dashboard Panel Penjual (Seller)
└── README.md
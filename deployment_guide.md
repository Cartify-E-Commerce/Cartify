# Panduan Deployment - Cartify E-Commerce

Dokumen ini menjelaskan langkah-langkah untuk mendeploy aplikasi Cartify ke layanan cloud:
1. **Railway** (untuk Spring Boot Backend & Database MySQL)
2. **Vercel** (untuk Next.js Frontend)

---

## 🖥️ Bagian 1: Deploy Backend & Database ke Railway

Railway sangat cocok untuk menjalankan aplikasi Java Spring Boot dan database MySQL.

### Langkah 1: Hubungkan Repositori GitHub ke Railway
1. Masuk ke akun [Railway.app](https://railway.app) menggunakan akun GitHub Anda.
2. Klik tombol **New Project** -> pilih **Deploy from GitHub repo**.
3. Pilih repositori `Cartify`.

### Langkah 2: Setup Database MySQL di Railway
1. Di dalam dashboard project Railway baru Anda, klik **+ Add** (atau **New**) -> pilih **Database** -> pilih **Add MySQL**.
2. Railway akan membuat layanan MySQL secara otomatis.
3. Klik pada tab layanan **MySQL**, buka bagian **Variables**. Anda akan melihat detail koneksi seperti `MYSQL_URL`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLPORT`, dan `MYSQLDATABASE`.

### Langkah 3: Konfigurasi Layanan Spring Boot Backend
Koleksi kode backend kita berada di sub-direktori `/backend`. Ikuti konfigurasi berikut agar Railway mendeteksi dan membangunnya dengan benar:

1. Di dashboard Railway, klik layanan repositori GitHub Anda.
2. Buka tab **Settings**:
   - Cari pengaturan **Root Directory**, lalu ubah nilainya menjadi: `/backend`. Ini memberi tahu Railway untuk hanya membangun kode di dalam folder backend.
3. Buka tab **Variables** dan tambahkan variabel lingkungan (*Environment Variables*) berikut untuk menghubungkan backend ke database MySQL Railway:
   - `SPRING_DATASOURCE_URL` = `jdbc:mysql://${{MYSQLHOST}}:${{MYSQLPORT}}/${{MYSQLDATABASE}}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC`
   - `SPRING_DATASOURCE_USERNAME` = `${{MYSQLUSER}}`
   - `SPRING_DATASOURCE_PASSWORD` = `${{MYSQLPASSWORD}}`
   - `ALLOWED_ORIGIN` = `https://<DOMAIN-VERCEL-FRONTEND-ANDA>.vercel.app` *(Ganti ini setelah Anda mendeploy frontend di Vercel)*
   - `PORT` = `8080`
4. Railway akan mendeteksi Maven secara otomatis dan memicu build ulang. Setelah build sukses, Railway akan memberikan **Domain Publik** (misalnya `https://backend-production-xxxx.up.railway.app`). Catat domain ini untuk konfigurasi frontend.

---

## 🌐 Bagian 2: Deploy Frontend ke Vercel

Vercel adalah platform terbaik untuk mendeploy aplikasi Next.js. Karena frontend kita berada di folder `/frontend`, kita perlu mengatur direktori root build di Vercel.

### Langkah 1: Impor Proyek di Vercel
1. Masuk ke [Vercel.com](https://vercel.com) menggunakan akun GitHub Anda.
2. Klik **Add New...** -> pilih **Project**.
3. Cari repositori `Cartify` lalu klik **Import**.

### Langkah 2: Konfigurasi Subdirektori & Variabel Lingkungan
Sebelum menekan tombol *Deploy*, sesuaikan pengaturan berikut:

1. **Root Directory**:
   - Klik **Edit** di sebelah kolom *Root Directory*.
   - Pilih atau ketik folder: `frontend`.
2. **Environment Variables**:
   - Di bagian bawah, tambahkan variabel lingkungan berikut:
     - `NEXT_PUBLIC_API_URL` = `https://<DOMAIN-BACKEND-RAILWAY-ANDA>.up.railway.app/api` *(Ganti dengan domain publik yang diberikan oleh Railway pada langkah sebelumnya)*
3. Klik tombol **Deploy**.

Vercel akan menginstal dependensi dan membangun Next.js frontend Anda secara otomatis. Setelah selesai, Anda akan diberikan domain Vercel publik (seperti `https://cartify-frontend.vercel.app`).

### Langkah 3: Penyelarasan CORS Akhir (Opsional)
Kembali ke dashboard **Railway** (backend Anda), lalu perbarui variabel lingkungan `ALLOWED_ORIGIN` dengan domain Vercel Anda yang baru dibuat (misalnya `https://cartify-frontend.vercel.app`) agar browser tidak memblokir permintaan API karena kebijakan CORS.

# 🚀 Panduan Cepat Uji Coba Mandiri: Project Redaksi
**Real-Time Intelligence Dashboard & Automated Content Generator**

Halo! Dokumen ini adalah panduan langkah demi langkah bagi Anda yang ingin menjalankan dan mencoba langsung platform **Project Redaksi** di komputer/laptop Anda sendiri secara lokal.

---

## 📋 Persyaratan Sistem (Prerequisites)
Pastikan komputer Anda sudah terinstal perangkat lunak berikut:
1. **Node.js** (Versi 18 atau terbaru) – untuk menjalankan aplikasi antarmuka web (Frontend).
2. **Python** (Versi 3.9 atau terbaru) – untuk menjalankan mesin kecerdasan buatan & penarik berita (Backend).

---

## 🛠️ Cara Memulai (Langkah Instalasi & Menjalankan)

Proyek ini terbagi menjadi 2 komponen utama di dalam folder `rakitdata/`: **Backend** dan **Frontend**. Anda perlu membuka terminal (command prompt / powershell) untuk menjalankan keduanya.

### Langkah 1: Menjalankan Mesin Backend (API & AI Generator)
1. Buka terminal atau command prompt baru, lalu masuk ke folder backend:
   ```bash
   cd rakitdata/backend
   ```
2. Instal pustaka Python yang dibutuhkan (jika belum terinstal):
   ```bash
   pip install flask flask-cors requests
   ```
3. Jalankan server API Backend:
   ```bash
   python app.py
   ```
   > ✅ **Sukses:** Jika berhasil, akan muncul pesan `[FLASK API] Server berjalan di http://localhost:5000`. Biarkan terminal ini tetap terbuka.

---

### Langkah 2: Menjalankan Antarmuka Web Frontend (Dashboard)
1. Buka terminal atau command prompt **kedua (baru)**, lalu masuk ke folder frontend:
   ```bash
   cd rakitdata/frontend
   ```
2. Instal paket modul Node.js (jika baru pertama kali):
   ```bash
   npm install
   ```
3. Jalankan server pengembang web:
   ```bash
   npm run dev
   ```
   > ✅ **Sukses:** Web akan berjalan dan siap diakses. Buka browser Anda (Chrome / Edge / Firefox) dan masuk ke alamat: **`http://localhost:3000`**

---

## 🎯 Cara Menguji & Menjelajahi Fitur Keren Aplikasi

Setelah membuka **`http://localhost:3000`** di browser, berikut adalah fitur utama yang bisa Anda coba:

1. **🌐 Tarik Data Live Internet Sekarang**
   * Klik tombol hijau bercahaya di bagian atas daftar berita.
   * Sistem akan otomatis berselancar ke internet untuk menarik tren berita terbaru secara langsung (*real-time*) dari **Kompas.com**, **DetikNews**, **Instagram**, **TikTok**, dan **Twitter/X**.
   * AI akan langsung merakit artikel dan menyusun rekomendasi situasi untuk berita yang ditarik tersebut!

2. **🏷️ Filter Tab Platform & Situasi**
   * Coba klik tab **📰 DetikNews** atau **🧭 Kompas.com** untuk menyaring berita khusus dari media utama.
   * Coba klik tab kategori situasi seperti **🚗 Lalu Lintas & Rute**, **🏥 Kesehatan & Medis**, atau **🛡️ Keamanan & Kriminal** untuk melihat arahan/solusi spesifik warga.

3. **📜 Sticky Floating Layout (Gulir ke Bawah)**
   * Cobalah menggulir layar ke bawah pada kolom berita utama di tengah.
   * Anda akan melihat kolom kiri (*Live Social Stream*) dan kolom kanan (*Situation Room Metrics*) tetap diam mengapung menemani guliran Anda dengan mulus!

4. **☀️ / 🌙 Toggle Mode Terang & Gelap**
   * Klik tombol penukar tema di pojok kanan atas untuk beralih antara tampilan terang (*Clean Light Mode*) yang elegan atau mode gelap (*Soft Slate Dark Mode*) yang nyaman dimata.

5. **⚙️ Masuk ke Ruang Redaksi (CMS Moderasi)**
   * Buka menu navigasi atas dan pilih **Masuk CMS** (atau kunjungi `http://localhost:3000/cms`).
   * Gunakan kredensial berikut untuk masuk:
     * **Username:** `amir` atau `rangga`
     * **Password:** `admin123`
   * Di dalam CMS ini, Anda bisa mensimulasikan pengetikan postingan sosmed baru dan melihat bagaimana AI merakit artikel serta memverifikasi faktanya secara instan!

---
*Selamat mencoba dan berimajinasi seliar mungkin dengan portal berita masa depan!* 🚀✨

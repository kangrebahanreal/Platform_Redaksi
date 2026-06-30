# Panduan Rekan Tim: Arsitektur File dan Cara Menjalankan Platform
**Tangsel EWS & Redaksi AI Dashboard — Real-Time Intelligence Platform**

Dokumen ini disusun sebagai panduan teknis resmi bagi seluruh tim engineering untuk memahami deskripsi tugas dan fungsi dari setiap file kode di dalam proyek, serta instruksi eksekusi platform dari tahap awal.

---

## Bagian 1: Deskripsi Tugas Masing-Masing File Proyek

Proyek ini dibangun menggunakan arsitektur berbasis Microservice yang dibagi menjadi dua modul utama: Backend (Python / AI / Database) dan Frontend (Next.js / Dashboard Antarmuka).

### A. File Peluncur Otomatis (Root Directory)
| Nama File | Deskripsi Tugas dan Peranan Utama |
| :--- | :--- |
| **`JALANKAN_PLATFORM.bat`** | Script otomatis berbasis Windows Batch yang bertugas mengeksekusi server Backend dan Frontend secara bersamaan melalui dua jendela terminal terpisah hanya dengan satu kali klik ganda (double-click). |

---

### B. Modul Backend (`backend/`)
Modul ini bertanggung jawab atas pemrosesan logika bisnis, integrasi Natural Language Processing (NLP), pemanggilan data berita real-time, dan manajemen penyimpanan database PostgreSQL.

| Nama File | Deskripsi Tugas dan Peranan Utama |
| :--- | :--- |
| **`app.py`** | Gerbang utama layanan backend (API Gateway). Menjalankan server Waitress WSGI berbasis multi-threading untuk menangani HTTP request dari frontend, mengelola rute endpoint API (`/api/news`, `/api/chat-ai`), dan menjalankan *Background Daemon Thread* penelusur berita otomatis setiap 15 menit. |
| **`db_config.py`** | Manajer konfigurasi koneksi database. Menghubungkan sistem langsung ke server PostgreSQL lokal (`Redaksi`) serta mengaktifkan mekanisme *auto-fallback* ke SQLite lokal (`db_ews.db`) apabila koneksi PostgreSQL mengalami kendala. File ini juga menginisialisasi skema tabel saat sistem pertama kali dimuat. |
| **`live_fetcher.py`** | Modul akuisisi data eksternal secara real-time. Bertugas menarik berita terkini dari kanal RSS Google News, DetikNews, Kompas, dan simulasi media sosial. Setiap liputan yang berhasil diproses langsung disimpan ke tabel khusus PostgreSQL yaitu `berita_utama` dan `entitas_berita`. |
| **`nlp_engine.py`** | Mesin pemrosesan bahasa alami (NLP). Bertugas mengolah judul singkat menjadi artikel berita berstandar jurnalistik, melakukan verifikasi silang fakta untuk menyematkan status *Terverifikasi Anti-Hoaks*, serta menentukan kategori situasi dan rekomendasi tindakan penanganan darurat bagi warga. |
| **`seed_knowledge.py`** | Modul pengisian basis pengetahuan AI (Knowledge Base). Berfungsi menanamkan data referensi situasional wilayah Tangerang Selatan ke tabel `pengetahuan_ai` pada database PostgreSQL agar asisten AI dapat merespons pertanyaan warga secara akurat dan dinamis. |
| **`geotag_engine.py`** | Mesin pemindai geospasial. Bertugas mendeteksi entitas lokasi atau nama wilayah (seperti Ciputat, Pamulang, BSD, dan Bintaro) di dalam teks liputan dan memetakan titik koordinat geografis (Latitude dan Longitude). |
| **`crawler_detik.py`** | Script penelusur web opsional yang dikhususkan untuk mengekstrak artikel berita dari kanal DetikNews. |
| **`import_excel.py`** | Utilitas migrasi data untuk mengimpor sampel laporan masyarakat dari file format Excel (`data_sosmed_sample.xlsx`) ke dalam database sistem. |

---

### C. Modul Frontend (`frontend/`)
Modul ini dibangun menggunakan framework Next.js berbasis React dan Vanilla CSS untuk menyajikan dasbor pemantauan visual yang interaktif dan responsif.

| Nama File | Deskripsi Tugas dan Peranan Utama |
| :--- | :--- |
| **`app/page.js`** | Komponen utama Dasbor Intelijen Warga. Menampilkan metrik pemantauan situasi, daftar stream liputan real-time, artikel terverifikasi, dan widget obrolan Asisten Warga berbasis AI yang dilengkapi algoritma *Fuzzy Keyword Matching* untuk toleransi kesalahan pengetikan (typo). |
| **`app/cms/page.js`** | Halaman Ruang Redaksi (Content Management System). Berfungsi sebagai portal moderasi khusus bagi administrator (`username: amir` atau `rangga`) untuk menyunting liputan warga, memvalidasi hasil verifikasi AI, dan menerbitkan artikel. |
| **`app/globals.css`** | Lembar gaya global (CSS System). Mengatur definisi variabel desain, efek *glassmorphism*, indikator *loading skeleton*, serta penyesuaian tema visual antara Mode Terang (*Clean Light Mode*) dan Mode Gelap (*Soft Slate Dark Mode*). |
| **`app/layout.js`** | Kerangka struktur dasar aplikasi web (Root Layout). Mengatur standar tipografi Google Fonts (*Outfit* dan *Inter*), konfigurasi metadata SEO, dan hierarki antarmuka global. |

---

### D. File Konfigurasi Akar Proyek
* **`.gitignore`**: Aturan eksklusi repositori Git untuk mencegah pengunggahan direktori berkapasitas besar (seperti `node_modules/` dan `.venv/`) serta file kredensial lokal (`.env`).
* **`DOKUMEN_ARSITEKTUR_TIM.md`**: Dokumen cetak biru teknis dan peta jalan pengembangan ekosistem perangkat lunak.

---

## Bagian 2: Panduan Menjalankan Platform

> [!IMPORTANT]
> **Standar Penulisan Direktori Eksekusi**
> Jangan menggunakan path absolut yang merujuk pada direktori pengguna komputer lain (seperti `C:\Users\NamaOrang\...\backend`). Gunakan script peluncur otomatis atau jalankan perintah secara relatif dari direktori utama proyek.

---

### Opsi A: Eksekusi Otomatis (Peluncur Batch)
1. Buka folder utama proyek ini melalui Windows Explorer.
2. Klik ganda pada file **`JALANKAN_PLATFORM.bat`**.
3. Sistem akan membuka dua jendela command prompt secara otomatis untuk menjalankan server Backend dan Frontend.
4. Buka peramban web (browser) dan akses alamat: **`http://localhost:3000`**

---

### Opsi B: Eksekusi Manual via Terminal
Pastikan posisi terminal Anda berada di direktori utama proyek ini.

1. **Menjalankan Layanan Backend:**
   ```powershell
   cd backend
   python app.py
   ```
   *Server API akan aktif pada port 5000.*

2. **Menjalankan Layanan Frontend (Buka Terminal Baru):**
   ```powershell
   cd frontend
   npm run dev
   ```
   *Akses antarmuka web melalui alamat `http://localhost:3000`.*

---

## Bagian 3: Verifikasi Sistem dan Pengujian

1. **Pengujian Integrasi PostgreSQL (Penarikan Otomatis):**
   * Akses atau segarkan (refresh) dasbor utama pada `http://localhost:3000`. Sistem secara otomatis menarik berita live di latar belakang tanpa notifikasi popup.
   * Periksa database PostgreSQL `Redaksi` menggunakan perintah SQL: `SELECT * FROM berita_utama ORDER BY id DESC LIMIT 5;`.
   * Pastikan artikel baru berhasil dicatat dengan penanda waktu terkini.
2. **Pengujian Toleransi Kesalahan Pengetikan pada AI:**
   * Buka widget obrolan Asisten Warga.
   * Masukkan kata kunci dengan kesalahan pengetikan, contoh: **`tmpt ngpi bntro`**.
   * Pastikan sistem tetap mengenali maksud masukan dan merespons dengan data kuliner atau tempat kopi di wilayah Bintaro.
3. **Pengujian Transisi Tema Visual:**
   * Gunakan tombol pengubah tema pada navigasi atas untuk memastikan transisi antara Mode Terang dan Mode Gelap berjalan tanpa kendala visual.

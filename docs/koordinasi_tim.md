# Dokumentasi Koordinasi Tim & Pembagian Tugas

Dokumen ini disusun sebagai bahan panduan koordinasi resmi untuk tim pengembang **Project Redaksi** (Automated Content Generator Portal News) yang akan dipresentasikan pada rapat koordinasi .

---

## 👥 Struktur Akses & Pembagian Tugas Developer

Sesuai arahan arsitektur, akses root sistem telah dibuatkan untuk developer utama dengan kredensial default sebagai berikut (dapat diganti setelah login pertama):
- **User Root 1**: `amir` (Password: `admin123`)
- **User Root 2**: `rangga` (Password: `admin123`)
- **User Editor Bersama**: `redaksi_user` (Password: `user123`)

### 📌 1. Amir — Backend Architecture & Data Pipeline Lead
**Fokus Tugas:**
1. **Infrastruktur Database & Auto-Fallback**: Mengelola koneksi database di server Colo (`10.100.14.139`, DB: `db_ews`, User: `redaksi`, Pass: `redaksidata`) serta memastikan mekanisme fallback lokal (`db_ews.db`) bekerja tanpa jeda jika jaringan Colo mengalami kendala VPN/SSH.
2. **REST API & Keamanan Token**: Membangun dan memelihara endpoint REST API di Python Flask (`app.py`), khususnya mengawasi logika pengamanan fungsi Approve/Reject menggunakan rumus API Key rahasia `azAZ09` minimal 16 karakter bertimestamp.
3. **Portal Crawler & Excel Loader**: Memastikan crawler berita online (Detik / Kompas) di `crawler_detik.py` berjalan periodik untuk menyuplai data pembanding verifikasi fakta, serta menangani proses impor file Excel eksternal (`import_excel.py`).

### 📌 2. Rangga — AI/NLP Engine & Frontend Experience Lead
**Fokus Tugas:**
1. **AI Content Generator & NER Extraction**: Membangun logika NLP di `nlp_engine.py` untuk mengonversi kalimat mentah media sosial (IG/TikTok/Apify) menjadi artikel bergaya *Hyper-Localize* (Tangerang Selatan, Pamulang, Ciputat, BSD).
2. **Geotagging & Rule-Based Action Engine**: Mengintegrasikan OpenStreetMap Nominatim API di `geotag_engine.py` untuk pemetaan entitas lokasi ("Trisakti" -> POI Jl. Gatsu) dan mengeksekusi rule keyword (misal: "lapar" -> mencari koordinat Warung/Warteg terdekat lalu menyimpannya via API).
3. **Next.js Web Application & Mock-Up UI**: Membina tampilan interaktif portal utama dan internal CMS agar berdesain mewah, responsif, dan mudah digunakan oleh tim redaksi.

---

## Agenda Pembahasan Rapat

1. **Review Performa Automated Generator**: Evaluasi akurasi ekstraksi entitas lokasi dan kelancaran transformasi kalimat sosmed menjadi berita utuh.
2. **Evaluasi Keamanan API Key Bertimestamp**: Pembahasan masa kedaluwarsa token (saat ini diatur window 24 jam dari timestamp embed).
3. **Migrasi Penuh ke Server Colo**: Koordinasi pembukaan firewall port 5432 di server `10.100.14.139` agar auto-fallback dapat sepenuhnya dinonaktifkan di lingkungan produksi.
4. **Demo Live Portal & CMS**: Demonstrasi alur persetujuan berita (*Approve/Reject*) kepada manajemen redaksi.

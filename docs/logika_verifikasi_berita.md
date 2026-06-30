# Logika Verifikasi Fakta Berita ("Cek Ngaco atau Benar")

Dokumen ini menjelaskan alur algoritma dan mekanisme verifikasi fakta yang diterapkan di modul `nlp_engine.py` dalam platform **Project Redaksi**.

---

## Tujuan Verifikasi
Karena portal berita beroperasi secara otomatis (*Automated Content Generator*) tanpa intervensi wartawan lapangan di tahap awal, sistem rentan terhadap masukan informasi fiktif, hoaks, atau kalimat halusinasi dari media sosial. Algoritma verifikasi bertugas membandingkan kalimat mentah dengan basis data liputan resmi dari portal kredibel (DetikNews / Kompas) yang dikumpulkan oleh modul crawler.

---

## Alur Logika Algoritma

```
[Kalimat Sosmed Mentah] (e.g., "Macet parah di Pamulang karena pohon tumbang")
           │
           ▼
[Preprocessing & Tokenisasi Kata Kunci] (Filter stopwords, ambil kata > 3 karakter)
           │
           ▼
[Pencocokan Silang Database Crawler] (SELECT * FROM crawler_data)
           │
     ┌─────┴─────────────────────────┐
     ▼                               ▼
[Kemiripan >= 2 Kata Kunci]   [Kemiripan < 2 Kata Kunci]
     │                               │
     │                               ▼
     │                      [Cek Daftar Kata Ngaco/Hoax]
     │                      (e.g., "alien", "dinosaurus", "kiamat")
     │                               │
     │                         ┌─────┴─────┐
     │                         ▼           ▼
     │                    [Terdeteksi]  [Bersih]
     │                         │           │
     ▼                         ▼           ▼
Status: BENAR            Status: NGACO   Status: BELUM TERVERIFIKASI
(Terverifikasi)          (Hoax/Fiktif)   (Info Warga Baru -> Pending Review)
```

---

## Implementasi Teknis di Python

1. **Ekstraksi Token**: Kalimat mentah dipecah menjadi daftar kata tunggal (token), mengabaikan kata sambung pendek (kurang dari 4 karakter).
2. **Scoring Kemiripan (*Relevance Matching*)**: Token dicocokkan terhadap judul dan kalimat dari artikel yang disimpan di tabel `crawler_data`. Jika ditemukan minimal 2 kata kunci yang bersinggungan secara konteks (misalnya kata `macet` dan `pamulang`), sistem mengklasifikasikan berita tersebut sebagai **BENAR (TERVERIFIKASI)** dan melampirkan tautan URL berita sumber asal Detik/Kompas sebagai rujukan validitas.
3. **Deteksi Anomali / Halusinasi (*Ngaco Detection*)**: Jika tidak ada kemiripan di referensi resmi, sistem menjalankan filter kata kunci halusinasi. Jika kalimat mengandung kata fiktif yang tidak wajar (seperti *alien*, *zombie*, *dinosaurus*), sistem langsung memberi label **NGACO / HOAX**.
4. **Penanganan Info Lokal Baru (*Escalation*)**: Jika berita bersih dari kata hoaks namun belum ada di Detik/Kompas (sering terjadi pada peristiwa hiperlokal yang baru terjadi beberapa menit), statusnya ditetapkan sebagai **BELUM TERVERIFIKASI / INFO WARGA BARU**, dan masuk ke antrian CMS dengan status default `PENDING` untuk menunggu persetujuan editor menggunakan API Key.

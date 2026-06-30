# Logika Geotagging OpenStreetMap & Pencarian POI Terdekat

Dokumen ini menjelaskan alur pencarian koordinat spasial (*Geocoding*) berdasarkan hasil ekstraksi entitas teks menggunakan **OpenStreetMap Nominatim API** serta pemetaan *Point of Interest* (POI) terdekat pada modul `geotag_engine.py`.

---

## Alur Geocoding Entitas Lokasi

Sistem mengadopsi mekanisme **Hybrid Geocoding** untuk menjamin kecepatan respon (*latency low*) sekaligus akurasi spasial tinggi di area fokus *Hyper-Localize* (Tangerang Selatan dan sekitarnya).

```
[Entity Extraction NER] -> Hasil: "Trisakti" atau "Pamulang"
           │
           ▼
[Pengecekan Internal Local Cache / Kamus Spasial]
           │
     ┌─────┴─────────────────────────┐
     ▼                               ▼
[Ditemukan di Kamus]        [Tidak Ditemukan]
     │                               │
     │                               ▼
     │                      [HTTP GET Nominatim API]
     │                      https://nominatim.openstreetmap.org/search
     │                               │
     └──────────────┬────────────────┘
                    ▼
          Koordinat Lat/Lon Akurat
```

---

## Penjelasan Langkah Teknis

1. **Ekstraksi Lokasi (*NER Extraction*)**: Modul NLP mendeteksi nama tempat spesifik dalam kalimat berita, misalnya `"Trisakti"`.
2. **Kamus Spasial Hiperlokal (*Pre-Mapped Cache*)**: Sebelum melakukan request internet eksternal, sistem memeriksa kamus koordinat lokal yang memuat titik-titik vital di Tangerang Selatan (seperti Kampus Trisakti Bintaro, Pertigaan Pamulang 2, Flyover Ciputat, Pasar Modern BSD). Jika cocok, koordinat langsung dikembalikan dalam waktu 0 milidetik.
3. **OpenStreetMap Nominatim API Fallback**: Jika lokasi tidak ada di kamus lokal, sistem mengirimkan HTTP GET request ke Nominatim API dengan header `User-Agent` resmi proyek:
   `https://nominatim.openstreetmap.org/search?q={entitas}+Tangerang+Selatan&format=json&limit=1`
4. **Pencarian POI Terdekat (*Nearest POI Lookup*)**: Setelah koordinat Latitude dan Longitude diperoleh (misalnya Trisakti di `-6.2845, 106.7330`), sistem melakukan query jarak terdekat ke titik landmark jalan utama atau fasilitas publik di sekitarnya, seperti menyandingkannya dengan titik **Jalan Gatot Subroto (Gatsu)** atau **Jalan Raya Bintaro Utama**. Hasil pemetaan ini disimpan ke kolom `lat`, `lon`, dan `poi` di database `berita` via REST API.

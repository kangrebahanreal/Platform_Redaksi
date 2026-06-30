# Logika Rule-Based Keyword & Action Mapping

Dokumen ini memaparkan arsitektur logika berbasis aturan (*Rule-Based Keyword Mapping*) yang menghubungkan kata kunci peristiwa dalam kalimat berita dengan tindakan spasial otomatis (*Spasial Action*) pada sistem **Project Redaksi**.

---

## Konsep Rule-Based Action

Dalam konsep portal berita *hyper-localize*, warga tidak hanya membutuhkan laporan peristiwa, tetapi juga **solusi atau rekomendasi tindak lanjut yang relevan di sekitar lokasi kejadian**. Oleh karena itu, sistem mengekstrak kata kunci pemicu (*keyword trigger*) dan mengeksekusi aksi otomatis untuk memberikan nilai tambah pada artikel yang dipublikasikan.

---

## Matriks Pemetaan Aturan (Keyword ➔ Action ➔ Output DB)

| Keyword Trigger | Kondisi / Contoh Kalimat Sosmed | Aksi Sistem (*Automated Action*) | Contoh Hasil POI Terdekat yang Disimpan via API ke DB |
| :--- | :--- | :--- | :--- |
| **`lapar`** / **`sarapan`** | *"Lapar malam-malam di Serpong dekat Rawa Buntu"* | Memetakan koordinat entitas lalu mencari daftar Warung / Warteg / Kuliner terdekat dalam radius 500 meter. | `Warteg Bahari Bahagia Pamulang (120 meter)` / `Warung Indomie Sederhana Ciputat` |
| **`macet`** / **`pohon tumbang`** | *"Macet parah di Pamulang 2 karena ada pohon tumbang"* | Mencari jalur rute pengalihan arus lalu lintas atau jalan alternatif terdekat untuk dihindari pengendara. | `Jalan Bukit Indah (Rute Hindari Macet Pamulang - 400 meter)` |
| **`bencana`** / **`banjir`** / **`hujan`** | *"Hujan deras disertai angin kencang di Ciputat"* | Mencari lokasi Posko Siaga Bencana BPBD atau titik penempatan pompa air Pemkot terdekat. | `Posko BPBD Tangsel Siaga Ciputat (300 meter)` |
| **`curanmor`** / **`kriminal`** | *"Waspada curanmor di dekat kampus Trisakti Bintaro"* | Mencari Pos Polisi layanan masyarakat atau Balai Warga terdekat untuk pengamanan lingkungan. | `Pos Polisi Layanan Masyarakat Bintaro (100 meter)` |

---

## Integrasi Penyimpanan via REST API

Sesuai spesifikasi proyek, seluruh hasil pemetaan POI dan koordinat dari *Rule-Based Action* ini **tidak disimpan secara direct/native SQL ke database**, melainkan wajib disalurkan melalui HTTP POST request ke endpoint REST API:
`POST http://localhost:5000/api/berita`

Ketika endpoint menerima muatan JSON berisi kalimat mentah, fungsi backend secara otomatis memanggil `geotag.process_and_save()`, mengisi kolom `lat`, `lon`, serta `poi` dengan string hasil rekomendasi aksi (misalnya: `"Warteg Bahari Bahagia Pamulang (120 meter)"`), sehingga portal web Next.js dapat langsung menampilkan badge penunjuk lokasi POI yang akurat kepada pembaca.

import os
import sqlite3
import datetime
import random
import string

try:
    import psycopg2
    import psycopg2.extras
    PSYCOPG2_AVAILABLE = True
except ImportError:
    PSYCOPG2_AVAILABLE = False

DB_COLO_HOST = "localhost"
DB_COLO_NAME = "Redaksi"
DB_COLO_USER = "postgres"
DB_COLO_PASS = "postgres"

LOCAL_DB_PATH = os.path.join(os.path.dirname(__file__), "db_ews.db")

class DatabaseConfig:
    def __init__(self):
        self.use_sqlite = True
        self.connection = None
        self.connect()
        self.init_db()

    def connect(self):
        if PSYCOPG2_AVAILABLE:
            try:
                self.connection = psycopg2.connect(
                    host=DB_COLO_HOST,
                    database=DB_COLO_NAME,
                    user=DB_COLO_USER,
                    password=DB_COLO_PASS,
                    connect_timeout=3
                )
                self.use_sqlite = False
                print(f"[DB CONFIG] Berhasil terhubung ke database PostgreSQL lokal ('{DB_COLO_NAME}' di {DB_COLO_HOST}).")
                return
            except Exception as e:
                print(f"[DB CONFIG] Gagal terhubung ke PostgreSQL ({e}). Auto-Fallback ke SQLite Lokal: {LOCAL_DB_PATH}")
        
        self.use_sqlite = True
        self.connection = sqlite3.connect(LOCAL_DB_PATH, check_same_thread=False)
        self.connection.row_factory = sqlite3.Row

    def execute_query(self, query, params=(), commit=False):
        try:
            if not self.use_sqlite:
                cursor = self.connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            else:
                cursor = self.connection.cursor()
                query = query.replace("%s", "?")
            cursor.execute(query, params)
            if commit:
                ret_id = None
                if "RETURNING" in query.upper():
                    try:
                        row = cursor.fetchone()
                        if row:
                            ret_id = list(row.values())[0] if isinstance(row, dict) else row[0]
                    except Exception:
                        pass
                self.connection.commit()
                return ret_id if ret_id is not None else cursor.lastrowid
            else:
                try:
                    return [dict(row) for row in cursor.fetchall()]
                except Exception:
                    return []
        except Exception as e:
            print(f"[DB ERROR] Query failed: {query} | Error: {e}")
            self.connect()
            return []

    def init_db(self):
        queries = [
            """
            CREATE TABLE IF NOT EXISTS berita (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                judul TEXT,
                kalimat TEXT,
                artikel TEXT,
                kategori TEXT,
                status TEXT DEFAULT 'PENDING',
                sumber TEXT,
                platform TEXT DEFAULT 'Instagram',
                tanggal TEXT,
                lat REAL,
                lon REAL,
                poi TEXT
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password TEXT,
                role TEXT
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS api_keys (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                api_key TEXT UNIQUE,
                created_at TEXT
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS crawler_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                judul TEXT,
                kalimat TEXT,
                sumber TEXT,
                url TEXT
            );
            """
        ]
        
        for q in queries:
            if not self.use_sqlite:
                q = q.replace("INTEGER PRIMARY KEY AUTOINCREMENT", "SERIAL PRIMARY KEY")
            self.execute_query(q, commit=True)
            
        self.seed_initial_data()

    def seed_initial_data(self):
        users = self.execute_query("SELECT * FROM users")
        if not users:
            seed_users = [
                ("amir", "admin123", "root"),
                ("rangga", "admin123", "root"),
                ("redaksi_user", "user123", "editor")
            ]
            for u in seed_users:
                self.execute_query("INSERT INTO users (username, password, role) VALUES (%s, %s, %s)", u, commit=True)
                
        berita = self.execute_query("SELECT * FROM berita")
        if not berita:
            now = datetime.datetime.now().strftime("%d %B %Y, %H:%M WIB")
            seed_berita = [
                (
                    "[Instagram Trending - Pamulang] Macet Parah Di Pertigaan Pamulang 2 Akibat Pohon Tumbang...",
                    "Ada macet parah di pertigaan Pamulang 2 dekat gapura karena ada pohon tumbang menutupi separuh jalan.",
                    "REDAKSI NEWS AGGREGATOR (PAMULANG) — Berdasarkan pemantauan algoritma terhadap topik populer di platform Instagram Trending pada hari ini, terdeteksi lonjakan percakapan publik terkait situasi di wilayah Pamulang. Liputan utama warga mencatat bahwa: \"Ada macet parah di pertigaan Pamulang 2 dekat gapura karena ada pohon tumbang menutupi separuh jalan.\"\n\nMenanggapi perkembangan isu ini, Sistem Rekomendasi Situasional AI Redaksi melakukan analisis mendalam untuk memberikan panduan tepat guna:\n• Kategori Situasi: Kepadatan Arus Lalu Lintas\n• Tindakan yang Disarankan: Pengendara diimbau berangkat lebih awal atau menunda perjalanan.\n• Solusi / Rute Konkret: Rute Alternatif Disarankan: Alihkan rute melewati Jalan Bukit Indah atau Jalan Raya Puspiptek menuju arah BSD/Serpong.",
                    "Lalu Lintas (Tangsel)",
                    "APPROVED",
                    "IG @infopamulang",
                    "Instagram",
                    now,
                    -6.3421,
                    106.7351,
                    "Pertigaan Pamulang 2 (120m)"
                ),
                (
                    "[Twitter / X Trending - Ciputat] Peringatan Dini Cuaca Ekstrem Hujan Badai Mengguyur Ciputat...",
                    "Hujan deras disertai angin kencang diprediksi mengguyur kawasan Ciputat dan Bintaro malam ini, waspada banjir genangan.",
                    "REDAKSI NEWS AGGREGATOR (CIPUTAT) — Berdasarkan pemantauan algoritma terhadap topik populer di platform Twitter / X Real-time, terdeteksi lonjakan percakapan publik terkait situasi di wilayah Ciputat. Liputan warga mencatat: \"Hujan deras disertai angin kencang diprediksi mengguyur kawasan Ciputat dan Bintaro malam ini, waspada banjir genangan.\"\n\nMenanggapi situasi ini, Sistem Rekomendasi Situasional AI Redaksi memberikan saran darurat:\n• Kategori Situasi: Siaga Cuaca Ekstrem & Bencana Hidrometeorologi\n• Tindakan yang Disarankan: Warga di titik cekungan harap mengamankan dokumen penting ke tempat tinggi.\n• Solusi Konkret: Hindari melintasi underpass atau parkir di bawah pohon besar. Pantau update cuaca BMKG dan catat nomor darurat BPBD Tangsel.",
                    "Cuaca & Bencana",
                    "APPROVED",
                    "𝕏 @TwitterTangsel",
                    "Twitter / X",
                    now,
                    -6.3120,
                    106.7489,
                    "Flyover Ciputat (200m)"
                ),
                (
                    "[TikTok Viral - BSD] Tren Kuliner Malam Sarapan Bubur Ayam Pasar Modern BSD...",
                    "Lapar malam-malam cari sarapan bubur ayam dekat pasar modern BSD yang lagi viral dan ramai dibicarakan.",
                    "REDAKSI NEWS AGGREGATOR (BSD) — Berdasarkan pemantauan algoritma terhadap topik populer di platform TikTok Viral, terdeteksi lonjakan percakapan publik terkait tren kuliner di wilayah BSD. Warga mencatat: \"Lapar malam-malam cari sarapan bubur ayam dekat pasar modern BSD yang lagi viral.\"\n\nMenanggapi tren gaya hidup ini, Sistem Rekomendasi Situasional AI Redaksi menyajikan saran:\n• Kategori Situasi: Tren Kuliner & Ekonomi Lokal\n• Tindakan yang Disarankan: Kunjungi sentra kuliner atau bazaar UMKM yang sedang viral untuk mendukung ekonomi lokal.\n• Solusi Konkret: Rekomendasi Terbaik: Sentra Kuliner Pasar Modern BSD atau Warung Bahari terdekat. Gunakan pembayaran non-tunai (QRIS).",
                    "Kuliner & Gaya Hidup",
                    "APPROVED",
                    "TikTok @bsd_foodie",
                    "TikTok",
                    now,
                    -6.3015,
                    106.6820,
                    "Pasar Modern BSD (80m)"
                ),
                (
                    "[Instagram Trending - Bintaro] Waspada Modus Curanmor Di Kawasan Parkir Bintaro Sektor 7...",
                    "Waspada marak modus curanmor di sekitar kawasan parkir Bintaro Sektor 7, selalu pastikan pasang kunci ganda kendaraan anda.",
                    "REDAKSI NEWS AGGREGATOR (BINTARO) — Berdasarkan pemantauan algoritma terhadap topik populer di platform Instagram Trending, terdeteksi lonjakan percakapan publik terkait keamanan di wilayah Bintaro. Laporan warga mencatat: \"Waspada marak modus curanmor di sekitar kawasan parkir Bintaro Sektor 7.\"\n\nMenanggapi situasi keamanan ini, Sistem Rekomendasi Situasional AI Redaksi merekomendasikan:\n• Kategori Situasi: Keamanan & Ketertiban Lingkungan\n• Tindakan yang Disarankan: Pengendara roda dua maupun roda empat yang parkir di area publik diimbau memasang kunci ganda atau alarm pengaman.\n• Solusi Konkret: Aktifkan kembali siskamling lingkungan. Segera laporkan aktivitas mencurigakan melalui layanan Call Center 110 atau Pos Polisi terdekat.",
                    "Keamanan & Warga",
                    "APPROVED",
                    "IG @bintaroupdate",
                    "Instagram",
                    now,
                    -6.2845,
                    106.7330,
                    "Bintaro Sektor 7 (150m)"
                ),
                (
                    "[Twitter / X Trending - Tangsel] Lonjakan Kasus Flu & ISPA Akibat Perubahan Cuaca Ekstrem...",
                    "Banyak warga demam dan batuk flu akibat polusi dan pergantian cuaca di Tangerang Selatan, jangan lupa minum vitamin.",
                    "REDAKSI NEWS AGGREGATOR (TANGSEL) — Berdasarkan pemantauan algoritma terhadap topik populer di platform Twitter / X Real-time, terdeteksi lonjakan pembahasan terkait kesehatan publik di Tangerang Selatan. Laporan mencatat: \"Banyak warga demam dan batuk flu akibat polusi dan pergantian cuaca.\"\n\nMenanggapi situasi kesehatan medis ini, Sistem Rekomendasi Situasional AI Redaksi menyarankan:\n• Kategori Situasi: Kesehatan Masyarakat & Kualitas Udara\n• Tindakan yang Disarankan: Warga disarankan mengenakan masker KF94/KN95 saat beraktivitas di luar ruangan.\n• Solusi Konkret: Perbanyak asupan air putih & vitamin C. Segera kunjungi Puskesmas atau RSUD Tangerang Selatan terdekat jika gejala berlanjut.",
                    "Kesehatan & Medis",
                    "APPROVED",
                    "𝕏 @KemenkesTangsel",
                    "Twitter / X",
                    now,
                    -6.3200,
                    106.7100,
                    "RSUD Tangerang Selatan (300m)"
                )
            ]
            for b in seed_berita:
                self.execute_query(
                    "INSERT INTO berita (judul, kalimat, artikel, kategori, status, sumber, platform, tanggal, lat, lon, poi) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                    b, commit=True
                )

        crawlers = self.execute_query("SELECT * FROM crawler_data")
        if not crawlers:
            seed_crawler = [
                ("Pohon Tumbang Pamulang 2 Bikin Macet", "Arus lalu lintas tersendat akibat dahan pohon patah di Pamulang Barat.", "DetikNews", "https://news.detik.com/pamulang-macet"),
                ("Wisuda Trisakti Bintaro Padat Merayap", "Kepadatan kendaraan di depan kampus Trisakti Bintaro Sektor 7.", "Kompas.com", "https://kompas.com/bintaro-padat"),
                ("Peringatan Cuaca Ekstrem Tangsel Hujan Badai", "BMKG memperingatkan potensi hujan lebat disertai angin di Ciputat malam ini.", "DetikNews", "https://news.detik.com/cuaca-tangsel"),
                ("Sentra Kuliner Pasar Modern BSD Diserbu Warga", "Ragam kuliner sarapan malam dan bubur ayam menjadi viral di TikTok.", "Kompas.com", "https://kompas.com/kuliner-bsd"),
                ("Polisi Amankan Komplotan Curanmor Bintaro", "Polres Tangsel mengingatkan warga untuk rutin menggunakan kunci ganda.", "DetikNews", "https://news.detik.com/curanmor-bintaro")
            ]
            for c in seed_crawler:
                self.execute_query("INSERT INTO crawler_data (judul, kalimat, sumber, url) VALUES (%s, %s, %s, %s)", c, commit=True)

db = DatabaseConfig()

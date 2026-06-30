from db_config import db

def seed_knowledge_base():
    pk = "SERIAL PRIMARY KEY" if not db.use_sqlite else "INTEGER PRIMARY KEY AUTOINCREMENT"
    db.execute_query(f'''
    CREATE TABLE IF NOT EXISTS pengetahuan_ai (
        id {pk},
        kategori TEXT NOT NULL,
        wilayah TEXT NOT NULL,
        kata_kunci TEXT NOT NULL,
        judul TEXT NOT NULL,
        konten TEXT NOT NULL,
        saran_ai TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''', commit=True)
    
    # Bersihkan data lama agar tidak duplikat saat seeding ulang
    db.execute_query('DELETE FROM pengetahuan_ai', commit=True)
    
    # 2. Dataset Pengetahuan AI (Knowledge Base)
    dataset = [
        # --- KULINER & NGOPI ---
        (
            'KULINER', 'BINTARO', 
            'ngopi,kopi,cafe,kafe,makan,lapar,kuliner,sarapan,warung,resto,restoran,nongkrong,wfc',
            '🥣 Rekomendasi Tempat Ngopi & Kuliner Terbaik di Bintaro',
            '1. Kopi Manyar (Sektor 9) — Ruang terbuka yang artistik, tenang, dan sangat nyaman untuk WFC.\n2. Lot 9 Bintaro — Memiliki halaman hijau yang luas dan menyajikan hidangan Nusantara autentik.\n3. Toko Kopi Tuku & Saudagar Kopi Bintaro — Spot kopi susu terfavorit warga.',
            '💡 Saran AI: Datanglah sore hari sekitar pukul 16:00 WIB untuk suasana terbaik dan gunakan transaksi non-tunai (QRIS).'
        ),
        (
            'KULINER', 'PAMULANG', 
            'ngopi,kopi,cafe,kafe,makan,lapar,kuliner,sarapan,warung,resto,restoran,nongkrong,padang,sate,bakso',
            '🥣 Rekomendasi Tempat Ngopi & Kuliner Terbaik di Pamulang',
            '1. Kebun Latte Pamulang — Suasana ngopi teduh di bawah rimbunan pohon jati yang sejuk.\n2. Kopi Daong & Sentra Kuliner Pamulang 2 — Pilihan beragam dengan harga ramah kantong.\n3. Warung Makan Padang & Sate Kambing Muda Pamulang — Pilihan santap siang bergizi tinggi.',
            '💡 Saran AI: Hindari parkir di tepi jalan utama saat jam sibuk agar tidak menimbulkan antrean kendaraan.'
        ),
        (
            'KULINER', 'CIPUTAT', 
            'ngopi,kopi,cafe,kafe,makan,lapar,kuliner,sarapan,warung,resto,restoran,nongkrong',
            '🥣 Rekomendasi Tempat Ngopi & Kuliner Terbaik di Ciputat',
            '1. Taman Kuliner Ciputat & Area Sekitar Kampus UIN — Pusat jajanan mahasiswa yang terjangkau dan lezat.\n2. Kopi Kenangan & Janji Jiwa Ciputat Raya — Spot ngopi cepat dan praktis.\n3. Warung Sate Madura & Soto Betawi H. Mamat Ciputat.',
            '💡 Saran AI: Gunakan transportasi online jika berkunjung di malam minggu karena keterbatasan lahan parkir.'
        ),
        (
            'KULINER', 'BSD', 
            'ngopi,kopi,cafe,kafe,makan,lapar,kuliner,sarapan,warung,resto,restoran,nongkrong',
            '🥣 Rekomendasi Tempat Ngopi & Kuliner Terbaik di BSD / Serpong',
            '1. Sentra Kuliner Pasar Modern BSD — Pusat jajanan legendaris mulai dari sarapan hingga makan malam.\n2. The Loop & Kumulo Creative Compound BSD — Spot nongkrong estetik bergaya modern outdoor.\n3. Warung Kharisma Bahari & Restoran Nusantara BSD.',
            '💡 Saran AI: Area BSD sangat ramah pejalan kaki dan bersepeda, manfaatkan fasilitas parkir resmi yang tersedia.'
        ),
        (
            'KULINER', 'TANGSEL', 
            'ngopi,kopi,cafe,kafe,makan,lapar,kuliner,sarapan,warung,resto,restoran,nongkrong',
            '🥣 Rekomendasi Tempat Ngopi & Kuliner Pilihan Redaksi AI Tangsel',
            '1. Kopi Manyar & Lot 9 (Bintaro Sektor 9) — Pilihan utama untuk suasana asri dan nyaman.\n2. Kebun Latte (Pamulang) — Sensasi ngopi di tengah kebun jati alami.\n3. Sentra Kuliner Pasar Modern (BSD) — Surga kuliner terlengkap di Tangerang Selatan.',
            '💡 Saran AI: Selalu pantau ulasan kebersihan higienis tempat makan dan gunakan pembayaran non-tunai.'
        ),
        
        # --- LALU LINTAS & RUTE ---
        (
            'LALIN', 'PAMULANG', 
            'macet,lalin,rute,jalan,lalu lintas,antrean,kendaraan,motor,mobil',
            '🚗 Pantauan Lalu Lintas & Rute Pamulang',
            'Terpantau adanya kepadatan antrean kendaraan di pertigaan Pamulang 2 dan sekitar gapura utama dekat Kampus UNPAM akibat volume kendaraan sore hari.',
            '💡 Saran Rute AI: Alihkan kendaraan Anda melewati Jalan Bukit Indah atau Jalan Merpati Raya untuk menghemat waktu perjalanan 15-20 menit.'
        ),
        (
            'LALIN', 'CIPUTAT', 
            'macet,lalin,rute,jalan,lalu lintas,antrean,kendaraan,motor,mobil,flyover',
            '🚗 Pantauan Lalu Lintas & Rute Ciputat',
            'Terjadi pelambatan arus lalu lintas di bawah kolong Flyover Ciputat arah Pasar Jumat / Lebak Bulus.',
            '💡 Saran Rute AI: Gunakan jalur alternatif melewati Jalan Juanda atau masuk melalui kawasan Bintaro Utama.'
        ),
        (
            'LALIN', 'BINTARO', 
            'macet,lalin,rute,jalan,lalu lintas,antrean,kendaraan,motor,mobil',
            '🚗 Pantauan Lalu Lintas & Rute Bintaro',
            'Arus lalu lintas di Boulevard Bintaro Jaya Sektor 7 dan Sektor 9 terpantau ramai lancar. Kepadatan sesaat terjadi di perlintasan stasiun KRL Pondok Ranji.',
            '💡 Saran Rute AI: Gunakan Tol Lingkar Luar (JORR) atau hindari perlintasan sebidang kereta api pada jam sibuk 17:00 - 19:00 WIB.'
        ),
        (
            'LALIN', 'BSD', 
            'macet,lalin,rute,jalan,lalu lintas,antrean,kendaraan,motor,mobil',
            '🚗 Pantauan Lalu Lintas & Rute BSD / Serpong',
            'Kondisi lalu lintas di jalan utama Boulevard BSD dan sekitar AEON Mall terpantau lancar. Sedikit antrean di lampu merah Cisauk.',
            '💡 Saran Rute AI: Manfaatkan Intermoda BSD atau KRL rute Rangkasbitung - Tanah Abang untuk perjalanan bebas macet.'
        ),
        
        # --- CUACA & BANJIR ---
        (
            'CUACA', 'TANGSEL', 
            'cuaca,hujan,banjir,bmkg,badai,panas,mendung,prakiraan,suhu',
            '⛈️ Radar Cuaca & Bencana Redaksi AI Tangsel',
            'Berdasarkan pantauan satelit BMKG, wilayah Tangerang Selatan dan sekitarnya diprakirakan mengalami kondisi berawan hingga hujan lebat disertai petir pada sore/malam hari.',
            '💡 Saran AI: Siapkan payung/jas hujan dan hindari memarkir kendaraan di bawah pohon besar atau papan reklame yang rawan tumbang.'
        ),
        
        # --- KESEHATAN ---
        (
            'KESEHATAN', 'TANGSEL', 
            'flu,sakit,kesehatan,demam,ispa,batuk,rumah sakit,puskesmas,dokter,rsud,bpjs',
            '🏥 Asisten Kesehatan Warga Tangsel',
            'Terdeteksi peningkatan tren keluhan batuk dan flu di masyarakat akibat pergantian cuaca pancaroba yang ekstrem. Layanan IGD RSUD Tangsel dan Puskesmas beroperasi 24 jam.',
            '💡 Saran AI: Gunakan masker saat beraktivitas di kerumunan publik, perbanyak minum air putih hangat, dan konsumsi vitamin C harian.'
        ),
        
        # --- VERIFIKASI FAKTA & HOAKS ---
        (
            'HOAX', 'ALL', 
            'hoax,hoaks,bohong,fakta,cek,valid,kebenaran,verifikasi,penipuan,fitnah',
            '🚨 Radar Anti-Hoaks Redaksi AI',
            'Sistem kami memvalidasi setiap laporan netizen secara real-time dengan mencocokkannya langsung ke rilis resmi DetikNews dan Kompas.com serta klarifikasi pihak berwenang.',
            '💡 Saran AI: Semua liputan yang memiliki stempel hijau Terverifikasi Anti-Hoaks di dasbor telah teruji keakuratan faktanya!'
        )
    ]
    
    for item in dataset:
        db.execute_query('''
            INSERT INTO pengetahuan_ai (kategori, wilayah, kata_kunci, judul, konten, saran_ai)
            VALUES (%s, %s, %s, %s, %s, %s)
        ''', item, commit=True)
    
    db_type = "PostgreSQL 'Redaksi'" if not db.use_sqlite else "SQLite Lokal"
    print(f"[SEED SUCCESS] Berhasil menanamkan {len(dataset)} baris knowledge base ke tabel 'pengetahuan_ai' di {db_type}.")

if __name__ == '__main__':
    seed_knowledge_base()

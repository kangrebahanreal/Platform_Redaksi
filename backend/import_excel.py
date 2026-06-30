import os
import datetime
import pandas as pd
from db_config import db

EXCEL_SAMPLE_PATH = os.path.join(os.path.dirname(__file__), "data_sosmed_sample.xlsx")

def generate_sample_excel():
    """
    Membuat file Excel sampel berisi data karangan/simulasi seolah-olah ditarik dari IG/Tiktok.
    """
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    data = [
        {
            "tanggal": now,
            "kalimat": "Ada kecelakaan ringan di flyover Ciputat arah Lebak Bulus pagi ini, tetap hati-hati berkendara.",
            "artikel": "Terjadi kecelakaan lalu lintas ringan yang melibatkan roda dua di Flyover Ciputat menuju Lebak Bulus. Warga Tangerang Selatan diminta berhati-hati dan menjaga jarak aman saat berkendara.",
            "kategori": "Lokal (Tangsel)",
            "status": "APPROVED",
            "sumber": "IG @ciputat24jam",
            "lat": -6.3119,
            "lon": 106.7381,
            "poi": "Flyover Ciputat"
        },
        {
            "tanggal": now,
            "kalimat": "Peringatan dini BMKG: cuaca panas ekstrem di BSD dan Pamulang mencapai 35 derajat celcius hari ini.",
            "artikel": "Badan Meteorologi menyampaikan peringatan cuaca panas ekstrem yang melanda kawasan BSD dan Pamulang hingga menyentuh angka 35 derajat celcius. Masyarakat dianjurkan banyak mengonsumsi air putih agar tidak dehidrasi.",
            "kategori": "Lokal (Tangsel)",
            "status": "APPROVED",
            "sumber": "TikTok @bsd.update",
            "lat": -6.3082,
            "lon": 106.6875,
            "poi": "Kawasan BSD City"
        },
        {
            "tanggal": now,
            "kalimat": "Lapar malam-malam di Serpong? Ada rekomendasi nasi goreng gerobak enak dekat stasiun Rawa Buntu.",
            "artikel": "Bagi warga Serpong yang mencari kuliner malam, kawasan sekitar Stasiun Rawa Buntu menyimpan aneka pilihan hidangan lezat seperti nasi goreng gerobak khas yang siap memanjakan lidah Anda.",
            "kategori": "Lokal (Tangsel)",
            "status": "PENDING",
            "sumber": "IG @kulinerserpong",
            "lat": -6.3210,
            "lon": 106.6815,
            "poi": "Stasiun Rawa Buntu"
        }
    ]
    df = pd.DataFrame(data)
    df.to_excel(EXCEL_SAMPLE_PATH, index=False)
    print(f"[EXCEL LOADER] Berhasil membuat sampel Excel di: {EXCEL_SAMPLE_PATH}")
    return EXCEL_SAMPLE_PATH

def import_excel_to_db(file_path=None):
    """
    Membaca file Excel dan memasukkannya ke database server (Colo PostgreSQL / Lokal).
    """
    if not file_path or not os.path.exists(file_path):
        file_path = EXCEL_SAMPLE_PATH
        if not os.path.exists(file_path):
            generate_sample_excel()

    print(f"[EXCEL LOADER] Membaca file Excel: {file_path}...")
    df = pd.read_excel(file_path)
    
    inserted = 0
    for idx, row in df.iterrows():
        # Cek apakah kalimat sudah ada
        existing = db.execute_query("SELECT id FROM berita WHERE kalimat = %s", (str(row["kalimat"]),))
        if not existing:
            query = """INSERT INTO berita (tanggal, kalimat, artikel, kategori, status, sumber, lat, lon, poi) 
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"""
            params = (
                str(row.get("tanggal", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))),
                str(row["kalimat"]),
                str(row.get("artikel", row["kalimat"])),
                str(row.get("kategori", "Lokal (Tangsel)")),
                str(row.get("status", "APPROVED")),
                str(row.get("sumber", "Excel Import")),
                float(row.get("lat", -6.3265)) if pd.notnull(row.get("lat")) else None,
                float(row.get("lon", 106.7248)) if pd.notnull(row.get("lon")) else None,
                str(row.get("poi", "Wilayah Tangsel")) if pd.notnull(row.get("poi")) else None
            )
            db.execute_query(query, params, commit=True)
            inserted += 1

    result_msg = f"Berhasil mengimpor {inserted} data baru dari Excel ke Database."
    print(f"[EXCEL LOADER] {result_msg}")
    return {"status": "SUCCESS", "message": result_msg, "inserted_count": inserted}

if __name__ == "__main__":
    import_excel_to_db()

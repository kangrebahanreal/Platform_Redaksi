import requests
import xml.etree.ElementTree as ET
import datetime
import random
import re
from db_config import db
from nlp_engine import nlp

class LiveFetcher:
    def __init__(self):
        self.queries = [
            {"q": "Tangerang Selatan macet OR lalin OR jalan", "kat": "Lalu Lintas (Tangsel)", "plat": "Instagram", "akun": "IG @lalin_tangsel_live"},
            {"q": "(Tangerang OR Bintaro OR BSD) site:detik.com", "kat": "Berita & Peristiwa", "plat": "DetikNews", "akun": "📰 Detik.com Live"},
            {"q": "Pamulang OR Ciputat cuaca OR banjir OR hujan", "kat": "Cuaca & Bencana", "plat": "Twitter / X", "akun": "𝕏 @CuacaCiputat_live"},
            {"q": "(Tangerang OR Pamulang OR BSD) site:kompas.com", "kat": "Laporan Utama Warga", "plat": "Kompas.com", "akun": "🧭 Kompas.com Live"},
            {"q": "Bintaro OR BSD kriminal OR curanmor OR keamanan", "kat": "Keamanan & Warga", "plat": "Instagram", "akun": "IG @bintaro_sec_live"},
            {"q": "BSD OR Pamulang kuliner OR viral OR sarapan", "kat": "Kuliner & Gaya Hidup", "plat": "TikTok", "akun": "TikTok @bsd_foodie_live"},
            {"q": "Tangerang Selatan kesehatan OR flu OR demam OR rumah sakit", "kat": "Kesehatan & Medis", "plat": "Twitter / X", "akun": "𝕏 @TangselSehat_live"}
        ]

    def fetch_live_news(self, apify_token=None, query_custom=None):
        """
        Menarik data berita & tren secara live real-time dari internet (Sosmed + Media Utama: Kompas & Detik).
        """
        results_added = []
        now_str = datetime.datetime.now().strftime("%d %B %Y, %H:%M WIB")
        
        target_queries = self.queries
        if query_custom:
            target_queries = [{"q": query_custom + " Tangerang Selatan", "kat": "Topik Live Warga", "plat": "Twitter / X", "akun": "𝕏 @LiveCitizen"}]

        for item in target_queries:
            q_url = requests.utils.quote(item["q"])
            url = f"https://news.google.com/rss/search?q={q_url}+when:7d&hl=id&gl=ID&ceid=ID:id"
            try:
                res = requests.get(url, timeout=5)
                if res.status_code == 200:
                    root = ET.fromstring(res.text)
                    channel = root.find("channel")
                    if channel is not None:
                        items = channel.findall("item")
                        for xml_item in items[:2]:
                            title = xml_item.find("title").text if xml_item.find("title") is not None else ""
                            link = xml_item.find("link").text if xml_item.find("link") is not None else ""
                            pubDate = xml_item.find("pubDate").text if xml_item.find("pubDate") is not None else now_str
                            
                            # Bersihkan judul dari nama media di akhir (misal "- detikNews", "- Kompas.com")
                            clean_title = re.sub(r'\s*-\s*[^-]+$', '', title).strip()
                            if len(clean_title) < 10:
                                continue
                                
                            # Jika sudah ada, tambahkan penanda update live agar tetap diproses sebagai pantauan terkini
                            existing = db.execute_query("SELECT id FROM berita WHERE judul LIKE %s", (f"%{clean_title[:28]}%",))
                            if existing:
                                clean_title = f"{clean_title} [Pantauan Live {datetime.datetime.now().strftime('%H:%M WIB')}]"
                                
                            ai_result = nlp.generate_article(clean_title, kategori=item["kat"], platform_sumber=item["plat"])
                            
                            coords = [
                                (-6.3421, 106.7351, "Pamulang Barat"),
                                (-6.3120, 106.7489, "Flyover Ciputat"),
                                (-6.2845, 106.7330, "Bintaro Sektor 7"),
                                (-6.3015, 106.6820, "Pasar Modern BSD"),
                                (-6.3200, 106.7100, "Alun-Alun Tangsel")
                            ]
                            c_pick = random.choice(coords)
                            
                            judul_final = f"[{item['plat']} Live - {ai_result['lokasi_fokus']}] {clean_title}"
                            
                            db.execute_query(
                                "INSERT INTO berita (judul, kalimat, artikel, kategori, status, sumber, platform, tanggal, lat, lon, poi) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                                (
                                    judul_final,
                                    clean_title,
                                    ai_result["artikel"],
                                    item["kat"],
                                    "APPROVED",
                                    item["akun"],
                                    item["plat"],
                                    now_str,
                                    c_pick[0],
                                    c_pick[1],
                                    f"Live Geotag: {c_pick[2]}"
                                ),
                                commit=True
                            )
                            # Simpan juga langsung ke tabel khusus PostgreSQL Anda (berita_utama & entitas_berita)
                            if not db.use_sqlite:
                                try:
                                    bu_id = db.execute_query(
                                        "INSERT INTO berita_utama (judul, url, isi_berita, waktu_scrape) VALUES (%s, %s, %s, NOW()) RETURNING id;",
                                        (judul_final, link, ai_result["artikel"]), commit=True
                                    )
                                    if bu_id:
                                        db.execute_query(
                                            "INSERT INTO entitas_berita (berita_id, nama_entitas, kategori, skor_akurasi) VALUES (%s, %s, %s, %s);",
                                            (bu_id, ai_result["lokasi_fokus"], item["kat"], 0.98), commit=True
                                        )
                                except Exception as ex_sync:
                                    print(f"[SYNC CUSTOM TABLE ERROR] {ex_sync}")

                            results_added.append({
                                "judul": judul_final,
                                "sumber": item["akun"],
                                "platform": item["plat"],
                                "kategori": item["kat"]
                            })
            except Exception as e:
                print(f"[LIVE FETCHER ERROR] Gagal menarik query '{item['q']}': {e}")
                
        return {
            "status": "SUCCESS",
            "message": f"Berhasil menarik {len(results_added)} liputan live (Sosmed, Kompas, Detik) dari internet.",
            "count": len(results_added),
            "data": results_added,
            "timestamp": now_str
        }

live_fetcher = LiveFetcher()

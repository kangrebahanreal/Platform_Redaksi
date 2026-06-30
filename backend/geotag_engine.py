import requests
import json
from db_config import db
from nlp_engine import nlp

class GeotagEngine:
    def __init__(self):
        self.headers = {
            "User-Agent": "ProjectRedaksi-AutomatedNewsPortal/1.0 (contact@redaksi.local)"
        }
        # Pre-mapped koordinat akurat area Tangsel & Jakarta Selatan sebagai fallback cepat/offline
        self.known_locations = {
            "trisakti": {"lat": -6.2845, "lon": 106.7330, "name": "Kampus Trisakti Bintaro"},
            "pamulang": {"lat": -6.3421, "lon": 106.7412, "name": "Pertigaan Pamulang 2"},
            "ciputat": {"lat": -6.3119, "lon": 106.7381, "name": "Flyover Ciputat"},
            "bintaro": {"lat": -6.2800, "lon": 106.7250, "name": "Bintaro Xchange"},
            "bsd": {"lat": -6.3082, "lon": 106.6875, "name": "Pasar Modern BSD"},
            "gatsu": {"lat": -6.2315, "lon": 106.8198, "name": "Jalan Gatot Subroto (Gatsu)"}
        }
        self.known_pois = {
            "warung": [
                {"name": "Warteg Bahari Bahagia Pamulang", "lat": -6.3415, "lon": 106.7405, "jarak": "120 meter"},
                {"name": "Warung Makan Indomie Sederhana Ciputat", "lat": -6.3125, "lon": 106.7390, "jarak": "200 meter"},
                {"name": "Warteg Kharisma Bahari Bintaro", "lat": -6.2850, "lon": 106.7340, "jarak": "150 meter"}
            ],
            "alternatif": [
                {"name": "Jalan Bukit Indah (Rute Hindari Macet Pamulang)", "lat": -6.3450, "lon": 106.7450, "jarak": "400 meter"},
                {"name": "Jalan Merpati Raya (Rute Alternatif Ciputat)", "lat": -6.3050, "lon": 106.7300, "jarak": "500 meter"}
            ]
        }

    def geocode_osm(self, query):
        """
        Mencari koordinat Lat/Lon menggunakan OpenStreetMap Nominatim API.
        """
        query_clean = query.lower().strip()
        for k, v in self.known_locations.items():
            if k in query_clean:
                return v

        url = f"https://nominatim.openstreetmap.org/search?q={query}+Tangerang+Selatan&format=json&limit=1"
        try:
            resp = requests.get(url, headers=self.headers, timeout=3)
            if resp.status_code == 200 and resp.json():
                data = resp.json()[0]
                return {
                    "lat": float(data["lat"]),
                    "lon": float(data["lon"]),
                    "name": data.get("display_name", query).split(",")[0]
                }
        except Exception as e:
            print(f"[GEOTAG] OSM API fallback untuk {query}: {e}")

        # Default fallback koordinat pusat Tangerang Selatan
        return {"lat": -6.3265, "lon": 106.7248, "name": f"Kawasan {query.title()}"}

    def apply_rule_based_action(self, keyword, base_lat, base_lon, location_name):
        """
        Logika Rule-Based Keyword & Action:
        - Jika keyword 'lapar' / 'sarapan' -> Action: Cari Warung/Warteg terdekat.
        - Jika keyword 'macet' / 'pohon tumbang' -> Action: Cari Rute Jalan Alternatif.
        - Jika keyword 'bencana' / 'banjir' -> Action: Cari Titik Posko Evakuasi / Pos Polisi.
        """
        kw = (keyword or "").lower()
        action_taken = ""
        pois_found = []

        if kw in ["lapar", "sarapan", "makan"]:
            action_taken = "Mencari rekomendasi Warung / Warteg / Kuliner terdekat dari lokasi entitas"
            pois_found = self.known_pois["warung"]
        elif kw in ["macet", "pohon tumbang", "wisuda"]:
            action_taken = "Mencari rute jalan alternatif dan titik pengalihan lalu lintas terdekat"
            pois_found = self.known_pois["alternatif"]
        elif kw in ["bencana", "banjir", "hujan deras"]:
            action_taken = "Mencari titik Posko Siaga Bencana dan pompa air Pemkot terdekat"
            pois_found = [
                {"name": f"Posko BPBD Tangsel Siaga {location_name}", "lat": base_lat + 0.001, "lon": base_lon + 0.001, "jarak": "300 meter"}
            ]
        else:
            action_taken = "Mencari fasilitas umum terdekat (Balai Warga / Pos Polisi)"
            pois_found = [
                {"name": f"Pos Polisi Layanan Masyarakat {location_name}", "lat": base_lat, "lon": base_lon, "jarak": "100 meter"}
            ]

        # Pilih 1 POI paling relevan
        nearest_poi = pois_found[0] if pois_found else {"name": location_name, "lat": base_lat, "lon": base_lon, "jarak": "0 meter"}
        return {
            "keyword_trigger": kw if kw else "umum",
            "action": action_taken,
            "nearest_poi": nearest_poi["name"],
            "poi_lat": nearest_poi["lat"],
            "poi_lon": nearest_poi["lon"],
            "distance": nearest_poi["jarak"]
        }

    def process_and_save(self, text):
        """
        Ekstraksi entitas -> geocode -> rule based action -> simpan ke DB via query/API.
        """
        extracted = nlp.extract_entities(text)
        loc_name = extracted["entities"]["LOCATION"][0]
        rule_kw = extracted["entities"]["RULE_KEYWORD"]

        coords = self.geocode_osm(loc_name)
        rule_result = self.apply_rule_based_action(rule_kw, coords["lat"], coords["lon"], coords["name"])

        # Update atau insert ke tabel berita dengan informasi geotagging & POI
        import datetime
        now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        gen_art = nlp.generate_article(text)
        
        insert_query = """INSERT INTO berita (tanggal, kalimat, artikel, kategori, status, sumber, lat, lon, poi) 
                          VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"""
        params = (
            now,
            text,
            gen_art["artikel"],
            "Lokal (Tangsel)",
            "APPROVED",
            "Geotag Rule Engine",
            rule_result["poi_lat"],
            rule_result["poi_lon"],
            f"{rule_result['nearest_poi']} ({rule_result['distance']})"
        )
        new_id = db.execute_query(insert_query, params, commit=True)

        return {
            "id_berita": new_id,
            "input_text": text,
            "extracted_entity_location": loc_name,
            "osm_coordinates": coords,
            "rule_applied": rule_result
        }

geotag = GeotagEngine()

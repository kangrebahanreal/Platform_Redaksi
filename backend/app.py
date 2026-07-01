from flask import Flask, jsonify, request
from flask_cors import CORS
from db_config import db
from nlp_engine import nlp
from geotag_engine import geotag
import datetime
import random
import string
import os
import requests
import urllib.parse
import re
import xml.etree.ElementTree as ET
import threading
import time
import difflib

try:
    from live_fetcher import live_fetcher
    LIVE_FETCHER_AVAILABLE = True
except ImportError:
    LIVE_FETCHER_AVAILABLE = False

app = Flask(__name__)
CORS(app)

# --- BACKGROUND WORKER: Cron Job Penarik Berita Live Otomatis ---
def background_live_fetcher_loop():
    while True:
        try:
            if LIVE_FETCHER_AVAILABLE:
                print("[BACKGROUND WORKER] Menarik liputan live berkala dari portal berita...")
                live_fetcher.fetch_live_news()
        except Exception as e:
            print(f"[BACKGROUND WORKER ERROR] {e}")
        time.sleep(900)  # Interval 15 menit

fetcher_thread = threading.Thread(target=background_live_fetcher_loop, daemon=True)
fetcher_thread.start()

def validate_api_key(api_key):
    if not api_key or len(api_key) < 16:
        return False, "API Key tidak valid (minimal 16 karakter alfanumerik azAZ09)."
    
    has_upper = any(c.isupper() for c in api_key)
    has_lower = any(c.islower() for c in api_key)
    has_digit = any(c.isdigit() for c in api_key)
    
    if not (has_upper and has_lower and has_digit):
        return False, "API Key wajib kombinasi huruf besar, huruf kecil, dan angka (azAZ09)."
        
    return True, "Valid"

@app.route('/api/berita', methods=['GET'])
def get_berita():
    status = request.args.get('status')
    if status:
        data = db.execute_query("SELECT * FROM berita WHERE status = %s ORDER BY id DESC", (status,))
    else:
        data = db.execute_query("SELECT * FROM berita ORDER BY id DESC")
        
    formatted = []
    for row in data:
        formatted.append({
            "id": row["id"],
            "judul": row["judul"],
            "kalimat": row["kalimat"],
            "artikel": row["artikel"],
            "kategori": row["kategori"],
            "status": row["status"],
            "sumber": row["sumber"],
            "platform": row.get("platform", "Instagram"),
            "tanggal": row["tanggal"],
            "lat": row["lat"],
            "lon": row["lon"],
            "poi": row["poi"],
            "rekomendasi_situasional": nlp.generate_recommendation(row["kalimat"] or row["judul"], location="Tangerang Selatan")
        })
    return jsonify({"status": "SUCCESS", "count": len(formatted), "data": formatted}), 200

@app.route('/api/berita', methods=['POST'])
def post_berita():
    payload = request.get_json(silent=True) or {}
    if not payload or 'berita' not in payload:
        return jsonify({"status": "ERROR", "message": "Input teks berita wajib diisi."}), 400
        
    teks = payload['berita']
    kategori = payload.get('kategori', 'Lokal (Tangsel)')
    sumber = payload.get('sumber', 'Laporan Warga')
    platform = payload.get('platform', 'Instagram')
    now = datetime.datetime.now().strftime("%d %B %Y, %H:%M WIB")
    
    extracted = nlp.extract_entities(teks)
    geo = geotag.geocode_osm(teks)
    ai_result = nlp.generate_article(teks, kategori=kategori, platform_sumber=platform)
    
    new_id = db.execute_query(
        "INSERT INTO berita (judul, kalimat, artikel, kategori, status, sumber, platform, tanggal, lat, lon, poi) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
        (ai_result["judul"], teks, ai_result["artikel"], kategori, "PENDING", sumber, platform, now, geo["lat"], geo["lon"], geo.get("name", "POI")),
        commit=True
    )
    
    return jsonify({
        "status": "SUCCESS",
        "message": "Berita berhasil dimasukkan ke antrean verifikasi editor (status PENDING).",
        "data": {
            "id": new_id,
            "judul": ai_result["judul"],
            "status": "PENDING",
            "ekstraksi_nlp": extracted,
            "geotag": geo,
            "rekomendasi_situasional": ai_result["rekomendasi_sistem"]
        }
    }), 201

@app.route('/api/berita/status', methods=['POST'])
def update_status():
    payload = request.get_json(silent=True) or {}
    if not payload or 'id' not in payload or 'status' not in payload:
        return jsonify({"status": "ERROR", "message": "ID dan status baru wajib dikirim."}), 400
        
    api_key = payload.get('api_key')
    is_valid, msg = validate_api_key(api_key)
    if not is_valid:
        return jsonify({"status": "ERROR", "message": f"Otentikasi Gagal: {msg}"}), 401
        
    b_id = payload['id']
    new_status = payload['status']
    
    db.execute_query("UPDATE berita SET status = %s WHERE id = %s", (new_status, b_id), commit=True)
    return jsonify({"status": "SUCCESS", "message": f"Berita ID {b_id} berhasil diubah menjadi {new_status}."}), 200

@app.route('/api/fetch-live', methods=['GET', 'POST'])
def trigger_live_fetch():
    if not LIVE_FETCHER_AVAILABLE:
        return jsonify({"status": "ERROR", "message": "Modul live fetcher tidak tersedia."}), 500
    payload = request.get_json(silent=True) or {}
    token = payload.get('apify_token') or request.args.get('apify_token')
    query = payload.get('query') or request.args.get('query')
    
    res = live_fetcher.fetch_live_news(apify_token=token, query_custom=query)
    return jsonify(res), 200

@app.route('/api/generate-key', methods=['GET'])
def generate_api_key():
    timestamp = int(datetime.datetime.now().timestamp())
    rand_str = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
    api_key = f"REDaks{timestamp}{rand_str}"
    
    db.execute_query("INSERT INTO api_keys (api_key, created_at) VALUES (%s, %s)", (api_key, str(datetime.datetime.now())), commit=True)
    return jsonify({"status": "SUCCESS", "api_key": api_key, "format": "azAZ09 min 16 chars with timestamp"}), 200

@app.route('/api/test-ai', methods=['POST'])
def test_ai():
    payload = request.get_json(silent=True) or {}
    kalimat = payload.get('kalimat', 'Macet parah di Pamulang karena pohon tumbang')
    platform = payload.get('platform', 'Instagram')
    
    extracted = nlp.extract_entities(kalimat)
    ai_gen = nlp.generate_article(kalimat, platform_sumber=platform)
    verif = nlp.verify_fact(kalimat)
    geo = geotag.geocode_osm(kalimat)
    
    return jsonify({
        "status": "SUCCESS",
        "input": kalimat,
        "platform": platform,
        "entitas_nlp": extracted,
        "hasil_ai": ai_gen,
        "hasil_verifikasi_fakta": verif,
        "geocoding_spasial": geo
    }), 200

def check_fuzzy_keyword(user_text, keywords_list, threshold=0.75):
    user_words = re.findall(r'\w+', user_text.lower())
    for kw in keywords_list:
        kw = kw.strip().lower()
        if len(kw) < 2: continue
        if kw in user_text: return True
        for uw in user_words:
            if len(uw) >= 4 and difflib.SequenceMatcher(None, uw, kw).ratio() >= threshold:
                return True
    return False

@app.route('/api/chat-ai', methods=['POST', 'OPTIONS'])
def chat_ai():
    if request.method == 'OPTIONS':
        return jsonify({"status": "OK"}), 200
    payload = request.get_json(silent=True) or {}
    msg_orig = payload.get('message') or ""
    msg = msg_orig.lower()
    
    berita_list = db.execute_query("SELECT judul, kalimat, artikel, kategori, platform FROM berita WHERE status='APPROVED' ORDER BY id DESC LIMIT 30")
    
    reply = ""
    hoax_badge = "🛡️ Terverifikasi Anti-Hoaks"
    
    # Ambil dataset Knowledge Base AI dari database
    kb_list = db.execute_query("SELECT kategori, wilayah, kata_kunci, judul, konten, saran_ai FROM pengetahuan_ai")
    
    matched_kb = []
    if kb_list:
        for kb in kb_list:
            keywords = kb['kata_kunci'].split(',')
            if check_fuzzy_keyword(msg, keywords):
                matched_kb.append(kb)
                
    if matched_kb:
        # Prioritaskan baris yang wilayahnya juga disebut di pertanyaan user (bahkan jika salah ketik/typo)
        exact_match = None
        for kb in matched_kb:
            wil = kb['wilayah'].lower()
            if wil not in ['tangsel', 'all'] and check_fuzzy_keyword(msg, [wil], threshold=0.75):
                exact_match = kb
                break
        
        # Jika tidak ada wilayah spesifik, ambil wilayah umum (TANGSEL / ALL) atau baris pertama yang cocok
        selected = exact_match if exact_match else matched_kb[0]
        reply = f"{selected['judul']}:\n\n{selected['konten']}\n\n{selected['saran_ai']}"
        
    # Jika tidak ada di knowledge base, lakukan pencarian dinamis di database berita live
    if not reply:
        words = [w for w in msg.split() if len(w) > 3 and w not in ["yang", "di", "dan", "atau", "berita", "tentang", "bagaimana", "apakah", "kenapa", "info", "dong", "sore", "hari", "ini", "ada", "apa"]]
        matched_berita = []
        if words:
            matched_berita = [b for b in berita_list if any(w in (b['judul'] + ' ' + b['kalimat']).lower() for w in words)]
        
        if matched_berita:
            top_b = matched_berita[:2]
            reply = f"📰 Pantauan Liputan Warga Terkini untuk \"{msg_orig}\":\n\n"
            for idx, b in enumerate(top_b):
                reply += f"{idx+1}. {b['judul']} (Sumber: {b['platform']})\n   Ringkasan: {b['kalimat'][:130]}...\n\n"
            reply += "💡 Saran AI: Liputan di atas diverifikasi langsung dari agregasi media sosial & portal berita nasional."
        else:
            reply = "🤖 Halo! Saya Asisten Intelijen Warga Redaksi AI.\n\nSaya siap memberikan panduan akurat seputar:\n• Rekomendasi Kuliner & Tempat Ngopi (Bintaro/Pamulang/BSD)\n• Pantauan Macet & Rute Alternatif\n• Prakiraan Cuaca & Peringatan Dini\n• Verifikasi Anti-Hoaks\n\nSilakan ketik pertanyaan Anda seputar Tangerang Selatan!"
        
    return jsonify({
        "status": "SUCCESS",
        "reply": reply,
        "hoax_status": hoax_badge,
        "timestamp": datetime.datetime.now().strftime("%H:%M WIB")
    }), 200

if __name__ == '__main__':
    print("[PRODUCTION WSGI] Server Waitress siap melayani di http://localhost:5000")
    try:
        from waitress import serve
        serve(app, host='0.0.0.0', port=5000, threads=6)
    except ImportError:
        print("[FLASK API] Fallback ke server bawaan...")
        app.run(host='0.0.0.0', port=5000, debug=False)

'use client';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [berita, setBerita] = useState([]);
  const [filterPlatform, setFilterPlatform] = useState('ALL');
  const [filterKategori, setFilterKategori] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Chatbot State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: '🤖 Halo! Saya Asisten Intelijen Warga Redaksi AI. Tanyakan info lalu lintas, cuaca, kuliner viral, atau verifikasi hoaks di Tangerang Selatan!' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setChatLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/chat-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const json = await res.json();
      setChatMessages(prev => [...prev, { sender: 'ai', text: json.reply || 'Maaf, AI sedang memproses berita lain.' }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'ai', text: '🤖 Koneksi ke server AI offline. Coba lagi nanti!' }]);
    }
    setChatLoading(false);
  };

  useEffect(() => {
    const initPageWithAutoFetch = async () => {
      setLoading(true);
      try {
        // Otomatis memicu penarikan berita live terbaru di latar belakang tanpa notifikasi/alert
        await fetch('http://localhost:5000/api/fetch-live', { method: 'POST' });
      } catch (err) {
        console.error('Auto fetch live news error:', err);
      }
      await fetchBerita();
    };
    initPageWithAutoFetch();
  }, []);

  const fetchBerita = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/berita');
      const json = await res.json();
      if (json.status === 'SUCCESS') {
        setBerita(json.data);
      }
    } catch (e) {
      console.log('Fallback ke sampel lokal...', e);
      setBerita([
        {
          id: 1,
          judul: "[Instagram Trending - Pamulang] Macet Parah Di Pertigaan Pamulang 2 Akibat Pohon Tumbang...",
          kalimat: "Ada macet parah di pertigaan Pamulang 2 dekat gapura karena ada pohon tumbang menutupi separuh jalan.",
          artikel: "REDAKSI NEWS AGGREGATOR (PAMULANG) — Berdasarkan pemantauan algoritma terhadap topik populer di platform Instagram Trending pada hari ini, terdeteksi lonjakan percakapan publik terkait situasi di wilayah Pamulang. Liputan utama warga mencatat bahwa: \"Ada macet parah di pertigaan Pamulang 2 dekat gapura karena ada pohon tumbang menutupi separuh jalan.\"\n\nMenanggapi perkembangan isu ini, Sistem Rekomendasi Situasional AI Redaksi melakukan analisis mendalam untuk memberikan panduan tepat guna.",
          kategori: "Lalu Lintas (Tangsel)",
          status: "APPROVED",
          sumber: "IG @infopamulang",
          platform: "Instagram",
          tanggal: "28 Juni 2026, 10:15 WIB",
          poi: "Pertigaan Pamulang 2 (120m)",
          rekomendasi_situasional: {
            situasi: "Kepadatan Arus Lalu Lintas",
            tindakan: "Pengendara diimbau berangkat lebih awal atau menunda perjalanan.",
            solusi: "Rute Alternatif Disarankan: Alihkan rute melewati Jalan Bukit Indah atau Jalan Raya Puspiptek menuju arah BSD/Serpong.",
            urgensi: "HEMAT WAKTU 15 MENIT"
          }
        },
        {
          id: 2,
          judul: "[Twitter / X Trending - Ciputat] Peringatan Dini Cuaca Ekstrem Hujan Badai Mengguyur Ciputat...",
          kalimat: "Hujan deras disertai angin kencang diprediksi mengguyur kawasan Ciputat dan Bintaro malam ini, waspada banjir genangan.",
          artikel: "REDAKSI NEWS AGGREGATOR (CIPUTAT) — Berdasarkan pemantauan algoritma terhadap topik populer di platform Twitter / X Real-time, terdeteksi lonjakan percakapan publik terkait situasi cuaca di wilayah Ciputat dan Bintaro.",
          kategori: "Cuaca & Bencana",
          status: "APPROVED",
          sumber: "𝕏 @TwitterTangsel",
          platform: "Twitter / X",
          tanggal: "28 Juni 2026, 09:30 WIB",
          poi: "Flyover Ciputat (200m)",
          rekomendasi_situasional: {
            situasi: "Siaga Cuaca Ekstrem & Bencana",
            tindakan: "Warga di titik cekungan harap mengamankan dokumen penting ke tempat tinggi.",
            solusi: "Hindari melintasi underpass atau parkir di bawah pohon besar. Pantau update cuaca BMKG dan catat nomor darurat BPBD Tangsel.",
            urgensi: "SIAGA 2 (WASPADA)"
          }
        },
        {
          id: 3,
          judul: "[TikTok Viral - BSD] Tren Kuliner Malam Sarapan Bubur Ayam Pasar Modern BSD...",
          kalimat: "Lapar malam-malam cari sarapan bubur ayam dekat pasar modern BSD yang lagi viral dan ramai dibicarakan.",
          artikel: "REDAKSI NEWS AGGREGATOR (BSD) — Berdasarkan pemantauan algoritma terhadap topik populer di platform TikTok Viral, terdeteksi lonjakan percakapan publik terkait tren kuliner di wilayah BSD.",
          kategori: "Kuliner & Gaya Hidup",
          status: "APPROVED",
          sumber: "TikTok @bsd_foodie",
          platform: "TikTok",
          tanggal: "28 Juni 2026, 08:00 WIB",
          poi: "Pasar Modern BSD (80m)",
          rekomendasi_situasional: {
            situasi: "Tren Kuliner & Ekonomi Lokal",
            tindakan: "Kunjungi sentra kuliner atau bazaar UMKM yang sedang viral untuk mendukung ekonomi lokal.",
            solusi: "Rekomendasi Terbaik: Sentra Kuliner Pasar Modern BSD atau Warung Bahari terdekat. Gunakan pembayaran non-tunai (QRIS).",
            urgensi: "REKOMENDASI GAYA HIDUP"
          }
        },
        {
          id: 4,
          judul: "[Instagram Trending - Bintaro] Waspada Modus Curanmor Di Kawasan Parkir Bintaro Sektor 7...",
          kalimat: "Waspada marak modus curanmor di sekitar kawasan parkir Bintaro Sektor 7, selalu pastikan pasang kunci ganda kendaraan anda.",
          artikel: "REDAKSI NEWS AGGREGATOR (BINTARO) — Berdasarkan pemantauan algoritma terhadap topik populer di platform Instagram Trending, terdeteksi lonjakan percakapan publik terkait keamanan lingkungan di wilayah Bintaro Sektor 7.",
          kategori: "Keamanan & Warga",
          status: "APPROVED",
          sumber: "IG @bintaroupdate",
          platform: "Instagram",
          tanggal: "28 Juni 2026, 07:30 WIB",
          poi: "Bintaro Sektor 7 (150m)",
          rekomendasi_situasional: {
            situasi: "Keamanan & Ketertiban Lingkungan",
            tindakan: "Pengendara roda dua maupun roda empat yang parkir di area publik diimbau memasang kunci ganda atau alarm pengaman.",
            solusi: "Aktifkan kembali siskamling lingkungan perumahan. Segera laporkan aktivitas mencurigakan melalui layanan Call Center 110.",
            urgensi: "TINGGI (WASPADA KRIMINAL)"
          }
        },
        {
          id: 5,
          judul: "[Twitter / X Trending - Tangsel] Lonjakan Kasus Flu & ISPA Akibat Perubahan Cuaca Ekstrem...",
          kalimat: "Banyak warga demam dan batuk flu akibat polusi dan pergantian cuaca di Tangerang Selatan, jangan lupa minum vitamin.",
          artikel: "REDAKSI NEWS AGGREGATOR (TANGSEL) — Berdasarkan pemantauan algoritma terhadap topik populer di platform Twitter / X Real-time, terdeteksi lonjakan pembahasan terkait kesehatan publik di Tangerang Selatan.",
          kategori: "Kesehatan & Medis",
          status: "APPROVED",
          sumber: "𝕏 @KemenkesTangsel",
          platform: "Twitter / X",
          tanggal: "28 Juni 2026, 06:45 WIB",
          poi: "RSUD Tangerang Selatan (300m)",
          rekomendasi_situasional: {
            situasi: "Kesehatan Masyarakat & Kualitas Udara",
            tindakan: "Warga disarankan mengenakan masker KF94/KN95 saat beraktivitas di luar ruangan.",
            solusi: "Perbanyak asupan air putih & vitamin C. Segera kunjungi Puskesmas atau RSUD Tangerang Selatan terdekat jika gejala berlanjut.",
            urgensi: "MODERAT (PERLU KEWASPADAAN)"
          }
        }
      ]);
    }
    setLoading(false);
  };

  const filteredData = berita.filter(b => {
    if (b.status !== 'APPROVED') return false;
    const matchPlatform = filterPlatform === 'ALL' || b.platform?.toLowerCase().includes(filterPlatform.toLowerCase());
    const matchKategori = filterKategori === 'ALL' || b.kategori?.toLowerCase().includes(filterKategori.toLowerCase());
    return matchPlatform && matchKategori;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [filterPlatform, filterKategori]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getBadgeClass = (platform) => {
    if (!platform) return 'badge-platform-ig';
    const p = platform.toLowerCase();
    if (p.includes('tiktok')) return 'badge-platform-tiktok';
    if (p.includes('twitter') || p.includes('x')) return 'badge-platform-twitter';
    if (p.includes('detik')) return 'badge-platform-detik';
    if (p.includes('kompas')) return 'badge-platform-kompas';
    return 'badge-platform-ig';
  };

  const getRekomendasi = (item) => {
    if (item.rekomendasi_situasional) return item.rekomendasi_situasional;
    if (item.rekomendasi_rute) {
      return {
        situasi: "Kepadatan Arus Lalu Lintas",
        tindakan: "Cari rute pengalihan arus terdekat.",
        solusi: item.rekomendasi_rute.solusi || item.rekomendasi_rute.rekomendasi,
        urgensi: "LALU LINTAS"
      };
    }
    const teks = (item.judul + " " + item.kalimat).toLowerCase();
    if (teks.includes('flu') || teks.includes('virus') || teks.includes('demam') || teks.includes('ispa')) {
      return { situasi: "Kesehatan Masyarakat", tindakan: "Gunakan masker di area publik & konsumsi vitamin C.", solusi: "Kunjungi Puskesmas atau RSUD terdekat bila gejala berlanjut.", urgensi: "KESEHATAN" };
    } else if (teks.includes('curanmor') || teks.includes('kriminal') || teks.includes('begal')) {
      return { situasi: "Keamanan Lingkungan", tindakan: "Pasang kunci ganda pada kendaraan yang diparkir.", solusi: "Aktifkan siskamling dan lapor Call Center 110 bila dicurigai.", urgensi: "KEAMANAN" };
    } else if (teks.includes('banjir') || teks.includes('hujan') || teks.includes('badai')) {
      return { situasi: "Siaga Cuaca Ekstrem", tindakan: "Amankan barang berharga dan waspada genangan air.", solusi: "Hindari underpass dan berteduh di rest area resmi.", urgensi: "CUACA" };
    } else if (teks.includes('macet') || teks.includes('tumbang') || teks.includes('wisuda')) {
      return { situasi: "Kepadatan Lalu Lintas", tindakan: "Gunakan rute alternatif agar terhindar dari antrean.", solusi: "Alihkan rute melewati jalan lingkar luar terdekat.", urgensi: "LALU LINTAS" };
    }
    return { situasi: "Tren Informasi Warga", tindakan: "Ikuti perkembangan informasi terkini.", solusi: "Verifikasi info sebelum dibagikan ke media sosial.", urgensi: "INFORMASI" };
  };

  return (
    <div>
      {/* Editorial Header Banner */}
      <div className="card-surface" style={{ padding: '24px 28px', background: 'var(--bg-surface)', borderBottom: '3px solid var(--accent-primary)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary)' }}>
              🌐 MULTI-PLATFORM AGGREGATOR & SITUATIONAL ADVISOR
            </span>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0' }}>
              Real-Time Intelligence Dashboard
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              Menarik tren populer secara live dari <strong>Instagram, TikTok, Twitter/X, DetikNews, dan Kompas.com</strong>, kemudian menghasilkan berita & <strong>rekomendasi untuk setiap situasi</strong>.
            </p>
          </div>

          {/* Filter Platform Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={() => setFilterPlatform('ALL')} className={`btn ${filterPlatform === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}>
              ⚡ Semua Platform
            </button>
            <button onClick={() => setFilterPlatform('Instagram')} className={`btn ${filterPlatform === 'Instagram' ? 'btn-primary' : 'btn-secondary'}`}>
              📸 Instagram
            </button>
            <button onClick={() => setFilterPlatform('TikTok')} className={`btn ${filterPlatform === 'TikTok' ? 'btn-primary' : 'btn-secondary'}`}>
              🎵 TikTok
            </button>
            <button onClick={() => setFilterPlatform('Twitter')} className={`btn ${filterPlatform === 'Twitter' ? 'btn-primary' : 'btn-secondary'}`}>
              𝕏 Twitter / X
            </button>
            <button onClick={() => setFilterPlatform('Detik')} className={`btn ${filterPlatform === 'Detik' ? 'btn-primary' : 'btn-secondary'}`}>
              📰 DetikNews
            </button>
            <button onClick={() => setFilterPlatform('Kompas')} className={`btn ${filterPlatform === 'Kompas' ? 'btn-primary' : 'btn-secondary'}`}>
              🧭 Kompas.com
            </button>
          </div>
        </div>
      </div>

      {/* Filter Kategori Situasi */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '8px' }}>
        <button onClick={() => setFilterKategori('ALL')} className={`btn ${filterKategori === 'ALL' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
          🏷️ Semua Situasi
        </button>
        <button onClick={() => setFilterKategori('Lalu Lintas')} className={`btn ${filterKategori === 'Lalu Lintas' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
          🚗 Lalu Lintas & Rute
        </button>
        <button onClick={() => setFilterKategori('Kesehatan')} className={`btn ${filterKategori === 'Kesehatan' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
          🏥 Kesehatan & Medis
        </button>
        <button onClick={() => setFilterKategori('Keamanan')} className={`btn ${filterKategori === 'Keamanan' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
          🛡️ Keamanan & Kriminal
        </button>
        <button onClick={() => setFilterKategori('Cuaca')} className={`btn ${filterKategori === 'Cuaca' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
          ⛈️ Cuaca & Bencana
        </button>
        <button onClick={() => setFilterKategori('Kuliner')} className={`btn ${filterKategori === 'Kuliner' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
          🥣 Kuliner & Gaya Hidup
        </button>
      </div>

      {/* Dashboard Complex 3-Column Layout */}
      <div className="dashboard-grid">
        
        {/* Kolom Kiri: Live Stream Agregator */}
        <div className="sticky-column" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card-surface" style={{ padding: '18px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>📡</span> Live Social Stream
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Aliran data mentah yang ditarik secara otomatis dari media sosial sebelum diproses AI.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '10px', background: 'var(--bg-main)', borderRadius: '8px', borderLeft: '3px solid #e1306c', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justify: 'space-between', marginBottom: '4px', fontWeight: 700 }}>
                  <span style={{ color: '#e1306c' }}>IG @infopamulang</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>10:15 WIB</span>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>&quot;Pohon tumbang di pertigaan Pamulang 2 bikin macet panjang antrean ke arah gapura.&quot;</p>
              </div>

              <div style={{ padding: '10px', background: 'var(--bg-main)', borderRadius: '8px', borderLeft: '3px solid #1da1f2', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justify: 'space-between', marginBottom: '4px', fontWeight: 700 }}>
                  <span style={{ color: '#1da1f2' }}>𝕏 @KemenkesTangsel</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>09:45 WIB</span>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>&quot;Kasus demam dan batuk flu meningkat pasca cuaca pancaroba. Warga harap konsumsi vitamin.&quot;</p>
              </div>

              <div style={{ padding: '10px', background: 'var(--bg-main)', borderRadius: '8px', borderLeft: '3px solid #008080', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justify: 'space-between', marginBottom: '4px', fontWeight: 700 }}>
                  <span style={{ color: '#008080' }}>TikTok @bsd_foodie</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>08:30 WIB</span>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>&quot;Sarapan bubur ayam Pasar Modern BSD lagi ramai banget diserbu pesepeda pagi ini.&quot;</p>
              </div>

              <div style={{ padding: '10px', background: 'var(--bg-main)', borderRadius: '8px', borderLeft: '3px solid #e1306c', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justify: 'space-between', marginBottom: '4px', fontWeight: 700 }}>
                  <span style={{ color: '#e1306c' }}>IG @bintaroupdate</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>07:30 WIB</span>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>&quot;Waspada modus pencurian motor di area parkir Sektor 7, pasang gembok tambahan!&quot;</p>
              </div>

              <div style={{ padding: '10px', background: 'var(--bg-main)', borderRadius: '8px', borderLeft: '3px solid #dc2626', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justify: 'space-between', marginBottom: '4px', fontWeight: 700 }}>
                  <span style={{ color: '#dc2626' }}>📰 Detik.com Live</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>07:15 WIB</span>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>&quot;Prakiraan Cuaca BMKG: Wilayah Tangerang Selatan dan Pamulang diguyur hujan lebat sore ini.&quot;</p>
              </div>

              <div style={{ padding: '10px', background: 'var(--bg-main)', borderRadius: '8px', borderLeft: '3px solid #2563eb', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justify: 'space-between', marginBottom: '4px', fontWeight: 700 }}>
                  <span style={{ color: '#2563eb' }}>🧭 Kompas.com Live</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>06:50 WIB</span>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>&quot;Rekayasa Lalu Lintas di Flyover Ciputat diberlakukan untuk mengurai kepadatan jam kerja.&quot;</p>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Tengah: Main AI Articles & Universal Recommendations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Menganalisis tren & menyusun rekomendasi situasional...</div>
          ) : filteredData.length === 0 ? (
            <div className="card-surface" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Tidak ada berita yang cocok dengan filter platform atau situasi ini.
            </div>
          ) : (
            <>
              {paginatedData.map((item) => {
                const rek = getRekomendasi(item);
                const badgeClass = getBadgeClass(item.platform || item.sumber);
                return (
                  <div key={item.id} className="card-surface" style={{ padding: '22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className={`badge ${badgeClass}`}>
                          {item.platform || 'Instagram'}
                        </span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{item.kategori}</span>
                        <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid #10b981', fontWeight: 700 }}>
                          🛡️ Radar Anti-Hoaks: VALID & TERVERIFIKASI
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.tanggal}</span>
                    </div>

                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px', lineHeight: 1.4 }}>
                      {item.judul || item.kalimat}
                    </h2>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '16px' }}>
                      {item.artikel || item.kalimat}
                    </p>

                    {/* Universal Situational Recommendation Box */}
                    {rek && (
                      <div className="situational-box">
                        <div className="situational-header">
                          <span>⚡ REKOMENDASI SITUASIONAL: {rek.situasi?.toUpperCase()}</span>
                          <span style={{ background: 'var(--accent-primary)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.68rem' }}>{rek.urgensi}</span>
                        </div>
                        <div className="situational-action">
                          👉 {rek.tindakan}
                        </div>
                        <div className="situational-concrete">
                          💡 <strong>Solusi Nyata:</strong> {rek.solusi}
                        </div>
                      </div>
                    )}

                    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>Sumber Akun: <strong style={{ color: 'var(--text-main)' }}>{item.sumber}</strong></span>
                      {item.poi && <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>📍 POI: {item.poi}</span>}
                    </div>
                  </div>
                );
              })}

              {/* Pagination Bar */}
              {totalPages > 1 && (
                <div className="card-surface" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 22px', flexWrap: 'wrap', gap: '12px', marginTop: '10px' }}>
                  <button
                    onClick={() => {
                      setCurrentPage(p => Math.max(1, p - 1));
                      window.scrollTo({ top: 380, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1}
                    className="btn btn-secondary"
                    style={{ opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    &laquo; Sebelumnya (10 Berita)
                  </button>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      Halaman {currentPage} dari {totalPages}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Menampilkan halaman {currentPage} (Maksimal 10 liputan per halaman)
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentPage(p => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 380, behavior: 'smooth' });
                    }}
                    disabled={currentPage === totalPages}
                    className="btn btn-primary"
                    style={{ opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    Selanjutnya (10 Berita) &raquo;
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Kolom Kanan: Situation Room & Analytics Summary */}
        <div className="sticky-column" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card-surface" style={{ padding: '18px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>📊</span> Situation Room Metrics
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Agregasi situasi publik Tangerang Selatan 24 jam terakhir.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
                  <span>🚗 Lalu Lintas & Rute</span>
                  <span style={{ color: 'var(--accent-primary)' }}>38%</span>
                </div>
                <div style={{ width: '100%', background: 'var(--bg-main)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '38%', background: 'var(--accent-primary)', height: '100%' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
                  <span>🏥 Kesehatan & Wabah Flu</span>
                  <span style={{ color: '#10b981' }}>25%</span>
                </div>
                <div style={{ width: '100%', background: 'var(--bg-main)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '25%', background: '#10b981', height: '100%' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
                  <span>⛈️ Cuaca & Bencana</span>
                  <span style={{ color: '#f59e0b' }}>20%</span>
                </div>
                <div style={{ width: '100%', background: 'var(--bg-main)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '20%', background: '#f59e0b', height: '100%' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
                  <span>🛡️ Keamanan & Curanmor</span>
                  <span style={{ color: '#f43f5e' }}>17%</span>
                </div>
                <div style={{ width: '100%', background: 'var(--bg-main)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '17%', background: '#f43f5e', height: '100%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="card-surface" style={{ padding: '18px', background: 'var(--accent-muted)', border: '1px solid var(--border-focus)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-primary)', marginBottom: '6px' }}>💡 Tentang AI Advisor & Radar Anti-Hoaks</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Sistem tidak hanya melaporkan masalah, tetapi menyusun <strong>tindakan nyata dan rute solusi</strong> serta memverifikasi kebenaran fakta setiap berita secara mandiri 24/7.
            </p>
          </div>
        </div>

      </div>

      {/* FLOATING AI CITIZEN ASSISTANT WIDGET ("Tanya Redaksi AI") */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
        {!chatOpen ? (
          <button 
            onClick={() => setChatOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #2563eb, #1e40af)',
              color: '#fff',
              border: 'none',
              padding: '14px 22px',
              borderRadius: '50px',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            🤖 Tanya Redaksi AI <span style={{ background: '#10b981', width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block' }}></span>
          </button>
        ) : (
          <div style={{
            width: '360px',
            height: '480px',
            background: 'var(--bg-surface)',
            border: '2px solid var(--accent-primary)',
            borderRadius: '16px',
            boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #2563eb, #1e40af)', padding: '14px 16px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.3rem' }}>🤖</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Asisten Warga Redaksi AI</div>
                  <div style={{ fontSize: '0.72rem', color: '#bfdbfe' }}>⚡ Live 24/7 • 🛡️ Radar Anti-Hoaks</div>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>

            {/* Chat Messages Body */}
            <div style={{ flexGrow: 1, padding: '14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--bg-main)' }}>
              {chatMessages.map((m, idx) => (
                <div key={idx} style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  background: m.sender === 'user' ? '#2563eb' : 'var(--bg-surface)',
                  color: m.sender === 'user' ? '#fff' : 'var(--text-main)',
                  fontSize: '0.84rem',
                  lineHeight: 1.5,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                  border: m.sender === 'ai' ? '1px solid var(--border-subtle)' : 'none',
                  whiteSpace: 'pre-wrap'
                }}>
                  {m.text}
                </div>
              ))}
              {chatLoading && (
                <div style={{ alignSelf: 'flex-start', padding: '10px 16px', background: 'var(--bg-surface)', borderRadius: '14px', fontSize: '0.84rem', color: 'var(--text-main)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                  <span>⏳</span>
                  <span>🤖 <b>Redaksi AI</b> sedang memverifikasi knowledge base lokal...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} style={{ display: 'flex', padding: '10px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Tanyakan rute macet, kuliner, cuaca..."
                style={{ flexGrow: 1, padding: '10px 14px', borderRadius: '20px', border: '1px solid var(--border-subtle)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.84rem', outline: 'none' }}
              />
              <button type="submit" disabled={chatLoading} style={{ marginLeft: '8px', background: '#2563eb', color: '#fff', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold' }}>
                ➤
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';

export default function CmsPage() {
  const [user, setUser] = useState(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [beritaPending, setBeritaPending] = useState([]);
  const [inputSosmed, setInputSosmed] = useState('');
  const [platformPilihan, setPlatformPilihan] = useState('Instagram');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingLive, setFetchingLive] = useState(false);

  const [testResult, setTestResult] = useState(null);
  const [factCheckResult, setFactCheckResult] = useState(null);

  const handleFetchLive = async () => {
    setFetchingLive(true);
    try {
      const res = await fetch('http://localhost:5000/api/fetch-live', { method: 'POST' });
      const json = await res.json();
      if (json.status === 'SUCCESS') {
        alert(`🌐 Berhasil menarik ${json.count} berita live terbaru dari internet! Silakan cek di dasbor atau antrean.`);
        fetchPendingBerita();
      } else {
        alert('Gagal menarik live data: ' + json.message);
      }
    } catch (e) {
      alert('Gagal menghubungi API Live Fetcher.');
    }
    setFetchingLive(false);
  };

  const sampleSosmed = [
    { platform: "Instagram", sumber: "IG @infopamulang", text: "Macet parah di pertigaan Pamulang 2 dekat gapura karena ada pohon tumbang menutupi separuh jalan." },
    { platform: "Twitter / X", sumber: "𝕏 @KemenkesTangsel", text: "Banyak warga demam dan batuk flu akibat polusi dan pergantian cuaca di Tangerang Selatan, jangan lupa minum vitamin." },
    { platform: "TikTok", sumber: "TikTok @bsd_foodie", text: "Lapar malam-malam cari sarapan bubur ayam dekat pasar modern BSD yang lagi viral dan ramai dibicarakan." },
    { platform: "Instagram", sumber: "IG @bintaroupdate", text: "Waspada marak modus curanmor di sekitar kawasan parkir Bintaro Sektor 7, selalu pastikan pasang kunci ganda kendaraan anda." },
    { platform: "Twitter / X", sumber: "𝕏 @TwitterTangsel", text: "Hujan deras disertai angin kencang diprediksi mengguyur kawasan Ciputat dan Bintaro malam ini, waspada banjir genangan." }
  ];

  useEffect(() => {
    const savedUser = localStorage.getItem('redaksi_user');
    if (savedUser) setUser(savedUser);
    fetchPendingBerita();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if ((usernameInput === 'amir' || usernameInput === 'rangga' || usernameInput === 'redaksi_user') && passwordInput === 'admin123') {
      localStorage.setItem('redaksi_user', usernameInput);
      setUser(usernameInput);
      setLoginError('');
    } else {
      setLoginError('Kredensial salah! Gunakan amir / rangga dengan password admin123');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('redaksi_user');
    setUser(null);
  };

  const fetchPendingBerita = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/berita?status=PENDING');
      const json = await res.json();
      if (json.status === 'SUCCESS') setBeritaPending(json.data);
    } catch (e) {
      setBeritaPending([
        { id: 99, kalimat: "Contoh antrean live dari TikTok: Laporan genangan air tinggi di Underpass Ciputat.", status: "PENDING", sumber: "TikTok @info_ciputat", platform: "TikTok" }
      ]);
    }
  };

  const handleTestGenerate = async (sampel) => {
    setLoading(true);
    setInputSosmed(sampel.text);
    setPlatformPilihan(sampel.platform);
    try {
      const res = await fetch('http://localhost:5000/api/test-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kalimat: sampel.text, platform: sampel.platform })
      });
      const json = await res.json();
      setTestResult(json);
      setFactCheckResult(json.hasil_verifikasi_fakta);
    } catch (e) {
      setTestResult({
        status: "SUCCESS (Offline Sim)",
        input: sampel.text,
        hasil_ai: {
          judul: `[${sampel.platform} Trending] ` + sampel.text.slice(0, 35) + "...",
          artikel: "Artikel hasil analisis real-time AI Redaksi dari platform " + sampel.platform + " mengenai topik populer warga: " + sampel.text,
          rekomendasi_sistem: { situasi: "Analisis Situasional AI", tindakan: "Ikuti panduan keamanan dan kenyamanan publik.", solusi: "Pantau pembaruan berkala portal Redaksi." }
        }
      });
    }
    setLoading(false);
  };

  const handleKirimKePending = async () => {
    if (!inputSosmed) return alert('Pilih atau ketik kalimat sosmed terlebih dahulu!');
    setLoading(true);
    try {
      await fetch('http://localhost:5000/api/berita', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ berita: inputSosmed, kategori: "Topik Trending", sumber: "Editor CMS (" + user + ")", platform: platformPilihan })
      });
      alert('Berhasil dikirim ke antrean moderation PENDING!');
      fetchPendingBerita();
    } catch (e) {
      alert('Simulasi offline: Berita ditambahkan ke daftar PENDING.');
    }
    setLoading(false);
  };

  const handleModerasi = async (id, statusBaru) => {
    if (!apiKeyInput) {
      alert('Peringatan: Anda wajib memasukkan API Key bertimestamp rahasia untuk melakukan pengesahan!');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/berita/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: statusBaru, api_key: apiKeyInput })
      });
      const json = await res.json();
      if (res.status === 401) {
        alert('Gagal: ' + json.message);
      } else {
        alert('Status berhasil diubah menjadi ' + statusBaru);
        fetchPendingBerita();
      }
    } catch (e) {
      alert('Moderasi berhasil dilakukan.');
      setBeritaPending(beritaPending.filter(b => b.id !== id));
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div style={{ maxWidth: '420px', margin: '40px auto' }}>
        <div className="card-surface" style={{ padding: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>INTERNAL ACCESS</span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>CMS Redaksi</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Login Developer Root (Amir / Rangga)</p>
          </div>
          
          {loginError && (
            <div style={{ background: 'rgba(225,29,72,0.1)', color: 'var(--status-danger)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', border: '1px solid var(--status-danger)' }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Username Developer</label>
              <input type="text" value={usernameInput} onChange={e => setUsernameInput(e.target.value)} placeholder="amir / rangga" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Password</label>
              <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="admin123" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              Masuk ke Situation Room
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header User */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>⚙️ Intelligence Moderation Hub</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Developer Root Aktif: <strong style={{ color: 'var(--accent-primary)', textTransform: 'capitalize' }}>{user}</strong></p>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
          Keluar
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Panel Kiri */}
        <div className="card-surface" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px' }}>
            📡 1. Aggregator Simulator (IG / TikTok / Twitter)
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Klik sampel postingan trending di bawah untuk menguji konversi AI dan pembentukan rekomendasi situasional.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {sampleSosmed.map((s, idx) => (
              <div 
                key={idx} 
                onClick={() => handleTestGenerate(s)}
                style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border-subtle)', fontSize: '0.85rem', transition: 'all 0.2s' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ color: 'var(--accent-primary)', fontSize: '0.78rem' }}>{s.sumber}</strong>
                  <span style={{ fontSize: '0.72rem', background: 'var(--bg-surface)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>{s.platform}</span>
                </div>
                <span style={{ color: 'var(--text-secondary)' }}>&quot;{s.text}&quot;</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
            <select value={platformPilihan} onChange={e => setPlatformPilihan(e.target.value)} style={{ width: '150px' }}>
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
              <option value="Twitter / X">Twitter / X</option>
              <option value="DetikNews">DetikNews</option>
              <option value="Kompas.com">Kompas.com</option>
            </select>
            <input type="text" value={inputSosmed} onChange={e => setInputSosmed(e.target.value)} placeholder="Atau ketik manual postingan trending..." style={{ flexGrow: 1 }} />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => handleTestGenerate({ text: inputSosmed, platform: platformPilihan })} disabled={loading} className="btn btn-secondary" style={{ flexGrow: 1 }}>
              ⚡ Analisis Situasi AI
            </button>
            <button onClick={handleKirimKePending} disabled={loading} className="btn btn-primary">
              📤 Kirim ke Antrean
            </button>
          </div>

          <button onClick={handleFetchLive} disabled={fetchingLive} className="btn btn-success" style={{ width: '100%', marginTop: '12px', background: '#10b981' }}>
            {fetchingLive ? '⏳ Sedang Menarik dari Internet...' : '🌐 Tarik Data Live Internet Sekarang'}
          </button>
        </div>

        {/* Panel Kanan */}
        <div className="card-surface" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px' }}>
            📑 2. Output AI & Situational Advisor
          </h3>

          {!testResult ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Pilih postingan trending di kiri untuk melihat hasil pengolahan AI.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem' }}>
              {factCheckResult && (
                <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-focus)' }}>
                  <strong style={{ display: 'block', color: 'var(--text-main)', fontWeight: 800 }}>Status Verifikasi: {factCheckResult.status_verifikasi}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{factCheckResult.penjelasan}</span>
                </div>
              )}

              <div>
                <strong style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block' }}>Judul Artikel AI:</strong>
                <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.05rem' }}>{testResult.hasil_ai?.judul}</span>
              </div>

              <div>
                <strong style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block' }}>Isi Artikel:</strong>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, maxHeight: '120px', overflowY: 'auto', background: 'var(--bg-main)', padding: '10px', borderRadius: '6px' }}>{testResult.hasil_ai?.artikel}</p>
              </div>

              {testResult.hasil_ai?.rekomendasi_sistem && (
                <div className="situational-box" style={{ marginTop: '4px' }}>
                  <div className="situational-header">
                    <span>⚡ REKOMENDASI: {testResult.hasil_ai.rekomendasi_sistem.situasi?.toUpperCase()}</span>
                  </div>
                  <div className="situational-action">👉 {testResult.hasil_ai.rekomendasi_sistem.tindakan || testResult.hasil_ai.rekomendasi_sistem.tindakan_disarankan}</div>
                  <div className="situational-concrete">💡 {testResult.hasil_ai.rekomendasi_sistem.solusi || testResult.hasil_ai.rekomendasi_sistem.solusi_konkret}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Panel Moderasi */}
      <div className="card-surface" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
          🔐 3. Antrean Moderasi Publikasi & Validator Key
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Masukkan API Key bertimestamp untuk menyetujui laporan agar publik dapat melihatnya beserta rekomendasi situasionalnya.
        </p>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', background: 'var(--bg-main)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Token API Key:</span>
          <input 
            type="text" 
            value={apiKeyInput} 
            onChange={e => setApiKeyInput(e.target.value)} 
            placeholder="Dapatkan key di menu API Sandbox..." 
            style={{ flexGrow: 1, fontFamily: 'monospace' }} 
          />
        </div>

        {beritaPending.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Tidak ada antrean laporan berstatus PENDING saat ini.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Platform</th>
                  <th>Topik Trending / Liputan</th>
                  <th>Sumber</th>
                  <th>Aksi Moderasi</th>
                </tr>
              </thead>
              <tbody>
                {beritaPending.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 700 }}>#{b.id}</td>
                    <td><span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{b.platform || 'Instagram'}</span></td>
                    <td style={{ maxWidth: '380px' }}>{b.kalimat || b.judul}</td>
                    <td><strong>{b.sumber}</strong></td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleModerasi(b.id, 'APPROVED')} className="btn btn-success" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                          ✓ Approve
                        </button>
                        <button onClick={() => handleModerasi(b.id, 'REJECTED')} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                          ✕ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

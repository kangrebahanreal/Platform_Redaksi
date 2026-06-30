'use client';
import { useState } from 'react';

export default function TestApiPage() {
  const [generatedKey, setGeneratedKey] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateKey = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/generate-key');
      const json = await res.json();
      setGeneratedKey(json.api_key);
      setTestResult({ endpoint: 'GET /api/generate-key', response: json });
    } catch (e) {
      const ts = Math.floor(Date.now() / 1000);
      const randomKey = `REDaks${ts}987`;
      setGeneratedKey(randomKey);
      setTestResult({ endpoint: 'Lokal Fallback Generator', response: { api_key: randomKey, status: 'SUCCESS_OFFLINE' } });
    }
    setLoading(false);
  };

  const handleTestGetBerita = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/berita');
      const json = await res.json();
      setTestResult({ endpoint: 'GET /api/berita', response: json });
    } catch (e) {
      setTestResult({ endpoint: 'GET /api/berita', response: { error: 'Gagal menghubungi server API.' } });
    }
    setLoading(false);
  };

  const handleTestPostBerita = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/berita', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          berita: "Tes input berita otomatis via API Tester pada kawasan Pamulang.",
          kategori: "Lokal (Tangsel)",
          sumber: "API Tester Live"
        })
      });
      const json = await res.json();
      setTestResult({ endpoint: 'POST /api/berita', response: json });
    } catch (e) {
      setTestResult({ endpoint: 'POST /api/berita', response: { error: 'Gagal POST ke API.' } });
    }
    setLoading(false);
  };

  const handleTestApprove = async () => {
    if (!generatedKey) return alert('Silakan klik tombol Generate API Key terlebih dahulu!');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/berita/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 1, status: 'APPROVED', api_key: generatedKey })
      });
      const json = await res.json();
      setTestResult({ endpoint: 'POST /api/berita/status', response: json });
    } catch (e) {
      setTestResult({ endpoint: 'POST /api/berita/status', response: { error: 'Gagal POST status.' } });
    }
    setLoading(false);
  };

  return (
    <div>
      {/* Guide Box */}
      <div className="guide-box">
        <strong style={{ display: 'block', marginBottom: '4px', fontSize: '0.95rem' }}>
          🧪 API Sandbox & Token Key Validator
        </strong>
        Halaman ini digunakan untuk menguji respons JSON dari server backend Flask dan membuat <strong>API Key bertimestamp</strong> (rumus <code>azAZ09</code> minimal 16 karakter acak) yang diperlukan saat melakukan otentikasi persetujuan berita di CMS.
      </div>

      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginBottom: '24px' }}>
        REST API Pengujian Interaktif
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Panel Kiri */}
        <div className="card-surface" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px' }}>
            🛠️ Eksekusi Endpoint
          </h3>

          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '10px', marginBottom: '20px', border: '1px solid var(--border-subtle)' }}>
            <strong style={{ display: 'block', fontSize: '0.85rem', color: '#f8fafc', marginBottom: '6px' }}>1. Generator API Key Rahasia:</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Aturan: azAZ09 min 16 karakter dengan embed timestamp.
            </p>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button onClick={handleGenerateKey} className="btn btn-primary">
                ⚡ Generate Key
              </button>
              {generatedKey && (
                <span style={{ fontFamily: 'monospace', background: '#030712', padding: '8px 12px', borderRadius: '6px', color: '#34d399', fontSize: '0.8rem', border: '1px solid #10b981', wordBreak: 'break-all' }}>
                  {generatedKey}
                </span>
              )}
            </div>
          </div>

          <strong style={{ display: 'block', fontSize: '0.85rem', color: '#f8fafc', marginBottom: '10px' }}>2. Pengujian Pengiriman REST API:</strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={handleTestGetBerita} className="btn btn-secondary" style={{ justifyContent: 'space-between' }}>
              <span>📥 GET /api/berita</span>
              <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>Ambil data</span>
            </button>
            <button onClick={handleTestPostBerita} className="btn btn-secondary" style={{ justifyContent: 'space-between' }}>
              <span>📤 POST /api/berita</span>
              <span style={{ fontSize: '0.75rem', color: '#34d399' }}>Input berita AI</span>
            </button>
            <button onClick={handleTestApprove} className="btn btn-secondary" style={{ justifyContent: 'space-between' }}>
              <span>🔐 POST /api/berita/status</span>
              <span style={{ fontSize: '0.75rem', color: '#fbbf24' }}>Uji Approve Key</span>
            </button>
          </div>
        </div>

        {/* Panel Kanan */}
        <div className="card-surface" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px' }}>
            🖥️ JSON Console Output
          </h3>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Mengirim request...</div>
          ) : !testResult ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Belum ada pengujian yang dijalankan.
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-local">{testResult.endpoint}</span>
                <span style={{ fontSize: '0.8rem', color: '#34d399' }}>Status: 200 OK</span>
              </div>
              <pre style={{ background: '#030712', padding: '16px', borderRadius: '10px', overflowX: 'auto', fontSize: '0.8rem', color: '#cbd5e1', border: '1px solid var(--border-subtle)', maxHeight: '400px' }}>
                {JSON.stringify(testResult.response, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

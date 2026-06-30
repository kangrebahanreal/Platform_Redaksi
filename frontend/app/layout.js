'use client';
import './globals.css';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function RootLayout({ children }) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('redaksi_theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('redaksi_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <html lang="id" data-theme={theme}>
      <head>
        <title>Project Redaksi — Real-Time Social Aggregator & Situational Recommendation</title>
      </head>
      <body>
        <nav className="navbar">
          <div className="container nav-container">
            <Link href="/" className="nav-brand">
              <span style={{ color: 'var(--accent-primary)' }}>REDAKSI</span>
              <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>INTELLIGENCE</span>
              <span className="nav-brand-badge">Multi-Platform AI</span>
            </Link>
            
            <div className="nav-menu">
              <Link href="/" className="nav-link">
                📡 Live Feed & Situational AI
              </Link>
              <Link href="/cms" className="nav-link">
                ⚙️ CMS Redaksi
              </Link>
              <Link href="/test-api" className="nav-link">
                🧪 API Sandbox
              </Link>

              <button onClick={toggleTheme} className="theme-toggle" title="Ganti Mode Terang / Gelap">
                <span>{theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Live Trending Ticker */}
        <div className="ticker-bar">
          <div className="container" style={{ overflow: 'hidden' }}>
            <div className="ticker-content">
              <div className="ticker-item">⚡ <span className="tag">#PamulangMacet</span> Pohon tumbang di Pertigaan Pamulang 2</div>
              <div className="ticker-item">📸 <span className="tag">#KulinerBSD</span> Sarapan bubur ayam Pasar Modern viral di TikTok</div>
              <div className="ticker-item">𝕏 <span className="tag">#CuacaTangsel</span> Waspada hujan badai & potensi banjir Ciputat malam ini</div>
              <div className="ticker-item">🎵 <span className="tag">#CuranmorBintaro</span> Imbauan pasang kunci ganda di kawasan parkir Sektor 7</div>
              <div className="ticker-item">🏥 <span className="tag">#FluViral</span> Kemenkes ingatkan konsumsi vitamin C & gunakan masker di area publik</div>
            </div>
          </div>
        </div>

        <main className="container" style={{ paddingTop: '28px', paddingBottom: '64px' }}>
          {children}
        </main>

        <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <div className="container">
            © 2026 Project Redaksi. Real-time Aggregator (Instagram, TikTok, Twitter/X) & Universal Situational AI Advisor.
          </div>
        </footer>
      </body>
    </html>
  );
}

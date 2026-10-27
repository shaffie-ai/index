import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [emel, setEmel]       = useState('')
  const [kata, setKata]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: emel, password: kata })
    if (error) setError('Emel atau kata laluan tidak sah.')
    setLoading(false)
  }

  return (
    <div className="login-page">
      {/* Panel kiri — branding */}
      <div className="login-brand">
        <div className="login-brand-inner">
          <div className="login-logo">⚡</div>
          <h1 className="login-brand-title">Bahan Luak JKE</h1>
          <p className="login-brand-sub">Sistem Permohonan Bahan Luak<br/>Jabatan Kejuruteraan Elektrik</p>
          <div className="login-brand-divider"/>
          <div className="login-features">
            {[
              { icon: '📝', text: 'Mohon bahan dengan mudah' },
              { icon: '📊', text: 'Pantau status permohonan' },
              { icon: '📦', text: 'Kompilasi automatik' },
              { icon: '📥', text: 'Export laporan perolehan' },
            ].map(f => (
              <div key={f.text} className="login-feature-item">
                <span>{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel kanan — borang */}
      <div className="login-form-panel">
        <div className="login-form-box">
          <div className="login-form-header">
            <h2>Log Masuk</h2>
            <p>Masukkan akaun institusi anda</p>
          </div>

          {error && (
            <div className="alert alert-error">⚠️ {error}</div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Gmail <span>✱</span></label>
              <input
                className="form-control"
                type="email"
                placeholder="nama@gmail.com"
                value={emel}
                onChange={e => setEmel(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Kata Laluan <span>✱</span></label>
              <input
                className="form-control"
                type="password"
                placeholder="••••••••"
                value={kata}
                onChange={e => setKata(e.target.value)}
                required
              />
            </div>
            <button className="btn btn-primary btn-full" style={{ marginTop: 8, padding: '12px', fontSize: 15 }} type="submit" disabled={loading}>
              {loading ? '⏳ Sedang log masuk...' : '🔑 Log Masuk'}
            </button>
          </form>

          <div className="login-divider"><span>atau</span></div>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#57606A' }}>
            Belum ada akaun?{' '}
            <Link to="/daftar" style={{ color: '#0078D4', fontWeight: 700, textDecoration: 'none' }}>Daftar di sini →</Link>
          </p>

          <div className="login-footer">
            Jabatan Kejuruteraan Elektrik · Sistem Bahan Luak
          </div>
        </div>
      </div>
    </div>
  )
}

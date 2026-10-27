import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function DaftarPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nama: '', emel: '', kata: '', sahKata: '', peranan: 'pensyarah' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleDaftar(e) {
    e.preventDefault()
    setError('')
    if (form.kata !== form.sahKata) return setError('Kata laluan tidak sepadan.')
    if (form.kata.length < 6) return setError('Kata laluan mestilah sekurang-kurangnya 6 aksara.')
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: form.emel,
      password: form.kata,
      options: { data: { nama_penuh: form.nama, peranan: form.peranan } }
    })
    if (error) setError(error.message)
    else setSuccess(true)
    setLoading(false)
  }

  if (success) return (
    <div style={{ maxWidth: 400, margin: '60px auto' }}>
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Pendaftaran Berjaya!</h2>
        <p style={{ color: '#57606A', fontSize: 14, marginBottom: 20 }}>
          Sila semak emel anda untuk pengesahan akaun, kemudian log masuk.
        </p>
        <Link to="/login" className="btn btn-primary btn-full">🔑 Pergi ke Log Masuk</Link>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 440, margin: '40px auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 40, marginBottom: 6 }}>👤</div>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Daftar Akaun Baru</h1>
        <p style={{ color: '#57606A', fontSize: 13 }}>Sistem Permohonan Bahan Luak JKE</p>
      </div>
      <div className="card">
        <div className="card-title">Maklumat Pendaftaran</div>
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        <form onSubmit={handleDaftar}>
          <div className="form-group">
            <label className="form-label">Nama Penuh <span>✱</span></label>
            <input className="form-control" type="text" placeholder="Nama penuh anda"
              value={form.nama} onChange={e => set('nama', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Gmail <span>✱</span></label>
            <input className="form-control" type="email" placeholder="nama@gmail.com"
              value={form.emel} onChange={e => set('emel', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Peranan <span>✱</span></label>
            <select className="form-control" value={form.peranan} onChange={e => set('peranan', e.target.value)}>
              <option value="pensyarah">Pensyarah</option>
              <option value="koordinator">Koordinator Perolehan</option>
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Kata Laluan <span>✱</span></label>
              <input className="form-control" type="password" placeholder="Min. 6 aksara"
                value={form.kata} onChange={e => set('kata', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Sahkan Kata Laluan <span>✱</span></label>
              <input className="form-control" type="password" placeholder="Ulang kata laluan"
                value={form.sahKata} onChange={e => set('sahKata', e.target.value)} required />
            </div>
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? '⏳ Mendaftar...' : '✅ Daftar Sekarang'}
          </button>
        </form>
        <p style={{ marginTop: 14, textAlign: 'center', fontSize: 13, color: '#57606A' }}>
          Sudah ada akaun?{' '}
          <Link to="/login" style={{ color: '#0078D4', fontWeight: 600 }}>Log masuk</Link>
        </p>
      </div>
    </div>
  )
}

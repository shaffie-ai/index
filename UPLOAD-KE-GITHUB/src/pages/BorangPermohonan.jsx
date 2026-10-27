import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../App'

const KATEGORI = ['Elektronik', 'Mekanikal', 'Elektrik', 'Kimia', 'Lain-lain']
const KATEGORI_IKON = { Elektronik: '⚡', Mekanikal: '⚙️', Elektrik: '🔌', Kimia: '🧪', 'Lain-lain': '📦' }
const UNIT = ['unit', 'pcs', 'meter', 'liter', 'lain-lain']

const INIT = {
  nama_bahan: '', kategori: 'Elektronik', spesifikasi: '',
  kuantiti: '', unit: 'unit', kursus_subjek: '',
  tarikh_diperlukan: '', catatan: ''
}

export default function BorangPermohonan() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]       = useState(INIT)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [preview, setPreview] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function handlePreview(e) {
    e.preventDefault()
    if (!form.nama_bahan || !form.kuantiti || !form.kursus_subjek || !form.tarikh_diperlukan) {
      setError('Sila isi semua medan bertanda ✱')
      return
    }
    setError('')
    setPreview(true)
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    const { error } = await supabase.from('permohonan').insert({
      user_id:           user.id,
      nama_pensyarah:    profile?.nama_penuh || user.email,
      emel_pensyarah:    profile?.emel || user.email,
      nama_bahan:        form.nama_bahan,
      kategori:          form.kategori,
      spesifikasi:       form.spesifikasi,
      kuantiti:          Number(form.kuantiti),
      unit:              form.unit,
      kursus_subjek:     form.kursus_subjek,
      tarikh_diperlukan: form.tarikh_diperlukan,
      catatan:           form.catatan,
      status:            'Menunggu',
    })
    setLoading(false)
    if (error) {
      console.error('Supabase error:', error)
      setError(`Gagal hantar: ${error.message}`)
      setPreview(false)
    } else {
      navigate('/permohonan')
    }
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div className="welcome-banner" style={{ marginBottom: 24 }}>
        <div className="welcome-banner-inner">
          <div>
            <div className="welcome-greeting">Borang Permohonan</div>
            <div className="welcome-name">📝 Permohonan Bahan Luak Baru</div>
            <div className="welcome-sub">Isi semua maklumat yang diperlukan</div>
          </div>
          <button className="btn btn-white" onClick={() => navigate(-1)}>← Kembali</button>
        </div>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Preview Modal */}
      {preview && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">✅ Semak Sebelum Hantar</div>
            <table style={{ width: '100%', fontSize: 13 }}>
              <tbody>
                {[
                  ['Nama Bahan',    form.nama_bahan],
                  ['Kategori',      `${KATEGORI_IKON[form.kategori]} ${form.kategori}`],
                  ['Spesifikasi',   form.spesifikasi || '-'],
                  ['Kuantiti',      `${form.kuantiti} ${form.unit}`],
                  ['Kursus',        form.kursus_subjek],
                  ['Tarikh Perlu',  form.tarikh_diperlukan],
                  ['Catatan',       form.catatan || '-'],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ padding: '7px 0', color: '#57606A', width: '40%' }}>{k}</td>
                    <td style={{ padding: '7px 0', fontWeight: 500 }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setPreview(false)}>✏️ Edit Semula</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? '⏳ Menghantar...' : '📤 Hantar Permohonan'}
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handlePreview}>
        {/* Bahagian 1 — Maklumat Bahan */}
        <div className="form-section">
          <div className="form-section-title">📦 Maklumat Bahan</div>

          <div className="form-group">
            <label className="form-label">Kategori Bahan <span>✱</span></label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {KATEGORI.map(k => (
                <button
                  type="button"
                  key={k}
                  onClick={() => set('kategori', k)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: `2px solid ${form.kategori === k ? '#0078D4' : '#E5E7EB'}`,
                    background: form.kategori === k ? '#EFF6FF' : '#fff',
                    color: form.kategori === k ? '#0078D4' : '#1f2328',
                    cursor: 'pointer',
                    fontWeight: form.kategori === k ? 700 : 400,
                    fontSize: 13,
                    transition: 'all 0.15s'
                  }}
                >
                  {KATEGORI_IKON[k]} {k}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nama Bahan <span>✱</span></label>
            <input className="form-control" type="text" placeholder="Contoh: Resistor 10kΩ"
              value={form.nama_bahan} onChange={e => set('nama_bahan', e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Spesifikasi</label>
            <input className="form-control" type="text" placeholder="Contoh: 1/4W, ±5%, Through Hole"
              value={form.spesifikasi} onChange={e => set('spesifikasi', e.target.value)} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Kuantiti <span>✱</span></label>
              <input className="form-control" type="number" min="1" placeholder="0"
                value={form.kuantiti} onChange={e => set('kuantiti', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Unit <span>✱</span></label>
              <select className="form-control" value={form.unit} onChange={e => set('unit', e.target.value)}>
                {UNIT.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Bahagian 2 — Maklumat Kursus */}
        <div className="form-section">
          <div className="form-section-title">📚 Maklumat Kursus</div>

          <div className="form-group">
            <label className="form-label">Kursus / Subjek <span>✱</span></label>
            <input className="form-control" type="text" placeholder="Contoh: BEE2223 - Litar Elektrik"
              value={form.kursus_subjek} onChange={e => set('kursus_subjek', e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Tarikh Diperlukan <span>✱</span></label>
            <input className="form-control" type="date"
              min={new Date().toISOString().split('T')[0]}
              value={form.tarikh_diperlukan} onChange={e => set('tarikh_diperlukan', e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Catatan Tambahan</label>
            <textarea className="form-control" rows={3} placeholder="Maklumat tambahan jika ada..."
              value={form.catatan} onChange={e => set('catatan', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Batal</button>
          <button type="submit" className="btn btn-primary">Semak & Hantar →</button>
        </div>
      </form>
    </div>
  )
}

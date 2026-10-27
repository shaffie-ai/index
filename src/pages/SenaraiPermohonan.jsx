import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import StatusBadge from '../components/StatusBadge'
import ProgressTracker from '../components/ProgressTracker'

const TABS = ['Semua', 'Menunggu', 'Dikompil', 'Dalam Perolehan', 'Diterima', 'Ditolak']

export default function SenaraiPermohonan() {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('Semua')
  const [selected, setSelected] = useState(null)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const { data: rows } = await supabase
      .from('permohonan')
      .select('*')
      .order('created_at', { ascending: false })
    setData(rows ?? [])
    setLoading(false)
  }

  const filtered = tab === 'Semua' ? data : data.filter(d => d.status === tab)

  if (loading) return <div className="loading-screen"><div className="spinner"/><span>Memuatkan...</span></div>

  return (
    <div>
      <div className="welcome-banner" style={{ marginBottom: 24 }}>
        <div className="welcome-banner-inner">
          <div>
            <div className="welcome-greeting">Rekod Permohonan</div>
            <div className="welcome-name">📂 Permohonan Saya</div>
            <div className="welcome-sub">{data.length} permohonan keseluruhan</div>
          </div>
          <Link to="/mohon" className="btn btn-white">＋ Permohonan Baru</Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tab-nav" style={{ marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t} {t !== 'Semua' && <span style={{ opacity: 0.7 }}>({data.filter(d => d.status === t).length})</span>}
          </button>
        ))}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-title">
              📋 {selected.nama_bahan}
              <span style={{ marginLeft: 10 }}><StatusBadge status={selected.status} /></span>
            </div>
            <ProgressTracker status={selected.status} />
            <table style={{ width: '100%', fontSize: 13, marginTop: 16 }}>
              <tbody>
                {[
                  ['No. Siri',       selected.nombor_siri ?? '-'],
                  ['Kategori',       selected.kategori],
                  ['Spesifikasi',    selected.spesifikasi || '-'],
                  ['Kuantiti',       `${selected.kuantiti} ${selected.unit}`],
                  ['Kursus',         selected.kursus_subjek],
                  ['Tarikh Perlu',   selected.tarikh_diperlukan],
                  ['Tarikh Mohon',   new Date(selected.created_at).toLocaleDateString('ms-MY')],
                  ['Catatan',        selected.catatan || '-'],
                  ['Rujukan Perolehan', selected.rujukan_perolehan || '-'],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ padding: '7px 0', color: '#57606A', width: '38%', fontSize: 12 }}>{k}</td>
                    <td style={{ padding: '7px 0', fontWeight: 500 }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>Tiada permohonan ditemui</h3>
          <p>Cuba tukar tab filter di atas</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(p => (
            <div key={p.id} className="card" style={{ cursor: 'pointer', margin: 0 }}
              onClick={() => setSelected(p)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{p.nama_bahan}</div>
                  <div style={{ fontSize: 12, color: '#57606A' }}>
                    {p.kategori} &nbsp;·&nbsp; {p.kuantiti} {p.unit}
                    {p.spesifikasi && ` · ${p.spesifikasi}`}
                  </div>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <div style={{ fontSize: 12, color: '#57606A', marginBottom: 10 }}>
                📚 {p.kursus_subjek} &nbsp;·&nbsp;
                📅 Perlu: {p.tarikh_diperlukan} &nbsp;·&nbsp;
                🕐 Mohon: {new Date(p.created_at).toLocaleDateString('ms-MY')}
              </div>
              <ProgressTracker status={p.status} />
              {p.rujukan_perolehan && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#0078D4', fontWeight: 600 }}>
                  📎 Rujukan: {p.rujukan_perolehan}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

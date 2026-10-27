import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import StatusBadge from '../components/StatusBadge'

const STATUS_LIST = ['Menunggu', 'Dikompil', 'Dalam Perolehan', 'Diterima', 'Ditolak']
const TABS = ['Semua', ...STATUS_LIST]

export default function DashboardKoordinator() {
  const [data, setData]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState('Semua')
  const [carian, setCarian]     = useState('')
  const [editItem, setEditItem] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [rujukan, setRujukan]   = useState('')
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState(null)
  const [view, setView]         = useState('senarai') // 'senarai' | 'kompil'

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const { data: rows } = await supabase
      .from('permohonan').select('*').order('created_at', { ascending: false })
    setData(rows ?? [])
    setLoading(false)
  }

  const kpi = {
    semua:    data.length,
    menunggu: data.filter(d => d.status === 'Menunggu').length,
    perolehan: data.filter(d => d.status === 'Dalam Perolehan').length,
    selesai:  data.filter(d => d.status === 'Diterima').length,
  }

  const filtered = data.filter(d => {
    const matchTab    = tab === 'Semua' || d.status === tab
    const matchCarian = !carian || [d.nama_bahan, d.nama_pensyarah, d.kursus_subjek]
      .some(f => f?.toLowerCase().includes(carian.toLowerCase()))
    return matchTab && matchCarian
  })

  // Kompilasi — gabungkan kuantiti bahan yang sama (semua status)
  const kompilMap = {}
  data.forEach(d => {
    const key = `${d.nama_bahan}||${d.spesifikasi ?? ''}||${d.unit}`
    if (!kompilMap[key]) kompilMap[key] = { nama_bahan: d.nama_bahan, spesifikasi: d.spesifikasi, unit: d.unit, kuantiti: 0, pensyarah: [], status: new Set() }
    kompilMap[key].kuantiti += Number(d.kuantiti)
    if (!kompilMap[key].pensyarah.includes(d.nama_pensyarah)) kompilMap[key].pensyarah.push(d.nama_pensyarah)
    kompilMap[key].status.add(d.status)
  })
  const kompilList = Object.values(kompilMap)

  function exportCSV() {
    const header = 'Bil,Nama Bahan,Spesifikasi,Jumlah Kuantiti,Unit,Dimohon Oleh,Status\n'
    const rows = kompilList.map((r, i) =>
      `${i+1},"${r.nama_bahan}","${r.spesifikasi ?? ''}",${r.kuantiti},${r.unit},"${r.pensyarah.join('; ')}","${[...r.status].join('; ')}"`)
    const blob = new Blob([header + rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url
    a.download = `senarai-perolehan-${new Date().toISOString().split('T')[0]}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  function openEdit(item) {
    setEditItem(item)
    setNewStatus(item.status)
    setRujukan(item.rujukan_perolehan ?? '')
    setMsg(null)
  }

  async function saveStatus() {
    setSaving(true)
    const { error } = await supabase.from('permohonan')
      .update({ status: newStatus, rujukan_perolehan: rujukan })
      .eq('id', editItem.id)
    setSaving(false)
    if (error) { setMsg({ type: 'error', text: 'Gagal kemaskini.' }) }
    else {
      setMsg({ type: 'success', text: 'Status berjaya dikemaskini!' })
      await fetchData()
      setTimeout(() => { setEditItem(null); setMsg(null) }, 1200)
    }
  }

  if (loading) return <div className="loading-screen"><div className="spinner"/><span>Memuatkan...</span></div>

  return (
    <div>
      {/* Header */}
      <div className="coord-header">
        <div className="coord-header-text">
          <h1>📊 Dashboard Koordinator</h1>
          <p>Penyelaras Perolehan Jabatan — semua permohonan bahan luak</p>
        </div>
        <div className="coord-header-actions">
          <button className={`btn-coord ${view === 'senarai' ? 'btn-coord-solid' : 'btn-coord-outline'}`} onClick={() => setView('senarai')}>📋 Senarai</button>
          <button className={`btn-coord ${view === 'kompil' ? 'btn-coord-solid' : 'btn-coord-outline'}`} onClick={() => setView('kompil')}>📦 Kompilasi</button>
        </div>
      </div>

      {/* KPI */}
      <div className="kpi-grid">
        <div className="kpi-card kpi-blue">
          <div className="kpi-icon">📋</div>
          <div className="kpi-num">{kpi.semua}</div>
          <div className="kpi-label">Jumlah Masuk</div>
        </div>
        <div className="kpi-card kpi-yellow">
          <div className="kpi-icon">⏳</div>
          <div className="kpi-num">{kpi.menunggu}</div>
          <div className="kpi-label">Menunggu Tindakan</div>
        </div>
        <div className="kpi-card kpi-orange">
          <div className="kpi-icon">🛒</div>
          <div className="kpi-num">{kpi.perolehan}</div>
          <div className="kpi-label">Dalam Perolehan</div>
        </div>
        <div className="kpi-card kpi-green">
          <div className="kpi-icon">✅</div>
          <div className="kpi-num">{kpi.selesai}</div>
          <div className="kpi-label">Selesai</div>
        </div>
      </div>

      {/* Modal Edit Status */}
      {editItem && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">✏️ Kemaskini Status — {editItem.nama_bahan}</div>
            {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
            <div className="form-group">
              <label className="form-label">Status Baru</label>
              <select className="form-control" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                {STATUS_LIST.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Rujukan Perolehan (jika ada)</label>
              <input className="form-control" type="text" placeholder="Contoh: PO-2025-001"
                value={rujukan} onChange={e => setRujukan(e.target.value)} />
            </div>
            <div style={{ background: '#F3F2F1', borderRadius: 8, padding: '12px', fontSize: 13, color: '#57606A' }}>
              <strong>Pemohon:</strong> {editItem.nama_pensyarah}<br/>
              <strong>Bahan:</strong> {editItem.nama_bahan} — {editItem.kuantiti} {editItem.unit}<br/>
              <strong>Kursus:</strong> {editItem.kursus_subjek}
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setEditItem(null)}>Batal</button>
              <button className="btn btn-primary" onClick={saveStatus} disabled={saving}>
                {saving ? '⏳ Menyimpan...' : '💾 Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: SENARAI */}
      {view === 'senarai' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div className="tab-nav" style={{ margin: 0, flexWrap: 'wrap' }}>
              {TABS.map(t => (
                <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                  {t} <span style={{ opacity: 0.65 }}>({t === 'Semua' ? data.length : data.filter(d => d.status === t).length})</span>
                </button>
              ))}
            </div>
            <input className="form-control" style={{ width: 220 }} type="text"
              placeholder="🔍 Cari bahan / pensyarah..." value={carian}
              onChange={e => setCarian(e.target.value)} />
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>Tiada rekod ditemui</h3>
              <p>Cuba ubah tab atau carian</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>No. Siri</th>
                    <th>Pensyarah</th>
                    <th>Nama Bahan</th>
                    <th>Kuantiti</th>
                    <th>Kursus</th>
                    <th>Tarikh Perlu</th>
                    <th>Status</th>
                    <th>Tindakan</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#57606A' }}>{p.nombor_siri ?? '-'}</td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{p.nama_pensyarah}</div>
                        <div style={{ fontSize: 11, color: '#57606A' }}>{p.emel_pensyarah}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.nama_bahan}</div>
                        {p.spesifikasi && <div style={{ fontSize: 11, color: '#57606A' }}>{p.spesifikasi}</div>}
                      </td>
                      <td>{p.kuantiti} {p.unit}</td>
                      <td style={{ fontSize: 12 }}>{p.kursus_subjek}</td>
                      <td style={{ fontSize: 12 }}>{p.tarikh_diperlukan}</td>
                      <td><StatusBadge status={p.status} /></td>
                      <td>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>
                          ✏️ Kemaskini
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW: KOMPILASI */}
      {view === 'kompil' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div className="card-title" style={{ margin: 0, padding: 0, border: 'none' }}>📦 Senarai Kompilasi untuk Perolehan</div>
              <p style={{ fontSize: 12, color: '#57606A', marginTop: 4 }}>
                Permohonan status Menunggu & Dikompil digabungkan mengikut bahan
              </p>
            </div>
            <button className="btn btn-success btn-sm" onClick={exportCSV}>
              📥 Export CSV
            </button>
          </div>

          {kompilList.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">✅</div>
              <h3>Tiada permohonan menunggu</h3>
              <p>Semua permohonan telah diproses</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Bil</th>
                    <th>Nama Bahan</th>
                    <th>Spesifikasi</th>
                    <th>Jumlah Kuantiti</th>
                    <th>Unit</th>
                    <th>Dimohon Oleh</th>
                  </tr>
                </thead>
                <tbody>
                  {kompilList.map((r, i) => (
                    <tr key={i}>
                      <td style={{ color: '#57606A' }}>{i + 1}</td>
                      <td style={{ fontWeight: 700 }}>{r.nama_bahan}</td>
                      <td style={{ fontSize: 12, color: '#57606A' }}>{r.spesifikasi || '-'}</td>
                      <td style={{ fontWeight: 700, color: '#0078D4', fontSize: 16 }}>{r.kuantiti}</td>
                      <td>{r.unit}</td>
                      <td style={{ fontSize: 12, color: '#57606A' }}>
                        {r.pensyarah.map((p, j) => (
                          <span key={j} style={{ display: 'inline-block', background: '#EFF6FF', color: '#0078D4', padding: '2px 8px', borderRadius: 8, fontSize: 11, margin: '2px 2px 2px 0', fontWeight: 600 }}>
                            {p}
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

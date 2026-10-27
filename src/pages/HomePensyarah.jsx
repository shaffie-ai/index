import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../App'
import StatusBadge from '../components/StatusBadge'

export default function HomePensyarah() {
  const { profile } = useAuth()
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [kpi, setKpi]         = useState({ semua: 0, menunggu: 0, diterima: 0 })

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const { data: rows } = await supabase
      .from('permohonan')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    if (rows) {
      setData(rows)
      const { count: semua }    = await supabase.from('permohonan').select('*', { count: 'exact', head: true })
      const { count: menunggu } = await supabase.from('permohonan').select('*', { count: 'exact', head: true }).eq('status', 'Menunggu')
      const { count: diterima } = await supabase.from('permohonan').select('*', { count: 'exact', head: true }).eq('status', 'Diterima')
      setKpi({ semua: semua ?? 0, menunggu: menunggu ?? 0, diterima: diterima ?? 0 })
    }
    setLoading(false)
  }

  if (loading) return <div className="loading-screen"><div className="spinner"/><span>Memuatkan...</span></div>

  const nama = profile?.nama_penuh?.split(' ')[0] ?? 'Pensyarah'

  return (
    <div>
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-banner-inner">
          <div>
            <div className="welcome-greeting">Selamat Datang,</div>
            <div className="welcome-name">{profile?.nama_penuh ?? 'Pensyarah'}</div>
            <div className="welcome-sub">Sistem Permohonan Bahan Luak — Jabatan Kejuruteraan Elektrik</div>
          </div>
          <Link to="/mohon" className="btn btn-white">
            ＋ Permohonan Baru
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ marginTop: 24 }}>
        <div className="kpi-card kpi-blue">
          <div className="kpi-icon">📋</div>
          <div className="kpi-num">{kpi.semua}</div>
          <div className="kpi-label">Jumlah Permohonan</div>
        </div>
        <div className="kpi-card kpi-yellow">
          <div className="kpi-icon">⏳</div>
          <div className="kpi-num">{kpi.menunggu}</div>
          <div className="kpi-label">Menunggu Tindakan</div>
        </div>
        <div className="kpi-card kpi-green">
          <div className="kpi-icon">✅</div>
          <div className="kpi-num">{kpi.diterima}</div>
          <div className="kpi-label">Bahan Diterima</div>
        </div>
      </div>

      {/* Permohonan Terkini */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="card-title" style={{ margin: 0, border: 'none', padding: 0 }}>📋 Permohonan Terkini</div>
          <Link to="/permohonan" style={{ color: '#0078D4', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            Lihat Semua →
          </Link>
        </div>
        {data.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>Tiada permohonan lagi</h3>
            <p style={{ marginBottom: 16 }}>Buat permohonan pertama anda sekarang</p>
            <Link to="/mohon" className="btn btn-primary btn-sm">+ Permohonan Baru</Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>No. Siri</th>
                  <th>Nama Bahan</th>
                  <th>Kuantiti</th>
                  <th>Kursus</th>
                  <th>Tarikh Mohon</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#57606A' }}>{p.nombor_siri ?? '-'}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.nama_bahan}</div>
                      {p.spesifikasi && <div style={{ fontSize: 12, color: '#57606A' }}>{p.spesifikasi}</div>}
                    </td>
                    <td>{p.kuantiti} {p.unit}</td>
                    <td style={{ fontSize: 12 }}>{p.kursus_subjek}</td>
                    <td style={{ fontSize: 12, color: '#57606A' }}>
                      {new Date(p.created_at).toLocaleDateString('ms-MY')}
                    </td>
                    <td><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Panduan Status */}
      <div className="card">
        <div className="card-title">🏷️ Panduan Status Permohonan</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {[
            { status: 'Menunggu',        desc: 'Permohonan baru, belum diproses' },
            { status: 'Dikompil',        desc: 'Digabungkan dengan permohonan lain' },
            { status: 'Dalam Perolehan', desc: 'Proses pembelian sedang berjalan' },
            { status: 'Diterima',        desc: 'Bahan tiba, sedia diambil' },
            { status: 'Ditolak',         desc: 'Hubungi koordinator' },
          ].map(s => (
            <div key={s.status} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#fafafa', borderRadius: 8, border: '1px solid #E5E7EB' }}>
              <StatusBadge status={s.status} />
              <span style={{ fontSize: 12, color: '#57606A' }}>{s.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

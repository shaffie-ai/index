import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../App'

export default function Navbar() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        🔧 Bahan Luak JKE
      </Link>
      <div className="navbar-user">
        {profile?.peranan === 'pensyarah' && (
          <>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: 13 }}>Utama</Link>
            <Link to="/mohon" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: 13 }}>+ Permohonan</Link>
            <Link to="/permohonan" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: 13 }}>Senarai</Link>
          </>
        )}
        <span style={{ opacity: 0.7, fontSize: 12 }}>
          {profile?.nama_penuh ?? profile?.emel}
        </span>
        <span style={{
          background: 'rgba(255,255,255,0.2)',
          padding: '2px 8px',
          borderRadius: 10,
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          color: '#fff'
        }}>
          {profile?.peranan}
        </span>
        <button className="btn-logout" onClick={handleLogout}>Keluar</button>
      </div>
    </nav>
  )
}

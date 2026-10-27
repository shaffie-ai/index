import { useState, useEffect, createContext, useContext } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import DaftarPage from './pages/DaftarPage'
import HomePensyarah from './pages/HomePensyarah'
import BorangPermohonan from './pages/BorangPermohonan'
import SenaraiPermohonan from './pages/SenaraiPermohonan'
import DashboardKoordinator from './pages/DashboardKoordinator'

export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

function ProtectedRoute({ children, role }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <div className="loading-screen"><div className="spinner"/><span>Memuatkan...</span></div>
  if (!user) return <Navigate to="/login" replace />
  if (role && profile?.peranan !== role) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data)
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      <Router>
        <div className="app-shell">
          {user && <Navbar />}
          <main className="main-content">
            <Routes>
              <Route path="/login"  element={user ? <Navigate to="/" /> : <LoginPage />} />
              <Route path="/daftar" element={user ? <Navigate to="/" /> : <DaftarPage />} />
              <Route path="/" element={
                <ProtectedRoute>
                  {profile?.peranan === 'koordinator'
                    ? <DashboardKoordinator />
                    : <HomePensyarah />}
                </ProtectedRoute>
              }/>
              <Route path="/mohon" element={
                <ProtectedRoute><BorangPermohonan /></ProtectedRoute>
              }/>
              <Route path="/permohonan" element={
                <ProtectedRoute><SenaraiPermohonan /></ProtectedRoute>
              }/>
              <Route path="/koordinator" element={
                <ProtectedRoute role="koordinator"><DashboardKoordinator /></ProtectedRoute>
              }/>
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthContext.Provider>
  )
}

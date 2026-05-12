import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import Navbar from '@/components/layout/Navbar'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import HomePage from '@/pages/HomePage'
import EventDetailPage from '@/pages/EventDetailPage'
import RecommendedPage from '@/pages/RecommendedPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ProfilePage from '@/pages/ProfilePage'
import AdminPage from '@/pages/AdminPage'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="grain min-h-screen">
          <Navbar />
          <Routes>
            {/* Públicas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/eventos/:id" element={<EventDetailPage />} />
            <Route path="/recomendados" element={<RecommendedPage />} />

            {/* Solo visitantes (redirige si ya tienes sesión) */}
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/registro" element={<GuestRoute><RegisterPage /></GuestRoute>} />

            {/* Requieren sesión */}
            <Route path="/perfil" element={
              <ProtectedRoute><ProfilePage /></ProtectedRoute>
            } />

            {/* Solo admin */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>
            } />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

// Redirige al home si ya tienes sesión (evita ver login/registro logueado)
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/" replace />
  return <>{children}</>
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <span className="text-5xl mb-4">🗺️</span>
      <h1 className="text-2xl font-bold text-stone-200 mb-2"
        style={{ fontFamily: 'Syne, sans-serif' }}>
        Página no encontrada
      </h1>
      <a href="/" className="gdl-btn-primary mt-4 inline-flex">
        Volver al inicio
      </a>
    </div>
  )
}
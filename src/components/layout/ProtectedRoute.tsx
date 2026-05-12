import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface Props {
  children: React.ReactNode
  adminOnly?: boolean
}

export default function ProtectedRoute({ children, adminOnly = false }: Props) {
  const { user, loading, isAdmin } = useAuth()
  const location = useLocation()

  // Mientras valida el token guardado, muestra spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="text-orange-500 animate-spin" />
      </div>
    )
  }

  // No autenticado → redirige al login guardando la ruta de origen
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Autenticado pero no es admin
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
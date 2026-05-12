import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { authApi } from '@/services/api'
import type { UserProfile } from '@/types'

interface AuthState {
  user: UserProfile | null
  token: string | null
  loading: boolean
  login: (token: string) => Promise<void>
  logout: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('gdl_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('gdl_token')
  )

  // Si hay token guardado arrancamos en true para validarlo antes de mostrar nada
  const [loading, setLoading] = useState(!!localStorage.getItem('gdl_token'))

  const logout = useCallback(() => {
    localStorage.removeItem('gdl_token')
    localStorage.removeItem('gdl_user')
    setToken(null)
    setUser(null)
  }, [])

  const login = useCallback(async (newToken: string) => {
    localStorage.setItem('gdl_token', newToken)
    setToken(newToken)
    try {
      const profile = await authApi.me()
      setUser(profile)
      localStorage.setItem('gdl_user', JSON.stringify(profile))
    } catch {
      logout()
    }
  }, [logout])

  // Valida el token guardado al montar — si expiró o es inválido limpia la sesión
  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    authApi.me()
      .then((profile) => {
        setUser(profile)
        localStorage.setItem('gdl_user', JSON.stringify(profile))
      })
      .catch(() => logout())
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Mientras valida el token muestra un spinner de pantalla completa
  // para evitar flashes de contenido protegido
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen"
        style={{ background: 'var(--gdl-bg, #0c0a09)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white text-xs font-black"
            style={{ fontFamily: 'Syne, sans-serif' }}>
            GDL
          </div>
          <Loader2 size={20} className="text-orange-500 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
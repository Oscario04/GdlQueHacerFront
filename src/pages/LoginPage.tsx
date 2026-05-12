import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { authApi } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/lib/utils'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { access_token } = await authApi.login(form)
      await login(access_token)
      navigate(from, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-up">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/20 mb-4">
            <span className="text-orange-400 text-lg">🌆</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-100"
            style={{ fontFamily: 'Syne, sans-serif' }}>
            Bienvenido de vuelta
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            Entra para ver tus recomendaciones personalizadas
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}
          className="gdl-card p-6 flex flex-col gap-4 animate-fade-up stagger-1">

          {error && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm text-rose-400">
              {error}
            </div>
          )}

          <div>
            <label className="gdl-label">Correo electrónico</label>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="tu@correo.com"
              className="gdl-input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="gdl-label">Contraseña</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="gdl-input pr-10"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPwd((o) => !o)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300">
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="gdl-btn-primary w-full mt-1">
            <LogIn size={15} />
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-4 animate-fade-up stagger-2">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="text-orange-400 hover:text-orange-300 font-medium">
            Regístrate gratis
          </Link>
        </p>
      </div>
    </main>
  )
}
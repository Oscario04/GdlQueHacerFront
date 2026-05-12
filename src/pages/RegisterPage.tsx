import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { authApi } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/lib/utils'
import CategoryPicker from '@/components/preferences/CategoryPicker'

type Step = 'register' | 'preferences'

export default function RegisterPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

  const [step, setStep] = useState<Step>('register')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { access_token } = await authApi.register(form)
      await login(access_token)
      setStep('preferences')  // ir al picker en vez de navegar
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handlePreferencesSaved = () => {
    navigate(from, { replace: true })
  }

  const pwdStrength = (() => {
    const p = form.password
    if (p.length === 0) return null
    if (p.length < 6) return { label: 'Muy corta', color: 'bg-rose-500', width: '25%' }
    if (p.length < 8 || !/\d/.test(p)) return { label: 'Débil', color: 'bg-amber-500', width: '50%' }
    if (!/[A-Z]/.test(p)) return { label: 'Aceptable', color: 'bg-yellow-400', width: '75%' }
    return { label: 'Fuerte', color: 'bg-emerald-500', width: '100%' }
  })()

  // ── Paso 2: Selector de categorías ───────────────────────────────
  if (step === 'preferences') {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-4 py-8">
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-orange-500/5 blur-3xl" />
        </div>
        <div className="w-full max-w-sm">
          <div className="gdl-card p-6 animate-fade-up">
            <CategoryPicker
              onSaved={handlePreferencesSaved}
              onSkip={() => navigate(from, { replace: true })}
            />
          </div>
        </div>
      </main>
    )
  }

  // ── Paso 1: Formulario de registro ────────────────────────────────
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8 animate-fade-up">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/20 mb-4">
            <span className="text-orange-400 text-lg">🎉</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-100"
            style={{ fontFamily: 'Syne, sans-serif' }}>
            Crea tu cuenta
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            Descubre eventos personalizados en la ZMG
          </p>
        </div>

        <form onSubmit={handleSubmit}
          className="gdl-card p-6 flex flex-col gap-4 animate-fade-up stagger-1">
          {error && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm text-rose-400">
              {error}
            </div>
          )}

          <div>
            <label className="gdl-label">Nombre</label>
            <input type="text" required minLength={2} placeholder="Tu nombre"
              className="gdl-input" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div>
            <label className="gdl-label">Correo electrónico</label>
            <input type="email" required autoComplete="email"
              placeholder="tu@correo.com" className="gdl-input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>

          <div>
            <label className="gdl-label">Contraseña</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} required minLength={8}
                placeholder="Mínimo 8 caracteres" className="gdl-input pr-10"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <button type="button" onClick={() => setShowPwd((o) => !o)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300">
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {pwdStrength && (
              <div className="mt-2">
                <div className="h-1 rounded-full bg-night-600 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${pwdStrength.color}`}
                    style={{ width: pwdStrength.width }} />
                </div>
                <p className="text-xs text-stone-500 mt-1">{pwdStrength.label}</p>
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="gdl-btn-primary w-full mt-1">
            <UserPlus size={15} />
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          <p className="text-xs text-stone-500 text-center">
            Al registrarte aceptas nuestros términos de servicio.
          </p>
        </form>

        <p className="text-center text-sm text-stone-500 mt-4 animate-fade-up stagger-2">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-orange-400 hover:text-orange-300 font-medium">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  )
}
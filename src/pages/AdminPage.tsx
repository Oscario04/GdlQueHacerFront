import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart2, Users, Eye, CheckCircle2, XCircle,
  Plus, Loader2, RefreshCw, ShieldCheck, Zap, Brain,
} from 'lucide-react'
import { adminApi } from '@/services/api'
import type { AdminStats, ReviewItem, EventCategory } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { CATEGORY_META, formatRelative, cn } from '@/lib/utils'
import JobTerminal from '@/components/admin/JobTerminal'

type Tab = 'stats' | 'reviews' | 'create'

const CATEGORY_OPTIONS: EventCategory[] = [
  'cultural', 'deportivo', 'gastronomico', 'entretenimiento', 'otro'
]

export default function AdminPage() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('stats')

  useEffect(() => {
    if (!user) navigate('/login')
    else if (!isAdmin) navigate('/')
  }, [user, isAdmin, navigate])

  if (!user || !isAdmin) return null

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 animate-fade-up">
        <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/20
          flex items-center justify-center">
          <ShieldCheck size={18} className="text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-stone-100"
            style={{ fontFamily: 'Syne, sans-serif' }}>
            Panel de Administración
          </h1>
          <p className="text-xs text-stone-500">GDL Qué Hacer · Sistema</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-night-800 border w-fit"
        style={{ borderColor: 'var(--gdl-border)' }}>
        {(['stats', 'reviews', 'create'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              tab === t
                ? 'bg-orange-500 text-white'
                : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
            )}
            style={{ fontFamily: 'Syne, sans-serif' }}>
            {t === 'stats' ? '📊 Estadísticas' : t === 'reviews' ? '🔍 Revisión' : '➕ Nuevo evento'}
          </button>
        ))}
      </div>

      {tab === 'stats' && <StatsTab />}
      {tab === 'reviews' && <ReviewsTab />}
      {tab === 'create' && <CreateEventTab />}
    </main>
  )
}

// ── Stats Tab ─────────────────────────────────────────────────────────

function StatsTab() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Scraper job
  const [scraperJobId, setScraperJobId] = useState<string | null>(null)
  const [scraperRunning, setScraperRunning] = useState(false)

  // Retrain job
  const [retrainJobId, setRetrainJobId] = useState<string | null>(null)
  const [retrainRunning, setRetrainRunning] = useState(false)

  useEffect(() => {
    adminApi.stats().then(setStats).finally(() => setLoading(false))
  }, [])

  const handleTriggerScraper = async () => {
    setScraperRunning(true)
    setScraperJobId(null)
    try {
      const res = await adminApi.triggerScraper()
      setScraperJobId(res.job_id)
    } catch {
      setScraperRunning(false)
    }
  }

  const handleTriggerRetrain = async () => {
    setRetrainRunning(true)
    setRetrainJobId(null)
    try {
      const res = await adminApi.triggerRetrain()
      setRetrainJobId(res.job_id)
    } catch {
      setRetrainRunning(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center py-16">
      <Loader2 size={24} className="text-orange-500 animate-spin" />
    </div>
  )

  if (!stats) return (
    <p className="text-stone-400">No se pudieron cargar las estadísticas.</p>
  )

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard icon="🎯" label="Total eventos" value={stats.events.total} />
        <KPICard icon="✅" label="Publicados" value={stats.events.published} accent />
        <KPICard icon="🔍" label="En revisión" value={stats.events.pending_review} warn />
        <KPICard icon="👥" label="Usuarios" value={stats.users.total} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Category distribution */}
        <div className="gdl-card p-5">
          <h3 className="font-semibold text-stone-200 mb-4 text-sm"
            style={{ fontFamily: 'Syne, sans-serif' }}>
            Eventos por categoría
          </h3>
          <div className="flex flex-col gap-3">
            {Object.entries(stats.events.by_category).map(([cat, count]) => {
              const meta = CATEGORY_META[cat as EventCategory] ?? CATEGORY_META.otro
              const pct = stats.events.published > 0
                ? Math.round((count / stats.events.published) * 100)
                : 0
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn('text-xs font-medium', meta.color)}>
                      {meta.emoji} {meta.label}
                    </span>
                    <span className="text-xs text-stone-400">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-night-700">
                    <div className="h-full rounded-full bg-orange-500 transition-all"
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sistema */}
        <div className="gdl-card p-5 flex flex-col gap-4">
          <h3 className="font-semibold text-stone-200 text-sm"
            style={{ fontFamily: 'Syne, sans-serif' }}>
            Sistema
          </h3>
          <div className="flex flex-col gap-2 text-sm">
            <Row label="Total interacciones" value={stats.interactions.total} />
            <Row
              label="Actualizado"
              value={new Date(stats.generated_at).toLocaleTimeString('es-MX')}
            />
          </div>

          <div className="flex flex-col gap-2 mt-auto pt-4 border-t"
            style={{ borderColor: 'var(--gdl-border)' }}>
            <button
              onClick={handleTriggerScraper}
              disabled={scraperRunning}
              className="gdl-btn-outline w-full gap-2">
              {scraperRunning
                ? <Loader2 size={14} className="animate-spin" />
                : <Zap size={14} className="text-orange-400" />}
              {scraperRunning ? 'Scraper ejecutándose...' : 'Disparar scraper'}
            </button>

            <button
              onClick={handleTriggerRetrain}
              disabled={retrainRunning}
              className="gdl-btn-outline w-full gap-2">
              {retrainRunning
                ? <Loader2 size={14} className="animate-spin" />
                : <Brain size={14} className="text-orange-400" />}
              {retrainRunning ? 'Reentrenando...' : 'Reentrenar modelos ML'}
            </button>
          </div>
        </div>
      </div>

      {/* Terminal scraper */}
      {scraperJobId && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-stone-300"
            style={{ fontFamily: 'Syne, sans-serif' }}>
            🕷️ Log del scraper
          </h3>
          <JobTerminal
            jobId={scraperJobId}
            onFinish={() => setScraperRunning(false)}
          />
        </div>
      )}

      {/* Terminal retrain */}
      {retrainJobId && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-stone-300"
            style={{ fontFamily: 'Syne, sans-serif' }}>
            🧠 Log de reentrenamiento
          </h3>
          <JobTerminal
            jobId={retrainJobId}
            onFinish={() => setRetrainRunning(false)}
          />
        </div>
      )}
    </div>
  )
}

// ── Reviews Tab ───────────────────────────────────────────────────────

function ReviewsTab() {
  const [items, setItems] = useState<ReviewItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    adminApi.reviews('pendiente', 1, 20)
      .then((res) => { setItems(res.items); setTotal(res.total) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleAction = async (eventId: string, action: 'aprobado' | 'rechazado') => {
    setActionLoading(eventId)
    try {
      await adminApi.reviewEvent(eventId, action)
      setItems((prev) => prev.filter((i) => i.event_id !== eventId))
      setTotal((t) => t - 1)
    } catch { /* silent */ }
    finally { setActionLoading(null) }
  }

  if (loading) return (
    <div className="flex justify-center py-16">
      <Loader2 size={24} className="text-orange-500 animate-spin" />
    </div>
  )

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-stone-400">
          <span className="text-stone-100 font-semibold">{total}</span> pendientes de revisión
        </p>
        <button onClick={load} className="gdl-btn-ghost text-xs">
          <RefreshCw size={13} />
          Actualizar
        </button>
      </div>

      {items.length === 0 ? (
        <div className="gdl-card p-10 text-center">
          <span className="text-4xl block mb-3">✅</span>
          <p className="text-stone-300 font-medium">Cola vacía</p>
          <p className="text-stone-500 text-sm">No hay eventos pendientes de revisión.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item._id}
              className="gdl-card p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-mono text-stone-500 mb-1">{item.event_id}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400">quality_ml:</span>
                  <span className={cn(
                    'font-mono text-xs font-semibold',
                    item.quality_ml >= 0.4 ? 'text-amber-400' : 'text-rose-400'
                  )}>
                    {item.quality_ml.toFixed(3)}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  {formatRelative(item.created_at)}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleAction(item.event_id, 'aprobado')}
                  disabled={actionLoading === item.event_id}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium
                    bg-emerald-500/10 border border-emerald-500/20 text-emerald-400
                    hover:bg-emerald-500/20 transition-all disabled:opacity-50">
                  <CheckCircle2 size={13} />
                  Aprobar
                </button>
                <button
                  onClick={() => handleAction(item.event_id, 'rechazado')}
                  disabled={actionLoading === item.event_id}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium
                    bg-rose-500/10 border border-rose-500/20 text-rose-400
                    hover:bg-rose-500/20 transition-all disabled:opacity-50">
                  <XCircle size={13} />
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Create Event Tab ──────────────────────────────────────────────────

function CreateEventTab() {
  const [form, setForm] = useState({
    title: '', description: '', category: 'cultural' as EventCategory,
    date_start: '', date_end: '', location: '', price: '', image_url: '', url_source: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)
    try {
      await adminApi.createEvent({
        ...form,
        price: form.price ? Number(form.price) : undefined,
        date_end: form.date_end || undefined,
        description: form.description || undefined,
        location: form.location || undefined,
        image_url: form.image_url || undefined,
        url_source: form.url_source || undefined,
      })
      setSuccess(true)
      setForm({
        title: '', description: '', category: 'cultural',
        date_start: '', date_end: '', location: '', price: '', image_url: '', url_source: '',
      })
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : 'Error al crear el evento.'
      setError(msg ?? 'Error al crear el evento.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="animate-fade-up gdl-card p-6">
      <h3 className="font-bold text-stone-100 mb-6"
        style={{ fontFamily: 'Syne, sans-serif' }}>
        Crear evento manualmente
      </h3>

      {success && (
        <div className="mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400">
          ✅ Evento creado y publicado correctamente.
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm text-rose-400">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="gdl-label">Título *</label>
          <input required className="gdl-input" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>

        <div className="sm:col-span-2">
          <label className="gdl-label">Descripción</label>
          <textarea className="gdl-input h-24 resize-none" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        <div>
          <label className="gdl-label">Categoría *</label>
          <select required className="gdl-input" value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as EventCategory })}>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c} style={{ background: '#1c1917' }}>
                {CATEGORY_META[c].emoji} {CATEGORY_META[c].label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="gdl-label">Precio (MXN)</label>
          <input type="number" min="0" step="0.01" placeholder="0 = gratis"
            className="gdl-input" value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })} />
        </div>

        <div>
          <label className="gdl-label">Fecha inicio *</label>
          <input required type="datetime-local" className="gdl-input"
            value={form.date_start}
            onChange={(e) => setForm({ ...form, date_start: e.target.value })} />
        </div>

        <div>
          <label className="gdl-label">Fecha fin</label>
          <input type="datetime-local" className="gdl-input"
            value={form.date_end}
            onChange={(e) => setForm({ ...form, date_end: e.target.value })} />
        </div>

        <div className="sm:col-span-2">
          <label className="gdl-label">Lugar</label>
          <input className="gdl-input" placeholder="Teatro Degollado, Guadalajara"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </div>

        <div>
          <label className="gdl-label">URL de imagen</label>
          <input type="url" className="gdl-input" placeholder="https://..."
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
        </div>

        <div>
          <label className="gdl-label">URL fuente</label>
          <input type="url" className="gdl-input" placeholder="https://..."
            value={form.url_source}
            onChange={(e) => setForm({ ...form, url_source: e.target.value })} />
        </div>
      </div>

      <div className="mt-6">
        <button type="submit" disabled={loading} className="gdl-btn-primary">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          {loading ? 'Creando...' : 'Crear y publicar'}
        </button>
      </div>
    </form>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────

function KPICard({
  icon, label, value, accent, warn,
}: {
  icon: string; label: string; value: number; accent?: boolean; warn?: boolean
}) {
  return (
    <div className="gdl-card p-4">
      <p className="text-2xl mb-1">{icon}</p>
      <p className={cn(
        'text-2xl font-black',
        accent ? 'text-emerald-400' : warn ? 'text-amber-400' : 'text-stone-100'
      )}
        style={{ fontFamily: 'Syne, sans-serif' }}>
        {value.toLocaleString()}
      </p>
      <p className="text-xs text-stone-500 mt-0.5">{label}</p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between py-1 border-b"
      style={{ borderColor: 'var(--gdl-border)' }}>
      <span className="text-stone-400">{label}</span>
      <span className="text-stone-200 font-medium">{value}</span>
    </div>
  )
}
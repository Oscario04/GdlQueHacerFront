import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Calendar, MapPin, ExternalLink, Bookmark, Heart,
  ThumbsDown, Loader2, ArrowLeft, Tag, Star
} from 'lucide-react'
import { eventsApi, interactionsApi } from '@/services/api'
import type { EventDetail } from '@/types'
import { CATEGORY_META, formatDate, formatDateTime, formatPrice, cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [interactions, setInteractions] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!id) return
    setLoading(true)
    eventsApi.get(id)
      .then((e) => {
        setEvent(e)
        // Auto-register view
        if (user) {
          interactionsApi.create({ event_id: id, type: 'view' }).catch(() => {})
        }
      })
      .catch(() => setError('No se pudo cargar el evento.'))
      .finally(() => setLoading(false))
  }, [id, user])

  const handleInteraction = async (type: 'save' | 'interested' | 'uninterested') => {
    if (!user || !id) return
    setInteractions((prev) => ({ ...prev, [type]: true }))
    try {
      await interactionsApi.create({ event_id: id, type })
    } catch {
      setInteractions((prev) => ({ ...prev, [type]: false }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="text-orange-500 animate-spin" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <span className="text-4xl mb-4">😕</span>
        <h2 className="text-xl font-bold text-stone-200 mb-2"
          style={{ fontFamily: 'Syne, sans-serif' }}>
          Evento no encontrado
        </h2>
        <Link to="/" className="gdl-btn-primary mt-4">
          <ArrowLeft size={14} />
          Volver al inicio
        </Link>
      </div>
    )
  }

  const meta = CATEGORY_META[event.category] ?? CATEGORY_META.otro

  return (
    <main className="min-h-screen">
      {/* Hero image */}
      <div className="relative w-full h-64 sm:h-80 bg-night-800 overflow-hidden">
        {event.image_url ? (
          <img src={event.image_url} alt={event.title}
            className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-6xl">
            {meta.emoji}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-night-900 via-transparent to-transparent" />

        {/* Back button */}
        <Link to="/"
          className="absolute top-4 left-4 flex items-center gap-1.5 rounded-xl bg-black/40 backdrop-blur-sm px-3 py-2 text-sm text-white hover:bg-black/60 transition-all">
          <ArrowLeft size={14} />
          Volver
        </Link>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 -mt-8 pb-16">
        <div className="gdl-card p-6 sm:p-8 animate-fade-up">
          {/* Category + quality */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={cn('gdl-badge border', meta.bg, meta.color)}>
              {meta.emoji} {meta.label}
            </span>
            {event.quality_ml >= 0.8 && (
              <span className="gdl-badge bg-orange-500/15 border-orange-500/25 text-orange-400">
                <Star size={10} fill="currentColor" />
                Destacado
              </span>
            )}
            {event.source_id && (
              <span className="gdl-badge bg-white/5 border-white/10 text-stone-400 font-mono text-[10px]">
                {event.source_id}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-black text-stone-50 leading-tight mb-6"
            style={{ fontFamily: 'Syne, sans-serif' }}>
            {event.title}
          </h1>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <InfoRow icon={<Calendar size={15} className="text-orange-500" />}
              label="Fecha"
              value={formatDate(event.date_start)} />

            {event.date_end && (
              <InfoRow icon={<Calendar size={15} className="text-orange-500" />}
                label="Termina"
                value={formatDateTime(event.date_end)} />
            )}

            {event.location && (
              <InfoRow icon={<MapPin size={15} className="text-orange-500" />}
                label="Lugar"
                value={event.location} />
            )}

            <InfoRow
              icon={<span className="text-sm">💰</span>}
              label="Precio"
              value={formatPrice(event.price)}
              valueClass={event.price === 0 || !event.price ? 'text-emerald-400' : 'text-stone-200'}
            />
          </div>

          {/* Description */}
          {event.description && (
            <div className="mb-6">
              <h2 className="gdl-label mb-2">Descripción</h2>
              <p className="text-stone-300 leading-relaxed text-sm whitespace-pre-line">
                {event.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {event.tags.map((tag) => (
                <span key={tag}
                  className="gdl-badge bg-white/5 border-white/10 text-stone-400 gap-1">
                  <Tag size={10} />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t"
            style={{ borderColor: 'var(--gdl-border)' }}>
            {event.url_source && (
              <a href={event.url_source} target="_blank" rel="noopener noreferrer"
                className="gdl-btn-primary">
                <ExternalLink size={14} />
                Ver en fuente
              </a>
            )}

            {user ? (
              <>
                <button
                  onClick={() => handleInteraction('save')}
                  disabled={interactions.save}
                  className={cn(
                    'gdl-btn-outline',
                    interactions.save && 'text-orange-400 border-orange-500/30'
                  )}>
                  <Bookmark size={14} fill={interactions.save ? 'currentColor' : 'none'} />
                  {interactions.save ? 'Guardado' : 'Guardar'}
                </button>

                <button
                  onClick={() => handleInteraction('interested')}
                  disabled={interactions.interested}
                  className={cn(
                    'gdl-btn-outline',
                    interactions.interested && 'text-emerald-400 border-emerald-500/30'
                  )}>
                  <Heart size={14} fill={interactions.interested ? 'currentColor' : 'none'} />
                  {interactions.interested ? 'Me interesa' : 'Interesante'}
                </button>

                <button
                  onClick={() => handleInteraction('uninterested')}
                  disabled={interactions.uninterested}
                  className={cn(
                    'gdl-btn-ghost text-stone-500',
                    interactions.uninterested && 'text-stone-300'
                  )}>
                  <ThumbsDown size={14} />
                  No me interesa
                </button>
              </>
            ) : (
              <Link to="/login" className="gdl-btn-ghost text-stone-400 text-sm">
                Inicia sesión para guardar eventos
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

function InfoRow({
  icon, label, value, valueClass,
}: {
  icon: React.ReactNode
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-stone-500 uppercase tracking-wide mb-0.5"
          style={{ fontFamily: 'Syne, sans-serif' }}>
          {label}
        </p>
        <p className={cn('text-sm font-medium text-stone-200', valueClass)}>
          {value}
        </p>
      </div>
    </div>
  )
}

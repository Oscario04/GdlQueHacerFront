import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Calendar, Bookmark, Heart, Eye } from 'lucide-react'
import type { Event, EventRecommendation } from '@/types'
import { CATEGORY_META, formatDate, formatPrice, cn } from '@/lib/utils'
import { interactionsApi } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'

interface EventCardProps {
  event: Event | EventRecommendation
  index?: number
}

function isRecommendation(e: Event | EventRecommendation): e is EventRecommendation {
  return 'recommendation_score' in e
}

export default function EventCard({ event, index = 0 }: EventCardProps) {
  const { user } = useAuth()
  const meta = CATEGORY_META[event.category] ?? CATEGORY_META.otro
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleInteraction = async (type: 'save' | 'interested') => {
    if (!user || loading) return
    setLoading(true)
    try {
      await interactionsApi.create({ event_id: event._id, type })
      if (type === 'save') setSaved(true)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  const trackView = () => {
    if (user) {
      interactionsApi.create({ event_id: event._id, type: 'view' }).catch(() => {})
    }
  }

  const delay = `${index * 50}ms`

  return (
    <article
      className="gdl-card-hover group flex flex-col overflow-hidden opacity-0 animate-fade-up"
      style={{ animationDelay: delay, animationFillMode: 'forwards' }}>
      {/* Image */}
      <Link to={`/eventos/${event._id}`} onClick={trackView}
        className="block relative aspect-[16/9] overflow-hidden bg-night-700">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-4xl">
            {meta.emoji}
          </div>
        )}

        {/* Category badge */}
        <span className={cn('gdl-badge absolute top-3 left-3 border', meta.bg, meta.color)}>
          {meta.emoji} {meta.label}
        </span>

        {/* Quality score */}
        {event.quality_ml >= 0.8 && (
          <span className="absolute top-3 right-3 gdl-badge bg-orange-500/20 border-orange-500/30 text-orange-400">
            ✦ Destacado
          </span>
        )}

        {/* Recommendation reason */}
        {isRecommendation(event) && event.recommendation_reason && (
          <div className="absolute bottom-0 inset-x-0 px-3 py-2
            bg-gradient-to-t from-black/80 to-transparent
            text-xs text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity">
            {event.recommendation_reason}
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Title */}
        <Link to={`/eventos/${event._id}`} onClick={trackView}>
          <h3 className="font-semibold text-stone-100 leading-snug line-clamp-2 hover:text-orange-400 transition-colors"
            style={{ fontFamily: 'Syne, sans-serif' }}>
            {event.title}
          </h3>
        </Link>

        {/* Meta */}
        <div className="flex flex-col gap-1.5 text-xs text-stone-400">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="shrink-0 text-orange-500" />
            <span>{formatDate(event.date_start)}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="shrink-0 text-orange-500" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between">
          <span className={cn(
            'text-sm font-semibold',
            event.price === 0 || event.price === undefined
              ? 'text-emerald-400'
              : 'text-stone-200'
          )}>
            {formatPrice(event.price)}
          </span>

          {user && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleInteraction('save')}
                disabled={saved || loading}
                className={cn(
                  'p-1.5 rounded-lg transition-all hover:bg-white/5',
                  saved ? 'text-orange-400' : 'text-stone-500 hover:text-stone-300'
                )}
                title={saved ? 'Guardado' : 'Guardar'}>
                <Bookmark size={14} fill={saved ? 'currentColor' : 'none'} />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Sparkles, LogIn } from 'lucide-react'
import { eventsApi } from '@/services/api'
import type { EventRecommendation } from '@/types'
import EventCard from '@/components/events/EventCard'
import { useAuth } from '@/hooks/useAuth'

export default function RecommendedPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<EventRecommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    eventsApi.recommended(24)
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main>
      {/* Header */}
      <section className="border-b py-10 px-4 relative overflow-hidden"
        style={{ borderColor: 'var(--gdl-border)' }}>
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-orange-500/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="animate-fade-up flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center">
              <Sparkles size={16} className="text-orange-400" />
            </div>
            <h1 className="text-3xl font-black text-stone-100"
              style={{ fontFamily: 'Syne, sans-serif' }}>
              Para ti
            </h1>
          </div>

          <p className="text-stone-400 text-sm max-w-xl animate-fade-up stagger-1">
            {user
              ? `Recomendaciones personalizadas basadas en tus interacciones, ${user.name.split(' ')[0]}.`
              : 'Los eventos más populares de Guadalajara ahora mismo.'}
          </p>

          {!user && (
            <div className="mt-4 animate-fade-up stagger-2 flex items-center gap-3
              rounded-xl bg-orange-500/8 border border-orange-500/15 px-4 py-3 max-w-md">
              <Sparkles size={14} className="text-orange-400 shrink-0" />
              <p className="text-sm text-stone-300">
                <Link to="/login" className="text-orange-400 font-medium hover:underline">
                  Inicia sesión
                </Link>{' '}
                para recibir recomendaciones personalizadas con IA.
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={28} className="text-orange-500 animate-spin" />
              <p className="text-sm text-stone-400">Calculando recomendaciones...</p>
            </div>
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-5xl mb-4">🌆</span>
            <h3 className="text-lg font-semibold text-stone-200 mb-2"
              style={{ fontFamily: 'Syne, sans-serif' }}>
              Aún sin recomendaciones
            </h3>
            <p className="text-stone-400 text-sm max-w-xs mb-4">
              Explora algunos eventos e interactúa con ellos para mejorar tus recomendaciones.
            </p>
            <Link to="/" className="gdl-btn-primary">
              Explorar eventos
            </Link>
          </div>
        )}

        {!loading && events.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {events.map((event, i) => (
              <EventCard key={event._id} event={event} index={i} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

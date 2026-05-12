import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { eventsApi } from '@/services/api'
import type { EventFilter, EventListResponse } from '@/types'
import EventCard from '@/components/events/EventCard'
import FiltersBar from '@/components/events/FiltersBar'

const HERO_PHRASES = [
  'Descubre lo que pasa en tu ciudad.',
  'Conciertos, cultura y gastronomía.',
  'Eventos para todos los gustos en la ZMG.',
]

export default function HomePage() {
  const [filters, setFilters] = useState<EventFilter>({ page: 1, limit: 20 })
  const [data, setData] = useState<EventListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [heroPhrase] = useState(
    () => HERO_PHRASES[Math.floor(Math.random() * HERO_PHRASES.length)]
  )

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await eventsApi.list(filters)
      setData(res)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden border-b py-12 px-4"
        style={{ borderColor: 'var(--gdl-border)' }}>
        {/* Background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-12 -right-24 w-96 h-96 rounded-full bg-orange-500/8 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-72 h-72 rounded-full bg-orange-700/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 gdl-badge bg-orange-500/10 border-orange-500/20 text-orange-400 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse-slow" />
              Guadalajara, Jalisco
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-stone-100 mb-3 leading-tight"
              style={{ fontFamily: 'Syne, sans-serif' }}>
              {heroPhrase}
            </h1>
            <p className="text-stone-400 max-w-xl">
              Eventos recopilados de Ticketmaster, Boletia, Eventbrite y más.
              Clasificados con ML para que siempre encuentres los mejores.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Filters */}
        <div className="mb-8 animate-fade-up stagger-1">
          <FiltersBar filters={filters} onChange={setFilters} />
        </div>

        {/* Results header */}
        {data && !loading && (
          <div className="flex items-center justify-between mb-5 animate-fade-in">
            <p className="text-sm text-stone-400">
              <span className="text-stone-100 font-semibold">{data.total}</span>{' '}
              evento{data.total !== 1 ? 's' : ''} encontrado{data.total !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-stone-500">
              Página {data.page}
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={28} className="text-orange-500 animate-spin" />
              <p className="text-sm text-stone-400">Cargando eventos...</p>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && data?.items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-5xl mb-4">🔍</span>
            <h3 className="text-lg font-semibold text-stone-200 mb-2"
              style={{ fontFamily: 'Syne, sans-serif' }}>
              Sin resultados
            </h3>
            <p className="text-stone-400 text-sm max-w-xs">
              Prueba con diferentes filtros o busca otra categoría.
            </p>
          </div>
        )}

        {/* Grid */}
        {!loading && data && data.items.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {data.items.map((event, i) => (
                <EventCard key={event._id} event={event} index={i} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-3 mt-10">
              <button
                disabled={data.page <= 1}
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
                className="gdl-btn-outline disabled:opacity-30 disabled:pointer-events-none">
                <ChevronLeft size={16} />
                Anterior
              </button>

              <span className="text-sm text-stone-400">
                {data.page} / {Math.ceil(data.total / (data.limit || 20))}
              </span>

              <button
                disabled={!data.has_next}
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
                className="gdl-btn-outline disabled:opacity-30 disabled:pointer-events-none">
                Siguiente
                <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

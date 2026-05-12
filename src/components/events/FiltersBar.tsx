import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import type { EventCategory, EventFilter } from '@/types'
import { CATEGORY_META, cn } from '@/lib/utils'

interface FiltersBarProps {
  filters: EventFilter
  onChange: (f: EventFilter) => void
}

const CATEGORIES: { value: EventCategory | ''; label: string; emoji: string }[] = [
  { value: '', label: 'Todos', emoji: '✦' },
  { value: 'cultural', label: 'Cultural', emoji: '🎭' },
  { value: 'deportivo', label: 'Deportivo', emoji: '⚽' },
  { value: 'gastronomico', label: 'Gastro', emoji: '🍽️' },
  { value: 'entretenimiento', label: 'Entretenimiento', emoji: '🎵' },
  { value: 'otro', label: 'Otro', emoji: '📌' },
]

export default function FiltersBar({ filters, onChange }: FiltersBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const set = (partial: Partial<EventFilter>) =>
    onChange({ ...filters, ...partial, page: 1 })

  const clearFilters = () =>
    onChange({ page: 1, limit: 20 })

  const hasActive = !!(
    filters.category || filters.q || filters.date_from || filters.date_to
  )

  return (
    <div className="flex flex-col gap-3">
      {/* Search + controls row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            placeholder="Buscar eventos en Guadalajara..."
            value={filters.q ?? ''}
            onChange={(e) => set({ q: e.target.value || undefined })}
            className="gdl-input pl-9 pr-4"
          />
          {filters.q && (
            <button
              onClick={() => set({ q: undefined })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300">
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowAdvanced((o) => !o)}
          className={cn(
            'gdl-btn-outline gap-1.5',
            showAdvanced && 'border-orange-500/40 text-orange-400 bg-orange-500/5'
          )}>
          <SlidersHorizontal size={14} />
          <span className="hidden sm:inline">Filtros</span>
          {hasActive && (
            <span className="w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center">
              !
            </span>
          )}
        </button>

        {hasActive && (
          <button onClick={clearFilters} className="gdl-btn-ghost text-xs text-stone-400">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map(({ value, label, emoji }) => (
          <button
            key={value}
            onClick={() => set({ category: value || undefined })}
            className={cn(
              'shrink-0 flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all',
              filters.category === (value || undefined)
                ? 'bg-orange-500 border-orange-500 text-white'
                : 'border-white/10 text-stone-400 hover:border-white/20 hover:text-stone-200'
            )}>
            <span>{emoji}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="gdl-card p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
          <div>
            <label className="gdl-label">Desde</label>
            <input
              type="date"
              className="gdl-input"
              value={filters.date_from?.slice(0, 10) ?? ''}
              onChange={(e) =>
                set({ date_from: e.target.value ? `${e.target.value}T00:00:00` : undefined })
              }
            />
          </div>
          <div>
            <label className="gdl-label">Hasta</label>
            <input
              type="date"
              className="gdl-input"
              value={filters.date_to?.slice(0, 10) ?? ''}
              onChange={(e) =>
                set({ date_to: e.target.value ? `${e.target.value}T23:59:59` : undefined })
              }
            />
          </div>
        </div>
      )}
    </div>
  )
}

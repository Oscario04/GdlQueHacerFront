import { useState } from 'react'
import { Loader2, Check, GripVertical } from 'lucide-react'
import { authApi } from '@/services/api'
import { CATEGORY_META } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { EventCategory } from '@/types'

const CATEGORIES: EventCategory[] = [
  'cultural', 'deportivo', 'gastronomico', 'entretenimiento', 'otro'
]

interface Props {
  initial?: string[]
  onSaved: (cats: string[]) => void
  onSkip?: () => void
}

export default function CategoryPicker({ initial = [], onSaved, onSkip }: Props) {
  const [selected, setSelected] = useState<string[]>(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggle = (cat: string) => {
    setSelected((prev) => {
      if (prev.includes(cat)) return prev.filter((c) => c !== cat)
      if (prev.length >= 3) return prev  // máximo 3
      return [...prev, cat]
    })
  }

  const getRank = (cat: string) => {
    const i = selected.indexOf(cat)
    return i === -1 ? null : i + 1
  }

  const handleSave = async () => {
    if (selected.length === 0) { setError('Elige al menos una categoría.'); return }
    setLoading(true)
    setError('')
    try {
      await authApi.updatePreferences(selected)
      onSaved(selected)
    } catch {
      setError('No se pudieron guardar las preferencias.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-black text-stone-100 mb-1"
          style={{ fontFamily: 'Syne, sans-serif' }}>
          ¿Qué te gusta hacer?
        </h2>
        <p className="text-sm text-stone-400">
          Elige hasta 3 categorías en orden de preferencia.
          El orden importa — la primera tendrá más peso en tus recomendaciones.
        </p>
      </div>

      {/* Categorías */}
      <div className="grid grid-cols-1 gap-2">
        {CATEGORIES.map((cat) => {
          const meta = CATEGORY_META[cat]
          const rank = getRank(cat)
          const isSelected = rank !== null

          return (
            <button
              key={cat}
              onClick={() => toggle(cat)}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all',
                isSelected
                  ? 'border-orange-500/50 bg-orange-500/10'
                  : 'border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5'
              )}>

              {/* Rank badge o círculo vacío */}
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-sm font-black shrink-0 transition-all',
                isSelected
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/10 text-stone-500'
              )}
                style={{ fontFamily: 'Syne, sans-serif' }}>
                {isSelected ? rank : ''}
              </div>

              <span className="text-xl">{meta.emoji}</span>

              <div className="flex-1">
                <p className={cn(
                  'font-semibold text-sm',
                  isSelected ? 'text-stone-100' : 'text-stone-300'
                )}>
                  {meta.label}
                </p>
                <p className="text-xs text-stone-500">
                  {cat === 'cultural' && 'Teatro, museos, exposiciones'}
                  {cat === 'deportivo' && 'Partidos, carreras, torneos'}
                  {cat === 'gastronomico' && 'Restaurantes, food fests, catas'}
                  {cat === 'entretenimiento' && 'Conciertos, festivales, shows'}
                  {cat === 'otro' && 'Talleres, ferias, actividades varias'}
                </p>
              </div>

              {isSelected && (
                <Check size={16} className="text-orange-400 shrink-0" />
              )}
            </button>
          )
        })}
      </div>

      {/* Orden visual */}
      {selected.length > 0 && (
        <div className="rounded-xl bg-white/3 border border-white/10 px-4 py-3">
          <p className="text-xs text-stone-500 mb-2">Tu orden de preferencia:</p>
          <div className="flex gap-2 flex-wrap">
            {selected.map((cat, i) => {
              const meta = CATEGORY_META[cat as EventCategory]
              return (
                <span key={cat}
                  className="flex items-center gap-1.5 rounded-full bg-orange-500/15 border border-orange-500/25 px-3 py-1 text-xs text-orange-300">
                  <span className="font-black text-orange-400">{i + 1}</span>
                  {meta.emoji} {meta.label}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-rose-400">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={loading || selected.length === 0}
          className="gdl-btn-primary flex-1">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          {loading ? 'Guardando...' : 'Guardar preferencias'}
        </button>
        {onSkip && (
          <button onClick={onSkip} className="gdl-btn-ghost text-stone-500 text-sm">
            Omitir
          </button>
        )}
      </div>
    </div>
  )
}
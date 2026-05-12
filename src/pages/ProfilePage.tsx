import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, BarChart2, Calendar, Tag } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { interactionsApi } from '@/services/api'
import type { Interaction } from '@/types'
import { CATEGORY_META, formatRelative } from '@/lib/utils'
import CategoryPicker from '@/components/preferences/CategoryPicker'

export default function ProfilePage() {
  const { user, logout, login } = useAuth()
  const navigate = useNavigate()
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [editingPrefs, setEditingPrefs] = useState(false)
  const [topCategories, setTopCategories] = useState<string[]>([])

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    setTopCategories(user.top_categories ?? [])
    interactionsApi.my(30).then(setInteractions).catch(() => {})
  }, [user, navigate])

  if (!user) return null

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handlePreferencesSaved = async (cats: string[]) => {
    setTopCategories(cats)
    setEditingPrefs(false)
  }

  const interactionIcons: Record<string, string> = {
    view: '👁️',
    save: '🔖',
    interested: '❤️',
    uninterested: '👎',
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">

      {/* Profile card */}
      <div className="gdl-card p-6 mb-6 animate-fade-up">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/30
              flex items-center justify-center text-2xl font-black text-orange-400"
              style={{ fontFamily: 'Syne, sans-serif' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-100"
                style={{ fontFamily: 'Syne, sans-serif' }}>
                {user.name}
              </h1>
              <p className="text-sm text-stone-400">{user.email}</p>
              <span className="mt-1 inline-flex items-center gap-1 gdl-badge
                bg-orange-500/10 border-orange-500/20 text-orange-400 text-[10px]">
                {user.role === 'admin' ? '⭐ Admin' : '👤 Usuario'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="gdl-btn-ghost text-rose-400 hover:bg-rose-500/10 text-sm">
            <LogOut size={14} />
            Salir
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t"
          style={{ borderColor: 'var(--gdl-border)' }}>
          <StatBox
            icon={<BarChart2 size={14} className="text-orange-400" />}
            label="Interacciones"
            value={user.total_interactions}
          />
          <StatBox
            icon={<Tag size={14} className="text-orange-400" />}
            label="Categorías"
            value={topCategories.length}
          />
          <StatBox
            icon={<Calendar size={14} className="text-orange-400" />}
            label="Miembro desde"
            value={new Date(user.created_at).getFullYear()}
          />
        </div>

        {/* Categorías preferidas */}
        <div className="mt-5 pt-5 border-t" style={{ borderColor: 'var(--gdl-border)' }}>
          {editingPrefs ? (
            <CategoryPicker
              initial={topCategories}
              onSaved={handlePreferencesSaved}
              onSkip={() => setEditingPrefs(false)}
            />
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="gdl-label">Categorías favoritas</p>
                <button
                  onClick={() => setEditingPrefs(true)}
                  className="text-xs text-orange-400 hover:text-orange-300 transition-colors">
                  {topCategories.length > 0 ? '✏️ Editar' : '+ Agregar'}
                </button>
              </div>

              {topCategories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {topCategories.map((cat, i) => {
                    const meta = CATEGORY_META[cat as keyof typeof CATEGORY_META]
                      ?? CATEGORY_META.otro
                    return (
                      <span
                        key={cat}
                        className={`gdl-badge border ${meta.bg} ${meta.color} gap-1.5`}>
                        <span className="font-black text-xs opacity-60">{i + 1}</span>
                        {meta.emoji} {meta.label}
                      </span>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-stone-500">
                  No has configurado preferencias.{' '}
                  <button
                    onClick={() => setEditingPrefs(true)}
                    className="text-orange-400 hover:text-orange-300 underline">
                    Configúralas ahora
                  </button>{' '}
                  para recibir mejores recomendaciones.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="animate-fade-up stagger-2">
        <h2 className="gdl-section-title text-lg mb-4">Actividad reciente</h2>

        {interactions.length === 0 ? (
          <div className="gdl-card p-8 text-center text-stone-400 text-sm">
            Aún no tienes interacciones. ¡Explora eventos!
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {interactions.map((i) => (
              <div
                key={i._id}
                className="gdl-card flex items-center justify-between px-4 py-3 text-sm">
                <div className="flex items-center gap-2 text-stone-300">
                  <span>{interactionIcons[i.type]}</span>
                  <span className="font-mono text-xs text-stone-500">
                    {i.event_id.slice(-8)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-stone-500 capitalize">{i.type}</span>
                  <span className="text-xs text-stone-600">
                    {formatRelative(i.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function StatBox({
  icon, label, value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <div className="rounded-xl bg-white/3 p-3 text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="text-xl font-bold text-stone-100"
        style={{ fontFamily: 'Syne, sans-serif' }}>
        {value}
      </p>
      <p className="text-xs text-stone-500">{label}</p>
    </div>
  )
}
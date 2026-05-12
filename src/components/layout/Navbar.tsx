import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MapPin, Compass, Star, ShieldCheck, User, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { to: '/', label: 'Explorar', icon: Compass },
  { to: '/recomendados', label: 'Para ti', icon: Star },
]

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setUserMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 border-b backdrop-blur-xl"
      style={{ borderColor: 'var(--gdl-border)', background: 'rgba(12,10,9,0.85)' }}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500 text-white text-xs font-black"
            style={{ fontFamily: 'Syne, sans-serif' }}>
            GDL
          </span>
          <span className="hidden sm:block text-sm font-semibold text-stone-200 group-hover:text-white transition-colors"
            style={{ fontFamily: 'Syne, sans-serif' }}>
            Qué Hacer
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
                location.pathname === to
                  ? 'bg-orange-500/15 text-orange-400'
                  : 'text-stone-400 hover:text-stone-100 hover:bg-white/5'
              )}>
              <Icon size={14} />
              {label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin"
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
                location.pathname.startsWith('/admin')
                  ? 'bg-orange-500/15 text-orange-400'
                  : 'text-stone-400 hover:text-stone-100 hover:bg-white/5'
              )}>
              <ShieldCheck size={14} />
              Admin
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm text-stone-300 hover:bg-white/5 hover:text-white transition-all">
                <div className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 text-xs font-bold"
                  style={{ fontFamily: 'Syne, sans-serif' }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block">{user.name.split(' ')[0]}</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border p-1 shadow-2xl shadow-black/50"
                  style={{ background: 'var(--gdl-surface)', borderColor: 'var(--gdl-border)' }}>
                  <div className="px-3 py-2 border-b mb-1"
                    style={{ borderColor: 'var(--gdl-border)' }}>
                    <p className="text-xs text-stone-400">Conectado como</p>
                    <p className="text-sm font-medium text-stone-200 truncate">{user.email}</p>
                  </div>
                  <Link to="/perfil" onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-300 hover:bg-white/5 hover:text-white transition-all">
                    <User size={14} />
                    Mi perfil
                  </Link>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-all">
                    <LogOut size={14} />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="gdl-btn-ghost text-xs">
                Entrar
              </Link>
              <Link to="/registro" className="gdl-btn-primary text-xs px-3 py-2">
                Registrarse
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button className="md:hidden gdl-btn-ghost p-2"
            onClick={() => setMobileOpen((o) => !o)}>
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t px-4 py-3 flex flex-col gap-1"
          style={{ borderColor: 'var(--gdl-border)', background: 'rgba(12,10,9,0.97)' }}>
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium',
                location.pathname === to
                  ? 'bg-orange-500/15 text-orange-400'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              )}>
              <Icon size={16} />
              {label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-300 hover:text-white hover:bg-white/5">
              <ShieldCheck size={16} />
              Admin
            </Link>
          )}
        </div>
      )}

      {/* Click outside to close user menu */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-[-1]" onClick={() => setUserMenuOpen(false)} />
      )}
    </header>
  )
}

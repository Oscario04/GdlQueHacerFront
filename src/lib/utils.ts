import { clsx, type ClassValue } from 'clsx'
import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { EventCategory } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(iso: string) {
  try {
    return format(parseISO(iso), "EEEE d 'de' MMMM", { locale: es })
  } catch {
    return iso
  }
}

export function formatDateTime(iso: string) {
  try {
    return format(parseISO(iso), "d MMM · HH:mm 'h'", { locale: es })
  } catch {
    return iso
  }
}

export function formatRelative(iso: string) {
  try {
    return formatDistanceToNow(parseISO(iso), { locale: es, addSuffix: true })
  } catch {
    return iso
  }
}

export function formatPrice(price?: number) {
  if (price === undefined || price === null) return 'Gratis'
  if (price === 0) return 'Gratis'
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(price)
}

export const CATEGORY_META: Record<
  EventCategory,
  { label: string; emoji: string; color: string; bg: string }
> = {
  cultural: {
    label: 'Cultural',
    emoji: '🎭',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
  },
  deportivo: {
    label: 'Deportivo',
    emoji: '⚽',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  gastronomico: {
    label: 'Gastronómico',
    emoji: '🍽️',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  entretenimiento: {
    label: 'Entretenimiento',
    emoji: '🎵',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
  },
  otro: {
    label: 'Otro',
    emoji: '📌',
    color: 'text-slate-400',
    bg: 'bg-slate-500/10 border-slate-500/20',
  },
}

export function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const res = (err as { response?: { data?: { detail?: string } } }).response
    return res?.data?.detail ?? 'Algo salió mal. Intenta de nuevo.'
  }
  return 'Algo salió mal. Intenta de nuevo.'
}

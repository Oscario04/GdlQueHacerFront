import axios from 'axios'
import type {
  TokenResponse,
  RegisterRequest,
  LoginRequest,
  UserProfile,
  Event,
  EventDetail,
  EventListResponse,
  EventFilter,
  EventRecommendation,
  InteractionCreate,
  Interaction,
  AdminStats,
  ReviewItem,
  ReviewStatus,
  EventCreate,
} from '@/types'

// ── Axios instance ────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
  timeout: 15_000,
})

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gdl_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global 401 → clear session
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('gdl_token')
      localStorage.removeItem('gdl_user')
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<TokenResponse>('/api/auth/register', data).then((r) => r.data),

  login: (data: LoginRequest) =>
    api.post<TokenResponse>('/api/auth/login', data).then((r) => r.data),

  me: () =>
    api.get<UserProfile>('/api/auth/me').then((r) => r.data),

  updatePreferences: (preferred_categories: string[]) =>
    api.patch<{ preferred_categories: string[] }>(
      '/api/auth/preferences',
      { preferred_categories }
    ).then((r) => r.data),
}

// ── Events ────────────────────────────────────────────────────────────
export const eventsApi = {
  list: (filters?: EventFilter) =>
    api
      .get<EventListResponse>('/api/events', { params: filters })
      .then((r) => r.data),

  recommended: (limit = 20) =>
    api
      .get<EventRecommendation[]>('/api/events/recommended', { params: { limit } })
      .then((r) => r.data),

  get: (id: string) =>
    api.get<EventDetail>(`/api/events/${id}`).then((r) => r.data),
}

// ── Interactions ──────────────────────────────────────────────────────
export const interactionsApi = {
  create: (data: InteractionCreate) =>
    api.post<Interaction>('/api/interactions', data).then((r) => r.data),

  my: (limit = 50) =>
    api
      .get<Interaction[]>('/api/interactions/my', { params: { limit } })
      .then((r) => r.data),
}

// ── Admin ─────────────────────────────────────────────────────────────
export const adminApi = {
  stats: () =>
    api.get<AdminStats>('/api/admin/stats').then((r) => r.data),

  reviews: (status_filter: ReviewStatus = 'pendiente', page = 1, limit = 20) =>
    api
      .get<{ total: number; page: number; limit: number; items: ReviewItem[] }>(
        '/api/admin/reviews',
        { params: { status_filter, page, limit } }
      )
      .then((r) => r.data),

  reviewEvent: (eventId: string, action: ReviewStatus, notes?: string) =>
    api
      .patch(`/api/admin/reviews/${eventId}`, { action, notes })
      .then((r) => r.data),

  createEvent: (data: EventCreate) =>
    api.post('/api/admin/events', data).then((r) => r.data),

  triggerScraper: () =>
    api
      .post<{ job_id: string; message: string }>('/api/admin/trigger-scraper')
      .then((r) => r.data),

  triggerRetrain: () =>
    api
      .post<{ job_id: string; message: string }>('/api/admin/trigger-retrain')
      .then((r) => r.data),
}

// ── Health ────────────────────────────────────────────────────────────
export const healthApi = {
  check: () =>
    api
      .get<{ status: string; version: string; environment: string }>('/api/health')
      .then((r) => r.data),
}

export default api
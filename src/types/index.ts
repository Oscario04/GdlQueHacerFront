// ── Enums ─────────────────────────────────────────────────────────────

export type EventCategory =
  | 'cultural'
  | 'deportivo'
  | 'gastronomico'
  | 'entretenimiento'
  | 'otro'

export type EventStatus =
  | 'recolectado'
  | 'normalizado'
  | 'pendiente_revision'
  | 'publicado'
  | 'rechazado'

export type InteractionType = 'view' | 'save' | 'interested' | 'uninterested'

export type ReviewStatus = 'pendiente' | 'aprobado' | 'rechazado'

export type UserRole = 'user' | 'admin'

// ── Event ─────────────────────────────────────────────────────────────

export interface GeoCoordinates {
  type: 'Point'
  coordinates: [number, number] // [lon, lat]
}

export interface Event {
  _id: string
  title: string
  description?: string
  category: EventCategory
  date_start: string
  date_end?: string
  location?: string
  coordinates?: GeoCoordinates
  image_url?: string
  url_source?: string
  price?: number
  tags: string[]
  quality_ml: number
  status: EventStatus
  created_at: string
  updated_at?: string
}

export interface EventDetail extends Event {
  source_id?: string
}

export interface EventRecommendation extends Event {
  recommendation_score: number
  recommendation_reason?: string
}

export interface EventListResponse {
  total: number
  page: number
  limit: number
  has_next: boolean
  items: Event[]
}

export interface EventFilter {
  category?: EventCategory
  date_from?: string
  date_to?: string
  lat?: number
  lon?: number
  radius_km?: number
  q?: string
  page?: number
  limit?: number
}

// ── Auth ──────────────────────────────────────────────────────────────

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

// ── User ──────────────────────────────────────────────────────────────

export interface UserProfile {
  _id: string
  name: string
  email: string
  role: UserRole
  created_at: string
  top_categories: string[]
  total_interactions: number
  preferences_updated_at?: string
}

// ── Interactions ──────────────────────────────────────────────────────

export interface InteractionCreate {
  event_id: string
  type: InteractionType
}

export interface Interaction {
  _id: string
  user_id: string
  event_id: string
  type: InteractionType
  created_at: string
}

// ── Admin ─────────────────────────────────────────────────────────────

export interface ReviewItem {
  _id: string
  event_id: string
  quality_ml: number
  status: ReviewStatus
  reviewer_id?: string
  notes?: string
  created_at: string
  reviewed_at?: string
}

export interface ReviewAction {
  action: ReviewStatus
  notes?: string
}

export interface AdminStats {
  events: {
    total: number
    published: number
    pending_review: number
    by_category: Record<string, number>
  }
  users: { total: number }
  interactions: { total: number }
  generated_at: string
}

export interface EventCreate {
  title: string
  description?: string
  category: EventCategory
  date_start: string
  date_end?: string
  location?: string
  price?: number
  tags?: string[]
  image_url?: string
  url_source?: string
}

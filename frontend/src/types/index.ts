// ─── Video / Portfolio types ────────────────────────────────────────────────
export interface Video {
  id: string
  title: string
  description?: string
  video_url: string
  thumbnail?: string
  tags: string[]
  category: VideoCategory
  client_name?: string
  created_at: string
  is_featured: boolean
  source_type: 'cloudinary' | 'youtube'
  youtube_id?: string
}

export type VideoCategory =
  | 'AI Ads'
  | 'AI Video Editing'
  | 'AI Voiceovers'
  | 'AI Storytelling'
  | 'Animation'

// ─── Auth types ─────────────────────────────────────────────────────────────
export interface AdminUser {
  id: string
  email: string
  name: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: AdminUser
}

// ─── API types ───────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  has_more: boolean
}

// ─── Upload types ─────────────────────────────────────────────────────────────
export interface VideoUploadPayload {
  title: string
  description?: string
  tags?: string[]
  category: VideoCategory
  client_name?: string
  video_file?: File
  thumbnail_file?: File
  is_featured: boolean
  source_type: 'cloudinary' | 'youtube'
  youtube_url?: string
}

// ─── Filter types ────────────────────────────────────────────────────────────
export interface PortfolioFilters {
  category?: VideoCategory | 'All'
  tags?: string[]
  search?: string
}

// ─── Contact types ────────────────────────────────────────────────────────────
export interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  is_read: boolean
  created_at: string
}

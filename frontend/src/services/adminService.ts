import api from './api'
import type { LoginCredentials, AuthResponse, Video, VideoUploadPayload } from '@/types'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

type AdminOverview = {
  ads?: {
    total?: number
    active?: number
    inactive?: number
  }
  contacts?: {
    total?: number
    unread?: number
  }
  system?: {
    cpu_usage_percent?: number
    memory_usage_percent?: number
  }
  cloudinary?: {
    plan?: string
    storage?: {
      used?: number
      limit?: number
      used_percent?: number
    }
    credits?: {
      used?: number
      limit?: number
      used_percent?: number
    }
  }
}

const MOCK_ADMIN = { email: 'admin@rohitvishwakarma.com', password: 'admin123' }

export const adminService = {
  isMockMode(): boolean {
    return USE_MOCK
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (USE_MOCK) {
      if (
        credentials.email === MOCK_ADMIN.email &&
        credentials.password === MOCK_ADMIN.password
      ) {
        return {
          token: 'mock_jwt_token_rohit_portfolio',
          user: { id: '1', email: credentials.email, name: 'Rohit Vishwakarma' },
        }
      }
      throw new Error('Invalid credentials')
    }

    const params = new URLSearchParams()
    params.append('username', credentials.email)
    params.append('password', credentials.password)

    const res = await api.post('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    const loginData = res.data.data
    
    if (loginData.status === 'otp_required') {
      return loginData as any
    }
    
    const userData = loginData.user

    return {
      token: loginData.token || 'cookie_session_active',
      user: {
        id: userData.id || userData._id || '',
        email: userData.email || credentials.email,
        name: userData.username || userData.name || credentials.email.split('@')[0],
      },
    }

  },
 
   async verifyOTP(username: string, otp: string): Promise<AuthResponse> {
     const res = await api.post('/auth/verify-otp', { username, otp })
     const loginData = res.data.data
     const userData = loginData.user
  
     return {
       token: loginData.token || 'cookie_session_active',
       user: {
         id: userData.id || userData._id || '',
         email: userData.email || username,
         name: userData.username || userData.name || username.split('@')[0],
       },
     }
   },
 
   async resendOTP(username: string): Promise<void> {
     await api.post('/auth/resend-otp', { username })
   },

   async forgotPassword(email: string): Promise<void> {
     await api.post('/auth/forgot-password', { email })
   },

   async verifyForgotPasswordOTP(email: string, otp: string): Promise<{ reset_token: string }> {
     const res = await api.post('/auth/forgot-password/verify-otp', { email, otp })
     return res.data.data
   },

   async resetPassword(reset_token: string, new_password: string): Promise<void> {
     await api.post('/auth/reset-password', { reset_token, new_password })
   },

   async getVideos(): Promise<Video[]> {
    if (USE_MOCK) {
      const { MOCK_VIDEOS } = await import('./portfolioService')
      return MOCK_VIDEOS
    }

    const res = await api.get('/ads?skip=0&limit=100')
    return res.data.data || []
  },

  async getOverview(): Promise<AdminOverview | null> {
    if (USE_MOCK) {
      return {
        ads: { total: 8, active: 8, inactive: 0 },
        cloudinary: {
          plan: 'Free (Mock)',
          storage: { used: 125000000, limit: 1073741824, used_percent: 11.6 },
          credits: { used: 5.5, limit: 25, used_percent: 22 }
        }
      }
    }

    try {
      const res = await api.get('/admin/overview')
      return res.data.data || null
    } catch {
      return null
    }
  },

  async uploadVideo(payload: VideoUploadPayload, onProgress?: (percent: number) => void): Promise<Video> {
    if (USE_MOCK) {
      // Simulate progress for mock mode
      if (onProgress) {
        let p = 0
        const interval = setInterval(() => {
          p += 10
          onProgress(Math.min(p, 90))
          if (p >= 90) clearInterval(interval)
        }, 200)
      }
      await new Promise((r) => setTimeout(r, 1500))
      const newVideo: Video = {
        id: String(Date.now()),
        title: payload.title,
        description: payload.description || '',
        video_url: 'https://res.cloudinary.com/demo/video/upload/dog.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
        tags: payload.tags || [],
        category: payload.category,
        client_name: payload.client_name || '',
        created_at: new Date().toISOString(),
        is_featured: payload.is_featured,
      }
      if (onProgress) onProgress(100)
      return newVideo
    }

    let public_id: string | null = null
    let youtube_id: string | null = null

    if (payload.source_type === 'youtube') {
      youtube_id = payload.youtube_url || null
    } else if (payload.video_file) {
      const videoForm = new FormData()
      videoForm.append('file', payload.video_file)
      const mediaRes = await api.post('/media/upload/video', videoForm, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(percentCompleted)
          }
        },
      })
      public_id = mediaRes.data.data.public_id
    } else {
      throw new Error('Video file or YouTube URL is required')
    }


    let thumbnailUrl: string | null = null
    if (payload.thumbnail_file) {
      const imageForm = new FormData()
      imageForm.append('file', payload.thumbnail_file)
      const imageRes = await api.post('/media/upload/image', imageForm, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      thumbnailUrl = imageRes.data.data.secure_url || null
    }

    const adCreatePayload = {
      title: payload.title,
      description: payload.description || null,
      cloudinary_public_id: public_id,
      source_type: payload.source_type,
      youtube_id: youtube_id,
      thumbnail_url: thumbnailUrl,
      tags: payload.tags || [],
      category: payload.category,
      client_name: payload.client_name?.trim() ? payload.client_name.trim() : null,
      is_featured: payload.is_featured,
      is_active: true,
    }

    const adRes = await api.post('/ads', adCreatePayload)
    return adRes.data.data
  },

  async updateVideo(id: string, payload: Partial<VideoUploadPayload>): Promise<Video> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500))
      return {
        id,
        title: payload.title || 'Untitled',
        description: payload.description || '',
        video_url: 'https://res.cloudinary.com/demo/video/upload/dog.mp4',
        thumbnail: payload.thumbnail_file
          ? URL.createObjectURL(payload.thumbnail_file)
          : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
        tags: payload.tags || [],
        category: payload.category || 'AI Ads',
        client_name: payload.client_name || '',
        created_at: new Date().toISOString(),
        is_featured: payload.is_featured ?? false,
      }
    }

    let thumbnailUrl: string | undefined
    if (payload.thumbnail_file) {
      const imageForm = new FormData()
      imageForm.append('file', payload.thumbnail_file)
      const imageRes = await api.post('/media/upload/image', imageForm, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      thumbnailUrl = imageRes.data.data.secure_url
    }

    const updatePayload: Record<string, unknown> = {}
    if (payload.title !== undefined) updatePayload.title = payload.title
    if (payload.description !== undefined) updatePayload.description = payload.description || null
    if (payload.category !== undefined) updatePayload.category = payload.category
    if (payload.client_name !== undefined) updatePayload.client_name = payload.client_name?.trim() ? payload.client_name.trim() : null
    if (payload.tags !== undefined) updatePayload.tags = payload.tags || []
    if (payload.is_featured !== undefined) updatePayload.is_featured = payload.is_featured
    if (payload.source_type !== undefined) updatePayload.source_type = payload.source_type
    if (payload.youtube_url !== undefined) updatePayload.youtube_id = payload.youtube_url
    if (thumbnailUrl) updatePayload.thumbnail_url = thumbnailUrl

    const res = await api.put(`/ads/${id}`, updatePayload)
    return res.data.data
  },

  async deleteVideo(id: string): Promise<void> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500))
      return
    }
    await api.delete(`/ads/${id}`)
  },

  async getNotificationEmail(): Promise<string> {
    if (USE_MOCK) return 'admin@example.com'
    const res = await api.get('/admin/settings/notification-email')
    return res.data.data.email || ''
  },

  async updateNotificationEmail(email: string): Promise<void> {
    if (USE_MOCK) return
    await api.post('/admin/settings/notification-email', { email })
  },
}

import type { Video, PaginatedResponse, PortfolioFilters } from '@/types'

// ─── Mock Data ────────────────────────────────────────────────────────────────
export const MOCK_VIDEOS: Video[] = [
  {
    id: '1',
    title: 'NeuraLux — AI-Powered Luxury Brand Ad',
    description:
      'A cinematic 30-second brand film crafted entirely with AI tools. From script to final cut, every element was generated and refined using cutting-edge AI platforms.',
    video_url: 'https://res.cloudinary.com/demo/video/upload/dog.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    tags: ['Luxury', 'Brand Film', 'Cinematic'],
    category: 'AI Ads',
    client_name: 'NeuraLux Cosmetics',
    created_at: '2024-03-15',
    is_featured: true,
  },
  {
    id: '2',
    title: 'EchoSync — Product Launch Campaign',
    description:
      'Dynamic product reveal video with AI-generated voiceover and motion graphics.',
    video_url: 'https://res.cloudinary.com/demo/video/upload/dog.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
    tags: ['Product', 'Motion Graphics', 'Launch'],
    category: 'AI Ads',
    client_name: 'EchoSync Tech',
    created_at: '2024-02-20',
    is_featured: true,
  },
  {
    id: '3',
    title: 'Vortex — Sports Energy Brand Story',
    description:
      'High-energy storytelling reel for a sports nutrition brand with AI-generated narration.',
    video_url: 'https://res.cloudinary.com/demo/video/upload/dog.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80',
    tags: ['Sports', 'Energy', 'Narrative'],
    category: 'AI Storytelling',
    client_name: 'Vortex Nutrition',
    created_at: '2024-01-10',
    is_featured: true,
  },
  {
    id: '4',
    title: 'Aurora — Fashion Brand Voiceover',
    description:
      'Silky AI voice narration for a premium fashion brand runway video.',
    video_url: 'https://res.cloudinary.com/demo/video/upload/dog.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80',
    tags: ['Fashion', 'Voice', 'Premium'],
    category: 'AI Voiceovers',
    client_name: 'Aurora Fashion',
    created_at: '2024-01-25',
    is_featured: false,
  },
  {
    id: '5',
    title: 'NeonGrid — Animated Explainer',
    description:
      'Futuristic animated explainer video for a SaaS company using AI-generated assets.',
    video_url: 'https://res.cloudinary.com/demo/video/upload/dog.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=800&q=80',
    tags: ['Animation', 'SaaS', 'Explainer'],
    category: 'Animation',
    client_name: 'NeonGrid Software',
    created_at: '2023-12-05',
    is_featured: false,
  },
  {
    id: '6',
    title: 'Celestia — Real Estate Walk-Through',
    description:
      'AI-edited luxury real estate tour with smooth transitions and AI voiceover.',
    video_url: 'https://res.cloudinary.com/demo/video/upload/dog.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    tags: ['Real Estate', 'Tour', 'Edit'],
    category: 'AI Video Editing',
    client_name: 'Celestia Properties',
    created_at: '2023-11-18',
    is_featured: false,
  },
  {
    id: '7',
    title: 'Pulse — Music Artist Promo',
    description:
      'Viral-ready music artist promotional reel with AI visual effects.',
    video_url: 'https://res.cloudinary.com/demo/video/upload/dog.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
    tags: ['Music', 'Promo', 'VFX'],
    category: 'AI Video Editing',
    client_name: 'Pulse Records',
    created_at: '2023-10-22',
    is_featured: true,
  },
  {
    id: '8',
    title: 'Zenith — Fintech Brand Commercial',
    description:
      'Trust-building brand commercial for a fintech startup with AI-generated visuals.',
    video_url: 'https://res.cloudinary.com/demo/video/upload/dog.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    tags: ['Fintech', 'Brand', 'Trust'],
    category: 'AI Ads',
    client_name: 'Zenith Finance',
    created_at: '2023-09-14',
    is_featured: false,
  },
]

// ─── Service functions (swap out mock for real API later) ─────────────────────
import api from './api'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export const portfolioService = {
  async getPortfolio(
    filters?: PortfolioFilters,
    page = 1,
    limit = 8
  ): Promise<PaginatedResponse<Video>> {
    if (USE_MOCK) {
      let filtered = [...MOCK_VIDEOS]
      if (filters?.category && filters.category !== 'All') {
        filtered = filtered.filter((v) => v.category === filters.category)
      }
      if (filters?.tags && filters.tags.length > 0) {
        filtered = filtered.filter((v) =>
          filters.tags!.some((t) => v.tags.includes(t))
        )
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase()
        filtered = filtered.filter(
          (v) =>
            v.title.toLowerCase().includes(q) ||
            (v.description || '').toLowerCase().includes(q)
        )
      }
      // Featured videos first, then newest first — mirrors backend sort
      filtered.sort((a, b) => {
        if (b.is_featured !== a.is_featured) return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
      const start = (page - 1) * limit
      const paginated = filtered.slice(start, start + limit)
      return {
        data: paginated,
        total: filtered.length,
        page,
        limit,
        has_more: start + limit < filtered.length,
      }
    }

    const params = new URLSearchParams()
    if (filters?.category && filters.category !== 'All')
      params.set('category', filters.category)
    if (filters?.search) params.set('search', filters.search)
    
    // Convert page to skip for backend
    const skip = (page - 1) * limit
    params.set('skip', String(skip))
    params.set('limit', String(limit))

    const res = await api.get(`/ads?${params}`)
    const payload = res.data
    
    return {
      data: payload.data,
      total: payload.meta?.total || 0,
      page,
      limit,
      has_more: skip + limit < (payload.meta?.total || 0),
    }
  },

  async getVideoById(id: string): Promise<Video> {
    if (USE_MOCK) {
      const video = MOCK_VIDEOS.find((v) => v.id === id)
      if (!video) throw new Error('Video not found')
      return video
    }
    const res = await api.get(`/ads/${id}`)
    return res.data.data
  },
}

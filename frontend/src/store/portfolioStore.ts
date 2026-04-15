import { create } from 'zustand'
import type { Video, PortfolioFilters, VideoCategory } from '@/types'

interface PortfolioState {
  videos: Video[]
  featured: Video[]
  filters: PortfolioFilters
  isLoading: boolean
  hasMore: boolean
  page: number
  setVideos: (videos: Video[]) => void
  appendVideos: (videos: Video[]) => void
  setFeatured: (videos: Video[]) => void
  setFilter: (filters: Partial<PortfolioFilters>) => void
  resetFilters: () => void
  setLoading: (loading: boolean) => void
  setHasMore: (hasMore: boolean) => void
  setPage: (page: number) => void
  incrementPage: () => void
}

const DEFAULT_FILTERS: PortfolioFilters = {
  category: 'All' as VideoCategory | 'All',
  tags: [],
  search: '',
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  videos: [],
  featured: [],
  filters: DEFAULT_FILTERS,
  isLoading: false,
  hasMore: true,
  page: 1,

  setVideos: (videos) => set({ videos }),
  appendVideos: (newVideos) =>
    set((state) => ({ videos: [...state.videos, ...newVideos] })),
  setFeatured: (featured) => set({ featured }),
  setFilter: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
      videos: [],
      page: 1,
      hasMore: true,
    })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS, videos: [], page: 1, hasMore: true }),
  setLoading: (isLoading) => set({ isLoading }),
  setHasMore: (hasMore) => set({ hasMore }),
  setPage: (page) => set({ page }),
  incrementPage: () => set((state) => ({ page: state.page + 1 })),
}))

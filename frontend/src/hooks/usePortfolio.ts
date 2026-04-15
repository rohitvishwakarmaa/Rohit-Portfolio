import { useCallback, useEffect, useRef } from 'react'
import { portfolioService } from '@/services/portfolioService'
import { usePortfolioStore } from '@/store/portfolioStore'

export const usePortfolio = () => {
  const {
    videos,
    filters,
    isLoading,
    hasMore,
    page,
    appendVideos,
    setFeatured,
    setLoading,
    setHasMore,
    incrementPage,
  } = usePortfolioStore()

  const loadingRef = useRef(false)

  const loadVideos = useCallback(
    async (p: number) => {
      if (loadingRef.current) return
      loadingRef.current = true
      setLoading(true)
      try {
        const res = await portfolioService.getPortfolio(filters, p, 8)
        appendVideos(res.data)
        setHasMore(res.has_more)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
        loadingRef.current = false
      }
    },
    [filters, appendVideos, setLoading, setHasMore]
  )

  const loadFeatured = useCallback(async () => {
    try {
      const res = await portfolioService.getPortfolio({ category: 'All' }, 1, 100)
      setFeatured(res.data.filter((v) => v.is_featured))
    } catch (err) {
      console.error(err)
    }
  }, [setFeatured])

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      incrementPage()
    }
  }, [isLoading, hasMore, incrementPage])

  useEffect(() => {
    loadVideos(page)
  }, [page, loadVideos])

  return { videos, isLoading, hasMore, loadMore, loadFeatured }
}

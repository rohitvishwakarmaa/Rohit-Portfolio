import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { VideoGrid } from '@/components/video/VideoGrid'
import { usePortfolio } from '@/hooks/usePortfolio'
import { usePortfolioStore } from '@/store/portfolioStore'
import type { VideoCategory } from '@/types'

const CATEGORIES: Array<VideoCategory | 'All'> = [
  'All',
  'AI Ads',
  'AI Video Editing',
  'AI Voiceovers',
  'AI Storytelling',
  'Animation',
]

const ALL_TAGS = ['Luxury', 'Brand Film', 'Product', 'Sports', 'Fashion', 'SaaS', 'Real Estate', 'Music', 'Fintech']

export default function Portfolio() {
  const { videos, isLoading, hasMore, loadMore } = usePortfolio()
  const { filters, setFilter, resetFilters } = usePortfolioStore()
  const [searchInput, setSearchInput] = useState('')
  const [showTags, setShowTags] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter({ search: searchInput })
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput, setFilter])

  const activeCategory = filters.category || 'All'
  const activeTags = filters.tags || []
  const hasActiveFilters = activeCategory !== 'All' || activeTags.length > 0 || searchInput

  const toggleTag = (tag: string) => {
    const current = filters.tags || []
    if (current.includes(tag)) {
      setFilter({ tags: current.filter((t) => t !== tag) })
    } else {
      setFilter({ tags: [...current, tag] })
    }
  }

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-white border-b border-gray-100">
        <div className="container-xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-label mb-4">All Work</span>
            <h1 className="font-display font-black text-5xl md:text-6xl text-gray-900 mt-3 mb-4">
              The <span className="gradient-text">Portfolio</span>
            </h1>
            <p className="text-gray-500 text-lg max-w-xl">
              AI-crafted ads, edits, voiceovers, stories, and animations — all in one place.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-[72px] z-30 bg-white/90 backdrop-blur-xl border-b border-gray-100 py-4">
        <div className="container-xl">
          <div className="flex flex-col gap-4">
            {/* Row 1: Category tabs + search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Category pills */}
              <div className="flex items-center gap-2 flex-wrap flex-1 no-scrollbar">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter({ category: cat })}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                      activeCategory === cat
                        ? 'text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    style={
                      activeCategory === cat
                        ? { background: 'linear-gradient(135deg, #F77F00, #FF4D6D)' }
                        : {}
                    }
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search + tag toggle */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-60">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search projects…"
                    className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200 bg-white text-sm focus:outline-none focus:border-brand-orange transition-colors"
                  />
                  {searchInput && (
                    <button
                      onClick={() => setSearchInput('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowTags((s) => !s)}
                  className={`p-2 rounded-full border transition-all ${
                    showTags || activeTags.length > 0
                      ? 'border-brand-orange text-brand-orange bg-brand-orange/5'
                      : 'border-gray-200 text-gray-400 hover:border-gray-300'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={() => { resetFilters(); setSearchInput('') }}
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors whitespace-nowrap"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* Row 2: Tag filters (expandable) */}
            {showTags && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-2 flex-wrap"
              >
                {ALL_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                      activeTags.includes(tag)
                        ? 'bg-brand-purple text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="section-padding bg-gray-50">
        <div className="container-xl">
          <VideoGrid
            videos={videos}
            isLoading={isLoading}
            hasMore={hasMore}
            onLoadMore={loadMore}
          />
        </div>
      </section>
    </PageWrapper>
  )
}

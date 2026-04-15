import { useEffect, useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import { VideoCard } from './VideoCard'
import { VideoCardSkeleton } from '@/components/ui/Skeleton'
import type { Video } from '@/types'

interface VideoGridProps {
  videos: Video[]
  isLoading: boolean
  hasMore: boolean
  onLoadMore: () => void
}

export const VideoGrid = ({ videos, isLoading, hasMore, onLoadMore }: VideoGridProps) => {
  const { ref: sentinelRef, inView } = useInView({ threshold: 0.1 })
  const triggered = useRef(false)

  useEffect(() => {
    if (inView && hasMore && !isLoading && !triggered.current) {
      triggered.current = true
      onLoadMore()
      setTimeout(() => { triggered.current = false }, 800)
    }
  }, [inView, hasMore, isLoading, onLoadMore])

  if (videos.length === 0 && !isLoading) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 text-4xl"
          style={{ background: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)' }}
        >
          🎬
        </div>
        <h3 className="text-gray-900 font-semibold text-lg mb-2">No videos found</h3>
        <p className="text-gray-500 text-sm">Try a different category or search term.</p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video, i) => (
          <VideoCard key={video.id} video={video} index={i % 8} />
        ))}
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => <VideoCardSkeleton key={`sk-${i}`} />)}
      </div>

      {/* Infinite scroll sentinel */}
      {hasMore && (
        <div ref={sentinelRef} className="h-10 flex items-center justify-center">
          {isLoading && (
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-brand-orange animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {!hasMore && videos.length > 0 && (
        <p className="text-center text-gray-400 text-sm py-4">
          ✦ You've seen all {videos.length} projects
        </p>
      )}
    </div>
  )
}

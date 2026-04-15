import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, User, Tag, ArrowUpRight } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { VideoPlayer } from '@/components/video/VideoPlayer'
import { VideoCard } from '@/components/video/VideoCard'
import { Badge } from '@/components/ui/Badge'
import { VideoCardSkeleton } from '@/components/ui/Skeleton'
import { portfolioService } from '@/services/portfolioService'
import type { Video } from '@/types'

export default function VideoDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [video, setVideo] = useState<Video | null>(null)
  const [related, setRelated] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true)
      try {
        const data = await portfolioService.getVideoById(id!)
        setVideo(data)
        const relatedRes = await portfolioService.getPortfolio(
          { category: data.category },
          1,
          12
        )
        const rel = relatedRes.data
          .filter((v) => v.id !== id)
          .slice(0, 3)
        setRelated(rel)
      } catch {
        navigate('/portfolio')
      } finally {
        setIsLoading(false)
      }
    }
    if (id) fetch()
  }, [id, navigate])

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="pt-28 section-padding container-xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-100 rounded-lg w-40 mb-8" />
            <div className="aspect-video bg-gray-100 rounded-2xl mb-8" />
            <div className="h-10 bg-gray-100 rounded-lg w-2/3 mb-4" />
            <div className="h-4 bg-gray-100 rounded-lg w-full mb-2" />
            <div className="h-4 bg-gray-100 rounded-lg w-5/6" />
          </div>
        </div>
      </PageWrapper>
    )
  }

  if (!video) return null

  return (
    <PageWrapper>
      <div className="pt-24 pb-20">
        <div className="container-xl max-w-5xl">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors group text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Portfolio
            </button>
          </motion.div>

          {/* Video player */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <VideoPlayer
              src={video.video_url}
              poster={video.thumbnail}
              title={video.title}
            />
          </motion.div>

          {/* Meta info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left: main info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="flex flex-wrap gap-2 mb-4">
                {video.is_featured && <Badge label="Featured" variant="featured" />}
                <Badge label={video.category} variant="category" />
              </div>
              <h1 className="font-display font-black text-3xl md:text-4xl text-gray-900 mb-5 leading-tight">
                {video.title}
              </h1>

              <div className="flex flex-wrap gap-2">
                {video.tags.map((tag) => (
                  <Badge key={tag} label={tag} />
                ))}
              </div>
            </motion.div>

            {/* Right: details card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-5">
                <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider mb-4">
                  Project Details
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-brand-orange" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Client</p>
                    <p className="text-gray-900 font-semibold text-sm">{video.client_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Tag className="w-4 h-4 text-brand-purple" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Category</p>
                    <p className="text-gray-900 font-semibold text-sm">{video.category}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <a
                    href={video.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-brand-orange text-sm font-semibold hover:gap-3 transition-all"
                  >
                    View on Cloudinary <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Related videos */}
          {related.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display font-bold text-2xl text-gray-900">
                  More <span className="gradient-text">{video.category}</span>
                </h2>
                <Link
                  to="/portfolio"
                  className="text-brand-orange text-sm font-semibold hover:underline"
                >
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading
                  ? Array.from({ length: 3 }).map((_, i) => <VideoCardSkeleton key={i} />)
                  : related.map((v, i) => <VideoCard key={v.id} video={v} index={i} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}

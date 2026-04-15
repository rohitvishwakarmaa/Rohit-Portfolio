import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Clock, ArrowUpRight } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { truncate, formatDate } from '@/utils'
import type { Video } from '@/types'

interface VideoCardProps {
  video: Video
  index?: number
}

export const VideoCard = ({ video, index = 0 }: VideoCardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (video.source_type === 'cloudinary' && videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (video.source_type === 'cloudinary' && videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: 'easeOut' }}
      whileHover={{ y: -6 }}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-card hover:shadow-card-hover transition-shadow duration-400 cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link to={`/portfolio/${video.id}`} className="block">
        {/* Thumbnail / Video hover */}
        <div className="relative aspect-video bg-gray-100 overflow-hidden">
          {/* Static thumbnail */}
          <img
            src={video.thumbnail || (video.source_type === 'youtube' ? `https://img.youtube.com/vi/${video.youtube_id}/maxresdefault.jpg` : '')}
            alt={video.title}
            className={`w-full h-full object-cover transition-all duration-700 ${
              isHovered && video.source_type === 'cloudinary' ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
            }`}
            loading="lazy"
          />

          {/* Hover video preview (Only for Cloudinary) */}
          {video.source_type === 'cloudinary' && (
            <video
              ref={videoRef}
              src={video.video_url}
              muted
              loop
              playsInline
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}

          {/* Overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Play button */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
              isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </div>

          {/* Badges overlay */}
          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
            {video.is_featured && <Badge label="Featured" variant="featured" />}
            <Badge label={video.category} variant="category" />
          </div>

          {/* Arrow on hover */}
          <div
            className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${
              isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-gray-900" />
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-display font-semibold text-gray-900 text-base leading-snug group-hover:text-brand-orange transition-colors">
              {truncate(video.title, 50)}
            </h3>
          </div>



          <div className="flex items-center justify-between">
            <div className="flex gap-1.5 flex-wrap">
              {video.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} label={tag} />
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

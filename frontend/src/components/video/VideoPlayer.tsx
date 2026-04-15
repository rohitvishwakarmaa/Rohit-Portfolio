import { useRef, useState, useCallback, type MutableRefObject } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react'

interface VideoPlayerProps {
  src: string
  poster?: string
  title?: string
}

export const VideoPlayer = ({ src, poster, title }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null) as MutableRefObject<ReturnType<typeof setTimeout> | null>

  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) { v.play(); setIsPlaying(true) }
    else { v.pause(); setIsPlaying(false) }
  }, [])

  const toggleMute = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setIsMuted(v.muted)
  }, [])

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    setCurrentTime(v.currentTime)
    setProgress((v.currentTime / v.duration) * 100)
  }, [])

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = progressRef.current?.getBoundingClientRect()
    if (!rect || !videoRef.current) return
    const ratio = (e.clientX - rect.left) / rect.width
    videoRef.current.currentTime = ratio * videoRef.current.duration
  }, [])

  const handleFullscreen = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (document.fullscreenElement) document.exitFullscreen()
    else v.requestFullscreen()
  }, [])

  const handleMouseMove = useCallback(() => {
    setShowControls(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false)
    }, 2500)
  }, [isPlaying])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div
      className="relative bg-black rounded-2xl overflow-hidden group select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {src.includes('youtube') || src.includes('youtu.be') ? (
        <iframe
          src={src}
          className="w-full aspect-video border-0 rounded-2xl"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title={title || "YouTube video player"}
        ></iframe>
      ) : (
        <>
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            className="w-full aspect-video object-cover"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
            onEnded={() => setIsPlaying(false)}
            onClick={togglePlay}
          />

          {/* Title overlay */}
          {title && !isPlaying && (
            <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none">
              <p className="text-white font-semibold text-lg">{title}</p>
            </div>
          )}

          {/* Big play button when paused */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #F77F00, #FF4D6D)', boxShadow: '0 0 40px rgba(247,127,0,0.5)' }}
              >
                <Play className="w-8 h-8 text-white fill-white ml-1" />
              </div>
            </button>
          )}

          {/* Controls bar */}
          <div
            className={`absolute bottom-0 left-0 right-0 p-4 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}
          >
            {/* Progress bar */}
            <div
              ref={progressRef}
              className="w-full h-1 bg-white/20 rounded-full mb-3 cursor-pointer group/progress"
              onClick={handleProgressClick}
            >
              <div
                className="h-full rounded-full transition-all relative"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #F77F00, #FF4D6D)',
                }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover/progress:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Buttons row */}
            <div className="flex items-center gap-3">
              <button onClick={togglePlay} className="text-white hover:text-brand-yellow transition-colors">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              </button>
              <button onClick={() => { if(videoRef.current) { videoRef.current.currentTime = 0; setIsPlaying(false) } }} className="text-white hover:text-brand-yellow transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
              <button onClick={toggleMute} className="text-white hover:text-brand-yellow transition-colors">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <span className="text-white/70 text-xs ml-1 font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <button onClick={handleFullscreen} className="text-white hover:text-brand-yellow transition-colors ml-auto">
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

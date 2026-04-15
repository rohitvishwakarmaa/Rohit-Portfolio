import { cn } from '@/utils'

interface SkeletonProps {
  className?: string
}

const Skeleton = ({ className }: SkeletonProps) => (
  <div
    className={cn(
      'animate-pulse rounded-xl bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 bg-[length:200%_100%]',
      className
    )}
    style={{ animation: 'shimmer 1.5s ease-in-out infinite' }}
  />
)

export const VideoCardSkeleton = () => (
  <div className="rounded-2xl overflow-hidden bg-white border border-gray-100">
    <Skeleton className="aspect-video w-full" />
    <div className="p-5 space-y-3">
      <Skeleton className="h-5 w-3/4 rounded-lg" />
      <Skeleton className="h-4 w-full rounded-lg" />
      <Skeleton className="h-4 w-2/3 rounded-lg" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  </div>
)

export const HeroSkeleton = () => (
  <div className="min-h-screen bg-brand-dark animate-pulse" />
)

export { Skeleton }

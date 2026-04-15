import { cn, getCategoryColor } from '@/utils'

interface BadgeProps {
  label: string
  variant?: 'category' | 'tag' | 'featured'
  className?: string
}

export const Badge = ({ label, variant = 'tag', className }: BadgeProps) => {
  if (variant === 'featured') {
    return (
      <span
        className={cn(
          'tag-pill text-white text-[11px] font-bold tracking-wide',
          className
        )}
        style={{ background: 'linear-gradient(135deg, #FFD166, #F77F00)' }}
      >
        ✦ Featured
      </span>
    )
  }

  if (variant === 'category') {
    return (
      <span
        className={cn('tag-pill text-[11px] font-semibold', getCategoryColor(label), className)}
      >
        {label}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'tag-pill bg-gray-100 text-gray-600 text-[11px] hover:bg-brand-yellow/20 hover:text-brand-orange transition-colors cursor-default',
        className
      )}
    >
      #{label}
    </span>
  )
}

import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-300 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2'

    const variants = {
      primary: 'text-white shadow-md hover:shadow-lg hover:-translate-y-0.5',
      secondary: 'bg-white text-gray-900 border border-gray-200 hover:border-brand-orange hover:text-brand-orange hover:-translate-y-0.5',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
      danger: 'bg-red-500 text-white hover:bg-red-600',
    }

    const sizes = {
      sm: 'text-xs px-4 py-2',
      md: 'text-sm px-6 py-3',
      lg: 'text-base px-8 py-4',
    }

    const primaryStyle =
      variant === 'primary'
        ? { background: 'linear-gradient(135deg, #F77F00, #FF4D6D)', boxShadow: '0 4px 20px rgba(247,127,0,0.3)' }
        : {}

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        style={primaryStyle}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], (disabled || loading) && 'opacity-60 cursor-not-allowed', className)}
        {...(props as object)}
      >
        {loading ? (
          <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : icon ? (
          icon
        ) : null}
        {children}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

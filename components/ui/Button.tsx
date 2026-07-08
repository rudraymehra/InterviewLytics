import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded font-data font-semibold uppercase tracking-wide transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      // Primary: outlined cyan terminal button; subtle outer glow on hover (dark)
      primary: 'bg-transparent border border-jade-600 text-jade-700 hover:bg-jade-50 dark:border-jade-400/60 dark:text-jade-400 dark:hover:border-jade-400 dark:hover:shadow-neon',
      secondary: 'bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white/10 dark:text-white dark:hover:bg-white/15',
      outline: 'border border-line-light dark:border-line-dark text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5',
      ghost: 'text-jade-700 dark:text-jade-400 hover:bg-jade-50 dark:hover:bg-jade-400/10',
      destructive: 'bg-transparent border border-red-600 text-red-600 hover:bg-red-50 dark:border-[#FF3B5C]/70 dark:text-[#FF3B5C] dark:hover:border-[#FF3B5C] dark:hover:shadow-[0_0_16px_0_rgba(255,59,92,0.3)]'
    }

    const sizes = {
      sm: 'px-3 py-2 text-xs',
      md: 'px-4 py-2 text-xs',
      lg: 'px-6 py-3 text-sm'
    }

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }

'use client'

import React from 'react'
import { motion } from '@/components/MotionWrapper'
import { cn } from '@/lib/utils'

interface Progress3DProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error' | 'gradient'
  showLabel?: boolean
  label?: string
  animated?: boolean
  glowEffect?: boolean
  className?: string
}

const Progress3D = React.forwardRef<HTMLDivElement, Progress3DProps>(
  ({ 
    value,
    max = 100,
    size = 'md',
    variant = 'default',
    showLabel = true,
    label,
    animated = true,
    glowEffect = true,
    className,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    const sizeClasses = {
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4'
    }

    const variants = {
      default: 'bg-jade-600',
      success: 'bg-green-600',
      warning: 'bg-amber-500',
      error: 'bg-red-600',
      gradient: 'bg-jade-600'
    }

    return (
      <div className={cn('space-y-2', className)} ref={ref} {...props}>
        {/* Label */}
        {showLabel && (label || value !== undefined) && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {label || 'Progress'}
            </span>
            <span className="font-data text-sm text-neutral-500 dark:text-neutral-400">
              {Math.round(percentage)}%
            </span>
          </div>
        )}

        {/* Progress Bar Container */}
        <div className={cn(
          'relative overflow-hidden rounded-full bg-neutral-200 dark:bg-slate-700',
          sizeClasses[size]
        )}>
          {/* Progress Fill */}
          <motion.div
            className={cn(
              'relative h-full rounded-full',
              variants[variant]
            )}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{
              duration: animated ? 0.4 : 0,
              ease: 'easeOut'
            }}
          />

          {/* Progress Value Indicator */}
          {percentage > 0 && (
            <motion.div
              className="absolute top-1/2 right-2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-sm"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            />
          )}
        </div>
      </div>
    )
  }
)

Progress3D.displayName = 'Progress3D'

export { Progress3D }

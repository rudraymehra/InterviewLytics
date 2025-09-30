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
      default: 'from-accent-500 to-accent-600',
      success: 'from-green-500 to-green-600',
  warning: 'from-accent-500 to-accent-600',
      error: 'from-red-500 to-red-600',
      gradient: 'from-accent-500 via-accent-600 to-accent-700'
    }

    return (
      <div className={cn('space-y-2', className)} ref={ref} {...props}>
        {/* Label */}
        {showLabel && (label || value !== undefined) && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-neutral-700">
              {label || 'Progress'}
            </span>
            <span className="text-sm text-neutral-500">
              {Math.round(percentage)}%
            </span>
          </div>
        )}

        {/* Progress Bar Container */}
        <div className={cn(
          'relative overflow-hidden rounded-full bg-neutral-200',
          sizeClasses[size]
        )}>
          {/* 3D Background */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-neutral-100 to-neutral-300" />
          
          {/* Progress Fill */}
          <motion.div
            className={cn(
              'relative h-full rounded-full bg-gradient-to-r',
              variants[variant],
              glowEffect && 'shadow-lg'
            )}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ 
              duration: animated ? 1.5 : 0,
              ease: 'easeOut'
            }}
            style={{
              boxShadow: glowEffect ? `0 0 20px rgba(212, 175, 55, ${percentage / 100 * 0.5})` : undefined
            }}
          >
            {/* Shine Effect */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5
              }}
            />

            {/* Animated Dots */}
            {animated && (
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  background: [
                    'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                    'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                    'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)'
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            )}
          </motion.div>

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

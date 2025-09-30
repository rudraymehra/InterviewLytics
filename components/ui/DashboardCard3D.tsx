'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from '@/components/MotionWrapper'
import { cn } from '@/lib/utils'
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUp, 
  ArrowDown, 
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Share,
  Download
} from 'lucide-react'

interface DashboardCard3DProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'gradient'
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  glowEffect?: boolean
  actions?: Array<{
    label: string
    icon: React.ReactNode
    onClick: () => void
    variant?: 'default' | 'success' | 'warning' | 'error'
  }>
  className?: string
  children?: React.ReactNode
}

const DashboardCard3D = React.forwardRef<HTMLDivElement, DashboardCard3DProps>(
  ({ 
    title,
    value,
    change,
    changeLabel,
    icon,
    variant = 'default',
    size = 'md',
    interactive = true,
    glowEffect = true,
    actions = [],
    className,
    children,
    ...props 
  }, ref) => {
    const [isHovered, setIsHovered] = useState(false)
    const [showActions, setShowActions] = useState(false)

    const sizeClasses = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    }

    const variants = {
      default: {
        bg: 'from-white to-neutral-50',
        border: 'border-neutral-200',
        icon: 'text-accent-500',
        value: 'text-primary-950',
        title: 'text-neutral-700',
        glow: 'shadow-gold'
      },
      success: {
        bg: 'from-green-50 to-green-100',
        border: 'border-green-200',
        icon: 'text-green-500',
        value: 'text-green-700',
        title: 'text-green-600',
        glow: 'shadow-green-500/20'
      },
      warning: {
  bg: 'from-accent-50 to-accent-100',
  border: 'border-accent-200',
  icon: 'text-accent-500',
  value: 'text-accent-700',
  title: 'text-accent-600',
  glow: 'shadow-gold'
      },
      error: {
        bg: 'from-red-50 to-red-100',
        border: 'border-red-200',
        icon: 'text-red-500',
        value: 'text-red-700',
        title: 'text-red-600',
        glow: 'shadow-red-500/20'
      },
      info: {
        bg: 'from-blue-50 to-blue-100',
        border: 'border-blue-200',
        icon: 'text-blue-500',
        value: 'text-blue-700',
        title: 'text-blue-600',
        glow: 'shadow-blue-500/20'
      },
      gradient: {
        bg: 'from-accent-50 via-accent-100 to-accent-200',
        border: 'border-accent-200',
        icon: 'text-accent-600',
        value: 'text-accent-800',
        title: 'text-accent-700',
        glow: 'shadow-gold'
      }
    }

    const getChangeIcon = () => {
      if (change === undefined) return null
      if (change > 0) return <TrendingUp className="w-4 h-4" />
      if (change < 0) return <TrendingDown className="w-4 h-4" />
      return null
    }

    const getChangeColor = () => {
      if (change === undefined) return 'text-neutral-500'
      if (change > 0) return 'text-green-600'
      if (change < 0) return 'text-red-600'
      return 'text-neutral-500'
    }

    const variantStyles = variants[variant]

    return (
      <motion.div
        ref={ref}
        className={cn(
          'relative rounded-lg border transition-all duration-300 overflow-hidden',
          'bg-gradient-to-br',
          variantStyles.bg,
          variantStyles.border,
          sizeClasses[size],
          interactive && 'cursor-pointer',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={interactive ? { 
          scale: 1.02,
          y: -4,
          rotateX: 5,
          rotateY: 2
        } : {}}
        whileTap={interactive ? { scale: 0.98 } : {}}
        animate={{
          boxShadow: glowEffect && isHovered 
            ? `0 25px 50px ${variantStyles.glow}` 
            : '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
        style={{
          transformStyle: 'preserve-3d'
        }}
        {...props}
      >
        {/* 3D Background Layers */}
        <motion.div
          className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/80 to-transparent"
          animate={{
            opacity: isHovered ? 0.9 : 0.7
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Shine Effect */}
        <motion.div
          className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: isHovered ? '100%' : '-100%' }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />

        {/* Glow Effect */}
        {glowEffect && (
          <motion.div
            className="absolute inset-0 rounded-lg bg-gradient-to-r from-accent-400/10 to-accent-600/10"
            animate={{
              opacity: isHovered ? 0.3 : 0
            }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <motion.h3
              className={cn(
                'text-sm font-medium',
                variantStyles.title
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {title}
            </motion.h3>

            <div className="flex items-center gap-2">
              {icon && (
                <motion.div
                  className={cn(
                    'p-2 rounded-lg bg-white/50',
                    variantStyles.icon
                  )}
                  animate={{
                    scale: isHovered ? 1.1 : 1,
                    rotate: isHovered ? 5 : 0
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {icon}
                </motion.div>
              )}

              {actions.length > 0 && (
                <div className="relative">
                  <motion.button
                    onClick={() => setShowActions(!showActions)}
                    className="p-1 hover:bg-white/50 rounded transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <MoreVertical className="w-4 h-4 text-neutral-500" />
                  </motion.button>

                  <AnimatePresence>
                    {showActions && (
                      <motion.div
                        className="absolute right-0 top-8 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 z-20 min-w-[120px]"
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {actions.map((action, index) => (
                          <motion.button
                            key={index}
                            onClick={() => {
                              action.onClick()
                              setShowActions(false)
                            }}
                            className={cn(
                              'w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-2',
                              action.variant === 'error' && 'text-red-600',
                              action.variant === 'warning' && 'text-yellow-600',
                              action.variant === 'success' && 'text-green-600'
                            )}
                            whileHover={{ x: 4 }}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                          >
                            {action.icon}
                            {action.label}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* Value */}
          <motion.div
            className={cn(
              'text-2xl font-bold mb-2',
              variantStyles.value
            )}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {value}
          </motion.div>

          {/* Change Indicator */}
          <AnimatePresence>
            {change !== undefined && (
              <motion.div
                className={cn(
                  'flex items-center gap-1 text-sm font-medium',
                  getChangeColor()
                )}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <motion.div
                  animate={{
                    rotate: change > 0 ? [0, -10, 10, 0] : change < 0 ? [0, 10, -10, 0] : 0
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {getChangeIcon()}
                </motion.div>
                <span>
                  {Math.abs(change)}%
                </span>
                {changeLabel && (
                  <span className="text-neutral-500">
                    {changeLabel}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Children Content */}
          {children && (
            <motion.div
              className="mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              {children}
            </motion.div>
          )}
        </div>

        {/* Hover Border */}
        <AnimatePresence>
          {isHovered && interactive && (
            <motion.div
              className="absolute inset-0 rounded-lg border-2 border-accent-400 pointer-events-none"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    )
  }
)

DashboardCard3D.displayName = 'DashboardCard3D'

export { DashboardCard3D }

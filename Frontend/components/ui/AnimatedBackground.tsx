'use client'

import React from 'react'
import { motion } from '@/components/MotionWrapper'
import { cn } from '@/lib/utils'

interface AnimatedBackgroundProps {
  variant?: 'particles' | 'waves' | 'geometric' | 'gradient' | 'floating'
  intensity?: 'low' | 'medium' | 'high'
  color?: 'accent' | 'primary' | 'neutral' | 'rainbow'
  className?: string
  children?: React.ReactNode
}

const AnimatedBackground = React.forwardRef<HTMLDivElement, AnimatedBackgroundProps>(
  ({ 
    variant = 'particles',
    intensity = 'medium',
    color = 'accent',
    className,
    children,
    ...props 
  }, ref) => {
    const intensityClasses = {
      low: 'opacity-20',
      medium: 'opacity-40',
      high: 'opacity-60'
    }

    const colorClasses = {
      accent: 'from-accent-400/20 to-accent-600/20',
      primary: 'from-primary-400/20 to-primary-600/20',
      neutral: 'from-neutral-400/20 to-neutral-600/20',
      rainbow: 'from-red-400/20 via-yellow-400/20 via-green-400/20 via-blue-400/20 to-purple-400/20'
    }

    const renderParticles = () => (
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: intensity === 'low' ? 20 : intensity === 'medium' ? 40 : 60 }).map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              'absolute rounded-full bg-gradient-to-r',
              colorClasses[color],
              intensity === 'low' ? 'w-2 h-2' : intensity === 'medium' ? 'w-3 h-3' : 'w-4 h-4'
            )}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              scale: [1, 1.2, 1],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>
    )

    const renderWaves = () => (
      <div className="absolute inset-0 overflow-hidden">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn(
              'absolute w-full h-full bg-gradient-to-r',
              colorClasses[color]
            )}
            style={{
              top: `${i * 33}%`,
              left: '-100%'
            }}
            animate={{
              x: ['-100%', '100%'],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 1.5,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>
    )

    const renderGeometric = () => (
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: intensity === 'low' ? 8 : intensity === 'medium' ? 15 : 25 }).map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              'absolute bg-gradient-to-r',
              colorClasses[color],
              i % 3 === 0 ? 'rounded-full' : i % 3 === 1 ? 'rounded-lg' : 'rounded-none'
            )}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>
    )

    const renderGradient = () => (
      <motion.div
        className={cn(
          'absolute inset-0 bg-gradient-to-br',
          colorClasses[color]
        )}
        animate={{
          background: [
            'linear-gradient(45deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.3))',
            'linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(212, 175, 55, 0.1))',
            'linear-gradient(225deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.3))',
            'linear-gradient(315deg, rgba(212, 175, 55, 0.3), rgba(212, 175, 55, 0.1))'
          ]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    )

    const renderFloating = () => (
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: intensity === 'low' ? 6 : intensity === 'medium' ? 12 : 20 }).map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              'absolute rounded-full bg-gradient-to-r',
              colorClasses[color],
              intensity === 'low' ? 'w-16 h-16' : intensity === 'medium' ? 'w-24 h-24' : 'w-32 h-32'
            )}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, Math.random() * 30 - 15, 0],
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: Math.random() * 6 + 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>
    )

    const renderBackground = () => {
      switch (variant) {
        case 'waves':
          return renderWaves()
        case 'geometric':
          return renderGeometric()
        case 'gradient':
          return renderGradient()
        case 'floating':
          return renderFloating()
        default:
          return renderParticles()
      }
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          'relative overflow-hidden',
          className
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        {...props}
      >
        {/* Background Animation */}
        <div className={cn(
          'absolute inset-0',
          intensityClasses[intensity]
        )}>
          {renderBackground()}
        </div>

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    )
  }
)

AnimatedBackground.displayName = 'AnimatedBackground'

export { AnimatedBackground }

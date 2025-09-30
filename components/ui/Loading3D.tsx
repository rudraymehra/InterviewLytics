'use client'

import React from 'react'
import { motion } from '@/components/MotionWrapper'
import { cn } from '@/lib/utils'

interface Loading3DProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'dots' | 'pulse' | 'wave' | 'orbit'
  color?: 'primary' | 'accent' | 'white'
  text?: string
  className?: string
}

const Loading3D = React.forwardRef<HTMLDivElement, Loading3DProps>(
  ({ 
    size = 'md',
    variant = 'spinner',
    color = 'accent',
    text,
    className,
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-8 h-8',
      lg: 'w-12 h-12',
      xl: 'w-16 h-16'
    }

    const colorClasses = {
      primary: 'text-primary-600',
      accent: 'text-accent-500',
      white: 'text-white'
    }

    const renderSpinner = () => (
      <motion.div
        className={cn(
          'rounded-full border-2 border-current border-t-transparent',
          sizeClasses[size],
          colorClasses[color]
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    )

    const renderDots = () => (
      <div className="flex space-x-1">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={cn(
              'rounded-full bg-current',
              size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-5 h-5'
            )}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: index * 0.2,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>
    )

    const renderPulse = () => (
      <motion.div
        className={cn(
          'rounded-full bg-current',
          sizeClasses[size]
        )}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    )

    const renderWave = () => (
      <div className="flex space-x-1">
        {[0, 1, 2, 3, 4].map((index) => (
          <motion.div
            key={index}
            className={cn(
              'bg-current rounded-sm',
              size === 'sm' ? 'w-1 h-4' : size === 'md' ? 'w-1 h-6' : size === 'lg' ? 'w-1 h-8' : 'w-1 h-10'
            )}
            animate={{
              scaleY: [1, 2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: index * 0.1,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>
    )

    const renderOrbit = () => (
      <div className="relative">
        <motion.div
          className={cn(
            'rounded-full border-2 border-current border-t-transparent',
            sizeClasses[size]
          )}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
        <motion.div
          className={cn(
            'absolute top-0 left-0 rounded-full bg-current',
            size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-5 h-5'
          )}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      </div>
    )

    const renderLoader = () => {
      switch (variant) {
        case 'dots':
          return renderDots()
        case 'pulse':
          return renderPulse()
        case 'wave':
          return renderWave()
        case 'orbit':
          return renderOrbit()
        default:
          return renderSpinner()
      }
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center space-y-3',
          colorClasses[color],
          className
        )}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        {...props}
      >
        {/* 3D Container */}
        <motion.div
          className="relative"
          animate={{
            rotateY: [0, 5, -5, 0],
            rotateX: [0, 5, -5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          {renderLoader()}
        </motion.div>

        {/* Loading Text */}
        {text && (
          <motion.p
            className="text-sm font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {text}
          </motion.p>
        )}

        {/* Shimmer Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </motion.div>
    )
  }
)

Loading3D.displayName = 'Loading3D'

export { Loading3D }

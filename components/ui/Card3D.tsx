'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from '../MotionWrapper'
import { cn } from '@/lib/utils'

interface Card3DProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'floating' | 'glass' | 'neon'
  hover3D?: boolean
  glowEffect?: boolean
  interactive?: boolean
  children: React.ReactNode
}

const Card3D = React.forwardRef<HTMLDivElement, Card3DProps>(
  ({ 
    className, 
    variant = 'default',
    hover3D = true,
    glowEffect = false,
    interactive = false,
    children, 
    ...props 
  }, ref) => {
    const [isHovered, setIsHovered] = useState(false)
    const [isPressed, setIsPressed] = useState(false)

    const baseStyles = 'relative rounded-lg transition-all duration-300 overflow-hidden'

    const variants = {
      default: 'bg-white dark:bg-[#131A2A] border border-line-light dark:border-line-dark shadow-sm',
      elevated: 'bg-white dark:bg-[#131A2A] border border-line-light dark:border-line-dark shadow-sm',
      floating: 'bg-white dark:bg-[#131A2A] border border-line-light dark:border-line-dark shadow-sm',
      glass: 'bg-white/80 backdrop-blur-sm border border-white/20 shadow-sm',
      neon: 'bg-jade-100 dark:bg-jade-900/20 border border-jade-600/30 dark:border-jade-400/30 shadow-sm'
    }

    const handleMouseEnter = () => {
      setIsHovered(true)
    }

    const handleMouseLeave = () => {
      setIsHovered(false)
      setIsPressed(false)
    }

    const handleMouseDown = () => {
      if (interactive) {
        setIsPressed(true)
      }
    }

    const handleMouseUp = () => {
      if (interactive) {
        setIsPressed(false)
      }
    }

    return (
  <motion.div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        whileHover={hover3D ? {
          scale: 1.02,
          y: -4,
          rotateX: 5,
          rotateY: 2,
          boxShadow: glowEffect ? '0 4px 12px rgba(12, 18, 32, 0.08)' : undefined
        } : {}}
        whileTap={interactive ? { 
          scale: 0.98,
          y: -2
        } : {}}
        animate={{
          scale: isPressed ? 0.98 : 1,
          y: isPressed ? -2 : 0,
          rotateX: isHovered && hover3D ? 5 : 0,
          rotateY: isHovered && hover3D ? 2 : 0
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
        style={{
          transformStyle: 'preserve-3d'
        }}
  {...(props as any)}
      >
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Hover Border */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute inset-0 rounded-lg border border-jade-600 dark:border-jade-400 pointer-events-none"
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

Card3D.displayName = 'Card3D'

const Card3DHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn('p-6 pb-4', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...(props as any)}
    />
  )
)
Card3DHeader.displayName = 'Card3DHeader'

const Card3DTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <motion.h3
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight text-primary-950 dark:text-white', className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      {...(props as any)}
    />
  )
)
Card3DTitle.displayName = 'Card3DTitle'

const Card3DDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <motion.p
      ref={ref}
      className={cn('text-sm text-neutral-500 mt-2', className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      {...(props as any)}
    />
  )
)
Card3DDescription.displayName = 'Card3DDescription'

const Card3DContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn('p-6 pt-0', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      {...(props as any)}
    />
  )
)
Card3DContent.displayName = 'Card3DContent'

const Card3DFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn('p-6 pt-0', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      {...(props as any)}
    />
  )
)
Card3DFooter.displayName = 'Card3DFooter'

export { 
  Card3D, 
  Card3DHeader, 
  Card3DTitle, 
  Card3DDescription, 
  Card3DContent, 
  Card3DFooter 
}

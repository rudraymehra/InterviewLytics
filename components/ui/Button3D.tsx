'use client'

import React, { useState, useRef } from 'react'
import { AnimatePresence } from '@/components/MotionWrapper'
import MotionWrapper from '@/components/MotionWrapper'
import { cn } from '@/lib/utils'
import { Loader2, Check, X, ArrowRight, Plus, Trash2, Edit, Eye, Download } from 'lucide-react'

interface Button3DProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  success?: boolean
  error?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  glowEffect?: boolean
  rippleEffect?: boolean
  hover3D?: boolean
  children: React.ReactNode
}

const iconMap = {
  arrow: ArrowRight,
  plus: Plus,
  edit: Edit,
  delete: Trash2,
  view: Eye,
  download: Download
}

const Button3D = React.forwardRef<HTMLButtonElement, Button3DProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    success = false,
    error = false,
    icon,
    iconPosition = 'left',
    glowEffect = true,
    rippleEffect = true,
    hover3D = true,
    children, 
    disabled,
    ...props 
  }, ref) => {
    const [isPressed, setIsPressed] = useState(false)
    const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])
    const buttonRef = useRef<HTMLButtonElement>(null)

    const baseStyles = 'relative inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden'

    const variants = {
      primary: 'bg-gradient-to-r from-accent-500 to-accent-600 text-white hover:from-accent-600 hover:to-accent-700 focus:ring-accent-500 shadow-gold',
      secondary: 'bg-gradient-to-r from-primary-800 to-primary-900 text-white hover:from-primary-900 hover:to-primary-950 focus:ring-primary-500 shadow-dark',
      outline: 'border-2 border-accent-500 bg-white text-accent-600 hover:bg-accent-50 focus:ring-accent-500 shadow-premium dark:bg-primary-900 dark:text-accent-200 dark:hover:bg-primary-800',
      ghost: 'text-neutral-700 hover:bg-neutral-100 focus:ring-accent-500 dark:text-neutral-200 dark:hover:bg-primary-800',
      destructive: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-500 shadow-lg',
      success: 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 focus:ring-green-500 shadow-lg',
      warning: 'bg-gradient-to-r from-accent-500 to-accent-600 text-white hover:from-accent-600 hover:to-accent-700 focus:ring-accent-500 shadow-lg'
    }

    const sizes = {
      sm: 'px-3 py-2 text-sm h-8',
      md: 'px-4 py-2 text-sm h-10',
      lg: 'px-6 py-3 text-base h-12',
      xl: 'px-8 py-4 text-lg h-14'
    }

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsPressed(true)
      
      if (rippleEffect && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const newRipple = { id: Date.now(), x, y }
        
        setRipples(prev => [...prev, newRipple])
        
        setTimeout(() => {
          setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
        }, 600)
      }
    }

    const handleMouseUp = () => {
      setIsPressed(false)
    }

    const handleMouseLeave = () => {
      setIsPressed(false)
    }

    return (
      <MotionWrapper
        ref={ref || buttonRef}
        as="button"
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        whileHover={hover3D ? { 
          scale: 1.05,
          y: -2,
          boxShadow: glowEffect ? '0 20px 40px rgba(155, 92, 255, 0.35)' : undefined
        } : {}}
        whileTap={{ 
          scale: 0.95,
          y: 0
        }}
        animate={{
          scale: isPressed ? 0.95 : 1,
          y: isPressed ? 2 : 0,
          boxShadow: glowEffect && !isPressed ? '0 10px 25px rgba(155, 92, 255, 0.25)' : '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 17
        }}
        {...(props as any)}
      >
        {/* 3D Background Effect */}
        <MotionWrapper
          as="div"
          className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 to-transparent"
          animate={{
            opacity: isPressed ? 0.3 : 0.1
          }}
          transition={{ duration: 0.2 }}
        />

        {/* Shine Effect */}
        <MotionWrapper
          as="div"
          className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/30 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: isPressed ? '100%' : '-100%' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />

        {/* Ripple Effects */}
        <AnimatePresence>
          {ripples.map((ripple) => (
            <MotionWrapper
              key={ripple.id}
              as="div"
              className="absolute rounded-full bg-white/30 pointer-events-none"
              style={{
                left: ripple.x - 10,
                top: ripple.y - 10,
                width: 20,
                height: 20
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          ))}
        </AnimatePresence>

        {/* Content */}
        <div className="relative flex items-center gap-2">
          {/* Left Icon */}
          {icon && iconPosition === 'left' && (
            <MotionWrapper
              as="div"
              animate={{ 
                scale: loading ? 0.8 : 1,
                rotate: loading ? 360 : 0
              }}
              transition={{ duration: 0.3 }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
            </MotionWrapper>
          )}

          {/* Loading State */}
          {loading && (
            <MotionWrapper
              as="div"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 className="w-4 h-4 animate-spin" />
            </MotionWrapper>
          )}

          {/* Success State */}
          {success && !loading && (
            <MotionWrapper
              as="div"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
            >
              <Check className="w-4 h-4" />
            </MotionWrapper>
          )}

          {/* Error State */}
          {error && !loading && (
            <MotionWrapper
              as="div"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
            >
              <X className="w-4 h-4" />
            </MotionWrapper>
          )}

          {/* Text Content */}
          <MotionWrapper
            as="span"
            animate={{
              opacity: loading ? 0.7 : 1
            }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </MotionWrapper>

          {/* Right Icon */}
          {icon && iconPosition === 'right' && (
            <MotionWrapper
              as="div"
              animate={{ 
                scale: loading ? 0.8 : 1,
                x: loading ? 0 : 2
              }}
              transition={{ duration: 0.3 }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
            </MotionWrapper>
          )}
        </div>

        {/* Focus Ring */}
        <MotionWrapper
          as="div"
          className="absolute inset-0 rounded-lg border-2 border-accent-400 pointer-events-none"
          initial={{ opacity: 0, scale: 0.95 }}
          whileFocus={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        />
      </MotionWrapper>
    )
  }
)

Button3D.displayName = 'Button3D'

export { Button3D }

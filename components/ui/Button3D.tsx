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
      primary: 'bg-jade-600 text-white hover:bg-jade-700 focus:ring-jade-600 shadow-sm',
      secondary: 'bg-primary-900 text-white hover:bg-primary-950 focus:ring-primary-500 shadow-sm',
      outline: 'border border-jade-600 bg-white text-jade-700 hover:bg-jade-100 focus:ring-jade-600 shadow-sm dark:bg-transparent dark:text-jade-400 dark:border-jade-400 dark:hover:bg-jade-900/20',
      ghost: 'text-neutral-700 hover:bg-neutral-100 focus:ring-jade-600 dark:text-neutral-200 dark:hover:bg-slate-800',
      destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
      success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm',
      warning: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500 shadow-sm'
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
          scale: 1.02,
          y: -1,
          boxShadow: glowEffect ? '0 2px 8px rgba(12, 18, 32, 0.08)' : undefined
        } : {}}
        whileTap={{
          scale: 0.98,
          y: 0
        }}
        animate={{
          scale: isPressed ? 0.98 : 1,
          y: isPressed ? 1 : 0,
          boxShadow: '0 1px 2px rgba(12, 18, 32, 0.05)'
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 17
        }}
        {...(props as any)}
      >
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
          className="absolute inset-0 rounded-lg border border-jade-600 dark:border-jade-400 pointer-events-none"
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

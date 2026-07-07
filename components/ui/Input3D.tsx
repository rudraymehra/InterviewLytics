'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from '@/components/MotionWrapper'
import { cn } from '@/lib/utils'
import { Eye, EyeOff, Search, Mail, Lock, User, Building2, Phone, MapPin, Calendar, DollarSign } from 'lucide-react'

interface Input3DProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  variant?: 'default' | 'search' | 'email' | 'password' | 'phone' | 'location' | 'date' | 'salary'
  size?: 'sm' | 'md' | 'lg'
  glowColor?: string
}

const iconMap = {
  search: Search,
  email: Mail,
  password: Lock,
  user: User,
  building: Building2,
  phone: Phone,
  location: MapPin,
  date: Calendar,
  salary: DollarSign
}

const Input3D = React.forwardRef<HTMLInputElement, Input3DProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    leftIcon, 
    rightIcon, 
    variant = 'default',
    size = 'md',
    glowColor = 'accent-500',
    type = 'text',
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const IconComponent = variant !== 'default' ? iconMap[variant] : null
    const actualType = variant === 'password' ? (showPassword ? 'text' : 'password') : type

    const sizeClasses = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base'
    }

    const glowIntensity = 'shadow-sm'
    const glowColorClass = `shadow-${glowColor}`

    return (
      <div className="space-y-2">
        {label && (
          <motion.label 
            className="text-sm font-medium text-neutral-700 dark:text-slate-200 block"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.label>
        )}
        
        <div className="relative group">
          <motion.div
            className={cn(
              'relative overflow-hidden rounded-lg transition-all duration-300',
              sizeClasses[size],
              isFocused && 'scale-[1.02]',
              isHovered && 'scale-[1.01]'
            )}
            whileHover={{ scale: 1.01 }}
            whileFocus={{ scale: 1.02 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            {/* Background Layer */}
            <motion.div
              className={cn(
                'absolute inset-0 rounded-lg bg-white dark:bg-[#131A2A]',
                'border border-line-light dark:border-line-dark',
                isFocused && 'border-jade-600 dark:border-jade-400',
                error && 'border-red-400'
              )}
              animate={{
                boxShadow: isFocused
                  ? '0 0 0 3px rgba(14, 159, 121, 0.15), 0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
              transition={{ duration: 0.3 }}
            />

            {/* Input Container */}
            <div className="relative flex items-center h-full">
              {/* Left Icon */}
              {(leftIcon || IconComponent) && (
                <motion.div 
                  className="absolute left-3 flex items-center pointer-events-none z-10"
                  animate={{ 
                    scale: isFocused ? 1.1 : 1,
                    color: isFocused ? '#0E9F79' : '#6b7280'
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {leftIcon || (IconComponent && <IconComponent className="w-4 h-4" />)}
                </motion.div>
              )}

              {/* Input Field */}
              <input
                ref={ref || inputRef}
                type={actualType}
                className={cn(
                  'w-full h-full bg-transparent border-0 outline-none',
                  'text-neutral-900 dark:text-white',
                  'placeholder:text-neutral-500 dark:placeholder:text-neutral-300',
                  'caret-jade-600',
                  'focus:outline-none focus:ring-0 focus:text-neutral-900 dark:focus:text-white',
                  'selection:bg-accent-100 selection:text-neutral-900 dark:selection:text-white',
                  leftIcon || IconComponent ? 'pl-10' : 'pl-4',
                  rightIcon || variant === 'password' ? 'pr-10' : 'pr-4'
                )}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                {...props}
              />

              {/* Right Icon / Password Toggle */}
              {(rightIcon || variant === 'password') && (
                <motion.div 
                  className="absolute right-3 flex items-center z-10"
                  animate={{ 
                    scale: isFocused ? 1.1 : 1,
                    color: isFocused ? '#0E9F79' : '#6b7280'
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {variant === 'password' ? (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 hover:bg-neutral-100 rounded transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  ) : (
                    rightIcon
                  )}
                </motion.div>
              )}
            </div>

            {/* Focus Ring */}
            <AnimatePresence>
              {isFocused && (
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

          {/* Floating Label Animation */}
          <AnimatePresence>
            {isFocused && label && (
            <motion.div
              className="absolute -top-2 left-3 px-1 bg-white dark:bg-[#131A2A] text-xs font-medium text-jade-700 dark:text-jade-400"
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                {label}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error/Helper Text */}
        <AnimatePresence>
          {(error || helperText) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {error ? (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <motion.span
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    ⚠️
                  </motion.span>
                  {error}
                </p>
              ) : (
                <p className="text-sm text-neutral-500">{helperText}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

Input3D.displayName = 'Input3D'

export { Input3D }

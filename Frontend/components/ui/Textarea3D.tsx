'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from '@/components/MotionWrapper'
import { cn } from '@/lib/utils'
import { MessageSquare, FileText, Edit3, PenTool } from 'lucide-react'

interface Textarea3DProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  variant?: 'default' | 'message' | 'description' | 'comment'
  size?: 'sm' | 'md' | 'lg'
  autoResize?: boolean
  maxRows?: number
  minRows?: number
  glowColor?: string
}

const iconMap = {
  message: MessageSquare,
  description: FileText,
  comment: Edit3,
  default: PenTool
}

const Textarea3D = React.forwardRef<HTMLTextAreaElement, Textarea3DProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    variant = 'default',
    size = 'md',
    autoResize = true,
    maxRows = 10,
    minRows = 3,
    glowColor = 'accent-500',
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [rows, setRows] = useState(minRows)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const IconComponent = iconMap[variant]

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm min-h-[80px]',
      md: 'px-4 py-3 text-sm min-h-[100px]',
      lg: 'px-6 py-4 text-base min-h-[120px]'
    }

    const handleResize = useCallback(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current
        textarea.style.height = 'auto'
        
        const scrollHeight = textarea.scrollHeight
        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight)
        const newRows = Math.max(minRows, Math.min(maxRows, Math.ceil(scrollHeight / lineHeight)))
        
        setRows(newRows)
        textarea.style.height = `${newRows * lineHeight}px`
      }
    }, [autoResize, maxRows, minRows])

    useEffect(() => {
      handleResize()
    }, [props.value, handleResize])

    return (
      <div className="space-y-2">
        {label && (
          <motion.label 
            className="text-sm font-medium text-neutral-700 block"
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
            {/* 3D Background Layer */}
            <motion.div
              className={cn(
                'absolute inset-0 rounded-lg bg-gradient-to-br from-white to-neutral-50',
                'border border-neutral-200',
                isFocused && 'border-accent-400',
                error && 'border-red-400'
              )}
              animate={{
                boxShadow: isFocused 
                  ? '0 0 0 3px rgba(212, 175, 55, 0.1), 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                  : isHovered
                  ? '0 0 0 2px rgba(212, 175, 55, 0.05), 0 8px 20px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                  : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
              transition={{ duration: 0.3 }}
            />

            {/* Shine Effect */}
            <motion.div
              className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: isFocused ? '100%' : '-100%' }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            />

            {/* Icon */}
            <motion.div 
              className="absolute top-3 left-3 flex items-start pointer-events-none z-10"
              animate={{ 
                scale: isFocused ? 1.1 : 1,
                color: isFocused ? '#D4AF37' : '#6b7280'
              }}
              transition={{ duration: 0.2 }}
            >
              <IconComponent className="w-4 h-4 mt-0.5" />
            </motion.div>

            {/* Textarea Field */}
            <textarea
              ref={ref || textareaRef}
              className={cn(
                'w-full h-full bg-transparent border-0 outline-none text-neutral-900 placeholder:text-neutral-500',
                'focus:outline-none focus:ring-0 resize-none',
                'pl-10 pr-4'
              )}
              rows={rows}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onInput={handleResize}
              {...props}
            />

            {/* Character Count */}
            {props.maxLength && (
              <motion.div
                className="absolute bottom-2 right-2 text-xs text-neutral-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: isFocused ? 1 : 0.5 }}
                transition={{ duration: 0.2 }}
              >
                {props.value?.toString().length || 0} / {props.maxLength}
              </motion.div>
            )}
          </motion.div>

          {/* Focus Ring */}
          <AnimatePresence>
            {isFocused && (
              <motion.div
                className="absolute inset-0 rounded-lg border-2 border-accent-400 pointer-events-none"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>

          {/* Floating Label Animation */}
          <AnimatePresence>
            {isFocused && label && (
              <motion.div
                className="absolute -top-2 left-3 px-1 bg-white text-xs font-medium text-accent-600"
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

Textarea3D.displayName = 'Textarea3D'

export { Textarea3D }

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from '@/components/MotionWrapper'
import { cn } from '@/lib/utils'
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Info, 
  X, 
  Bell,
  Check,
  AlertTriangle,
  X as XIcon
} from 'lucide-react'

interface Notification3DProps {
  id?: string
  title: string
  message?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  onClose?: (id: string) => void
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const Notification3D = React.forwardRef<HTMLDivElement, Notification3DProps>(
  ({ 
    id = Math.random().toString(36).substr(2, 9),
    title,
    message,
    type = 'info',
    duration = 5000,
    position = 'top-right',
    onClose,
    action,
    className,
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = useState(true)
    const [isHovered, setIsHovered] = useState(false)

    const variants = {
      success: {
        bg: 'from-green-50 to-green-100',
        border: 'border-green-200',
        icon: CheckCircle,
        iconColor: 'text-green-500',
        titleColor: 'text-green-800',
        messageColor: 'text-green-600'
      },
      error: {
        bg: 'from-red-50 to-red-100',
        border: 'border-red-200',
        icon: XCircle,
        iconColor: 'text-red-500',
        titleColor: 'text-red-800',
        messageColor: 'text-red-600'
      },
      warning: {
            bg: 'from-accent-50 to-accent-100',
            border: 'border-accent-200',
            icon: AlertTriangle,
            iconColor: 'text-accent-500',
            titleColor: 'text-accent-800',
            messageColor: 'text-accent-600'
      },
      info: {
        bg: 'from-blue-50 to-blue-100',
        border: 'border-blue-200',
        icon: Info,
        iconColor: 'text-blue-500',
        titleColor: 'text-blue-800',
        messageColor: 'text-blue-600'
      }
    }

    const positions = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    }

    const variant = variants[type]
    const IconComponent = variant.icon

    useEffect(() => {
      if (duration > 0 && !isHovered) {
        const timer = setTimeout(() => {
          setIsVisible(false)
        }, duration)

        return () => clearTimeout(timer)
      }
    }, [duration, isHovered])

    const handleClose = () => {
      setIsVisible(false)
      setTimeout(() => onClose?.(id), 300)
    }

    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={ref}
            className={cn(
              'fixed z-50 max-w-sm w-full',
              positions[position]
            )}
            initial={{ 
              opacity: 0, 
              scale: 0.8,
              x: position.includes('right') ? 100 : position.includes('left') ? -100 : 0,
              y: position.includes('top') ? -100 : position.includes('bottom') ? 100 : 0
            }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: 0,
              y: 0
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.8,
              x: position.includes('right') ? 100 : position.includes('left') ? -100 : 0,
              y: position.includes('top') ? -100 : position.includes('bottom') ? 100 : 0
            }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            {...props}
          >
            <motion.div
              className={cn(
                'relative rounded-lg border shadow-2xl overflow-hidden',
                'bg-gradient-to-br',
                variant.bg,
                variant.border,
                className
              )}
              whileHover={{ 
                scale: 1.02,
                y: -2
              }}
              animate={{
                boxShadow: isHovered 
                  ? '0 25px 50px rgba(0, 0, 0, 0.15)' 
                  : '0 10px 25px rgba(0, 0, 0, 0.1)'
              }}
              transition={{ duration: 0.3 }}
            >
              {/* 3D Background Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent"
                animate={{
                  opacity: isHovered ? 0.8 : 0.6
                }}
                transition={{ duration: 0.3 }}
              />

              {/* Shine Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: isHovered ? '100%' : '-100%' }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              />

              {/* Content */}
              <div className="relative p-4">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <motion.div
                    className={cn(
                      'flex-shrink-0 p-2 rounded-full bg-white/80',
                      variant.iconColor
                    )}
                    animate={{
                      scale: isHovered ? 1.1 : 1,
                      rotate: isHovered ? 5 : 0
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <IconComponent className="w-5 h-5" />
                  </motion.div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <motion.h4
                      className={cn(
                        'text-sm font-semibold',
                        variant.titleColor
                      )}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      {title}
                    </motion.h4>
                    
                    {message && (
                      <motion.p
                        className={cn(
                          'text-sm mt-1',
                          variant.messageColor
                        )}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        {message}
                      </motion.p>
                    )}

                    {/* Action Button */}
                    {action && (
                      <motion.button
                        onClick={action.onClick}
                        className={cn(
                          'mt-2 px-3 py-1 text-xs font-medium rounded-md transition-colors',
                          'bg-white/80 hover:bg-white',
                          variant.titleColor
                        )}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {action.label}
                      </motion.button>
                    )}
                  </div>

                  {/* Close Button */}
                  <motion.button
                    onClick={handleClose}
                    className="flex-shrink-0 p-1 hover:bg-white/50 rounded transition-colors"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <XIcon className="w-4 h-4 text-neutral-500" />
                  </motion.button>
                </div>
              </div>

              {/* Progress Bar */}
              {duration > 0 && (
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-accent-500 to-accent-600"
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: duration / 1000, ease: 'linear' }}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }
)

Notification3D.displayName = 'Notification3D'

// Notification Manager Hook
export const useNotification3D = () => {
  const [notifications, setNotifications] = useState<Notification3DProps[]>([])

  const addNotification = (notification: Omit<Notification3DProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setNotifications(prev => [...prev, { ...notification, id }])
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll
  }
}

export { Notification3D }

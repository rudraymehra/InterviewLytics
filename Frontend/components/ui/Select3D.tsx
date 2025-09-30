'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from '@/components/MotionWrapper'
import { cn } from '@/lib/utils'
import { ChevronDown, Check, Search } from 'lucide-react'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  icon?: React.ReactNode
}

interface Select3DProps {
  label?: string
  error?: string
  helperText?: string
  placeholder?: string
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  searchable?: boolean
  multiple?: boolean
  size?: 'sm' | 'md' | 'lg'
  glowColor?: string
  className?: string
}

const Select3D = React.forwardRef<HTMLDivElement, Select3DProps>(
  ({ 
    label,
    error,
    helperText,
    placeholder = "Select an option",
    options,
    value,
    onChange,
    disabled = false,
    searchable = false,
    multiple = false,
    size = 'md',
    glowColor = 'accent-500',
    className,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedValues, setSelectedValues] = useState<string[]>(value ? [value] : [])
    const selectRef = useRef<HTMLDivElement>(null)
    const searchRef = useRef<HTMLInputElement>(null)

    const sizeClasses = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base'
    }

    const filteredOptions = options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const selectedOption = options.find(option => option.value === value)
    const selectedOptions = options.filter(option => selectedValues.includes(option.value))

    const handleToggle = () => {
      if (!disabled) {
        setIsOpen(!isOpen)
        if (!isOpen && searchable && searchRef.current) {
          setTimeout(() => searchRef.current?.focus(), 100)
        }
      }
    }

    const handleSelect = (optionValue: string) => {
      if (multiple) {
        const newValues = selectedValues.includes(optionValue)
          ? selectedValues.filter(v => v !== optionValue)
          : [...selectedValues, optionValue]
        setSelectedValues(newValues)
        onChange?.(newValues.join(','))
      } else {
        onChange?.(optionValue)
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false)
          setSearchTerm('')
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

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
        
        <div className="relative" ref={ref || selectRef}>
          <motion.div
            className={cn(
              'relative overflow-hidden rounded-lg transition-all duration-300 cursor-pointer',
              sizeClasses[size],
              isFocused && 'scale-[1.02]',
              isHovered && 'scale-[1.01]',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            whileHover={!disabled ? { scale: 1.01 } : {}}
            whileFocus={!disabled ? { scale: 1.02 } : {}}
            onHoverStart={() => !disabled && setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            tabIndex={disabled ? -1 : 0}
          >
            {/* 3D Background Layer */}
            <motion.div
              className={cn(
                'absolute inset-0 rounded-lg bg-gradient-to-br from-white to-neutral-50',
                'border border-neutral-200',
                isFocused && 'border-accent-400',
                error && 'border-red-400',
                isOpen && 'border-accent-500'
              )}
              animate={{
                boxShadow: isFocused || isOpen
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

            {/* Content */}
            <div className="relative flex items-center justify-between h-full px-4">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {selectedOption?.icon && (
                  <motion.div
                    animate={{ 
                      scale: isFocused ? 1.1 : 1,
                      color: isFocused ? '#D4AF37' : '#6b7280'
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {selectedOption.icon}
                  </motion.div>
                )}
                
                <span className={cn(
                  'truncate',
                  selectedOption ? 'text-neutral-900' : 'text-neutral-500'
                )}>
                  {multiple ? (
                    selectedOptions.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedOptions.map(option => (
                          <span
                            key={option.value}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-accent-100 text-accent-700 rounded text-xs"
                          >
                            {option.label}
                          </span>
                        ))}
                      </div>
                    ) : (
                      placeholder
                    )
                  ) : (
                    selectedOption?.label || placeholder
                  )}
                </span>
              </div>

              <motion.div
                animate={{ 
                  rotate: isOpen ? 180 : 0,
                  scale: isFocused ? 1.1 : 1
                }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-neutral-500" />
              </motion.div>
            </div>

            {/* Focus Ring */}
            <AnimatePresence>
              {(isFocused || isOpen) && (
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

          {/* Dropdown */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-2xl z-50 max-h-60 overflow-hidden"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {/* Search Input */}
                {searchable && (
                  <div className="p-2 border-b border-neutral-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        ref={searchRef}
                        type="text"
                        placeholder="Search options..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500"
                      />
                    </div>
                  </div>
                )}

                {/* Options */}
                <div className="max-h-48 overflow-y-auto">
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option, index) => (
                      <motion.div
                        key={option.value}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2 text-sm cursor-pointer transition-colors',
                          'hover:bg-accent-50',
                          selectedValues.includes(option.value) && 'bg-accent-100 text-accent-700',
                          option.disabled && 'opacity-50 cursor-not-allowed'
                        )}
                        onClick={() => !option.disabled && handleSelect(option.value)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        whileHover={!option.disabled ? { x: 4 } : {}}
                      >
                        {option.icon && (
                          <div className="flex-shrink-0">
                            {option.icon}
                          </div>
                        )}
                        
                        <span className="flex-1">{option.label}</span>
                        
                        {selectedValues.includes(option.value) && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 15 }}
                          >
                            <Check className="w-4 h-4 text-accent-600" />
                          </motion.div>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-sm text-neutral-500">
                      No options found
                    </div>
                  )}
                </div>
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

Select3D.displayName = 'Select3D'

export { Select3D }

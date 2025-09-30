'use client'

import React, { useState, useRef, useCallback } from 'react'
import { motion } from '@/components/MotionWrapper'
import { AnimatePresence } from '@/components/MotionWrapper'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { Upload, File, X, Check, AlertCircle, ImageIcon, FileText, Video, Music } from 'lucide-react'

interface FileUpload3DProps {
  label?: string
  error?: string
  helperText?: string
  accept?: string
  multiple?: boolean
  maxSize?: number // in MB
  maxFiles?: number
  onFilesChange?: (files: File[]) => void
  onFileRemove?: (file: File) => void
  disabled?: boolean
  className?: string
}

interface FileWithPreview extends File {
  id: string
  preview?: string
  status: 'uploading' | 'success' | 'error'
  error?: string
}

const getFileIcon = (file: File) => {
  const type = file.type.split('/')[0]
  switch (type) {
    case 'image':
      return ImageIcon
    case 'video':
      return Video
    case 'audio':
      return Music
    default:
      return FileText
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const FileUpload3D = React.forwardRef<HTMLDivElement, FileUpload3DProps>(
  ({ 
    label,
    error,
    helperText,
    accept = '*/*',
    multiple = false,
    maxSize = 10, // 10MB default
    maxFiles = 5,
    onFilesChange,
    onFileRemove,
    disabled = false,
    className,
    ...props 
  }, ref) => {
    const [files, setFiles] = useState<FileWithPreview[]>([])
    const [isDragOver, setIsDragOver] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const validateFile = useCallback((file: File): string | null => {
      if (file.size > maxSize * 1024 * 1024) {
        return `File size must be less than ${maxSize}MB`
      }
      return null
    }, [maxSize])

    const createFilePreview = useCallback((file: File): FileWithPreview => {
      // create a plain object that copies the File's properties and adds our metadata
      const base: any = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        status: 'uploading' as const
      }

      if (file.type.startsWith('image/')) {
        base.preview = URL.createObjectURL(file)
      }

      // keep a reference to the original File for uploads
      const fileWithPreview: FileWithPreview = Object.assign(base, { originalFile: file }) as any

      return fileWithPreview
    }, [])

    const handleFiles = useCallback((newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles)
      const validFiles: FileWithPreview[] = []
      const errors: string[] = []

      fileArray.forEach(file => {
        const error = validateFile(file)
        if (error) {
          errors.push(`${file.name}: ${error}`)
        } else {
          validFiles.push(createFilePreview(file))
        }
      })

      if (validFiles.length > 0) {
        const updatedFiles = multiple ? [...files, ...validFiles] : validFiles
        setFiles(updatedFiles.slice(0, maxFiles))
        onFilesChange?.(updatedFiles.slice(0, maxFiles))

        // Simulate upload completion
        setTimeout(() => {
          setFiles(prev => prev.map(f => ({ ...f, status: 'success' as const })))
        }, 2000)
      }

      if (errors.length > 0) {
        console.error('File validation errors:', errors)
      }
    }, [files, multiple, maxFiles, onFilesChange, validateFile, createFilePreview])

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled) {
        setIsDragOver(true)
      }
    }

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      if (!disabled && e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files)
      }
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files)
      }
    }

    const handleRemoveFile = (fileToRemove: FileWithPreview) => {
      const updatedFiles = files.filter(f => f.id !== fileToRemove.id)
      setFiles(updatedFiles)
      onFilesChange?.(updatedFiles)
      onFileRemove?.(fileToRemove)
      
      if (fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
    }

    const openFileDialog = () => {
      if (!disabled && fileInputRef.current) {
        fileInputRef.current.click()
      }
    }

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

        <div className="relative" ref={ref}>
          {/* Upload Area */}
          <motion.div
            className={cn(
              'relative border-2 border-dashed rounded-lg transition-all duration-300 cursor-pointer',
              'bg-gradient-to-br from-neutral-50 to-white',
              isDragOver ? 'border-accent-400 bg-accent-50' : 'border-neutral-300',
              isHovered && !disabled ? 'border-accent-300 bg-accent-25' : '',
              error ? 'border-red-400' : '',
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onMouseEnter={() => !disabled && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={openFileDialog}
            whileHover={!disabled ? { scale: 1.01 } : {}}
            whileTap={!disabled ? { scale: 0.99 } : {}}
          >
            {/* 3D Background Effect */}
            <motion.div
              className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/50 to-transparent"
              animate={{
                opacity: isDragOver ? 0.3 : isHovered ? 0.1 : 0
              }}
              transition={{ duration: 0.3 }}
            />

            {/* Shine Effect */}
            <motion.div
              className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: isDragOver ? '100%' : '-100%' }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            />

            <div className="p-8 text-center">
              <motion.div
                className="mx-auto w-12 h-12 mb-4 flex items-center justify-center"
                animate={{
                  scale: isDragOver ? 1.2 : isHovered ? 1.1 : 1,
                  rotate: isDragOver ? 5 : 0
                }}
                transition={{ duration: 0.3 }}
              >
                <Upload className="w-8 h-8 text-accent-500" />
              </motion.div>

              <motion.p
                className="text-lg font-medium text-neutral-900 mb-2"
                animate={{
                  color: isDragOver ? '#D4AF37' : '#111827'
                }}
                transition={{ duration: 0.3 }}
              >
                {isDragOver ? 'Drop files here' : 'Click to upload or drag and drop'}
              </motion.p>

              <p className="text-sm text-neutral-500">
                {accept === '*/*' ? 'Any file type' : accept} • Max {maxSize}MB
                {multiple && ` • Up to ${maxFiles} files`}
              </p>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={handleFileInput}
              className="hidden"
              disabled={disabled}
            />
          </motion.div>

          {/* File List */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                className="mt-4 space-y-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {files.map((file, index) => {
                  const IconComponent = getFileIcon(file)
                  
                  return (
                    <motion.div
                      key={file.id}
                      className="flex items-center gap-3 p-3 bg-white border border-neutral-200 rounded-lg shadow-sm"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      {/* File Icon/Preview */}
                      <div className="flex-shrink-0">
                        {file.preview ? (
                          <Image
                            src={file.preview}
                            alt={file.name}
                            width={32}
                            height={32}
                            className="rounded object-cover"
                          />
                        ) : (
                          <IconComponent className="w-8 h-8 text-neutral-500" />
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>

                      {/* Status Icon */}
                      <div className="flex-shrink-0">
                        {file.status === 'uploading' && (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <Upload className="w-4 h-4 text-accent-500" />
                          </motion.div>
                        )}
                        {file.status === 'success' && (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                        {file.status === 'error' && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>

                      {/* Remove Button */}
                      <motion.button
                        onClick={() => handleRemoveFile(file)}
                        className="flex-shrink-0 p-1 hover:bg-red-100 rounded transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </motion.button>
                    </motion.div>
                  )
                })}
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

FileUpload3D.displayName = 'FileUpload3D'

export { FileUpload3D }

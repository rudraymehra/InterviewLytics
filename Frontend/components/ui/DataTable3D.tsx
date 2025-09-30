'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from '@/components/MotionWrapper'
import { cn } from '@/lib/utils'
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

interface Column<T> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: any, row: T) => React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
}

interface DataTable3DProps<T> {
  data: T[]
  columns: Column<T>[]
  searchable?: boolean
  sortable?: boolean
  pagination?: boolean
  pageSize?: number
  onRowClick?: (row: T) => void
  onEdit?: (row: T) => void
  onDelete?: (row: T) => void
  onView?: (row: T) => void
  className?: string
}

function DataTable3D<T extends Record<string, any>>({
  data,
  columns,
  searchable = true,
  sortable = true,
  pagination = true,
  pageSize = 10,
  onRowClick,
  onEdit,
  onDelete,
  onView,
  className
}: DataTable3DProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data
    
    return data.filter(row =>
      columns.some(column => {
        const value = row[column.key]
        return value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      })
    )
  }, [data, searchTerm, columns])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredData, sortConfig])

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData

    const startIndex = (currentPage - 1) * pageSize
    return sortedData.slice(startIndex, startIndex + pageSize)
  }, [sortedData, currentPage, pageSize, pagination])

  const totalPages = Math.ceil(filteredData.length / pageSize)

  const handleSort = (key: keyof T) => {
    if (!sortable) return

    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const getSortIcon = (key: keyof T) => {
    if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown className="w-4 h-4" />
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Bar */}
      {searchable && (
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
            />
          </div>
        </motion.div>
      )}

      {/* Table Container */}
      <motion.div
        className="bg-white rounded-lg border border-neutral-200 shadow-premium overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header */}
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                {columns.map((column, index) => (
                  <motion.th
                    key={String(column.key)}
                    className={cn(
                      'px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      sortable && column.sortable !== false && 'cursor-pointer hover:bg-neutral-100'
                    )}
                    style={{ width: column.width }}
                    onClick={() => column.sortable !== false && handleSort(column.key)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={sortable && column.sortable !== false ? { scale: 1.02 } : {}}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.label}</span>
                      {sortable && column.sortable !== false && (
                        <motion.div
                          animate={{ 
                            scale: sortConfig?.key === column.key ? 1.2 : 1,
                            color: sortConfig?.key === column.key ? '#D4AF37' : '#6b7280'
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          {getSortIcon(column.key)}
                        </motion.div>
                      )}
                    </div>
                  </motion.th>
                ))}
                {(onEdit || onDelete || onView) && (
                  <th className="px-6 py-4 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-neutral-200">
              <AnimatePresence>
                {paginatedData.map((row, rowIndex) => (
                  <motion.tr
                    key={rowIndex}
                    className={cn(
                      'hover:bg-neutral-50 transition-colors',
                      onRowClick && 'cursor-pointer'
                    )}
                    onMouseEnter={() => setHoveredRow(rowIndex)}
                    onMouseLeave={() => setHoveredRow(null)}
                    onClick={() => onRowClick?.(row)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: rowIndex * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    {columns.map((column, colIndex) => (
                      <motion.td
                        key={String(column.key)}
                        className={cn(
                          'px-6 py-4 text-sm text-neutral-900',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right'
                        )}
                        style={{ width: column.width }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: colIndex * 0.05 }}
                      >
                        {column.render 
                          ? column.render(row[column.key], row)
                          : String(row[column.key] || '-')
                        }
                      </motion.td>
                    ))}
                    
                    {/* Action Buttons */}
                    {(onEdit || onDelete || onView) && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {onView && (
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation()
                                onView(row)
                              }}
                              className="p-2 text-neutral-400 hover:text-accent-500 hover:bg-accent-50 rounded-lg transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                          )}
                          
                          {onEdit && (
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation()
                                onEdit(row)
                              }}
                              className="p-2 text-neutral-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                          )}
                          
                          {onDelete && (
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation()
                                onDelete(row)
                              }}
                              className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          )}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && totalPages > 1 && (
          <motion.div
            className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="text-sm text-neutral-700">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} results
            </div>
            
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-neutral-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Previous
              </motion.button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <motion.button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    'px-3 py-2 text-sm border rounded-lg transition-colors',
                    page === currentPage
                      ? 'bg-accent-500 text-white border-accent-500'
                      : 'border-neutral-200 hover:bg-white'
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {page}
                </motion.button>
              ))}
              
              <motion.button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-neutral-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Next
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export { DataTable3D }

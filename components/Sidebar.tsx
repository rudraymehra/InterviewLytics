'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  BarChart3,
  Settings,
  FileText,
  MessageCircle,
  Star,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface SidebarProps {
  role: 'candidate' | 'recruiter'
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const recruiterNavItems = [
    {
      name: 'Dashboard',
      href: '/recruiter/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Jobs',
      href: '/recruiter/jobs',
      icon: Briefcase
    },
    {
      name: 'Applicants',
      href: '/recruiter/applicants',
      icon: Users
    },
    {
      name: 'Analytics',
      href: '/recruiter/analytics',
      icon: BarChart3
    },
    {
      name: 'Profile',
      href: '/recruiter/profile',
      icon: Settings
    }
  ]

  const candidateNavItems = [
    {
      name: 'Dashboard',
      href: '/candidate/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Applications',
      href: '/candidate/applications',
      icon: FileText
    },
    {
      name: 'Interview',
      href: '/candidate/interview',
      icon: MessageCircle
    },
    {
      name: 'Feedback',
      href: '/candidate/feedback',
      icon: Star
    },
    {
      name: 'Profile',
      href: '/candidate/profile',
      icon: User
    }
  ]

  const navItems = role === 'recruiter' ? recruiterNavItems : candidateNavItems

  return (
    <div className={cn(
      'bg-white dark:bg-primary-900 border-r border-neutral-200 dark:border-neutral-800 transition-all duration-300 flex flex-col shadow-premium text-neutral-900 dark:text-neutral-200',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-primary-950 dark:text-white capitalize">
              {role} Dashboard
            </h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-primary-800 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300'
                  : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-primary-800 hover:text-primary-950 dark:hover:text-white'
              )}
            >
              <item.icon className={cn('w-5 h-5', isCollapsed ? 'mx-auto' : 'mr-3')} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            InterviewLytics v1.0
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar

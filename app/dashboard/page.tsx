'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

// Legacy route: /dashboard redirects to the role-specific dashboard.
export default function DashboardRedirect() {
  const router = useRouter()
  const { user, loading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated || !user) {
      router.replace('/login-candidate')
      return
    }
    router.replace(user.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard')
  }, [loading, isAuthenticated, user, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper dark:bg-ink">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jade-600 dark:border-jade-400"></div>
    </div>
  )
}

'use client'

import React from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import { Grain, Orb } from '@/components/landing/Ambience'

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'recruiter')) {
      router.push('/login-recruiter')
    }
  }, [user, isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-paper dark:bg-ink">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jade-600 dark:border-jade-400"></div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'recruiter') {
    return null
  }

  return (
    <div className="min-h-screen bg-paper dark:bg-ink">
      <Navbar />
      <div className="flex flex-col md:flex-row">
        <Sidebar role="recruiter" />
        <main className="relative flex-1 min-w-0 overflow-hidden p-4 md:p-6">
          <Grain />
          <Orb className="h-[560px] w-[560px] -top-48 -left-48 !opacity-[0.08]" />
          <Orb magenta className="h-[560px] w-[560px] -bottom-48 -right-48 !opacity-[0.08]" />
          <div className="relative z-10">{children}</div>
        </main>
      </div>
    </div>
  )
}

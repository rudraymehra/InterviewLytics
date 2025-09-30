'use client'

import React from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'recruiter') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar role="recruiter" />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

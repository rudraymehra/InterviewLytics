'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Legacy route: /login now redirects to the candidate login portal.
export default function LoginRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/login-candidate')
  }, [router])

  return (
    <div className="min-h-screen bg-paper dark:bg-ink flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jade-600"></div>
    </div>
  )
}

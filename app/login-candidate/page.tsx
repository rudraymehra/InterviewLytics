'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input3D } from '@/components/ui/Input3D'
import { Check, ArrowLeft, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { AuthAmbience } from '@/components/landing/Ambience'
import Reveal from '@/components/landing/Reveal'

const LoginCandidate: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(formData.email, formData.password, 'candidate')
      toast.success('Login successful!')
    } catch (error: any) {
      toast.error(error?.message || 'Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="relative overflow-hidden min-h-screen bg-ink flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <AuthAmbience />

      {/* Back link — pinned top-left */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-10 inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-jade-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-500/60 rounded px-1"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="relative max-w-md w-full space-y-8">
        {/* Header */}
        <Reveal>
          <div className="text-center">
            <div className="flex justify-center mb-5">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-jade-500/20 blur-xl" aria-hidden="true" />
                <img src="/logo-mark.png" alt="InterviewLytics" width={56} height={56} className="relative rounded-full ring-1 ring-line-dark" />
              </div>
            </div>
            <p className="eyebrow text-jade-400 mb-2">Candidate Access</p>
            <h1 className="font-display text-4xl font-bold text-white">Candidate Login</h1>
            <p className="mt-2 text-sm text-neutral-400">
              Sign in to track applications and interview results
            </p>
          </div>
        </Reveal>

        {/* Login Form */}
        <Reveal delay={0.08}>
          <div className="relative rounded-xl border border-line-dark bg-[#0B1122]/90 backdrop-blur-sm shadow-[0_0_40px_-12px_rgba(6,182,212,0.25)]">
            {/* top accent hairline */}
            <div
              className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-jade-500/60 to-transparent"
              aria-hidden="true"
            />
            <div className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input3D
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  variant="email"
                  placeholder="Enter your email"
                />

                <Input3D
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  variant="password"
                  placeholder="Enter your password"
                />

                <div className="flex items-center justify-between">
                  <label htmlFor="remember-me" className="group flex items-center gap-2 cursor-pointer select-none">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer sr-only"
                    />
                    <span
                      className="flex h-4 w-4 items-center justify-center rounded border border-line-dark bg-ink/60 transition-colors group-hover:border-jade-500/60 peer-checked:border-jade-500 peer-checked:bg-jade-500 peer-focus-visible:ring-2 peer-focus-visible:ring-jade-500/60 peer-focus-visible:ring-offset-1 peer-focus-visible:ring-offset-ink"
                      aria-hidden="true"
                    >
                      <Check className={`h-3 w-3 text-ink transition-opacity ${rememberMe ? 'opacity-100' : 'opacity-0'}`} strokeWidth={3} />
                    </span>
                    <span className="text-sm text-neutral-300">Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      toast('Password reset is coming soon — contact support@interviewlytics.dev')
                    }
                    className="text-sm font-medium text-jade-400 hover:text-jade-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-500/60 rounded px-1"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-jade-500 text-ink hover:bg-jade-400 disabled:opacity-50 disabled:cursor-not-allowed font-data uppercase tracking-wide rounded-lg shadow-[0_0_20px_-6px_rgba(34,211,238,0.5)] focus-visible:ring-2 focus-visible:ring-jade-400"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Sign In
                </Button>
              </form>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-line-dark" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 bg-[#0B1122] font-data text-[11px] uppercase tracking-[0.2em] text-neutral-400">
                      Don't have an account?
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link href="/signup-candidate" className="block">
                    <Button
                      variant="outline"
                      className="w-full border-line-dark text-neutral-200 hover:border-jade-500/60 hover:text-jade-300 rounded-lg"
                    >
                      Create Candidate Account
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Trust footnote */}
        <Reveal delay={0.16}>
          <p className="flex items-center justify-center gap-2 font-data text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            <ShieldCheck className="h-3.5 w-3.5 text-jade-500" aria-hidden="true" />
            Encrypted session · Candidate portal
          </p>
        </Reveal>
      </div>
    </div>
  )
}

export default LoginCandidate

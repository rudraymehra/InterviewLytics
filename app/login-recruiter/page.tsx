'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { FormInput } from '@/components/ui'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Check, Info, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { AuthAmbience } from '@/components/landing/Ambience'
import Reveal from '@/components/landing/Reveal'

const LoginRecruiter: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(formData.email, formData.password, 'recruiter')
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
    <div className="relative overflow-hidden min-h-screen bg-ink flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <AuthAmbience />

      {/* Back to home — pinned top-left, out of the card's composition */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-10 inline-flex items-center gap-2 font-data text-xs uppercase tracking-[0.18em] text-neutral-400 hover:text-jade-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-400/60 rounded px-1 py-0.5"
      >
        <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
        Back to Home
      </Link>

      <div className="relative w-full max-w-md space-y-8">
        {/* Page header */}
        <Reveal className="text-center">
          <div className="flex justify-center mb-5">
            <div className="relative">
              <div className="absolute -inset-3 rounded-full bg-jade-500/15 blur-xl" aria-hidden="true" />
              <img
                src="/logo-mark.png"
                alt="InterviewLytics"
                width={56}
                height={56}
                className="relative rounded-full ring-1 ring-line-dark"
              />
            </div>
          </div>
          <p className="eyebrow mb-2">Recruiter Access</p>
          <h1 className="font-display text-4xl font-bold text-white tracking-tight">Recruiter Login</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Sign in to manage roles, pipelines and interview intelligence
          </p>
        </Reveal>

        {/* Login panel */}
        <Reveal delay={0.08}>
          <div className="hud-panel rounded-xl border border-line-dark bg-[#0B1122] shadow-[0_0_40px_rgba(6,182,212,0.06)]">
            <div className="p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="font-display text-lg font-semibold text-white">Welcome Back</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Enter your credentials to access your dashboard
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <FormInput
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  leftIcon={<Mail className="w-4 h-4 text-neutral-500" />}
                  placeholder="Enter your email"
                />

                <FormInput
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  leftIcon={<Lock className="w-4 h-4 text-neutral-500" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="text-neutral-500 hover:text-jade-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-400/60 rounded"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  placeholder="Enter your password"
                />

                <div className="flex items-center justify-between">
                  <label
                    htmlFor="remember-me"
                    className="flex items-center gap-2.5 cursor-pointer select-none group"
                  >
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={`flex h-4 w-4 items-center justify-center rounded border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-jade-400/60 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#0B1122] ${
                        rememberMe
                          ? 'border-jade-400 bg-jade-500'
                          : 'border-line-dark bg-ink group-hover:border-jade-500/50'
                      }`}
                    >
                      <Check
                        className={`h-3 w-3 text-ink transition-opacity ${rememberMe ? 'opacity-100' : 'opacity-0'}`}
                        strokeWidth={3}
                      />
                    </span>
                    <span className="text-sm text-neutral-300">Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      toast('Password reset is coming soon — contact support@interviewlytics.dev', {
                        icon: <Info className="h-4 w-4 shrink-0 text-jade-400" aria-hidden="true" />,
                      })
                    }
                    className="text-sm font-medium text-jade-400 hover:text-jade-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-400/60 rounded px-0.5"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full border-transparent dark:border-transparent bg-jade-500 dark:bg-jade-500 text-ink dark:text-ink hover:bg-jade-400 dark:hover:bg-jade-400 disabled:opacity-50 disabled:cursor-not-allowed font-data uppercase tracking-[0.14em] rounded-lg shadow-[0_0_20px_rgba(34,211,238,0.25)] focus-visible:ring-2 focus-visible:ring-jade-400/60"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Sign In
                </Button>
              </form>

              <div className="mt-7">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-line-dark" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 bg-[#0B1122] font-data text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      Don't have an account?
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link href="/signup-recruiter" className="block">
                    <Button
                      variant="outline"
                      className="w-full rounded-lg border-line-dark text-neutral-200 hover:border-jade-500/50 hover:text-jade-400 font-data uppercase tracking-[0.14em]"
                    >
                      Create Recruiter Account
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Cross-link for candidates */}
        <Reveal delay={0.16} className="text-center">
          <Link
            href="/login-candidate"
            className="inline-flex items-center gap-1.5 font-data text-xs uppercase tracking-[0.18em] text-neutral-500 hover:text-jade-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-400/60 rounded px-1 py-0.5"
          >
            Looking for a role? Candidate sign in
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </div>
  )
}

export default LoginRecruiter

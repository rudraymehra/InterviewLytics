'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { FormInput } from '@/components/ui'
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, Check, FileText, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { AuthAmbience } from '@/components/landing/Ambience'
import Reveal from '@/components/landing/Reveal'

const SignupCandidate: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { signup } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    if (!/[a-z]/.test(formData.password)) {
      toast.error('Password must contain at least one lowercase letter')
      return
    }

    if (!/[A-Z]/.test(formData.password)) {
      toast.error('Password must contain at least one uppercase letter')
      return
    }

    if (!/[0-9]/.test(formData.password)) {
      toast.error('Password must contain at least one number')
      return
    }

    setIsLoading(true)

    try {
      await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'candidate'
      })
      toast.success('Account created successfully!')
    } catch (error: any) {
      const message = error?.message || 'Failed to create account'
      toast.error(message)
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
            <h1 className="font-display text-3xl font-bold leading-tight text-white">Create Candidate Account</h1>
            <p className="mt-2 text-sm text-neutral-400">
              Join thousands of candidates finding their dream jobs
            </p>
          </div>
        </Reveal>

        {/* Signup Form */}
        <Reveal delay={0.08}>
          <div className="relative rounded-xl border border-line-dark bg-[#0B1122]/90 backdrop-blur-sm shadow-[0_0_40px_-12px_rgba(6,182,212,0.25)]">
            {/* top accent hairline */}
            <div
              className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-jade-500/60 to-transparent"
              aria-hidden="true"
            />
            <div className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <FormInput
                  label="Full Name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  leftIcon={<User className="w-4 h-4 text-neutral-500" />}
                  placeholder="Enter your full name"
                />

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
                      className="text-neutral-500 hover:text-jade-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-500/60 rounded"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  placeholder="Create a password"
                  helperText="8+ characters with uppercase, lowercase and a number"
                />

                <FormInput
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  leftIcon={<Lock className="w-4 h-4 text-neutral-500" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      className="text-neutral-500 hover:text-jade-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-500/60 rounded"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  placeholder="Confirm your password"
                />

                {/* Resume note */}
                <div className="flex items-center gap-3 rounded-lg border border-line-dark bg-ink/40 px-3 py-2.5">
                  <FileText className="h-4 w-4 shrink-0 text-jade-400" aria-hidden="true" />
                  <p className="font-data text-[11px] leading-relaxed tracking-wide text-neutral-400">
                    Add your resume from your profile after signup
                  </p>
                </div>

                <label htmlFor="terms" className="group flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="peer sr-only"
                  />
                  <span
                    className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-line-dark bg-ink/60 transition-colors group-hover:border-jade-500/60 peer-checked:border-jade-500 peer-checked:bg-jade-500 peer-focus-visible:ring-2 peer-focus-visible:ring-jade-500/60 peer-focus-visible:ring-offset-1 peer-focus-visible:ring-offset-ink"
                    aria-hidden="true"
                  >
                    <Check className={`h-3 w-3 text-ink transition-opacity ${agreedToTerms ? 'opacity-100' : 'opacity-0'}`} strokeWidth={3} />
                  </span>
                  <span className="text-sm text-neutral-300">
                    I agree to the{' '}
                    <Link href="/about" className="text-jade-400 hover:text-jade-300 transition-colors">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/about" className="text-jade-400 hover:text-jade-300 transition-colors">
                      Privacy Policy
                    </Link>
                  </span>
                </label>

                <Button
                  type="submit"
                  className="w-full bg-jade-500 text-ink dark:bg-jade-500 dark:text-ink hover:bg-jade-400 dark:hover:bg-jade-400 dark:border-transparent disabled:opacity-50 disabled:cursor-not-allowed font-data uppercase tracking-wide rounded-lg shadow-[0_0_20px_-6px_rgba(34,211,238,0.5)] focus-visible:ring-2 focus-visible:ring-jade-400"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Create Account
                </Button>
              </form>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-line-dark" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 bg-[#0B1122] font-data text-[11px] uppercase tracking-[0.2em] text-neutral-400">
                      Already have an account?
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link href="/login-candidate" className="block">
                    <Button
                      variant="outline"
                      className="w-full border-line-dark text-neutral-200 hover:border-jade-500/60 hover:text-jade-300 rounded-lg"
                    >
                      Sign In Instead
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

export default SignupCandidate

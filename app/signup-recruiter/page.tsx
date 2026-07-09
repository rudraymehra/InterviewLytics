'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { FormInput } from '@/components/ui/FormInput'
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Briefcase,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { AuthAmbience } from '@/components/landing/Ambience'
import Reveal from '@/components/landing/Reveal'

const SignupRecruiter: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    role: 'HR Manager'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { signup } = useAuth()

  const roleOptions = [
    'HR Manager',
    'Talent Acquisition Specialist',
    'Recruiting Manager',
    'HR Director',
    'CEO/Founder',
    'Other'
  ]

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
        role: 'recruiter',
        company: formData.company
      })
      toast.success('Account created successfully!')
    } catch (error: any) {
      const message = error?.message || 'Failed to create account'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
          <h1 className="font-display text-4xl font-bold text-white tracking-tight">Create Recruiter Account</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Start hiring the best talent with AI-powered recruitment
          </p>
        </Reveal>

        {/* Signup panel */}
        <Reveal delay={0.08}>
          <div className="hud-panel rounded-xl border border-line-dark bg-[#0B1122] shadow-[0_0_40px_rgba(6,182,212,0.06)]">
            <div className="p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="font-display text-lg font-semibold text-white">Get Started</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Post jobs and screen candidates in minutes
                </p>
              </div>

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
                  label="Company Name"
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  leftIcon={<Building2 className="w-4 h-4 text-neutral-500" />}
                  placeholder="Enter your company name"
                />

                <div className="space-y-2">
                  <label htmlFor="signup-role" className="text-sm font-medium text-neutral-300">
                    Role
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="w-4 h-4 text-neutral-500" aria-hidden="true" />
                    </div>
                    <select
                      id="signup-role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="flex h-10 w-full appearance-none rounded-md border border-line-dark bg-[#0B1122] pl-10 pr-10 py-2 text-sm text-white ring-offset-ink transition-colors hover:border-jade-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-400 focus-visible:ring-offset-2 cursor-pointer"
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-jade-400" aria-hidden="true" />
                    </div>
                  </div>
                </div>

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
                  placeholder="Create a password"
                  helperText="8+ characters, mixed case, at least one number"
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
                      className="text-neutral-500 hover:text-jade-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-400/60 rounded"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  placeholder="Confirm your password"
                />

                <label
                  htmlFor="terms"
                  className="flex items-start gap-2.5 cursor-pointer select-none group"
                >
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
                    aria-hidden="true"
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-jade-400/60 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#0B1122] ${
                      agreedToTerms
                        ? 'border-jade-400 bg-jade-500'
                        : 'border-line-dark bg-ink group-hover:border-jade-500/50'
                    }`}
                  >
                    <Check
                      className={`h-3 w-3 text-ink transition-opacity ${agreedToTerms ? 'opacity-100' : 'opacity-0'}`}
                      strokeWidth={3}
                    />
                  </span>
                  <span className="text-sm text-neutral-300">
                    I agree to the{' '}
                    <Link
                      href="/about"
                      className="text-jade-400 hover:text-jade-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-400/60 rounded"
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/about"
                      className="text-jade-400 hover:text-jade-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-400/60 rounded"
                    >
                      Privacy Policy
                    </Link>
                  </span>
                </label>

                <Button
                  type="submit"
                  className="w-full bg-jade-500 text-ink hover:bg-jade-400 disabled:opacity-50 disabled:cursor-not-allowed font-data uppercase tracking-[0.14em] rounded-lg shadow-[0_0_20px_rgba(34,211,238,0.25)] focus-visible:ring-2 focus-visible:ring-jade-400/60"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Create Account
                </Button>
              </form>

              <div className="mt-7">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-line-dark" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 bg-[#0B1122] font-data text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      Already have an account?
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link href="/login-recruiter" className="block">
                    <Button
                      variant="outline"
                      className="w-full rounded-lg border-line-dark text-neutral-200 hover:border-jade-500/50 hover:text-jade-400 font-data uppercase tracking-[0.14em]"
                    >
                      Sign In Instead
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
            href="/signup-candidate"
            className="inline-flex items-center gap-1.5 font-data text-xs uppercase tracking-[0.18em] text-neutral-500 hover:text-jade-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-400/60 rounded px-1 py-0.5"
          >
            Looking for a role? Candidate sign up
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </div>
  )
}

export default SignupRecruiter

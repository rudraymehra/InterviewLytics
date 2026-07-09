'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input3D, Select3D, FormInput } from '@/components/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { AuthAmbience } from '@/components/landing/Ambience'

const SignupCandidate: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
    <div className="relative overflow-hidden min-h-screen bg-paper dark:bg-ink flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <AuthAmbience />
      <div className="relative max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-jade-700 dark:text-jade-400 hover:text-jade-600 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex justify-center mb-4">
            <img src="/logo-mark.png" alt="InterviewLytics" width={56} height={56} className="rounded-full" />
          </div>
          <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Create Candidate Account</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-neutral-300">
            Join thousands of candidates finding their dream jobs
          </p>
        </div>

        {/* Signup Form */}
        <Card className="bg-white dark:bg-[#0B1122] rounded-lg shadow-sm border border-line-light dark:border-line-dark text-neutral-900 dark:text-white">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Create your candidate account to start applying for jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormInput
                label="Full Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                leftIcon={<User className="w-4 h-4 text-gray-400" />}
                placeholder="Enter your full name"
              />

              <FormInput
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
                placeholder="Enter your email"
              />

              <FormInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                placeholder="Create a password"
                helperText="Must be at least 8 characters with uppercase, lowercase, and number"
              />

              <FormInput
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                placeholder="Confirm your password"
              />

              <p className="text-xs text-gray-500 dark:text-neutral-400">
                You can upload your resume from your profile after signing up.
              </p>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-jade-600 focus:ring-jade-600 dark:focus:ring-jade-400 border-gray-300 dark:border-line-dark rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-neutral-300">
                  I agree to the{' '}
                  <Link href="/about" className="text-jade-700 dark:text-jade-400 hover:text-jade-600">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/about" className="text-jade-700 dark:text-jade-400 hover:text-jade-600">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-jade-600 text-white dark:bg-jade-500 dark:text-ink hover:bg-jade-700 dark:hover:bg-jade-400 font-data uppercase tracking-wide rounded"
                loading={isLoading}
                disabled={isLoading}
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-line-light dark:border-line-dark" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-[#0B1122] text-gray-500 dark:text-neutral-300">Already have an account?</span>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/login-candidate">
                  <Button variant="outline" className="w-full">
                    Sign In Instead
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SignupCandidate

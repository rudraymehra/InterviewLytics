'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input3D, FormInput } from '@/components/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Building2, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

const LoginRecruiter: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

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
    <div className="min-h-screen bg-paper dark:bg-ink flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-neutral-600 dark:text-neutral-300 hover:text-jade-700 dark:hover:text-jade-400 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-jade-600 rounded-lg flex items-center justify-center shadow-sm">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          </div>
          <h2 className="font-display text-4xl font-bold text-neutral-900 dark:text-white">Recruiter Login</h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
            Sign in to your recruiter account
          </p>
        </div>

        {/* Login Form */}
        <Card className="bg-white dark:bg-[#0B1122] rounded-lg shadow-sm border border-line-light dark:border-line-dark text-neutral-900 dark:text-white">
          <CardHeader>
            <CardTitle className="text-neutral-900 dark:text-white">Welcome Back</CardTitle>
            <CardDescription className="text-neutral-600 dark:text-neutral-300">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Enter your password"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-jade-600 focus:ring-jade-600 dark:focus:ring-jade-400 border-neutral-300 dark:border-line-dark rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700 dark:text-slate-200">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() =>
                      toast('Password reset is coming soon — contact support@interviewlytics.dev', {
                        icon: 'ℹ️',
                      })
                    }
                    className="font-medium text-jade-700 dark:text-jade-400 hover:text-jade-600"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-jade-600 text-white dark:bg-jade-500 dark:text-ink hover:bg-jade-700 dark:hover:bg-jade-400 font-data uppercase tracking-wide rounded shadow-sm"
                loading={isLoading}
                disabled={isLoading}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-line-light dark:border-line-dark" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-[#0B1122] text-gray-500 dark:text-neutral-300">Don't have an account?</span>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/signup-recruiter">
                  <Button variant="outline" className="w-full">
                    Create Recruiter Account
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

export default LoginRecruiter

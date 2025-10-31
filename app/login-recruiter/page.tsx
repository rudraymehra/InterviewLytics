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
    } catch (error) {
      toast.error('Invalid email or password')
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
    <div className="min-h-screen bg-gradient-to-br from-[#0b1025] via-[#111b3a] to-[#1c2a55] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center text-slate-100">
          <Link href="/" className="inline-flex items-center text-slate-200 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[#7c5cff] via-[#8f5dff] to-[#46d9ff] rounded-lg flex items-center justify-center shadow-[0_0_18px_rgba(70,217,255,0.45)]">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white drop-shadow-sm">Recruiter Login</h2>
          <p className="mt-2 text-sm text-slate-300">
            Sign in to your recruiter account
          </p>
        </div>

        {/* Login Form */}
        <Card className="backdrop-blur-xl bg-white/98 dark:bg-slate-900/85 border-white/20 dark:border-white/10 shadow-[0_20px_60px_rgba(10,16,45,0.35)] text-slate-900 dark:text-white">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Welcome Back</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">
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
                    className="h-4 w-4 text-accent-500 focus:ring-accent-500 border-neutral-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700 dark:text-slate-200">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-accent-500 hover:text-accent-400">
                    Forgot password?
                  </a>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-white via-slate-100 to-slate-200 text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.18)] hover:from-slate-100 hover:via-white hover:to-white dark:from-slate-200 dark:via-white dark:to-white"
                loading={isLoading}
                disabled={isLoading}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-slate-900/85 text-gray-500 dark:text-slate-300">Don't have an account?</span>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/signup-recruiter">
                  <Button variant="outline" className="w-full dark:text-slate-200 dark:border-slate-500 dark:hover:bg-slate-800">
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

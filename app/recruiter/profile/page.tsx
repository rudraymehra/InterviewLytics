'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FormInput } from '@/components/ui/FormInput'
import { User, Mail, Building2, Lock, Save, Upload, Camera } from 'lucide-react'
import Reveal from '@/components/landing/Reveal'
import toast from 'react-hot-toast'

const RecruiterProfile: React.FC = () => {
  const { user, logout, loading: authLoading, isAuthenticated } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company: user?.company || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [profileMeta, setProfileMeta] = useState({
    avatarUrl: '',
    avatarName: ''
  })
  const avatarInputRef = useRef<HTMLInputElement>(null)
  // Last-saved basic-info values so Cancel can revert unsaved edits.
  const savedFormRef = useRef({ name: '', email: '', company: '' })

  const handleCancelEdit = () => {
    setFormData(prev => ({ ...prev, ...savedFormRef.current }))
    setIsEditing(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) {
        throw new Error('Session expired. Please sign in again.')
      }

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          company: formData.company
        })
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message = typeof json?.message === 'string' ? json.message : 'Failed to update profile'
        throw new Error(message)
      }

      const updatedProfile = json?.data?.profile ?? {}
      const updatedUser = json?.data?.user ?? {}

      setProfileMeta(prev => ({
        ...prev,
        avatarUrl: updatedProfile.avatarUrl ?? prev.avatarUrl,
        avatarName: updatedProfile.avatarName ?? prev.avatarName
      }))

      if (typeof window !== 'undefined' && updatedUser) {
        const storedUser = { ...user, ...updatedUser }
        localStorage.setItem('user', JSON.stringify(storedUser))
      }

      savedFormRef.current = {
        name: formData.name,
        email: formData.email,
        company: formData.company,
      }

      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error: any) {
      const message = typeof error?.message === 'string' ? error.message : 'Failed to update profile'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    if (!/[a-z]/.test(formData.newPassword)) {
      toast.error('Password must include a lowercase letter')
      return
    }

    if (!/[A-Z]/.test(formData.newPassword)) {
      toast.error('Password must include an uppercase letter')
      return
    }

    if (!/[0-9]/.test(formData.newPassword)) {
      toast.error('Password must include a number')
      return
    }

    setLoading(true)

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) {
        throw new Error('Session expired. Please sign in again.')
      }

      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message = typeof json?.message === 'string' ? json.message : 'Failed to update password'
        throw new Error(message)
      }

      toast.success('Password updated successfully!')
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
    } catch (error: any) {
      const message = typeof error?.message === 'string' ? error.message : 'Failed to update password'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      void uploadAvatar(file)
    }
  }

  const uploadAvatar = async (file: File) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      toast.error('Session expired. Please sign in again.')
      return
    }

    setLoading(true)

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('type', 'avatar')

      const res = await fetch('/api/profile/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataUpload
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message = typeof json?.message === 'string' ? json.message : 'Failed to upload photo'
        throw new Error(message)
      }

      setProfileMeta(prev => ({ ...prev, avatarUrl: json.data.url, avatarName: json.data.name }))
      toast.success('Profile photo updated!')
    } catch (error: any) {
      const message = typeof error?.message === 'string' ? error.message : 'Upload failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Wait for auth restoration before fetching (avoids the token-timing bug).
    if (authLoading) return
    if (!isAuthenticated) {
      setInitialLoading(false)
      return
    }

    const loadProfile = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) {
        setInitialLoading(false)
        return
      }

      try {
        const res = await fetch('/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        const json = await res.json().catch(() => ({}))
        if (!res.ok) {
          const message = typeof json?.message === 'string' ? json.message : 'Failed to load profile'
          throw new Error(message)
        }

        const profile = json?.data?.profile ?? {}
        const currentUser = json?.data?.user ?? {}

        setFormData(prev => {
          const next = {
            ...prev,
            name: currentUser.name ?? prev.name,
            email: currentUser.email ?? prev.email,
            company: currentUser.company ?? prev.company
          }
          savedFormRef.current = {
            name: next.name,
            email: next.email,
            company: next.company,
          }
          return next
        })

        setProfileMeta({
          avatarUrl: profile.avatarUrl ?? '',
          avatarName: profile.avatarName ?? ''
        })
      } catch (error: any) {
        const message = typeof error?.message === 'string' ? error.message : 'Failed to load profile'
        toast.error(message)
      } finally {
        setInitialLoading(false)
      }
    }

    loadProfile()
  }, [authLoading, isAuthenticated])

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jade-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Reveal>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Recruiter Console</p>
          <h1 className="font-display text-3xl font-bold text-white">Profile Settings</h1>
          <p className="mt-1 text-sm text-neutral-400">Manage your account information and preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="recruiter-profile-form"
                loading={loading}
                className="border-transparent bg-jade-500 text-ink hover:bg-jade-400 dark:border-transparent dark:bg-jade-500 dark:text-ink dark:hover:border-transparent dark:hover:bg-jade-400 focus-visible:ring-2 focus-visible:ring-jade-400/60"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="border-transparent bg-jade-500 text-ink hover:bg-jade-400 dark:border-transparent dark:bg-jade-500 dark:text-ink dark:hover:border-transparent dark:hover:bg-jade-400 focus-visible:ring-2 focus-visible:ring-jade-400/60"
            >
              Edit Profile
            </Button>
          )}
        </div>
      </div>
      </Reveal>

      <Reveal index={1}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="rounded-xl">
            <CardHeader>
              <p className="eyebrow">01 · Identity</p>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form id="recruiter-profile-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    leftIcon={<User className="w-4 h-4 text-gray-400" />}
                    required
                  />
                  <FormInput
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled
                    leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
                    required
                  />
                </div>
                
                <FormInput
                  label="Company Name"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  disabled={!isEditing}
                  leftIcon={<Building2 className="w-4 h-4 text-gray-400" />}
                  required
                />

                {isEditing && (
                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      loading={loading}
                      className="border-transparent bg-jade-500 text-ink hover:bg-jade-400 dark:border-transparent dark:bg-jade-500 dark:text-ink dark:hover:border-transparent dark:hover:bg-jade-400 focus-visible:ring-2 focus-visible:ring-jade-400/60"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="rounded-xl">
            <CardHeader>
              <p className="eyebrow">02 · Security</p>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <FormInput
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
                  required
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
                    required
                    helperText="At least 8 chars with uppercase, lowercase, and number"
                  />
                  <FormInput
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
                    required
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    loading={loading}
                    className="border-transparent bg-jade-500 text-ink hover:bg-jade-400 dark:border-transparent dark:bg-jade-500 dark:text-ink dark:hover:border-transparent dark:hover:bg-jade-400 focus-visible:ring-2 focus-visible:ring-jade-400/60"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Profile Sidebar */}
        <div className="space-y-6">
          {/* Profile Picture */}
          <Card className="rounded-xl">
            <CardHeader>
              <p className="eyebrow">Operator</p>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Update your profile photo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-jade-400/30 bg-jade-400/10">
                    {profileMeta.avatarUrl || user?.avatar ? (
                      <Image
                        src={profileMeta.avatarUrl || user?.avatar || ''}
                        alt={user?.name || 'User avatar'}
                        width={96}
                        height={96}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-jade-400" />
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label="Change profile photo"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0B1122] bg-jade-500 text-ink transition-colors hover:bg-jade-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-jade-400/60"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-center">
                  <h3 className="font-display font-semibold text-white">{user?.name}</h3>
                  <p className="mt-1 font-data text-[11px] uppercase tracking-[0.18em] text-jade-400/70">{user?.role}</p>
                  {formData.company && (
                    <p className="mt-1 text-sm text-neutral-400">{formData.company}</p>
                  )}
                </div>

                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <Button variant="outline" size="sm" onClick={() => avatarInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </Button>
                {profileMeta.avatarName && (
                  <p className="font-data text-xs text-neutral-500">Current: {profileMeta.avatarName}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card className="rounded-xl">
            <CardHeader>
              <p className="eyebrow">Registry</p>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-line-dark">
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-neutral-400">Account type</span>
                  <span className="font-data text-sm capitalize text-white">{user?.role}</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-neutral-400">Email</span>
                  <span className="max-w-[12rem] truncate font-data text-sm text-white">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-neutral-400">Company</span>
                  <span className="max-w-[12rem] truncate font-data text-sm text-white">{formData.company || '—'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="rounded-xl border-[#FF3B5C]/25">
            <CardHeader>
              <p className="eyebrow !text-[#FF3B5C]/70">Restricted</p>
              <CardTitle className="text-[#FF3B5C]">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={logout}
                >
                  Sign Out
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  disabled
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </Reveal>
    </div>
  )
}

export default RecruiterProfile

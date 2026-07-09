'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FormInput } from '@/components/ui/FormInput'
import { User, Mail, Lock, Upload, Camera, Save, FileText, X } from 'lucide-react'
import Reveal from '@/components/landing/Reveal'
import toast from 'react-hot-toast'

// Signed resume URLs expire after 1 hour; refresh if fetched longer ago than this.
const RESUME_URL_TTL_MS = 50 * 60 * 1000

const CandidateProfile: React.FC = () => {
  const { user, logout, loading: authLoading, isAuthenticated } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [profileMeta, setProfileMeta] = useState({
    resumeUrl: '',
    resumeName: '',
    avatarUrl: '',
    avatarName: ''
  })
  const avatarInputRef = useRef<HTMLInputElement>(null)
  // Last-saved basic-info values so Cancel can revert unsaved edits.
  const savedFormRef = useRef({ name: '', email: '', phone: '', location: '', bio: '' })
  const resumeUrlFetchedAtRef = useRef(0)

  const handleCancelEdit = () => {
    setFormData(prev => ({ ...prev, ...savedFormRef.current }))
    setIsEditing(false)
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
          phone: formData.phone,
          location: formData.location,
          bio: formData.bio
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
        resumeUrl: updatedProfile.resumeUrl ?? prev.resumeUrl,
        resumeName: updatedProfile.resumeName ?? prev.resumeName,
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
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setResumeFile(file)
      void uploadFile(file, 'resume')
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      void uploadFile(file, 'avatar')
    }
  }

  const uploadFile = async (file: File, type: 'resume' | 'avatar') => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      toast.error('Session expired. Please sign in again.')
      return
    }

    setLoading(true)

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('type', type)

      const res = await fetch('/api/profile/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataUpload
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message = typeof json?.message === 'string' ? json.message : 'Failed to upload file'
        throw new Error(message)
      }

      if (type === 'resume') {
        setProfileMeta(prev => ({ ...prev, resumeUrl: json.data.url, resumeName: json.data.name }))
        resumeUrlFetchedAtRef.current = Date.now()
        toast.success('Resume uploaded successfully!')
      } else {
        setProfileMeta(prev => ({ ...prev, avatarUrl: json.data.url, avatarName: json.data.name }))
        toast.success('Profile photo updated!')
      }
    } catch (error: any) {
      const message = typeof error?.message === 'string' ? error.message : 'Upload failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // Signed resume URLs expire after ~1h; re-fetch the profile for a fresh
  // signed URL when the stored one is stale, then open it.
  const handleOpenResume = async () => {
    if (!profileMeta.resumeUrl) return
    if (Date.now() - resumeUrlFetchedAtRef.current < RESUME_URL_TTL_MS) {
      window.open(profileMeta.resumeUrl, '_blank', 'noopener,noreferrer')
      return
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      toast.error('Session expired. Please sign in again.')
      return
    }
    // Open the tab synchronously so popup blockers allow it.
    const win = window.open('about:blank', '_blank')
    try {
      const res = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.message || 'Failed to refresh resume link')
      const freshUrl = json?.data?.profile?.resumeUrl || ''
      setProfileMeta(prev => ({ ...prev, resumeUrl: freshUrl }))
      resumeUrlFetchedAtRef.current = Date.now()
      if (freshUrl) {
        if (win) win.location.href = freshUrl
        else window.open(freshUrl, '_blank', 'noopener,noreferrer')
      } else {
        win?.close()
        toast.error('Resume is no longer available')
      }
    } catch (error: any) {
      win?.close()
      toast.error(error?.message || 'Failed to refresh resume link')
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
            phone: profile.phone ?? '',
            location: profile.location ?? '',
            bio: profile.bio ?? ''
          }
          savedFormRef.current = {
            name: next.name,
            email: next.email,
            phone: next.phone,
            location: next.location,
            bio: next.bio,
          }
          return next
        })

        setProfileMeta({
          resumeUrl: profile.resumeUrl ?? '',
          resumeName: profile.resumeName ?? '',
          avatarUrl: profile.avatarUrl ?? '',
          avatarName: profile.avatarName ?? ''
        })
        resumeUrlFetchedAtRef.current = Date.now()
      } catch (error: any) {
        const message = typeof error?.message === 'string' ? error.message : 'Failed to load profile'
        toast.error(message)
      } finally {
        setInitialLoading(false)
      }
    }

    loadProfile()
  }, [authLoading, isAuthenticated])

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
          <p className="eyebrow mb-2">Candidate Portal</p>
          <h1 className="font-display text-3xl font-bold text-white">Profile Settings</h1>
          <p className="mt-1 text-sm text-neutral-400">Manage your candidate profile and preferences</p>
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
                form="candidate-profile-form"
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
              <form id="candidate-profile-form" onSubmit={handleSubmit} className="space-y-4">
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="+1 (555) 123-4567"
                  />
                  <FormInput
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="City, State"
                  />
                </div>

                <FormInput
                  label="Bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="A short summary about yourself"
                />

              </form>
            </CardContent>
          </Card>

          {/* Resume Upload */}
          <Card className="rounded-xl">
            <CardHeader>
              <p className="eyebrow">02 · Documents</p>
              <CardTitle>Resume & Documents</CardTitle>
              <CardDescription>Upload your resume and other relevant documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <label
                  htmlFor="resume-upload"
                  className="group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-jade-500/40 bg-jade-400/[0.03] p-8 text-center transition-colors hover:border-jade-400/80 hover:bg-jade-400/[0.06] focus-within:border-jade-400"
                >
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="sr-only"
                    id="resume-upload"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-jade-400/10 blur-3xl"
                  />
                  <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-jade-400/30 bg-jade-400/10 transition-colors group-hover:bg-jade-400/15">
                    <Upload className="h-7 w-7 text-jade-400" />
                  </span>
                  <span className="font-display text-lg font-semibold text-white">
                    Drop your resume here or click to browse
                  </span>
                  <span className="mt-2 font-data text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                    PDF · DOC · DOCX
                  </span>
                </label>

                {(resumeFile || profileMeta.resumeUrl) && (
                  <div className="flex flex-col items-center gap-2">
                    {resumeFile && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-jade-400/30 bg-jade-400/10 py-1.5 pl-3 pr-2 font-data text-xs text-jade-300">
                        <FileText className="h-3.5 w-3.5" />
                        {resumeFile.name}
                        <button
                          type="button"
                          onClick={() => setResumeFile(null)}
                          aria-label="Clear selected file"
                          className="rounded-full p-0.5 text-jade-400 transition-colors hover:bg-jade-400/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-jade-400/60"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    )}
                    {profileMeta.resumeUrl && (
                      <button
                        type="button"
                        onClick={handleOpenResume}
                        className="inline-flex items-center gap-1.5 font-data text-xs text-jade-400 transition-colors hover:text-jade-300 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-jade-400/60"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        View current resume ({profileMeta.resumeName || 'download'})
                      </button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="rounded-xl">
            <CardHeader>
              <p className="eyebrow">03 · Security</p>
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

                <div className="flex justify-end pt-4">
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
              <p className="eyebrow">Operator ID</p>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Update your profile photo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-jade-400/30 bg-jade-400/10">
                    {user?.avatar ? (
                      <Image
                        src={profileMeta.avatarUrl || user.avatar}
                        alt={user.name || 'User avatar'}
                        width={96}
                        height={96}
                        className="rounded-full object-cover"
                      />
                    ) : profileMeta.avatarUrl ? (
                      <Image
                        src={profileMeta.avatarUrl}
                        alt={user?.name || 'Profile avatar'}
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

export default CandidateProfile

'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export interface User {
  id: string
  email: string
  name: string
  role: 'candidate' | 'recruiter'
  company?: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string, role: 'candidate' | 'recruiter') => Promise<void>
  signup: (userData: SignupData) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

interface SignupData {
  name: string
  email: string
  password: string
  role: 'candidate' | 'recruiter'
  company?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  // Prefer internal API routes by default; fallback to configured external API
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api'

  // Validate token with the backend and normalize the returned user shape
  const validateTokenAndGetUser = async (token: string): Promise<User> => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    const json = await res.json().catch(() => ({})) as any
    if (!res.ok) {
      const message = (json && (json.message || json.error)) || 'Session validation failed'
      throw new Error(message)
    }
    const payload = (json && (json.data || json)) || {}
    const apiUser = (payload.user || payload) as Partial<User> | undefined
    if (!apiUser || !apiUser.id || !apiUser.email) {
      throw new Error('Invalid session')
    }
    return {
      id: String(apiUser.id),
      email: String(apiUser.email),
      name: String(apiUser.name || ''),
      role: (apiUser.role === 'recruiter' || apiUser.role === 'candidate') ? apiUser.role : 'candidate',
      company: apiUser.company,
      avatar: apiUser.avatar
    }
  }

  useEffect(() => {
    // Check for stored user data on mount and validate token with backend
    const restore = async () => {
      const storedToken = localStorage.getItem('token')
      if (!storedToken) {
        localStorage.removeItem('user')
        setUser(null)
        setLoading(false)
        return
      }
      try {
        const freshUser = await validateTokenAndGetUser(storedToken)
        setUser(freshUser)
        localStorage.setItem('user', JSON.stringify(freshUser))
      } catch (_) {
        // Token invalid or server rejected → clear session
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    restore()
  }, [])

  const login = async (email: string, password: string, role: 'candidate' | 'recruiter') => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send role as well so backend can validate against user type
        body: JSON.stringify({ email, password, role })
      })

      // Attempt to parse response JSON in a robust way
      const json = await res.json().catch(() => ({})) as any
      if (!res.ok) {
        const message = (json && (json.message || json.error)) || 'Login failed'
        throw new Error(message)
      }

      // Some APIs return { data: { user, token } }, others return { user, token }
      const payload = (json && (json.data || json)) || {}
      const apiUser = payload.user as Partial<User> | undefined
      const token = payload.token as string | undefined

      // Enforce presence of a token and a minimally valid user
      if (!token || !apiUser || !apiUser.id || !apiUser.email) {
        throw new Error('Invalid credentials')
      }

      // Validate token with backend and trust returned user details
      localStorage.setItem('token', token)
      const verifiedUser = await validateTokenAndGetUser(token)
      // Optional: ensure the account type matches the intended portal
      if (verifiedUser.role !== role) {
        // Prevent role-hopping (e.g., recruiter token used on candidate login page)
        throw new Error('Account role mismatch')
      }

      setUser(verifiedUser)
      localStorage.setItem('user', JSON.stringify(verifiedUser))

      const effectiveRole = verifiedUser.role
      router.push(effectiveRole === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard')
    } catch (err) {
      // Ensure we don't keep a stale session on failure
      setUser(null)
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signup = async (userData: SignupData) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      const json = await res.json().catch(() => ({})) as any
      if (!res.ok) {
        const message = (json && (json.message || json.error)) || 'Signup failed'
        throw new Error(message)
      }

      const payload = (json && (json.data || json)) || {}
      const apiUser = payload.user as Partial<User> | undefined
      const token = payload.token as string | undefined

      if (!token || !apiUser || !apiUser.id || !apiUser.email) {
        throw new Error('Signup failed')
      }

      // Validate token with backend
      localStorage.setItem('token', token)
      const verifiedUser = await validateTokenAndGetUser(token)

      if (verifiedUser.role !== userData.role) {
        throw new Error('Account role mismatch')
      }

      setUser(verifiedUser)
      localStorage.setItem('user', JSON.stringify(verifiedUser))

      const effectiveRole = verifiedUser.role
      router.push(effectiveRole === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard')
    } catch (err) {
      setUser(null)
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/')
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user && typeof window !== 'undefined' && !!localStorage.getItem('token')
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

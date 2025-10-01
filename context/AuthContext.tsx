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
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'

  useEffect(() => {
    // Check for stored user data on mount
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string, role: 'candidate' | 'recruiter') => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!res.ok) {
        // If user likely doesn't exist or bad credentials → redirect to signup
        if (res.status === 401) {
          router.push(role === 'recruiter' ? '/signup-recruiter' : '/signup-candidate')
        }
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || 'Login failed')
      }

      const { data } = await res.json()
      const apiUser = data.user
      const token = data.token

      const mappedUser: User = {
        id: apiUser.id,
        email: apiUser.email,
        name: apiUser.name,
        role: apiUser.role,
        company: apiUser.company,
        avatar: apiUser.avatar
      }

      setUser(mappedUser)
      localStorage.setItem('user', JSON.stringify(mappedUser))
      localStorage.setItem('token', token)

      router.push(role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard')
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

      if (!res.ok) {
        // If email already exists → redirect to login
        if (res.status === 409) {
          router.push(userData.role === 'recruiter' ? '/login-recruiter' : '/login-candidate')
        }
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || 'Signup failed')
      }

      const { data } = await res.json()
      const apiUser = data.user
      const token = data.token

      const mappedUser: User = {
        id: apiUser.id,
        email: apiUser.email,
        name: apiUser.name,
        role: apiUser.role,
        company: apiUser.company,
        avatar: apiUser.avatar
      }

      setUser(mappedUser)
      localStorage.setItem('user', JSON.stringify(mappedUser))
      localStorage.setItem('token', token)

      router.push(userData.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    router.push('/')
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

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
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        role,
        company: role === 'recruiter' ? 'Tech Corp' : undefined,
        avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=3b82f6&color=fff`
      }
      
      setUser(mockUser)
      localStorage.setItem('user', JSON.stringify(mockUser))
      
      // Redirect based on role
      if (role === 'recruiter') {
        router.push('/recruiter/dashboard')
      } else {
        router.push('/candidate/dashboard')
      }
    } catch (error) {
      throw new Error('Login failed')
    } finally {
      setLoading(false)
    }
  }

  const signup = async (userData: SignupData) => {
    setLoading(true)
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        name: userData.name,
        role: userData.role,
        company: userData.company,
        avatar: `https://ui-avatars.com/api/?name=${userData.name}&background=3b82f6&color=fff`
      }
      
      setUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
      
      // Redirect based on role
      if (userData.role === 'recruiter') {
        router.push('/recruiter/dashboard')
      } else {
        router.push('/candidate/dashboard')
      }
    } catch (error) {
      throw new Error('Signup failed')
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

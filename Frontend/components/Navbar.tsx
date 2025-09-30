'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Menu, X, User, Building2, LogOut } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
  <nav className="bg-white dark:bg-primary-900 shadow-premium border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-accent-500 to-accent-600 rounded-lg flex items-center justify-center shadow-gold">
                <span className="text-white font-bold text-sm">IL</span>
              </div>
              <span className="text-xl font-bold text-primary-950 dark:text-white">InterviewLytics</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-neutral-700 dark:text-neutral-200 hover:text-accent-500 dark:hover:text-accent-400 px-3 py-2 text-sm font-medium transition-colors">
              Home
            </Link>
            <Link href="/features" className="text-neutral-700 dark:text-neutral-200 hover:text-accent-500 dark:hover:text-accent-400 px-3 py-2 text-sm font-medium transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-neutral-700 dark:text-neutral-200 hover:text-accent-500 dark:hover:text-accent-400 px-3 py-2 text-sm font-medium transition-colors">
              Pricing
            </Link>
            <ThemeToggle />
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-accent-100 dark:bg-primary-800 flex items-center justify-center">
                    {user?.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name || 'User avatar'}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <User className="w-4 h-4 text-accent-600" />
                    )}
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-primary-950 dark:text-white">{user?.name}</div>
                    <div className="text-neutral-500 dark:text-neutral-400 capitalize">{user?.role}</div>
                  </div>
                </div>
                
                <Link
                  href={user?.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard'}
                  className="text-neutral-700 dark:text-neutral-200 hover:text-accent-500 dark:hover:text-accent-400 px-3 py-2 text-sm font-medium transition-colors flex items-center"
                >
                  {user?.role === 'recruiter' ? (
                    <Building2 className="w-4 h-4 mr-2" />
                  ) : (
                    <User className="w-4 h-4 mr-2" />
                  )}
                  Dashboard
                </Link>
                
                <Button variant="ghost" size="sm" onClick={logout} className="text-neutral-700 dark:text-neutral-200 hover:text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login-candidate">
                  <Button variant="ghost" size="sm" className="text-neutral-700 dark:text-neutral-200 hover:text-accent-500 dark:hover:text-accent-400">
                    <User className="w-4 h-4 mr-2" />
                    Candidate Login
                  </Button>
                </Link>
                <Link href="/login-recruiter">
                  <Button variant="ghost" size="sm" className="text-neutral-700 dark:text-neutral-200 hover:text-accent-500 dark:hover:text-accent-400">
                    <Building2 className="w-4 h-4 mr-2" />
                    Recruiter Login
                  </Button>
                </Link>
                <Link href="/signup-candidate">
                  <Button size="sm" className="bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 shadow-gold">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
      <div className="md:hidden">
            <button
              onClick={toggleMenu}
        className="text-gray-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-accent-400 p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-primary-900 border-t dark:border-neutral-800">
              <div className="flex items-center justify-end px-3 pb-2"><ThemeToggle /></div>
              <Link href="/" className="text-gray-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-accent-400 block px-3 py-2 text-base font-medium">
                Home
              </Link>
              <Link href="/features" className="text-gray-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-accent-400 block px-3 py-2 text-base font-medium">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-accent-400 block px-3 py-2 text-base font-medium">
                Pricing
              </Link>
              
              {isAuthenticated ? (
                <div className="pt-4 space-y-2">
                  <div className="flex items-center px-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                      {user?.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.name || 'User avatar'}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      ) : (
                        <User className="w-4 h-4 text-primary-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user?.name}</div>
                      <div className="text-sm text-gray-500 capitalize">{user?.role}</div>
                    </div>
                  </div>
                  
                  <Link
                    href={user?.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard'}
                    className="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium"
                  >
                    Dashboard
                  </Link>
                  
                  <button
                    onClick={logout}
                    className="text-gray-700 hover:text-red-600 block px-3 py-2 text-base font-medium w-full text-left"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="pt-4 space-y-2">
                  <Link href="/login-candidate" className="text-gray-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-accent-400 block px-3 py-2 text-base font-medium">
                    Candidate Login
                  </Link>
                  <Link href="/login-recruiter" className="text-gray-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-accent-400 block px-3 py-2 text-base font-medium">
                    Recruiter Login
                  </Link>
                  <Link href="/signup-candidate" className="block">
                    <Button size="sm" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar

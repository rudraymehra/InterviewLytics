'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Menu, X, User, Building2, LogOut } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  // Morph the flat full-width bar into a floating rounded capsule on scroll.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
    {/* Spacer keeps page content from jumping under the fixed bar */}
    <div className="h-16" aria-hidden="true" />
    <nav
      className={`fixed top-0 inset-x-0 z-50 border-b transition-all duration-500 ${
        scrolled
          ? 'px-3 sm:px-6 pt-3 bg-transparent border-transparent'
          : 'bg-white/90 dark:bg-[#060913]/80 backdrop-blur shadow-sm border-line-light dark:border-line-dark'
      }`}
    >
      <div
        className={`mx-auto border transition-all duration-500 px-4 sm:px-6 lg:px-8 ${
          scrolled
            ? `max-w-6xl overflow-hidden ${isMenuOpen ? 'rounded-2xl' : 'rounded-full'} border-jade-500/40 bg-white/95 dark:bg-[#0B1122]/95 backdrop-blur-xl shadow-lg shadow-jade-500/10`
            : 'max-w-7xl border-transparent'
        }`}
      >
        <div className={`flex justify-between items-center transition-all duration-500 ${scrolled ? 'h-12' : 'h-16'}`}>
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-jade-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">IL</span>
              </div>
              <span className="font-display text-xl font-bold text-primary-950 dark:text-white">InterviewLytics</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className={`hidden md:flex items-center whitespace-nowrap transition-all duration-500 ${scrolled ? 'space-x-3' : 'space-x-6'}`}>
            {!isAuthenticated && (
              <>
                <Link href="/" className="text-neutral-700 dark:text-neutral-200 hover:text-jade-700 dark:hover:text-jade-400 px-3 py-2 text-sm font-medium transition-colors">
                  Home
                </Link>
                <Link href="/features" className="text-neutral-700 dark:text-neutral-200 hover:text-jade-700 dark:hover:text-jade-400 px-3 py-2 text-sm font-medium transition-colors">
                  Features
                </Link>
                <Link href="/pricing" className="text-neutral-700 dark:text-neutral-200 hover:text-jade-700 dark:hover:text-jade-400 px-3 py-2 text-sm font-medium transition-colors">
                  Pricing
                </Link>
              </>
            )}
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {/* Compact single-line user chip */}
                <div
                  className="flex items-center space-x-2 pl-1 pr-3 py-1 rounded-full border border-line-light dark:border-line-dark"
                  title={`${user?.name} · ${user?.role}`}
                >
                  <div className="w-6 h-6 rounded-full bg-jade-100 dark:bg-jade-900/30 flex items-center justify-center shrink-0">
                    {user?.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name || 'User avatar'}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    ) : (
                      <User className="w-3.5 h-3.5 text-jade-700 dark:text-jade-400" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-primary-950 dark:text-white max-w-[10rem] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                </div>

                <Link href={user?.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard'}>
                  <Button size="sm" className="bg-jade-600 text-white dark:bg-jade-500 dark:text-ink hover:bg-jade-700 dark:hover:bg-jade-400 font-data uppercase tracking-wide rounded shadow-sm">
                    Dashboard
                  </Button>
                </Link>

                <button
                  onClick={logout}
                  aria-label="Logout"
                  title="Logout"
                  className="p-2 rounded-full text-neutral-500 dark:text-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login-candidate">
                  <Button variant="ghost" size="sm" className="text-neutral-700 dark:text-neutral-200 hover:text-jade-700 dark:hover:text-jade-400">
                    <User className="w-4 h-4 mr-2" />
                    Candidate Login
                  </Button>
                </Link>
                <Link href="/login-recruiter">
                  <Button variant="ghost" size="sm" className="text-neutral-700 dark:text-neutral-200 hover:text-jade-700 dark:hover:text-jade-400">
                    <Building2 className="w-4 h-4 mr-2" />
                    Recruiter Login
                  </Button>
                </Link>
                <Link href="/signup-candidate">
                  <Button size="sm" className="bg-jade-600 text-white dark:bg-jade-500 dark:text-ink hover:bg-jade-700 dark:hover:bg-jade-400 font-data uppercase tracking-wide rounded shadow-sm">
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
        className="text-gray-700 dark:text-neutral-200 hover:text-jade-700 dark:hover:text-jade-400 p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-[#060913]/95 backdrop-blur border-t border-line-light dark:border-line-dark">
              <div className="flex items-center justify-end px-3 pb-2"><ThemeToggle /></div>
              {!isAuthenticated && (
                <>
                  <Link href="/" className="text-gray-700 dark:text-neutral-200 hover:text-jade-700 dark:hover:text-jade-400 block px-3 py-2 text-base font-medium">
                    Home
                  </Link>
                  <Link href="/features" className="text-gray-700 dark:text-neutral-200 hover:text-jade-700 dark:hover:text-jade-400 block px-3 py-2 text-base font-medium">
                    Features
                  </Link>
                  <Link href="/pricing" className="text-gray-700 dark:text-neutral-200 hover:text-jade-700 dark:hover:text-jade-400 block px-3 py-2 text-base font-medium">
                    Pricing
                  </Link>
                </>
              )}
              
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
                  <Link href="/login-candidate" className="text-gray-700 dark:text-neutral-200 hover:text-jade-700 dark:hover:text-jade-400 block px-3 py-2 text-base font-medium">
                    Candidate Login
                  </Link>
                  <Link href="/login-recruiter" className="text-gray-700 dark:text-neutral-200 hover:text-jade-700 dark:hover:text-jade-400 block px-3 py-2 text-base font-medium">
                    Recruiter Login
                  </Link>
                  <Link href="/signup-candidate" className="block">
                    <Button size="sm" className="w-full bg-jade-600 text-white dark:bg-jade-500 dark:text-ink hover:bg-jade-700 dark:hover:bg-jade-400 font-data uppercase tracking-wide rounded">
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
    </>
  )
}

export default Navbar

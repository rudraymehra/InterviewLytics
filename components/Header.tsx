'use client'

import { useState } from 'react'
import { Menu, X, User, Building2 } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <header className="bg-white dark:bg-primary-900 shadow-premium border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <a href="/" className="text-2xl font-bold gradient-text hover:opacity-80 transition-opacity">
                InterviewLytics
              </a>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="/features" className="text-neutral-700 dark:text-neutral-200 hover:text-accent-500 dark:hover:text-accent-400 px-3 py-2 text-sm font-medium transition-colors">
                Features
              </a>
              <a href="/pricing" className="text-neutral-700 dark:text-neutral-200 hover:text-accent-500 dark:hover:text-accent-400 px-3 py-2 text-sm font-medium transition-colors">
                Pricing
              </a>
              <a href="/about" className="text-neutral-700 dark:text-neutral-200 hover:text-accent-500 dark:hover:text-accent-400 px-3 py-2 text-sm font-medium transition-colors">
                About
              </a>
              <a href="/contact" className="text-neutral-700 dark:text-neutral-200 hover:text-accent-500 dark:hover:text-accent-400 px-3 py-2 text-sm font-medium transition-colors">
                Contact
              </a>
            </div>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <a href="/login" className="text-neutral-700 dark:text-neutral-200 hover:text-accent-500 dark:hover:text-accent-400 px-3 py-2 text-sm font-medium transition-colors flex items-center">
              <User className="w-4 h-4 mr-2" />
              Login
            </a>
            <a href="/dashboard" className="text-neutral-700 dark:text-neutral-200 hover:text-accent-500 dark:hover:text-accent-400 px-3 py-2 text-sm font-medium transition-colors flex items-center">
              <Building2 className="w-4 h-4 mr-2" />
              Dashboard
            </a>
            <button className="bg-gradient-to-r from-accent-500 to-accent-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-accent-600 hover:to-accent-700 transition-colors shadow-gold">
              Book a Demo
            </button>
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
              <a href="/features" className="text-gray-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-accent-400 block px-3 py-2 text-base font-medium">
                Features
              </a>
              <a href="/pricing" className="text-gray-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-accent-400 block px-3 py-2 text-base font-medium">
                Pricing
              </a>
              <a href="/about" className="text-gray-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-accent-400 block px-3 py-2 text-base font-medium">
                About
              </a>
              <a href="/contact" className="text-gray-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-accent-400 block px-3 py-2 text-base font-medium">
                Contact
              </a>
              <div className="pt-4 space-y-2">
                <a href="/login" className="text-gray-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-accent-400 block px-3 py-2 text-base font-medium w-full text-left flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </a>
                <a href="/dashboard" className="text-gray-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-accent-400 block px-3 py-2 text-base font-medium w-full text-left flex items-center">
                  <Building2 className="w-4 h-4 mr-2" />
                  Dashboard
                </a>
                <button className="bg-gradient-to-r from-accent-500 to-accent-600 text-white px-3 py-2 rounded-lg text-base font-medium hover:from-accent-600 hover:to-accent-700 transition-colors w-full shadow-gold">
                  Book a Demo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

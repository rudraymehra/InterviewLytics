'use client'

import Link from 'next/link'
import Marquee from '@/components/landing/Marquee'
import {
  Building2,
  User,
  FileText,
  HelpCircle,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'

const footerLinks = {
  platform: [
    { name: 'Features', href: '/features' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'Pricing', href: '/pricing' }
  ],
  recruiters: [
    { name: 'Recruiter Login', href: '/login-recruiter' },
    { name: 'Register as Recruiter', href: '/signup-recruiter' }
  ],
  candidates: [
    { name: 'Find Jobs', href: '/login-candidate' },
    { name: 'Candidate Login', href: '/login-candidate' },
    { name: 'Register as Candidate', href: '/signup-candidate' }
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ]
}

export default function Footer() {
  return (
  <footer className="bg-white dark:bg-[#060913]/80 backdrop-blur text-gray-900 dark:text-neutral-200 border-t border-line-light dark:border-line-dark">
      {/* Mirrored ticker — slower, reverse direction of the hero strip */}
      <Marquee reverse duration={55} className="border-t-0" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-4">
                InterviewLytics
              </h3>
              <p className="text-gray-600 dark:text-neutral-400 leading-relaxed mb-6">
                AI-powered recruitment platform that transforms hiring through intelligent matching, 
                automated interviews, and data-driven insights.
              </p>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center text-gray-600 dark:text-neutral-400">
                <Mail className="w-5 h-5 mr-3" />
                <span>contact@interviewlytics.com</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-neutral-400">
                <Phone className="w-5 h-5 mr-3" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-neutral-400">
                <MapPin className="w-5 h-5 mr-3" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Platform
            </h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-neutral-400 hover:text-jade-700 dark:hover:text-jade-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Recruiters */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              For Recruiters
            </h4>
            <ul className="space-y-3">
              {footerLinks.recruiters.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-neutral-400 hover:text-jade-700 dark:hover:text-jade-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Candidates */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              For Candidates
            </h4>
            <ul className="space-y-3">
              {footerLinks.candidates.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-neutral-400 hover:text-jade-700 dark:hover:text-jade-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Company Links */}
  <div className="border-t border-line-light dark:border-line-dark pt-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <HelpCircle className="w-5 h-5 mr-2" />
                Company
              </h4>
              <ul className="flex flex-wrap gap-6">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-600 dark:text-neutral-400 hover:text-jade-700 dark:hover:text-jade-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
  <div className="border-t border-line-light dark:border-line-dark pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-500 dark:text-neutral-500 text-sm">
              © 2025 InterviewLytics. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

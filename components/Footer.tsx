'use client'

import { 
  Building2, 
  User, 
  FileText, 
  HelpCircle, 
  Mail, 
  Phone, 
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Github
} from 'lucide-react'

const footerLinks = {
  platform: [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Learn More', href: '#' },
    { name: 'Wishlist', href: '#' }
  ],
  recruiters: [
    { name: 'Recruiter Login', href: '#' },
    { name: 'Register as Recruiter', href: '#' }
  ],
  candidates: [
    { name: 'Find Jobs', href: '#' },
    { name: 'Candidate Login', href: '#' },
    { name: 'Register as Candidate', href: '#' }
  ],
  company: [
    { name: 'About Us', href: '#' },
    { name: 'Contact', href: '#' },
    { name: 'Privacy Policy', href: '#' },
    { name: 'Terms of Service', href: '#' }
  ]
}

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: '#' },
  { name: 'Twitter', icon: Twitter, href: '#' },
  { name: 'LinkedIn', icon: Linkedin, href: '#' },
  { name: 'GitHub', icon: Github, href: '#' }
]

export default function Footer() {
  return (
  <footer className="bg-gray-900 dark:bg-slate-900 text-white dark:text-neutral-200 border-t border-gray-800 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h3 className="text-2xl font-bold gradient-text mb-4">
                InterviewLytics
              </h3>
              <p className="text-gray-300 dark:text-neutral-400 leading-relaxed mb-6">
                AI-powered recruitment platform that transforms hiring through intelligent matching, 
                automated interviews, and data-driven insights.
              </p>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center text-gray-300 dark:text-neutral-400">
                <Mail className="w-5 h-5 mr-3" />
                <span>contact@interviewlytics.com</span>
              </div>
              <div className="flex items-center text-gray-300 dark:text-neutral-400">
                <Phone className="w-5 h-5 mr-3" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center text-gray-300 dark:text-neutral-400">
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
                  <a 
                    href={link.href} 
                    className="text-gray-300 dark:text-neutral-400 hover:text-white dark:hover:text-neutral-200 transition-colors"
                  >
                    {link.name}
                  </a>
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
                  <a 
                    href={link.href} 
                    className="text-gray-300 dark:text-neutral-400 hover:text-white dark:hover:text-neutral-200 transition-colors"
                  >
                    {link.name}
                  </a>
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
                  <a 
                    href={link.href} 
                    className="text-gray-300 dark:text-neutral-400 hover:text-white dark:hover:text-neutral-200 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Company Links */}
  <div className="border-t border-gray-800 dark:border-slate-700 pt-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <HelpCircle className="w-5 h-5 mr-2" />
                Company
              </h4>
              <ul className="flex flex-wrap gap-6">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href} 
                      className="text-gray-300 dark:text-neutral-400 hover:text-white dark:hover:text-neutral-200 transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
  <div className="border-t border-gray-800 dark:border-slate-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 InterviewLytics. All rights reserved.
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-4">
        {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
          className="text-gray-400 hover:text-white dark:hover:text-accent-400 transition-colors p-2 hover:bg-gray-800 dark:hover:bg-slate-800 rounded-lg"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

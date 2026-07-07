'use client'

import Link from 'next/link'
import { motion } from '@/components/MotionWrapper'
import { ArrowRight, Play } from 'lucide-react'

export default function Hero() {
  return (
  <section className="relative bg-paper dark:bg-ink py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-jade-100 text-jade-700 text-sm font-medium mb-8 border border-line-light dark:bg-jade-900/30 dark:text-jade-400 dark:border-line-dark"
          >
            <span className="w-2 h-2 bg-jade-600 rounded-full mr-2"></span>
            AI-Powered Hiring Platform
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-950 dark:text-white mb-6"
          >
            Revolutionize Your{' '}
            <span className="text-jade-700 dark:text-jade-400">Hiring</span> with
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-xl md:text-2xl text-neutral-700 dark:text-neutral-300 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            Our AI-driven platform transforms the recruitment process from job posting to candidate selection. 
            Automate interviews, analyze resumes, and make data-driven hiring decisions.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Link
              href="/signup-recruiter"
              className="bg-jade-600 hover:bg-jade-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-300 flex items-center group shadow-sm"
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/features"
              className="bg-white dark:bg-[#131A2A] text-primary-950 dark:text-white px-8 py-4 rounded-lg text-lg font-semibold border border-line-light dark:border-line-dark hover:border-jade-600 dark:hover:border-jade-400 transition-colors duration-300 flex items-center group shadow-sm"
            >
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              View Demo
            </Link>
          </motion.div>

          {/* Additional CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm"
          >
            <button className="text-neutral-600 dark:text-neutral-300 hover:text-jade-700 dark:hover:text-jade-400 transition-colors">
              Find Jobs
            </button>
            <span className="hidden sm:block text-neutral-300">•</span>
            <button className="text-neutral-600 dark:text-neutral-300 hover:text-jade-700 dark:hover:text-jade-400 transition-colors">
              How It Works
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

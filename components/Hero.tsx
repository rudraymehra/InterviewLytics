'use client'

import Link from 'next/link'
import { motion } from '@/components/MotionWrapper'
import { ArrowRight, Play } from 'lucide-react'

export default function Hero() {
  return (
  <section className="relative bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-primary-900 dark:to-primary-800 py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-accent-100 text-accent-800 text-sm font-medium mb-8 shadow-gold dark:bg-primary-800 dark:text-accent-200"
          >
            <span className="w-2 h-2 bg-accent-500 rounded-full mr-2 animate-pulse"></span>
            AI-Powered Hiring Platform
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-950 dark:text-white mb-6"
          >
            Revolutionize Your{' '}
            <span className="gradient-text">Hiring</span> with
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-neutral-700 dark:text-neutral-300 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            Our AI-driven platform transforms the recruitment process from job posting to candidate selection. 
            Automate interviews, analyze resumes, and make data-driven hiring decisions.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Link 
              href="/signup-recruiter"
              className="bg-gradient-to-r from-accent-500 to-accent-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-accent-600 hover:to-accent-700 transition-all duration-300 transform hover:scale-105 flex items-center group shadow-gold"
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/features"
              className="bg-white dark:bg-primary-900 text-primary-950 dark:text-white px-8 py-4 rounded-lg text-lg font-semibold border-2 border-accent-500 hover:bg-accent-50 dark:hover:bg-primary-800 transition-all duration-300 flex items-center group shadow-premium"
            >
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              View Demo
            </Link>
          </motion.div>

          {/* Additional CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm"
          >
            <button className="text-neutral-600 dark:text-neutral-300 hover:text-accent-500 dark:hover:text-accent-400 transition-colors">
              Find Jobs
            </button>
            <span className="hidden sm:block text-neutral-300">•</span>
            <button className="text-neutral-600 dark:text-neutral-300 hover:text-accent-500 dark:hover:text-accent-400 transition-colors">
              How It Works
            </button>
          </motion.div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-accent-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-bounce-slow"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-bounce-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-bounce-slow" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>
    </section>
  )
}

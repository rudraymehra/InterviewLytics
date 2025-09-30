'use client'

import Link from 'next/link'
import { motion } from '@/components/MotionWrapper'
import { 
  FileText, 
  Link as LinkIcon, 
  Brain, 
  MessageCircle, 
  BarChart3, 
  Target,
  Zap,
  Users,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle
} from 'lucide-react'

const features = [
  {
    icon: FileText,
    title: 'Smart Job Posting',
    description: 'Create optimized job listings that automatically generate unique application URLs.',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20'
  },
  {
    icon: LinkIcon,
    title: 'Unique Application Links',
    description: 'Share custom application URLs for each position to streamline the candidate experience.',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/20'
  },
  {
    icon: Brain,
    title: 'Resume Analysis',
    description: 'Our AI analyzes resumes to identify the most qualified candidates based on skills and experience.',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20'
  },
  {
    icon: MessageCircle,
    title: 'AI-Powered Interviews',
    description: 'Automated interview process that adapts questions based on candidate responses and resume.',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/20'
  },
  {
    icon: BarChart3,
    title: 'Comprehensive Feedback',
    description: 'Provide detailed feedback to both recruiters and candidates after the interview process.',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/20'
  },
  {
    icon: Target,
    title: 'Data-Driven Insights',
    description: 'Get actionable insights and analytics to improve your hiring process over time.',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/20'
  }
]

const stats = [
  { icon: Zap, value: '40%', label: 'Faster Hiring' },
  { icon: Users, value: '10K+', label: 'Active Users' },
  { icon: TrendingUp, value: '95%', label: 'Success Rate' },
  { icon: Clock, value: '24/7', label: 'AI Available' }
]

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-accent-100 dark:bg-accent-900/30 text-accent-800 dark:text-accent-300 text-sm font-medium mb-6"
          >
            <Shield className="w-4 h-4 mr-2" />
            AI-Powered Features
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Intelligent Recruitment Platform
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          >
            Our platform leverages cutting-edge AI to transform every step of the recruitment process, 
            from job posting to final selection.
          </motion.p>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-100 dark:bg-accent-900/30 rounded-full mb-4">
                <stat.icon className="w-8 h-8 text-accent-600 dark:text-accent-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</div>
              <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group hover:border-accent-300 dark:hover:border-accent-600"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 ${feature.bgColor} rounded-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-accent-50 dark:from-slate-800 to-accent-100 dark:to-slate-700 rounded-2xl p-8 md:p-12 border border-accent-200 dark:border-slate-600">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Transform Your Hiring Process?
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of companies using InterviewLytics to find the perfect candidates faster and more efficiently.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup-recruiter" className="bg-gradient-to-r from-accent-500 to-accent-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-accent-600 hover:to-accent-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center shadow-gold">
                <CheckCircle className="w-5 h-5 mr-2" />
                Get Started Now
              </Link>
              <Link href="/features" className="text-accent-600 dark:text-accent-400 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-accent-600 dark:border-accent-400 hover:bg-accent-50 dark:hover:bg-slate-700 transition-all duration-300">
                Learn More
              </Link>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              No credit card required • Free trial available
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

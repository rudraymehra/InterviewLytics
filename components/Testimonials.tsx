'use client'

import { motion } from '@/components/MotionWrapper'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'HR Director',
    company: 'TechCorp',
    content: 'InterviewLytics has revolutionized our recruitment process. We\'ve reduced our time-to-hire by 40% and found better quality candidates.',
    avatar: 'S',
    rating: 5
  },
  {
    name: 'David Rodriguez',
    role: 'Talent Acquisition Manager',
    company: 'InnovateX',
    content: 'The AI interview process is remarkably effective. It asks relevant questions and provides detailed feedback that helps us make better hiring decisions.',
    avatar: 'D',
    rating: 5
  },
  {
    name: 'Michael Chen',
    role: 'Software Engineer',
    company: 'Hired via InterviewLytics',
    content: 'As a candidate, I love how the platform matched me with jobs that truly aligned with my skills and career goals. The AI interview was surprisingly conversational.',
    avatar: 'M',
    rating: 5
  }
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-white dark:bg-ink transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            className="eyebrow inline-flex items-center mb-6"
          >
            <Star className="w-4 h-4 mr-2" />
            Success Stories
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6"
          >
            What Our Users Say
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          >
            Hear from recruiters and candidates who have transformed their hiring experience with our AI-powered platform.
          </motion.p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-[#131A2A] p-8 rounded-xl shadow-sm transition-all duration-300 border border-line-light dark:border-line-dark group hover:border-jade-600 dark:hover:border-jade-400"
            >
              {/* Quote Icon */}
              <div className="mb-6">
                <Quote className="w-8 h-8 text-accent-300 group-hover:text-accent-400 transition-colors" />
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-accent-400 fill-current" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-jade-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 bg-white dark:bg-[#131A2A] rounded-xl p-8 md:p-12 shadow-sm border border-line-light dark:border-line-dark"
        >
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Join Thousands of Happy Users
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Our platform has helped companies and candidates worldwide streamline their hiring process.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="font-data text-3xl font-bold text-jade-700 dark:text-jade-400 mb-2">10K+</div>
                <div className="text-gray-600 dark:text-gray-300">Active Users</div>
              </div>
              <div className="text-center">
                <div className="font-data text-3xl font-bold text-jade-700 dark:text-jade-400 mb-2">500+</div>
                <div className="text-gray-600 dark:text-gray-300">Companies</div>
              </div>
              <div className="text-center">
                <div className="font-data text-3xl font-bold text-jade-700 dark:text-jade-400 mb-2">50K+</div>
                <div className="text-gray-600 dark:text-gray-300">Interviews Conducted</div>
              </div>
              <div className="text-center">
                <div className="font-data text-3xl font-bold text-jade-700 dark:text-jade-400 mb-2">95%</div>
                <div className="text-gray-600 dark:text-gray-300">Success Rate</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

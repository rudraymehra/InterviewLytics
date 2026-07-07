'use client'

import NextLink from 'next/link'
import { motion } from '@/components/MotionWrapper'
import { 
  FileText, 
  Link as LinkIcon, 
  User, 
  Brain, 
  MessageCircle, 
  BarChart3,
  ArrowRight,
  Building2,
  Users,
  Target
} from 'lucide-react'

const steps = [
  {
    number: 1,
    title: 'Create Job Posting',
    description: 'Recruiters create detailed job postings with requirements, responsibilities, and qualifications.',
    icon: FileText,
    user: 'Recruiter',
    userIcon: Building2,
    subTitle: 'Job Description Creation',
    subDescription: 'The platform helps optimize job descriptions to attract the right candidates.',
    color: 'bg-jade-600'
  },
  {
    number: 2,
    title: 'Generate Application URL',
    description: 'The system automatically generates a unique application URL for each job posting.',
    icon: LinkIcon,
    user: 'System',
    userIcon: Target,
    subTitle: 'Unique Application Link',
    subDescription: 'Each job gets a custom URL that can be shared across platforms and social media.',
    color: 'bg-jade-600'
  },
  {
    number: 3,
    title: 'Candidate Application',
    description: 'Candidates apply through the unique URL, creating a streamlined application experience.',
    icon: User,
    user: 'Candidate',
    userIcon: Users,
    subTitle: 'Easy Application Process',
    subDescription: 'Candidates can apply with a simple, user-friendly interface designed for the best experience.',
    color: 'bg-jade-600'
  },
  {
    number: 4,
    title: 'Resume Analysis',
    description: 'Our AI analyzes the candidate\'s resume to extract skills, experience, and qualifications.',
    icon: Brain,
    user: 'AI System',
    userIcon: Brain,
    subTitle: 'Intelligent Resume Parsing',
    subDescription: 'Advanced AI extracts and analyzes key information from resumes to match with job requirements.',
    color: 'bg-jade-600'
  },
  {
    number: 5,
    title: 'AI-Powered Interview',
    description: 'The AI conducts an adaptive interview, asking questions based on the candidate\'s resume and responses.',
    icon: MessageCircle,
    user: 'Interview',
    userIcon: MessageCircle,
    subTitle: 'Dynamic Conversation',
    subDescription: 'The AI adapts questions based on previous answers to thoroughly assess candidate skills.',
    color: 'bg-jade-600'
  },
  {
    number: 6,
    title: 'Comprehensive Feedback',
    description: 'Both recruiters and candidates receive detailed feedback and insights from the interview process.',
    icon: BarChart3,
    user: 'Results',
    userIcon: BarChart3,
    subTitle: 'Actionable Insights',
    subDescription: 'Detailed reports help recruiters make informed decisions and candidates understand their performance.',
    color: 'bg-jade-600'
  }
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-paper dark:bg-ink transition-colors duration-300">
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
            <ArrowRight className="w-4 h-4 mr-2" />
            Streamlined Process
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6"
          >
            How InterviewLytics Works
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          >
            Our AI-powered platform streamlines the entire recruitment journey from job posting to final selection.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="space-y-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8 lg:gap-16`}
            >
              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center mb-6">
                  <div className={`w-12 h-12 ${step.color} rounded-full flex items-center justify-center text-white font-data font-bold text-lg mr-4`}>
                    {step.number}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {step.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <step.userIcon className="w-4 h-4 mr-2" />
                      {step.user}
                    </div>
                  </div>
                </div>
                
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  {step.description}
                </p>
                
                <div className="bg-white dark:bg-[#131A2A] p-6 rounded-xl shadow-sm border border-line-light dark:border-line-dark">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {step.subTitle}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {step.subDescription}
                  </p>
                </div>
              </div>

              {/* Visual */}
              <div className="flex-1 flex justify-center">
                <div className="w-32 h-32 bg-jade-100 dark:bg-jade-900/30 border border-line-light dark:border-line-dark rounded-xl flex items-center justify-center shadow-sm">
                  <step.icon className="w-16 h-16 text-jade-700 dark:text-jade-400" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <div className="bg-jade-600 rounded-xl p-8 md:p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
              Transform your hiring process today with our AI-powered platform.
            </p>
            <NextLink 
              href="/signup-recruiter"
              className="inline-block bg-white text-jade-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 dark:bg-ink dark:text-jade-400 dark:hover:bg-slate-800 transition-colors duration-300"
            >
              Get Started Now
            </NextLink>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

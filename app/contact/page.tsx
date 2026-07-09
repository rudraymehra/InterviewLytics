'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import MotionWrapper from '@/components/MotionWrapper'
import { Grain, Orb } from '@/components/landing/Ambience'
import Reveal from '@/components/landing/Reveal'
import { Mail, Phone, MapPin, Send, Clock, MessageCircle } from 'lucide-react'

const inputClasses =
  'w-full px-4 py-3 bg-ink/60 text-white placeholder-gray-500 border border-line-dark rounded-lg transition-colors duration-200 hover:border-jade-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-jade-400/60 focus:border-jade-500/50'

const labelClasses = 'block text-xs font-data uppercase tracking-wider text-gray-400 mb-2'

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  company: '',
  subject: '',
  message: '',
}

const contactChannels = [
  {
    icon: Mail,
    title: 'Email',
    lines: ['contact@interviewlytics.com', 'support@interviewlytics.com'],
  },
  {
    icon: Phone,
    title: 'Phone',
    lines: ['+1 (555) 123-4567', 'Mon-Fri 9AM-6PM PST'],
  },
  {
    icon: MapPin,
    title: 'Office',
    lines: ['123 Innovation Drive', 'San Francisco, CA 94105', 'United States'],
  },
]

const faqs = [
  {
    question: 'How does the AI interview process work?',
    answer:
      "Our AI conducts adaptive interviews by analyzing candidate resumes and asking relevant questions. The system learns from each response to ask follow-up questions that thoroughly assess the candidate's skills and experience.",
  },
  {
    question: 'How does resume screening work?',
    answer:
      'When a candidate applies, our AI compares their resume against the job requirements and produces a match score with strengths and gaps, so recruiters can prioritize the strongest applicants.',
  },
  {
    question: 'What happens after the interviews?',
    answer:
      'After each round the platform scores answers across dimensions like correctness, clarity and depth, then compiles a final hiring report combining resume match and both interview rounds.',
  },
  {
    question: 'How do candidates take the interviews?',
    answer:
      'Candidates complete two adaptive interview rounds right in the browser, with voice or typed answers. Round 1 digs into their resume; Round 2 focuses on role fit, with follow-up questions that probe earlier answers.',
  },
  {
    question: 'What kind of support do you provide?',
    answer:
      'We provide email support and detailed documentation. Our team is available Monday-Friday 9AM-6PM PST.',
  },
]

export default function Contact() {
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const update =
    (field: keyof typeof emptyForm) =>
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firstName.trim()) {
      toast.error('Please enter your first name')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast.error('Please enter a valid email address')
      return
    }
    if (!form.message.trim()) {
      toast.error('Please write a message before sending')
      return
    }
    setSubmitting(true)
    // No contact backend yet — open the user's mail client with the message
    // prefilled and confirm with a toast.
    const subjectLabel = form.subject ? `[${form.subject}] ` : ''
    const body = [
      `Name: ${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
      form.company.trim() ? `Company: ${form.company.trim()}` : '',
      `Email: ${form.email.trim()}`,
      '',
      form.message.trim(),
    ]
      .filter(Boolean)
      .join('\n')
    window.location.href = `mailto:contact@interviewlytics.com?subject=${encodeURIComponent(
      `${subjectLabel}Message from ${form.firstName.trim()}`
    )}&body=${encodeURIComponent(body)}`
    toast.success("Thanks — we'll get back to you")
    setForm(emptyForm)
    setSubmitting(false)
  }

  return (
    <main className="min-h-screen bg-ink">
      <Navbar />
      <Grain />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ink to-[#0B1122] py-24">
        <Orb className="h-[520px] w-[520px] -top-48 -left-48 !opacity-[0.08]" />
        <Orb magenta className="h-[480px] w-[480px] -bottom-48 -right-40 !opacity-[0.08]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <MotionWrapper
              as="p"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="eyebrow mb-5"
            >
              Contact&nbsp;&nbsp;//&nbsp;&nbsp;Channel Open
            </MotionWrapper>
            <MotionWrapper
              as="h1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl md:text-6xl font-bold text-white mb-6"
            >
              Get in <span className="text-jade-400">Touch</span>
            </MotionWrapper>
            <MotionWrapper
              as="p"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto"
            >
              Have questions about InterviewLytics? Send us a message and
              we&apos;ll respond within one business day.
            </MotionWrapper>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 bg-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Contact Form */}
            <Reveal>
              <div className="hud-panel relative rounded-xl border border-line-dark bg-[#0B1122] p-8 md:p-10">
                <p className="eyebrow mb-3">Transmit</p>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-8">
                  Send us a Message
                </h2>

                <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className={labelClasses}>
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={form.firstName}
                        onChange={update('firstName')}
                        className={inputClasses}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className={labelClasses}>
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={form.lastName}
                        onChange={update('lastName')}
                        className={inputClasses}
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className={labelClasses}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={form.email}
                      onChange={update('email')}
                      className={inputClasses}
                      placeholder="john@company.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className={labelClasses}>
                      Company (Optional)
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={form.company}
                      onChange={update('company')}
                      className={inputClasses}
                      placeholder="Your Company"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className={labelClasses}>
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={form.subject}
                      onChange={update('subject')}
                      className={inputClasses}
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="demo">Request a Demo</option>
                      <option value="pricing">Pricing Information</option>
                      <option value="support">Technical Support</option>
                      <option value="partnership">Partnership</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className={labelClasses}>
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      value={form.message}
                      onChange={update('message')}
                      className={inputClasses}
                      placeholder="Tell us how we can help you..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-jade-500 text-ink px-8 py-4 rounded-lg text-lg font-display font-semibold hover:bg-jade-400 transition-colors duration-200 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-jade-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:bg-[#1B2A4A] disabled:text-gray-500 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                    Send Message
                  </button>
                </form>
              </div>
            </Reveal>

            {/* Contact Information */}
            <Reveal delay={0.1} className="space-y-8">
              <div>
                <p className="eyebrow mb-3">Channels</p>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
                  Contact Information
                </h2>
                <p className="text-lg text-gray-300">
                  We&apos;re here to help. Reach out through any of the channels
                  below.
                </p>
              </div>

              {/* Contact Details */}
              <div className="space-y-4">
                {contactChannels.map(({ icon: Icon, title, lines }, i) => (
                  <Reveal key={title} index={i}>
                    <div className="scanline-hover flex items-start rounded-xl border border-line-dark bg-[#0B1122] p-5 transition-colors duration-200 hover:border-jade-500/40">
                      <div className="w-12 h-12 bg-jade-400/10 border border-jade-500/20 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                        <Icon className="w-6 h-6 text-jade-400" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-semibold text-white mb-1">
                          {title}
                        </h3>
                        {lines.map((line) => (
                          <p key={line} className="font-data text-sm text-gray-400 leading-relaxed">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* Business Hours */}
              <div className="bg-[#0B1122] border border-line-dark p-6 rounded-xl">
                <div className="flex items-center mb-4">
                  <Clock className="w-5 h-5 text-jade-400 mr-3" />
                  <h3 className="font-display text-lg font-semibold text-white">
                    Business Hours
                  </h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-line-dark/60 pb-2">
                    <span className="text-gray-400">Monday - Friday</span>
                    <span className="font-data text-gray-300">9:00 AM - 6:00 PM PST</span>
                  </div>
                  <div className="flex justify-between border-b border-line-dark/60 pb-2">
                    <span className="text-gray-400">Saturday</span>
                    <span className="font-data text-gray-300">10:00 AM - 4:00 PM PST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sunday</span>
                    <span className="font-data text-gray-500">Closed</span>
                  </div>
                </div>
              </div>

              {/* Quick Response */}
              <div className="relative overflow-hidden bg-[#111A30] border border-line-dark p-6 rounded-xl">
                <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-jade-500/10 blur-2xl" />
                <div className="flex items-center mb-3">
                  <MessageCircle className="w-5 h-5 text-jade-400 mr-3" />
                  <h3 className="font-display text-lg font-semibold text-white">
                    Quick Response
                  </h3>
                </div>
                <p className="text-gray-400">
                  We typically respond to all inquiries within{' '}
                  <span className="font-data text-jade-400">24 hours</span>. For
                  urgent matters, please call us directly.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-ink border-t border-line-dark/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-14">
            <p className="eyebrow mb-4">Signal Boost</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg md:text-xl text-gray-300">
              Quick answers to common questions
            </p>
          </Reveal>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Reveal key={faq.question} index={index}>
                <div className="scanline-hover bg-[#0B1122] border border-line-dark p-6 rounded-xl transition-colors duration-200 hover:border-jade-500/40">
                  <div className="flex items-baseline gap-4">
                    <span className="font-data text-sm text-jade-400/80 flex-shrink-0">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-white mb-3">
                        {faq.question}
                      </h3>
                      <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

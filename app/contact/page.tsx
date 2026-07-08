'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import MotionWrapper from '@/components/MotionWrapper'
import { Mail, Phone, MapPin, Send, Clock, MessageCircle } from 'lucide-react'

const inputClasses =
  'w-full px-4 py-3 bg-white dark:bg-[#0B1122] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border border-gray-300 dark:border-line-dark rounded-lg focus:ring-2 focus:ring-jade-600 dark:focus:ring-jade-400 focus:border-transparent transition-all duration-300'

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  company: '',
  subject: '',
  message: '',
}

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
    <main className="min-h-screen bg-paper dark:bg-ink">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-jade-50 to-white dark:from-ink dark:to-[#0B1122] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <MotionWrapper
              as="h1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-display text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
            >
              Get in <span className="text-jade-700 dark:text-jade-400">Touch</span>
            </MotionWrapper>
            <MotionWrapper
              as="p"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Have questions about InterviewLytics? We'd love to hear from you.
              Send us a message and we'll respond as soon as possible.
            </MotionWrapper>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 bg-white dark:bg-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <MotionWrapper
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                Send us a Message
              </h2>

              <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
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
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
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
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
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
                  <label
                    htmlFor="company"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
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
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
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
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
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
                  className="w-full bg-jade-600 dark:bg-jade-500 text-white dark:text-ink px-8 py-4 rounded-lg text-lg font-semibold hover:bg-jade-700 dark:hover:bg-jade-400 transition-all duration-300 transform hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </button>
              </form>
            </MotionWrapper>

            {/* Contact Information */}
            <MotionWrapper
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                  Contact Information
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                  We're here to help! Reach out to us through any of the
                  channels below.
                </p>
              </div>

              {/* Contact Details */}
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-jade-100 dark:bg-jade-400/10 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <Mail className="w-6 h-6 text-jade-700 dark:text-jade-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      Email
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">contact@interviewlytics.com</p>
                    <p className="text-gray-600 dark:text-gray-400">support@interviewlytics.com</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-jade-100 dark:bg-jade-400/10 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <Phone className="w-6 h-6 text-jade-700 dark:text-jade-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      Phone
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">+1 (555) 123-4567</p>
                    <p className="text-gray-600 dark:text-gray-400">Mon-Fri 9AM-6PM PST</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-jade-100 dark:bg-jade-400/10 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <MapPin className="w-6 h-6 text-jade-700 dark:text-jade-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      Office
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      123 Innovation Drive
                      <br />
                      San Francisco, CA 94105
                      <br />
                      United States
                    </p>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-gray-50 dark:bg-[#0B1122] dark:border dark:border-line-dark p-6 rounded-2xl">
                <div className="flex items-center mb-4">
                  <Clock className="w-6 h-6 text-jade-700 dark:text-jade-400 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Business Hours
                  </h3>
                </div>
                <div className="space-y-2 text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>9:00 AM - 6:00 PM PST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span>10:00 AM - 4:00 PM PST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>
              </div>

              {/* Quick Response */}
              <div className="bg-jade-50 dark:bg-[#111A30] dark:border dark:border-line-dark p-6 rounded-2xl">
                <div className="flex items-center mb-4">
                  <MessageCircle className="w-6 h-6 text-jade-700 dark:text-jade-400 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Quick Response
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  We typically respond to all inquiries within 24 hours. For
                  urgent matters, please call us directly.
                </p>
              </div>
            </MotionWrapper>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50 dark:bg-ink">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Quick answers to common questions
            </p>
          </div>

          <div className="space-y-6">
            {[
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
            ].map((faq, index) => (
              <MotionWrapper
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-[#0B1122] dark:border dark:border-line-dark p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{faq.answer}</p>
              </MotionWrapper>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

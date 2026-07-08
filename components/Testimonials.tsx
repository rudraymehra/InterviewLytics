'use client'

import React from 'react'
import { motion, useReducedMotion } from '@/components/landing/motion'
import { EASE_OUT } from '@/components/landing/hooks'

// Honest copy: these are the product's operating principles,
// deliberately NOT dressed up as customer testimonials.
const PRINCIPLES = [
  {
    tag: 'PRINCIPLE 01 // RIGOR',
    quote: 'Every claim gets probed.',
    body: "If it's on the resume, it's fair game. The interviewer cross-examines until the story holds — or doesn't.",
    offset: '',
  },
  {
    tag: 'PRINCIPLE 02 // SILENCE',
    quote: 'Judgment waits for the debrief.',
    body: 'No live scores leaking into the room. Candidates think out loud; the machine listens and keeps its counsel.',
    offset: 'md:translate-y-8',
  },
  {
    tag: 'PRINCIPLE 03 // EVIDENCE',
    quote: 'Evidence over vibes.',
    body: 'Every recommendation cites the transcript. You see why a candidate advanced — not just who.',
    offset: 'md:translate-y-3',
  },
]

export default function Testimonials() {
  const reduce = useReducedMotion()

  return (
    <section id="testimonials" className="relative overflow-hidden py-24 lg:py-32">
      <div className="orb orb-magenta h-[400px] w-[400px] -right-48 bottom-0" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          className="mb-16 text-center"
        >
          <p className="eyebrow mb-5">Operating Principles</p>
          <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white md:text-5xl">
            What the interviewer believes.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm text-neutral-500 dark:text-neutral-500">
            Not testimonials — the rules the machine is built on.
          </p>
        </motion.div>

        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}
          initial={reduce ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-1 gap-6 pb-10 md:grid-cols-3"
        >
          {PRINCIPLES.map((p) => (
            <motion.blockquote
              key={p.tag}
              variants={{
                hidden: { opacity: 0, y: 24 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
              }}
              className={`hud-panel rounded-lg p-7 transition-colors duration-300 hover:border-jade-600 dark:hover:border-jade-400/60 ${p.offset}`}
            >
              <p className="font-data text-[10px] font-medium uppercase tracking-[0.2em] text-jade-700 dark:text-jade-400/80">
                {p.tag}
              </p>
              <p className="mt-5 font-display text-xl font-semibold leading-snug text-gray-900 dark:text-white md:text-2xl">
                “{p.quote}”
              </p>
              <footer className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {p.body}
              </footer>
            </motion.blockquote>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

'use client'

import React, { useRef } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from '@/components/landing/motion'
import { EASE_OUT } from '@/components/landing/hooks'

const STEPS = [
  {
    n: '01',
    title: 'POST ROLE',
    body: 'Define the role once. Requirements become the interview blueprint — questions, scoring weights, pass bars.',
  },
  {
    n: '02',
    title: 'AI SCREEN',
    body: 'Every incoming resume is scored against the role: match percentage, strengths, gaps. Instantly, for all of them.',
  },
  {
    n: '03',
    title: 'ROUND 01 — RESUME DEEP-DIVE',
    body: 'The AI interviews each candidate on their own claims, line by line, and probes anything that sounds borrowed.',
  },
  {
    n: '04',
    title: 'AUTO-ADVANCE',
    body: 'Strong performers move forward on their own. No scheduling, no chasing, no calendar Tetris.',
  },
  {
    n: '05',
    title: 'ROUND 02 — ROLE FIT',
    body: 'Scenario questions test how they would do this job — cross-referenced against everything said in round one.',
  },
  {
    n: '06',
    title: 'VERDICT',
    body: 'A weighted report lands in your pipeline: evidence, risk flags, and a hire signal with its reasoning attached.',
  },
]

export default function HowItWorks() {
  const reduce = useReducedMotion()
  const trackRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start 0.75', 'end 0.55'],
  })
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section id="how-it-works" className="relative overflow-hidden py-24 lg:py-32">
      <div className="orb orb-cyan h-[480px] w-[480px] -left-60 top-16" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          className="mb-20 text-center"
        >
          <p className="eyebrow mb-5">The Pipeline</p>
          <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white md:text-5xl">
            Post a role. <span className="neon-text">Get a verdict.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-neutral-600 dark:text-neutral-400">
            Six stages, zero coordination. The machine runs the interview loop
            end to end.
          </p>
        </motion.div>

        {/* Timeline */}
        <div ref={trackRef} className="relative mx-auto max-w-3xl">
          {/* Track */}
          <div
            className="absolute inset-y-2 left-[19px] w-px bg-line-light dark:bg-[#1B2A4A]"
            aria-hidden="true"
          />
          {/* Glowing draw-down line */}
          <motion.div
            aria-hidden="true"
            style={reduce ? undefined : { scaleY }}
            className="absolute inset-y-2 left-[19px] w-px origin-top bg-gradient-to-b from-jade-400 via-jade-500 to-[#FF2ED1] shadow-neon"
          />

          <div className="space-y-10">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                initial={reduce ? false : { opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.6, ease: EASE_OUT }}
                className="relative flex items-start gap-6 pl-0"
              >
                {/* Node */}
                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-jade-500/50 bg-paper font-data text-[11px] font-semibold text-jade-700 dark:border-jade-400/50 dark:bg-[#060913] dark:text-jade-400">
                  {step.n}
                </div>

                {/* Card */}
                <div className="hud-panel min-w-0 flex-1 rounded-lg p-5 transition-colors duration-300 hover:border-jade-600 dark:hover:border-jade-400/60 md:p-6">
                  <h3 className="font-display text-base font-semibold tracking-wide text-gray-900 dark:text-white md:text-lg">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {step.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

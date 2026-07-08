'use client'

import React from 'react'
import { motion, useReducedMotion } from '@/components/landing/motion'
import { ArrowRight } from 'lucide-react'
import NeuralCanvas from '@/components/landing/NeuralCanvas'
import CursorSpotlight from '@/components/landing/CursorSpotlight'
import MagneticLink from '@/components/landing/MagneticLink'
import TerminalTyper from '@/components/landing/TerminalTyper'
import Marquee from '@/components/landing/Marquee'
import { Orb } from '@/components/landing/Ambience'
import { EASE_OUT } from '@/components/landing/hooks'

const HEADLINE_WORDS = ['The', 'interviewer', 'that']

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
}

const word = {
  hidden: { opacity: 0, y: 28, filter: 'blur(10px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: EASE_OUT },
  },
}

export default function Hero() {
  const reduce = useReducedMotion()

  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] flex-col overflow-hidden">
      {/* Ambient layers */}
      <NeuralCanvas />
      <CursorSpotlight />
      <Orb className="h-[560px] w-[560px] -top-64 left-1/2 -translate-x-1/2" />
      <Orb magenta className="h-[380px] w-[380px] -bottom-48 -right-40" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          className="eyebrow mb-8 flex items-center gap-3"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#FF2ED1] motion-safe:animate-pulse" />
          Autonomous AI Interviews
        </motion.p>

        <motion.h1
          variants={container}
          initial={reduce ? false : 'hidden'}
          animate="show"
          className="font-display text-5xl font-bold leading-[1.05] text-primary-950 dark:text-white sm:text-6xl lg:text-7xl xl:text-8xl"
        >
          {HEADLINE_WORDS.map((w) => (
            <motion.span key={w} variants={word} className="inline-block will-change-transform">
              {w}
              {' '}
            </motion.span>
          ))}
          <motion.span variants={word} className="neon-text inline-block will-change-transform">
            never sleeps.
          </motion.span>
        </motion.h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55, ease: EASE_OUT }}
          className="mt-8 max-w-2xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-300 md:text-xl"
        >
          AI-conducted, cross-questioned, scored and reported — your hiring
          pipeline runs itself.
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.8, ease: EASE_OUT }}
          className="mt-6"
        >
          <TerminalTyper />
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.95, ease: EASE_OUT }}
          className="mt-12 flex flex-col items-center gap-4 sm:flex-row"
        >
          <MagneticLink
            href="/signup-recruiter"
            className="group flex items-center rounded bg-jade-600 px-8 py-4 font-data text-sm font-semibold uppercase tracking-[0.14em] text-white shadow-sm transition-colors duration-300 hover:bg-jade-700 dark:bg-jade-500 dark:text-ink dark:hover:bg-jade-400 dark:hover:shadow-neon"
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </MagneticLink>
          <MagneticLink
            href="/#simulation"
            className="flex items-center rounded border border-jade-600 px-8 py-4 font-data text-sm font-semibold uppercase tracking-[0.14em] text-jade-700 transition-colors duration-300 hover:bg-jade-50 dark:border-jade-400/60 dark:text-jade-400 dark:hover:bg-jade-400/10"
          >
            Watch it think
          </MagneticLink>
        </motion.div>
      </div>

      {/* Bottom ticker */}
      <Marquee className="relative z-10 bg-white/60 dark:bg-[#060913]/60 backdrop-blur-sm" />
    </section>
  )
}

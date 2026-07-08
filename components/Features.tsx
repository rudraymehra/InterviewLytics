'use client'

import React, { useRef } from 'react'
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from '@/components/landing/motion'
import ScoreDial from '@/components/ui/ScoreDial'
import { EASE_OUT, useCountUp } from '@/components/landing/hooks'

const MAX_TILT = 6

/** Bento cell with a subtle 3D tilt toward the cursor (max 6°, springs back). */
function TiltCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 220, damping: 18 })
  const sry = useSpring(ry, { stiffness: 220, damping: 18 })

  const onMouseMove = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    ry.set(px * MAX_TILT * 2)
    rx.set(-py * MAX_TILT * 2)
  }

  const onMouseLeave = () => {
    rx.set(0)
    ry.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={
        reduce
          ? undefined
          : { rotateX: srx, rotateY: sry, transformPerspective: 900 }
      }
      variants={{
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
      }}
      className={`scanline-hover hud-panel group rounded-lg p-6 transition-colors duration-300 hover:border-jade-600 dark:hover:border-jade-400/60 md:p-8 ${className}`}
    >
      {children}
    </motion.div>
  )
}

function CellTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display text-lg font-semibold text-gray-900 transition-colors group-hover:text-jade-700 dark:text-white dark:group-hover:text-jade-400 md:text-xl">
      {children}
    </h3>
  )
}

function CellBody({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
      {children}
    </p>
  )
}

function MonoTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-data text-[10px] font-medium uppercase tracking-[0.2em] text-jade-700 dark:text-jade-400/80">
      {children}
    </span>
  )
}

/* --- Cell visuals ------------------------------------------------------- */

function MatchMeter() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()
  const value = useCountUp(98, inView)

  return (
    <div ref={ref} className="mt-6">
      <div className="flex items-baseline justify-between">
        <MonoTag>Resume match</MonoTag>
        <span className="font-data text-3xl font-bold text-jade-700 dark:text-jade-400 dark:[text-shadow:0_0_12px_rgba(34,211,238,0.4)]">
          {Math.round(value)}%
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-[#1B2A4A]">
        <motion.div
          className="h-full rounded-full bg-jade-500 dark:bg-jade-400"
          initial={reduce ? { width: '98%' } : { width: '0%' }}
          animate={inView ? { width: '98%' } : undefined}
          transition={{ duration: 0.8, ease: EASE_OUT }}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2 font-data text-[10px] tracking-[0.12em]">
        {['REACT ✓', 'PERF ✓', 'LEADERSHIP ~', 'GO ✗'].map((t) => (
          <span
            key={t}
            className="rounded-sm border border-line-light px-1.5 py-0.5 text-neutral-500 dark:border-line-dark dark:text-neutral-400"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

function ChatProbe() {
  return (
    <div className="mt-6 space-y-3">
      <div className="max-w-[90%] rounded border border-line-light bg-neutral-100 px-3 py-2 text-xs italic text-neutral-600 dark:border-line-dark dark:bg-[#111A30] dark:text-neutral-400">
        “We used microservices to scale.”
      </div>
      <div className="ml-auto max-w-[90%] rounded border border-[#FF2ED1]/40 bg-[#FF2ED1]/5 px-3 py-2">
        <span className="mb-1 block font-data text-[9px] tracking-[0.18em] text-[#FF2ED1]">
          FOLLOW-UP
        </span>
        <span className="font-data text-xs text-gray-800 dark:text-neutral-200">
          Scale to what, and measured how?
        </span>
      </div>
    </div>
  )
}

function ScoreCell() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const value = useCountUp(88, inView)
  return (
    <div ref={ref} className="mt-6 flex justify-center">
      <ScoreDial value={value} size={92} grade="strong" />
    </div>
  )
}

function DebriefLines() {
  return (
    <div className="mt-6 space-y-2.5 font-data text-xs leading-relaxed">
      <p className="text-neutral-600 dark:text-neutral-400">
        <span className="text-jade-700 dark:text-jade-400">▸ EVIDENCE</span>
        {' — quotes the transcript, never vibes'}
      </p>
      <p className="text-neutral-600 dark:text-neutral-400">
        <span className="text-[#B45309] dark:text-[#FFB020]">▸ RISK FLAGS</span>
        {' — thin answers, contradictions, borrowed wins'}
      </p>
      <p className="text-neutral-600 dark:text-neutral-400">
        <span className="text-[#0D9488] dark:text-[#34F5C5]">▸ RECOMMEND</span>
        {' — a hire signal with its reasoning attached'}
      </p>
    </div>
  )
}

function VoiceCell() {
  const reduce = useReducedMotion()
  return (
    <div className="mt-6 flex items-center justify-between">
      <span className="flex h-8 items-end gap-1" aria-hidden="true">
        {[10, 22, 14, 28, 18, 26, 12, 20, 9].map((h, i) => (
          <span
            key={i}
            className={`w-1 rounded-full bg-jade-500 dark:bg-jade-400 ${
              reduce ? '' : 'waveform-bar'
            }`}
            style={{ height: `${h}px`, animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </span>
      <MonoTag>George {'//'} TTS</MonoTag>
    </div>
  )
}

const FUNNEL = [
  { label: 'APPLIED', count: 214, width: '100%' },
  { label: 'SCREENED', count: 131, width: '62%' },
  { label: 'INTERVIEWED', count: 47, width: '30%' },
  { label: 'ADVANCE', count: 9, width: '12%' },
]

function FunnelCell() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()
  return (
    <div ref={ref} className="mt-6 space-y-2.5">
      {FUNNEL.map((row, i) => (
        <div key={row.label} className="flex items-center gap-3">
          <span className="w-24 shrink-0 font-data text-[9px] tracking-[0.14em] text-neutral-500 dark:text-neutral-500">
            {row.label}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-sm bg-neutral-200 dark:bg-[#1B2A4A]">
            <motion.div
              className={`h-full rounded-sm ${
                i === FUNNEL.length - 1
                  ? 'bg-[#34F5C5]'
                  : 'bg-jade-500 dark:bg-jade-400/80'
              }`}
              initial={reduce ? { width: row.width } : { width: '0%' }}
              animate={inView ? { width: row.width } : undefined}
              transition={{ duration: 0.7, delay: i * 0.09, ease: EASE_OUT }}
            />
          </div>
          <span className="w-8 shrink-0 text-right font-data text-[10px] text-neutral-600 dark:text-neutral-400">
            {row.count}
          </span>
        </div>
      ))}
    </div>
  )
}

/* --- Section ------------------------------------------------------------ */

export default function Features() {
  const reduce = useReducedMotion()

  return (
    <section id="features" className="relative overflow-hidden py-24 lg:py-32">
      <div className="orb orb-cyan h-[460px] w-[460px] -right-56 top-1/3" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          className="mb-16 text-center"
        >
          <p className="eyebrow mb-5">Capabilities</p>
          <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white md:text-5xl">
            Built to interrogate,
            <br className="hidden md:block" /> not just interview.
          </h2>
        </motion.div>

        <motion.div
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
          initial={reduce ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 gap-4 md:grid-cols-6"
        >
          {/* 1 — large */}
          <TiltCard className="md:col-span-4">
            <MonoTag>01 {'//'} SCREEN</MonoTag>
            <div className="mt-3">
              <CellTitle>Reads resumes like a senior recruiter</CellTitle>
              <CellBody>
                Every application is scored against the role — match
                percentage, strengths, gaps — before you even open it.
              </CellBody>
            </div>
            <MatchMeter />
          </TiltCard>

          {/* 2 */}
          <TiltCard className="md:col-span-2">
            <MonoTag>02 {'//'} PROBE</MonoTag>
            <div className="mt-3">
              <CellTitle>Cross-examines every answer</CellTitle>
            </div>
            <ChatProbe />
          </TiltCard>

          {/* 3 */}
          <TiltCard className="md:col-span-2">
            <MonoTag>03 {'//'} SCORE</MonoTag>
            <div className="mt-3">
              <CellTitle>Silent, rigorous scoring</CellTitle>
              <CellBody>
                Four dimensions per answer. No poker tells during the room.
              </CellBody>
            </div>
            <ScoreCell />
          </TiltCard>

          {/* 4 — wide */}
          <TiltCard className="md:col-span-4">
            <MonoTag>04 {'//'} REPORT</MonoTag>
            <div className="mt-3">
              <CellTitle>Hiring reports that read like a debrief</CellTitle>
              <CellBody>
                Not a spreadsheet of numbers — a case file, built per candidate.
              </CellBody>
            </div>
            <DebriefLines />
          </TiltCard>

          {/* 5 */}
          <TiltCard className="md:col-span-3">
            <MonoTag>05 {'//'} VOICE</MonoTag>
            <div className="mt-3">
              <CellTitle>Voice-native</CellTitle>
              <CellBody>
                The interviewer speaks and listens. Candidates talk like it's a
                real room, because it is one.
              </CellBody>
            </div>
            <VoiceCell />
          </TiltCard>

          {/* 6 */}
          <TiltCard className="md:col-span-3">
            <MonoTag>06 {'//'} CONTROL</MonoTag>
            <div className="mt-3">
              <CellTitle>Recruiter mission control</CellTitle>
              <CellBody>
                The whole funnel, live — who advanced, who stalled, and why.
              </CellBody>
            </div>
            <FunnelCell />
          </TiltCard>
        </motion.div>
      </div>
    </section>
  )
}

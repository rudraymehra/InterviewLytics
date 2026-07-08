'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion, animate, AnimatePresence } from '@/components/landing/motion'
import { RotateCcw } from 'lucide-react'
import ScoreDial from '@/components/ui/ScoreDial'
import { EASE_OUT } from '@/components/landing/hooks'

const QUESTION =
  'Your resume says you cut TTI from 4.2s to 1.1s. Walk me through exactly how.'
const ANSWER =
  '“Mostly route-level code-splitting, and we dropped a 900kb vendor chunk the team had been carrying for years…”'
const PROBE = 'Which of those wins was yours, specifically?'
const FINAL_SCORE = 82

// stage: 0 idle · 1 question typing · 2 answer · 3 follow-up · 4 verdict
const STAGE_DOTS = [
  { n: '01', label: 'QUESTION', at: 1 },
  { n: '02', label: 'PROBE', at: 3 },
  { n: '03', label: 'VERDICT', at: 4 },
]

function Waveform({ active }: { active: boolean }) {
  return (
    <span className="inline-flex h-4 items-end gap-[3px]" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={`w-[3px] rounded-full bg-jade-600 dark:bg-jade-400 ${
            active ? 'waveform-bar' : ''
          }`}
          style={{
            height: `${[9, 15, 11, 16, 8][i]}px`,
            animationDelay: `${i * 0.12}s`,
          }}
        />
      ))}
    </span>
  )
}

const reveal = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
}

export default function InterviewSimulation() {
  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef, { once: true, amount: 0.3 })
  const reduce = useReducedMotion()

  const [runId, setRunId] = useState(0)
  const [stage, setStage] = useState(0)
  const [qText, setQText] = useState('')
  const [pText, setPText] = useState('')
  const [score, setScore] = useState(0)

  useEffect(() => {
    if (!inView) return

    if (reduce) {
      // Static fallback: show the finished scene immediately
      setStage(4)
      setQText(QUESTION)
      setPText(PROBE)
      setScore(FINAL_SCORE)
      return
    }

    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []
    let dialControls: { stop: () => void } | undefined
    const wait = (ms: number) =>
      new Promise<void>((res) => timers.push(setTimeout(res, ms)))

    const type = async (
      text: string,
      set: (s: string) => void,
      speed = 22
    ) => {
      for (let i = 1; i <= text.length; i++) {
        if (cancelled) return
        set(text.slice(0, i))
        await wait(speed)
      }
    }

    ;(async () => {
      setStage(0)
      setQText('')
      setPText('')
      setScore(0)
      await wait(400)
      if (cancelled) return
      setStage(1)
      await type(QUESTION, setQText)
      if (cancelled) return
      await wait(600)
      setStage(2)
      await wait(1800)
      if (cancelled) return
      setStage(3)
      await wait(350)
      await type(PROBE, setPText, 26)
      if (cancelled) return
      await wait(700)
      setStage(4)
      dialControls = animate(0, FINAL_SCORE, {
        type: 'spring',
        stiffness: 55,
        damping: 16,
        onUpdate: (v) => setScore(Math.max(0, Math.min(100, v))),
      })
    })()

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
      dialControls?.stop()
    }
  }, [inView, reduce, runId])

  return (
    <section
      id="simulation"
      ref={sectionRef}
      className="relative overflow-hidden py-24 lg:py-32"
    >
      <div className="orb orb-magenta h-[420px] w-[420px] -left-52 top-24" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          variants={reveal}
          initial={reduce ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          className="mb-14 text-center"
        >
          <p className="eyebrow mb-5">Live Simulation</p>
          <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white md:text-5xl">
            Watch an interview <span className="neon-text">think</span>.
          </h2>
        </motion.div>

        <div className="flex items-start gap-6">
          {/* Stage dots */}
          <div className="sticky top-32 hidden shrink-0 flex-col gap-6 pt-2 lg:flex" aria-hidden="true">
            {STAGE_DOTS.map((dot) => {
              const active = stage >= dot.at
              return (
                <div key={dot.n} className="flex items-center gap-3">
                  <span
                    className={`h-2 w-2 rounded-full transition-colors duration-500 ${
                      active
                        ? 'bg-jade-500 dark:bg-jade-400 dark:shadow-neon'
                        : 'bg-neutral-300 dark:bg-[#1B2A4A]'
                    }`}
                  />
                  <span
                    className={`font-data text-[11px] tracking-[0.2em] transition-colors duration-500 ${
                      active
                        ? 'text-jade-700 dark:text-jade-400'
                        : 'text-neutral-400 dark:text-neutral-600'
                    }`}
                  >
                    {dot.n} {dot.label}
                  </span>
                </div>
              )
            })}
          </div>

          {/* The interview room, in miniature */}
          <motion.div
            variants={reveal}
            initial={reduce ? false : 'hidden'}
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            className="hud-panel min-w-0 flex-1 rounded-lg p-5 md:p-8"
          >
            <div className="grid gap-6 md:grid-cols-[260px,1fr] lg:gap-10">
              {/* Fake camera tile */}
              <div>
                <div className="relative aspect-video overflow-hidden rounded border border-line-light dark:border-line-dark bg-gradient-to-br from-[#111A30] via-[#0B1122] to-[#060913]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-jade-400/40 bg-jade-400/10 font-display text-xl font-bold text-jade-400">
                      C
                    </div>
                  </div>
                  <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-sm bg-[#060913]/80 px-2 py-0.5 font-data text-[10px] tracking-[0.18em] text-[#FF3B5C]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FF3B5C] motion-safe:animate-pulse" />
                    LIVE
                  </div>
                  <div className="absolute bottom-2 left-2 font-data text-[10px] tracking-[0.16em] text-neutral-400">
                    CANDIDATE_042
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between font-data text-[10px] tracking-[0.16em] text-neutral-500 dark:text-neutral-500">
                  <span>REC 00:14:32</span>
                  <span className="text-jade-600 dark:text-jade-400/80">AI // GEORGE</span>
                </div>
              </div>

              {/* Transcript */}
              <div className="min-h-[320px] min-w-0">
                <p className="eyebrow mb-5">Round 01 — Resume Deep-Dive</p>

                <div className="space-y-5">
                  {/* Question */}
                  {stage >= 1 && (
                    <div className="flex gap-3">
                      <span className="mt-0.5 shrink-0 font-data text-[10px] tracking-[0.16em] text-jade-600 dark:text-jade-400">
                        AI
                      </span>
                      <p className="font-data text-sm leading-relaxed text-gray-800 dark:text-neutral-200">
                        {qText}
                        {stage === 1 && (
                          <span className="terminal-caret ml-0.5 inline-block h-[1em] w-[0.5em] translate-y-[2px] bg-jade-400" />
                        )}
                      </p>
                    </div>
                  )}

                  {/* Answer + waveform */}
                  <AnimatePresence>
                    {stage >= 2 && (
                      <motion.div
                        initial={reduce ? false : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: EASE_OUT }}
                        className="flex gap-3"
                      >
                        <span className="mt-0.5 shrink-0 font-data text-[10px] tracking-[0.16em] text-neutral-500">
                          C42
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm italic leading-relaxed text-neutral-600 dark:text-neutral-400">
                            {ANSWER}
                          </p>
                          <div className="mt-2">
                            <Waveform active={stage === 2 && !reduce} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Follow-up probe */}
                  <AnimatePresence>
                    {stage >= 3 && (
                      <motion.div
                        initial={reduce ? false : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: EASE_OUT }}
                        className="flex gap-3"
                      >
                        <span className="mt-0.5 shrink-0 rounded-sm border border-[#FF2ED1]/50 bg-[#FF2ED1]/10 px-1.5 py-0.5 font-data text-[9px] tracking-[0.16em] text-[#FF2ED1]">
                          FOLLOW-UP
                        </span>
                        <p className="font-data text-sm leading-relaxed text-gray-800 dark:text-neutral-200">
                          {pText}
                          {stage === 3 && (
                            <span className="terminal-caret ml-0.5 inline-block h-[1em] w-[0.5em] translate-y-[2px] bg-[#FF2ED1]" />
                          )}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Verdict */}
                  <AnimatePresence>
                    {stage >= 4 && (
                      <motion.div
                        initial={reduce ? false : { opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: EASE_OUT }}
                      >
                        <div className="my-5 border-t border-dashed border-line-light dark:border-line-dark" />
                        <div className="flex flex-wrap items-center gap-6">
                          <ScoreDial
                            value={score}
                            size={88}
                            label="Final Score"
                            grade="strong"
                          />
                          <div className="min-w-0">
                            <span className="inline-block rounded-sm border border-[#34F5C5]/50 bg-[#34F5C5]/10 px-2 py-1 font-data text-[10px] tracking-[0.18em] text-[#0D9488] dark:text-[#34F5C5]">
                              VERDICT // STRONG_HIRE
                            </span>
                            <p className="mt-3 font-data text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                              strengths: measured impact · owns the narrative ·
                              specific under pressure
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Replay */}
            <div className="mt-6 flex justify-end border-t border-line-light pt-4 dark:border-line-dark">
              <button
                type="button"
                onClick={() => setRunId((r) => r + 1)}
                className="flex items-center gap-2 font-data text-[11px] uppercase tracking-[0.18em] text-neutral-500 transition-colors hover:text-jade-700 dark:text-neutral-400 dark:hover:text-jade-400"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Replay
              </button>
            </div>
          </motion.div>
        </div>

        <p className="mt-6 text-center font-data text-xs tracking-wide text-neutral-500 dark:text-neutral-500">
          Scores stay hidden during the interview — candidates get the full
          debrief after.
        </p>
      </div>
    </section>
  )
}

'use client'

import React, { useRef } from 'react'
import { motion, useInView, useReducedMotion } from '@/components/landing/motion'
import { EASE_OUT, useCountUp } from '@/components/landing/hooks'
import ScoreDial, { ScoreDialProps } from '@/components/ui/ScoreDial'

type RevealTag = 'div' | 'span' | 'li' | 'section' | 'article'

export interface RevealProps {
  children: React.ReactNode
  className?: string
  /** Stagger index — each step adds 70ms of delay (keep lists capped ~5). */
  index?: number
  /** Extra base delay in seconds. */
  delay?: number
  /** Spring "pop" (scale 0.92 → 1) instead of the default fade + 12px rise. */
  pop?: boolean
  /** Rendered element (default div). Use "li"/"span" to keep markup valid. */
  as?: RevealTag
}

/**
 * Viewport-triggered entrance used across the app: fade + 12px rise
 * (or a small spring pop), EASE_OUT, staggered via `index` (70ms steps).
 * Reduced-motion users get static content.
 */
export default function Reveal({
  children,
  className = '',
  index = 0,
  delay = 0,
  pop = false,
  as = 'div',
}: RevealProps) {
  const reduce = useReducedMotion()
  const Comp: any = (motion as any)[as] ?? motion.div
  const StaticComp: any = as

  if (reduce) {
    return <StaticComp className={className}>{children}</StaticComp>
  }

  const d = delay + index * 0.07
  return (
    <Comp
      className={className}
      initial={pop ? { opacity: 0, scale: 0.92 } : { opacity: 0, y: 12 }}
      whileInView={pop ? { opacity: 1, scale: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -40px 0px' }}
      transition={
        pop
          ? { type: 'spring', stiffness: 300, damping: 22, delay: d }
          : { duration: 0.5, ease: EASE_OUT, delay: d }
      }
    >
      {children}
    </Comp>
  )
}

/**
 * Mount-triggered pop for modals: scale 0.96 → 1 + fade (≤0.3s).
 * Pair with a `backdrop-blur-sm motion-safe:animate-fade-in` overlay.
 */
export function PopIn({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  )
}

/**
 * A stat number that counts up from 0 the first time it scrolls into view.
 * Renders a span so it drops into existing stat markup.
 */
export function CountUp({
  value,
  suffix = '',
  decimals = 0,
  className = '',
}: {
  value: number
  suffix?: string
  decimals?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20px' })
  const v = useCountUp(value, inView)
  return (
    <span ref={ref} className={className}>
      {v.toFixed(decimals)}
      {suffix}
    </span>
  )
}

/**
 * A horizontal meter bar that grows (scaleX 0 → 1) when it enters the view.
 * `percent` sets the final width; pass the same color classes as before.
 */
export function GrowBar({
  percent,
  className = '',
}: {
  percent: number
  className?: string
}) {
  const reduce = useReducedMotion()
  const width = `${Math.min(100, Math.max(0, percent))}%`
  if (reduce) return <div className={className} style={{ width }} />
  return (
    <motion.div
      className={`${className} origin-left`}
      style={{ width }}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: EASE_OUT }}
    />
  )
}

/**
 * ScoreDial whose arc + number spring up from 0 the first time it's seen.
 * Reduced motion renders the final value immediately (via useCountUp).
 */
export function AnimatedScoreDial({ value, ...rest }: ScoreDialProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const animated = useCountUp(value, inView)
  return (
    <div ref={ref} className="inline-flex">
      <ScoreDial value={animated} {...rest} />
    </div>
  )
}

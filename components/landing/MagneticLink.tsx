'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { motion, useMotionValue, useSpring, useReducedMotion } from '@/components/landing/motion'

const MAX_PULL = 8

/**
 * A link that leans up to ~8px toward the cursor while hovered and springs
 * back on leave. Static under prefers-reduced-motion.
 */
export default function MagneticLink({
  href,
  className = '',
  children,
}: {
  href: string
  className?: string
  children: React.ReactNode
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 320, damping: 22, mass: 0.5 })
  const sy = useSpring(y, { stiffness: 320, damping: 22, mass: 0.5 })

  const onMouseMove = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const relX = e.clientX - rect.left - rect.width / 2
    const relY = e.clientY - rect.top - rect.height / 2
    x.set(Math.max(-MAX_PULL, Math.min(MAX_PULL, relX * 0.18)))
    y.set(Math.max(-MAX_PULL, Math.min(MAX_PULL, relY * 0.3)))
  }

  const onMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={reduce ? undefined : { x: sx, y: sy }}
      className="inline-block"
    >
      <Link href={href} className={className}>
        {children}
      </Link>
    </motion.div>
  )
}

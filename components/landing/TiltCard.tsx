'use client'

import React, { useRef } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from '@/components/landing/motion'

/**
 * Mouse-position tilt wrapper for interactive cards (max 3° by default),
 * with a spring reset when the pointer leaves. Purely decorative:
 * reduced-motion users get a plain div. Combine with `.scanline-hover`
 * and border-brightening classes via `className`.
 */
export default function TiltCard({
  children,
  className = '',
  maxTilt = 3,
}: {
  children: React.ReactNode
  className?: string
  maxTilt?: number
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const springX = useSpring(rotateX, { stiffness: 240, damping: 20 })
  const springY = useSpring(rotateY, { stiffness: 240, damping: 20 })

  if (reduce) {
    return <div className={className}>{children}</div>
  }

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    rotateY.set(px * 2 * maxTilt)
    rotateX.set(-py * 2 * maxTilt)
  }

  const handleLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX: springX, rotateY: springY, transformPerspective: 900 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

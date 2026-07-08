'use client'

import React, { useEffect, useRef } from 'react'

/**
 * A soft ~600px cyan radial glow that trails the cursor.
 * Coordinates are written to CSS custom properties (--mx / --my) inside a
 * rAF tick, so paint work stays off the mousemove hot path.
 * Disabled entirely under prefers-reduced-motion (static centered glow).
 */
export default function CursorSpotlight({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    let pending = false
    let cx = 0
    let cy = 0

    const onMove = (e: MouseEvent) => {
      cx = e.clientX
      cy = e.clientY
      if (!pending) {
        pending = true
        raf = requestAnimationFrame(() => {
          pending = false
          const rect = el.getBoundingClientRect()
          el.style.setProperty('--mx', `${cx - rect.left}px`)
          el.style.setProperty('--my', `${cy - rect.top}px`)
        })
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        background:
          'radial-gradient(600px circle at var(--mx, 50%) var(--my, 35%), rgba(34, 211, 238, 0.06), transparent 70%)',
      }}
    />
  )
}

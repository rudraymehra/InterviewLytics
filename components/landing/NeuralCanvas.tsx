'use client'

import React, { useEffect, useRef, useState } from 'react'

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  /** cursor-repulsion offset, eased back to 0 */
  ox: number
  oy: number
  r: number
  magenta: boolean
}

const NODE_COUNT = 110
const LINK_DIST = 130
const REPEL_DIST = 150
const REPEL_STRENGTH = 42

/**
 * "Neural constellation" — a 2D-canvas field of drifting nodes joined by
 * distance-faded lines. Mostly cyan, ~15% magenta. Nodes ease away from the
 * cursor for a parallax feel.
 *
 * Performance: devicePixelRatio capped at 2, single rAF loop, paused while
 * the tab is hidden. Under prefers-reduced-motion a single static frame is
 * drawn and no listeners are attached.
 */
export default function NeuralCanvas({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let raf = 0
    let running = false
    let width = 0
    let height = 0
    let rect = canvas.getBoundingClientRect()
    const mouse = { x: -9999, y: -9999 }
    let nodes: Node[] = []

    const seed = () => {
      nodes = Array.from({ length: NODE_COUNT }, (_, i) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        ox: 0,
        oy: 0,
        r: 1 + Math.random() * 1.4,
        magenta: i % 7 === 0, // ~15%
      }))
    }

    const resize = () => {
      rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.max(1, Math.round(width * dpr))
      canvas.height = Math.max(1, Math.round(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (nodes.length === 0) seed()
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      // Links between close nodes, opacity by distance
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        const ax = a.x + a.ox
        const ay = a.y + a.oy
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          const bx = b.x + b.ox
          const by = b.y + b.oy
          const dx = ax - bx
          const dy = ay - by
          const d2 = dx * dx + dy * dy
          if (d2 < LINK_DIST * LINK_DIST) {
            const d = Math.sqrt(d2)
            const alpha = (1 - d / LINK_DIST) * 0.26
            ctx.strokeStyle =
              a.magenta && b.magenta
                ? `rgba(255,46,209,${alpha})`
                : `rgba(34,211,238,${alpha})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(ax, ay)
            ctx.lineTo(bx, by)
            ctx.stroke()
          }
        }
      }

      // Nodes
      for (const n of nodes) {
        ctx.fillStyle = n.magenta ? 'rgba(255,46,209,0.7)' : 'rgba(34,211,238,0.6)'
        ctx.beginPath()
        ctx.arc(n.x + n.ox, n.y + n.oy, n.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const step = () => {
      for (const n of nodes) {
        // Constant slow drift, wrapping at the edges
        n.x += n.vx
        n.y += n.vy
        if (n.x < -12) n.x = width + 12
        else if (n.x > width + 12) n.x = -12
        if (n.y < -12) n.y = height + 12
        else if (n.y > height + 12) n.y = -12

        // Subtle cursor repulsion, eased in and out
        const dx = n.x + n.ox - mouse.x
        const dy = n.y + n.oy - mouse.y
        const d2 = dx * dx + dy * dy
        if (d2 < REPEL_DIST * REPEL_DIST && d2 > 0.01) {
          const d = Math.sqrt(d2)
          const push = ((REPEL_DIST - d) / REPEL_DIST) * REPEL_STRENGTH
          n.ox += ((dx / d) * push - n.ox) * 0.08
          n.oy += ((dy / d) * push - n.oy) * 0.08
        } else {
          n.ox *= 0.92
          n.oy *= 0.92
        }
      }
      draw()
      raf = requestAnimationFrame(step)
    }

    const start = () => {
      if (!running) {
        running = true
        raf = requestAnimationFrame(step)
      }
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    const onScroll = () => {
      rect = canvas.getBoundingClientRect()
    }
    const onResize = () => resize()
    const onVisibility = () => {
      if (document.hidden) stop()
      else if (!reduced) start()
    }

    resize()
    setVisible(true)

    if (reduced) {
      // One static frame, no animation, no listeners
      draw()
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    }

    draw()
    start()
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stop()
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 transition-opacity duration-[1200ms] ease-out ${
        visible ? 'opacity-100' : 'opacity-0'
      } ${className}`}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}

'use client'

import React, { useEffect, useState } from 'react'

const LINES = [
  '> reading resume … 98% match',
  '> generating round 01 · resume deep-dive',
  "> follow-up: 'what did YOU build?'",
  '> final verdict: STRONG_HIRE',
]

/**
 * Monospace terminal line that types rotating status lines forever
 * (600ms pause between lines). Under prefers-reduced-motion it renders
 * the first line as a static string.
 */
export default function TerminalTyper({ className = '' }: { className?: string }) {
  const [text, setText] = useState(LINES[0])
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setText(LINES[0])
      return
    }

    setAnimated(true)
    let cancelled = false
    let timer: ReturnType<typeof setTimeout>

    const typeLine = (lineIndex: number) => {
      const line = LINES[lineIndex]
      let chars = 0
      const tick = () => {
        if (cancelled) return
        chars += 1
        setText(line.slice(0, chars))
        if (chars < line.length) {
          timer = setTimeout(tick, 28 + Math.random() * 34)
        } else {
          // Hold the finished line, then 600ms pause before the next one
          timer = setTimeout(() => {
            if (cancelled) return
            setText('>')
            timer = setTimeout(() => {
              if (!cancelled) typeLine((lineIndex + 1) % LINES.length)
            }, 600)
          }, 1500)
        }
      }
      setText('')
      tick()
    }

    typeLine(0)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [])

  return (
    <p
      aria-hidden="true"
      className={`font-data text-sm text-jade-700 dark:text-jade-400/90 ${className}`}
    >
      <span className="whitespace-pre-wrap">{text}</span>
      <span
        className={`ml-0.5 inline-block h-[1em] w-[0.55em] translate-y-[2px] bg-jade-600 dark:bg-jade-400 ${
          animated ? 'terminal-caret' : ''
        }`}
      />
    </p>
  )
}

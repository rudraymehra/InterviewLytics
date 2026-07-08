'use client'

import { useEffect, useState } from 'react'
import { animate, useReducedMotion } from '@/components/landing/motion'

export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]

/**
 * Count a number up from 0 to `target` the first time `active` becomes true.
 * Respects prefers-reduced-motion (jumps straight to the target).
 */
export function useCountUp(target: number, active: boolean, duration = 0.8): number {
  const [value, setValue] = useState(0)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (!active) return
    if (reduce) {
      setValue(target)
      return
    }
    const controls = animate(0, target, {
      duration,
      ease: EASE_OUT,
      onUpdate: (v) => setValue(v),
    })
    return () => controls.stop()
  }, [active, target, duration, reduce])

  return value
}

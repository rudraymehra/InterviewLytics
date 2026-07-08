import React from 'react'

/**
 * Fixed film-grain overlay (inline SVG feTurbulence). Purely decorative:
 * pointer-events-none, sits visually above backgrounds at 3.5% opacity.
 */
export function Grain() {
  return <div aria-hidden="true" className="grain-overlay" />
}

/**
 * A giant blurred neon orb. Position it with className (w/h + inset utilities);
 * the parent section must be `relative` (and usually `overflow-hidden`).
 */
export function Orb({
  className = '',
  magenta = false,
}: {
  className?: string
  magenta?: boolean
}) {
  return (
    <div
      aria-hidden="true"
      className={`orb ${magenta ? 'orb-magenta' : 'orb-cyan'} ${className}`}
    />
  )
}

/**
 * Drop-in ambience for the auth pages: grain + two orbs behind the card.
 * Visual only — no structural or text changes to the page itself.
 */
export function AuthAmbience() {
  return (
    <>
      <Grain />
      <Orb className="h-[480px] w-[480px] -top-48 -left-48" />
      <Orb magenta className="h-[420px] w-[420px] -bottom-44 -right-36" />
    </>
  )
}

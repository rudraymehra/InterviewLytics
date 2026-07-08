import React from 'react'

const ITEMS = [
  'RESUME DEEP-DIVE',
  'CROSS-EXAMINATION',
  'SILENT SCORING',
  'ROLE FIT',
  'FINAL VERDICT',
  'HIRE SIGNAL',
]

function Row({ hidden = false }: { hidden?: boolean }) {
  return (
    <div
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center"
    >
      {ITEMS.map((item) => (
        <React.Fragment key={item}>
          <span className="px-5 text-neutral-400 dark:text-neutral-500">{item}</span>
          <span className="text-jade-600 dark:text-jade-400/70">{'//'}</span>
        </React.Fragment>
      ))}
    </div>
  )
}

/**
 * Full-width monospace ticker. Pure CSS keyframes (translateX loop over
 * duplicated content), pauses on hover, freezes under reduced motion.
 */
export default function Marquee({
  reverse = false,
  duration = 30,
  className = '',
}: {
  reverse?: boolean
  duration?: number
  className?: string
}) {
  return (
    <div
      className={`marquee border-y border-line-light dark:border-line-dark py-3 font-data text-[11px] font-medium uppercase tracking-[0.28em] ${className}`}
    >
      <div
        className="marquee-track"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        <Row />
        <Row hidden />
      </div>
    </div>
  )
}

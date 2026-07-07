"use client"

import React from 'react'
import { motion, MotionProps, AnimatePresence as FramerAnimatePresence } from 'framer-motion'

type ElementTag = keyof JSX.IntrinsicElements

type MotionWrapperProps = {
  as?: ElementTag
  children?: React.ReactNode
  className?: string
} & MotionProps & React.HTMLAttributes<HTMLElement>

const MotionWrapper = React.forwardRef<any, MotionWrapperProps>(function MotionWrapper({ as = 'div', children, className = '', ...props }, ref) {
  const Component: any = (motion as any)[as] ?? motion.div
  return (
    <Component ref={ref} className={className} {...(props as any)}>
      {children}
    </Component>
  )
})

export default MotionWrapper

// Re-export AnimatePresence so other components can import it from this client-only module
export const AnimatePresence = FramerAnimatePresence
// Re-export the framer-motion `motion` proxy so other modules can import from this client-only module
export { motion }

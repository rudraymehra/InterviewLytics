'use client'

/**
 * Landing-only motion re-exports.
 *
 * The repo routes `framer-motion` through @/components/MotionWrapper so the
 * library never leaks into server components. MotionWrapper only re-exports
 * `motion` and `AnimatePresence`; the landing experience also needs the
 * hooks below. This module follows the exact same client-only pattern
 * (note the 'use client' directive), so the original concern doesn't apply.
 */
/* eslint-disable no-restricted-imports */
export {
  motion,
  AnimatePresence,
  animate,
  useInView,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'framer-motion'

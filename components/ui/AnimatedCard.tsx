"use client"

import React from 'react'
import MotionWrapper from '@/components/MotionWrapper'

type AnimatedCardProps = {
  className?: string
  children?: React.ReactNode
  hoverLift?: boolean
  stagger?: number
}

export default function AnimatedCard({ children, className = '', hoverLift = true, stagger = 0 }: AnimatedCardProps) {
  return (
    <MotionWrapper
      as="div"
      className={`${className}`}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: stagger }}
      whileHover={hoverLift ? { y: -6, scale: 1.01 } : undefined}
      viewport={{ once: true }}
    >
      {children}
    </MotionWrapper>
  )
}

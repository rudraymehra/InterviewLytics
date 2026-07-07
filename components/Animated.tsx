"use client"

import React from 'react'
import MotionWrapper from './MotionWrapper'

type AnimatedProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode
}

export default function Animated({ children, className = '', ...props }: AnimatedProps) {
  return (
    <MotionWrapper
      as="div"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
      className={className}
      {...(props as any)}
    >
      {children}
    </MotionWrapper>
  )
}

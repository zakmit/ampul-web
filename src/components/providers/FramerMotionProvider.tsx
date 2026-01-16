'use client'

import { LazyMotion, domAnimation } from 'framer-motion'

interface FramerMotionProviderProps {
  children: React.ReactNode
}

// LazyMotion reduces bundle size by ~60% by loading animation features on demand
// domAnimation includes: animate, exit, initial, transition, variants, whileHover, whileTap, whileInView
// For more features like layout animations, use domMax instead
export default function FramerMotionProvider({ children }: FramerMotionProviderProps) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  )
}
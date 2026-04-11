'use client'

import { motion, type MotionValue } from 'framer-motion'

interface ScrollIndicatorProps {
  opacity: MotionValue<number>
}

export default function ScrollIndicator({ opacity }: ScrollIndicatorProps) {
  return (
    <motion.div
      className="dest-reveal-scroll-hint"
      style={{ opacity }}
      aria-hidden="true"
    >
      <span className="dest-reveal-scroll-text">SCROLL</span>
      <div className="dest-reveal-scroll-line">
        <div className="dest-reveal-scroll-dot" />
      </div>
    </motion.div>
  )
}

'use client'

import { useRef } from 'react'
import {
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'

const DEFAULT_OFFSET = ['start end', 'center center'] as const

const SMOOTHING = {
  stiffness: 120,
  damping: 30,
  mass: 0.55,
  restDelta: 0.0005,
}

export function useScrollReveal() {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: [...DEFAULT_OFFSET],
  })

  // Reveal is one-way: progress only ever increases. Scrolling back up never
  // unravels the reveal, so the user keeps a fully native scroll on the way up.
  const maxProgress = useMotionValue(0)

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (latest > maxProgress.get()) {
      maxProgress.set(latest)
    }
  })

  const progress = useSpring(maxProgress, SMOOTHING)

  const clipP = useTransform(progress, [0, 1], [30, 0])
  const clipQ = useTransform(progress, [0, 1], [70, 100])
  const clipPath = useMotionTemplate`polygon(${clipP}% ${clipP}%, ${clipQ}% ${clipP}%, ${clipQ}% ${clipQ}%, ${clipP}% ${clipQ}%)`

  const imgScale = useTransform(progress, [0, 1], [1.25, 1])
  const textOpacity = useTransform(progress, [0.5, 1], [0, 1])
  const textY = useTransform(progress, [0.5, 1], [30, 0])
  const indicatorOpacity = useTransform(progress, [0, 0.15], [1, 0])

  return {
    containerRef,
    scrollYProgress: progress,
    clipPath,
    imgScale,
    textOpacity,
    textY,
    indicatorOpacity,
  }
}

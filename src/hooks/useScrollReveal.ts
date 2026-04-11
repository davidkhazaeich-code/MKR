'use client'

import { useRef } from 'react'
import { useMotionTemplate, useScroll, useTransform } from 'framer-motion'

const DEFAULT_OFFSET = ['start end', 'center center'] as const

export function useScrollReveal() {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: [...DEFAULT_OFFSET],
  })

  const clipP = useTransform(scrollYProgress, [0, 1], [30, 0])
  const clipQ = useTransform(scrollYProgress, [0, 1], [70, 100])
  const clipPath = useMotionTemplate`polygon(${clipP}% ${clipP}%, ${clipQ}% ${clipP}%, ${clipQ}% ${clipQ}%, ${clipP}% ${clipQ}%)`

  const imgScale = useTransform(scrollYProgress, [0, 1], [1.25, 1])
  const textOpacity = useTransform(scrollYProgress, [0.5, 1], [0, 1])
  const textY = useTransform(scrollYProgress, [0.5, 1], [30, 0])
  const indicatorOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])

  return {
    containerRef,
    scrollYProgress,
    clipPath,
    imgScale,
    textOpacity,
    textY,
    indicatorOpacity,
  }
}

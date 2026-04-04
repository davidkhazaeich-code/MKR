'use client'

import { useRef } from 'react'
import { motion, useMotionTemplate, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'

interface DestinationRevealProps {
  image: string
  alt: string
  label: string
  title: string
  facts: { label: string; value: string }[]
  badges?: string[]
}

export default function DestinationReveal({ image, alt, label, title, facts, badges }: DestinationRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'center center'],
  })

  const clipP = useTransform(scrollYProgress, [0, 1], [30, 0])
  const clipQ = useTransform(scrollYProgress, [0, 1], [70, 100])
  const clipPath = useMotionTemplate`polygon(${clipP}% ${clipP}%, ${clipQ}% ${clipP}%, ${clipQ}% ${clipQ}%, ${clipP}% ${clipQ}%)`

  const imgScale = useTransform(scrollYProgress, [0, 1], [1.25, 1])
  const textOpacity = useTransform(scrollYProgress, [0.5, 1], [0, 1])
  const textY = useTransform(scrollYProgress, [0.5, 1], [30, 0])

  return (
    <div
      ref={containerRef}
      className="dest-reveal-outer"
      style={{ height: 'calc(1400px + 100vh)' }}
    >
      <motion.div
        className="dest-reveal-sticky"
        style={{ clipPath }}
      >
        <motion.div
          className="dest-reveal-img-wrap"
          style={{ scale: imgScale, transformOrigin: '50% 40%' }}
        >
          <Image
            src={image}
            alt={alt}
            fill
            sizes="100vw"
            className="dest-reveal-img"
            priority
          />
        </motion.div>

        <div className="dest-reveal-overlay" aria-hidden="true" />

        <div className="dest-reveal-container">
          <motion.div
            className="dest-reveal-content"
            style={{ opacity: textOpacity, y: textY }}
          >
            <span className="label-tag">{label}</span>
            <h2 dangerouslySetInnerHTML={{ __html: title }} />

            <div className="dest-reveal-facts">
              {facts.map((f, i) => (
                <div key={i} className="dest-reveal-fact">
                  <span className="dest-reveal-fact-label">{f.label}</span>
                  <span className="dest-reveal-fact-value">{f.value}</span>
                </div>
              ))}
            </div>

            {badges && badges.length > 0 && (
              <div className="dest-reveal-badges">
                {badges.map((b, i) => (
                  <span key={i} className="voyage-badge">{b}</span>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

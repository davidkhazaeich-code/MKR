'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import ScrollIndicator from '@/components/ScrollIndicator'

interface DestinationRevealProps {
  image: string
  alt: string
  label: string
  title: string
  facts: { label: string; value: string }[]
  badges?: string[]
}

export default function DestinationReveal({ image, alt, label, title, facts, badges }: DestinationRevealProps) {
  const { containerRef, clipPath, imgScale, textOpacity, textY, indicatorOpacity } = useScrollReveal()

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

        <ScrollIndicator opacity={indicatorOpacity} />

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

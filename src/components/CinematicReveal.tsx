'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import ScrollIndicator from '@/components/ScrollIndicator'

interface CinematicRevealProps {
  image: string
  alt: string
  label?: string
  title?: string
  tagline?: string
  className?: string
}

export default function CinematicReveal({ image, alt, label, title, tagline, className }: CinematicRevealProps) {
  const { containerRef, clipPath, imgScale, textOpacity, textY, indicatorOpacity } = useScrollReveal()

  const hasContent = label || title || tagline

  return (
    <div
      ref={containerRef}
      className={`cine-reveal-outer${className ? ` ${className}` : ''}`}
    >
      <motion.div
        className="cine-reveal-sticky"
        style={{ clipPath }}
      >
        <motion.div
          className="cine-reveal-img-wrap"
          style={{ scale: imgScale, transformOrigin: '50% 40%' }}
        >
          <Image
            src={image}
            alt={alt}
            fill
            sizes="100vw"
            className="cine-reveal-img"
          />
        </motion.div>

        <div className="cine-reveal-overlay" aria-hidden="true" />

        <ScrollIndicator opacity={indicatorOpacity} />

        {hasContent && (
          <div className="cine-reveal-container">
            <motion.div
              className="cine-reveal-content"
              style={{ opacity: textOpacity, y: textY }}
            >
              {label && <span className="label-tag">{label}</span>}
              {title && <h3 dangerouslySetInnerHTML={{ __html: title }} />}
              {tagline && <p className="cine-reveal-tagline">{tagline}</p>}
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

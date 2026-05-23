'use client'

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
  const { containerRef } = useScrollReveal()
  const hasContent = label || title || tagline

  return (
    <div
      ref={containerRef}
      className={`cine-reveal-outer${className ? ` ${className}` : ''}`}
      data-scroll-section
      data-scroll-label={label || (title ? title.replace(/<[^>]+>/g, '') : 'Image')}
    >
      <div className="cine-reveal-sticky">
        <div className="cine-reveal-img-wrap" style={{ transformOrigin: '50% 40%' }}>
          <Image
            src={image}
            alt={alt}
            fill
            sizes="100vw"
            className="cine-reveal-img"
          />
        </div>

        <div className="cine-reveal-overlay" aria-hidden="true" />

        <ScrollIndicator />

        {hasContent && (
          <div className="cine-reveal-container">
            <div className="cine-reveal-content">
              {label && <span className="label-tag">{label}</span>}
              {title && <h3 dangerouslySetInnerHTML={{ __html: title }} />}
              {tagline && <p className="cine-reveal-tagline">{tagline}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

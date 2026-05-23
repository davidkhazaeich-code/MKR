'use client'

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
  const { containerRef } = useScrollReveal()

  return (
    <div
      ref={containerRef}
      className="dest-reveal-outer"
      style={{ height: 'calc(1400px + 100vh)' }}
    >
      <div className="dest-reveal-sticky">
        <div className="dest-reveal-img-wrap" style={{ transformOrigin: '50% 40%' }}>
          <Image
            src={image}
            alt={alt}
            fill
            sizes="100vw"
            className="dest-reveal-img"
            priority
          />
        </div>

        <div className="dest-reveal-overlay" aria-hidden="true" />

        <ScrollIndicator />

        <div className="dest-reveal-container">
          <div className="dest-reveal-content">
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
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useRef, useCallback } from 'react'

interface StoryCardProps {
  prenom: string
  discipline: string
  session: string
  destination: string
}

export default function StoryCard({ prenom, discipline, session, destination }: StoryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const bgImage = destination === 'Tchétchénie'
    ? '/images/environment/grozny-city.webp'
    : '/images/environment/dagestan-panorama.webp'

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return
    const { default: html2canvas } = await import('html2canvas')
    const canvas = await html2canvas(cardRef.current, {
      width: 1080,
      height: 1920,
      scale: 1,
      useCORS: true,
      backgroundColor: '#0E0E0E',
    })
    const link = document.createElement('a')
    link.download = `mkr-${prenom.toLowerCase()}-story.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [prenom])

  return (
    <div className="story-card-wrap">
      <div className="story-card">
      <div className="story-card-inner" ref={cardRef}>
        {/* Background image */}
        <div className="story-card-bg" style={{ backgroundImage: `url(${bgImage})` }} />

        {/* Top: logo + label */}
        <div className="story-card-top">
          <img src="/logo-white.webp" alt="" className="story-card-logo" />
          <span className="story-card-badge">CAUCASIAN CAMP</span>
        </div>

        {/* Center: name + destination */}
        <div className="story-card-center">
          <span className="story-card-label">INSCRIPTION RECUE</span>
          <h2 className="story-card-name">{prenom.toUpperCase()}</h2>
          <p className="story-card-tagline">
            PART {destination === 'Tchétchénie' ? 'EN' : 'AU'} <span>{destination.toUpperCase()}</span>
          </p>
        </div>

        {/* Bottom: session + discipline + handle */}
        <div className="story-card-bottom">
          <div className="story-card-meta">
            <div className="story-card-meta-item">
              <span className="story-card-meta-label">SESSION</span>
              <span className="story-card-meta-value">{session.toUpperCase()}</span>
            </div>
            <div className="story-card-meta-divider" />
            <div className="story-card-meta-item">
              <span className="story-card-meta-label">DISCIPLINE</span>
              <span className="story-card-meta-value">{discipline.toUpperCase()}</span>
            </div>
          </div>
          <div className="story-card-handle">@mkrcaucasiancamp</div>
        </div>
      </div>
      </div>

      <button className="story-card-download" onClick={handleDownload} type="button">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
          <path d="M10 3v10m0 0l-3.5-3.5M10 13l3.5-3.5M3 16h14" />
        </svg>
        TELECHARGER POUR INSTAGRAM
      </button>
    </div>
  )
}

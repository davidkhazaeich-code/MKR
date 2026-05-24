'use client'

import { useRef, useCallback } from 'react'

type CampDiscipline = 'lutte' | 'mma' | 'combo_quote' | ''

interface StoryCardProps {
  prenom: string
  campDiscipline?: CampDiscipline
  session: string
}

const CAMP_PRESETS: Record<Exclude<CampDiscipline, ''>, {
  disciplineLabel: string
  preposition: string
  destination: string
  bgImage: string
  filenameSuffix: string
  tight?: boolean
}> = {
  lutte: {
    disciplineLabel: 'LUTTE',
    preposition: 'AU',
    destination: 'DAGHESTAN',
    bgImage: '/images/environment/dagestan-panorama.webp',
    filenameSuffix: 'lutte-daghestan',
  },
  mma: {
    disciplineLabel: 'MMA',
    preposition: 'EN',
    destination: 'TCHÉTCHÉNIE',
    bgImage: '/images/environment/vainakh-towers.webp',
    filenameSuffix: 'mma-tchetchenie',
  },
  combo_quote: {
    disciplineLabel: 'COMBO LUTTE + MMA',
    preposition: 'AU',
    destination: 'DAGHESTAN + TCHÉTCHÉNIE',
    bgImage: '/images/environment/canyon-sulak.webp',
    filenameSuffix: 'combo-caucase',
    tight: true,
  },
}

export default function StoryCard({ prenom, campDiscipline, session }: StoryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const preset = CAMP_PRESETS[campDiscipline || 'lutte']

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
    link.download = `mkr-${prenom.toLowerCase()}-${preset.filenameSuffix}-story.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [prenom, preset.filenameSuffix])

  return (
    <div className="story-card-wrap">
      <div className="story-card">
      <div className="story-card-inner" ref={cardRef}>
        {/* Background image */}
        <div className="story-card-bg" style={{ backgroundImage: `url(${preset.bgImage})` }} />

        {/* Top: logo */}
        <div className="story-card-top">
          <img src="/logo-white.webp" alt="MKR Caucasian Camp" className="story-card-logo" />
        </div>

        {/* Center: name + destination */}
        <div className="story-card-center">
          <span className="story-card-label">INSCRIPTION RECUE</span>
          <h2 className="story-card-name">{prenom.toUpperCase()}</h2>
          <p
            className="story-card-tagline"
            style={preset.tight ? { fontSize: 36, lineHeight: 1.15 } : undefined}
          >
            PART {preset.preposition} <span>{preset.destination}</span>
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
              <span className="story-card-meta-value">{preset.disciplineLabel}</span>
            </div>
          </div>
          <div className="story-card-handle">@mkrcamp</div>
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

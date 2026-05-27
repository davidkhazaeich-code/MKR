'use client'

import { useRef, useCallback } from 'react'
import { useLocale, useTranslations } from 'next-intl'

type CampDiscipline = 'lutte' | 'mma' | 'combo_quote' | ''

interface StoryCardProps {
  prenom: string
  campDiscipline?: CampDiscipline
  session: string
}

const CAMP_PRESETS: Record<Exclude<CampDiscipline, ''>, {
  bgImage: string
  filenameSuffix: string
  tight?: boolean
}> = {
  lutte: {
    bgImage: '/images/environment/dagestan-panorama.webp',
    filenameSuffix: 'lutte-daghestan',
  },
  mma: {
    bgImage: '/images/environment/vainakh-towers.webp',
    filenameSuffix: 'mma-tchetchenie',
  },
  combo_quote: {
    bgImage: '/images/environment/canyon-sulak.webp',
    filenameSuffix: 'combo-caucase',
    tight: true,
  },
}

export default function StoryCard({ prenom, campDiscipline, session }: StoryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const locale = useLocale()
  const t = useTranslations('inscription.story_card')
  const disciplineKey = (campDiscipline || 'lutte') as Exclude<CampDiscipline, ''>
  const preset = CAMP_PRESETS[disciplineKey]

  const disciplineLabel = t(`disciplines.${disciplineKey}.label`)
  const preposition = t(`disciplines.${disciplineKey}.preposition`)
  const destination = t(`disciplines.${disciplineKey}.destination`)

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
    const safePrenom = prenom.toLocaleLowerCase(locale === 'en' ? 'en-US' : 'fr-FR')
    link.download = `mkr-${safePrenom}-${preset.filenameSuffix}-story.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [prenom, preset.filenameSuffix, locale])

  return (
    <div className="story-card-wrap">
      <div className="story-card">
      <div className="story-card-inner" ref={cardRef}>
        {/* Background image */}
        <div className="story-card-bg" style={{ backgroundImage: `url(${preset.bgImage})` }} />

        {/* Top: logo */}
        <div className="story-card-top">
          <img src="/logo-white.webp" alt={t('logo_alt')} className="story-card-logo" />
        </div>

        {/* Center: name + destination */}
        <div className="story-card-center">
          <span className="story-card-label">{t('label')}</span>
          <h2 className="story-card-name">{prenom.toLocaleUpperCase(locale === 'en' ? 'en-US' : 'fr-FR')}</h2>
          <p
            className="story-card-tagline"
            style={preset.tight ? { fontSize: 36, lineHeight: 1.15 } : undefined}
          >
            {locale === 'en' ? 'GOES TO' : `PART ${preposition}`} <span>{destination}</span>
          </p>
        </div>

        {/* Bottom: session + discipline + handle */}
        <div className="story-card-bottom">
          <div className="story-card-meta">
            <div className="story-card-meta-item">
              <span className="story-card-meta-label">{t('meta_session')}</span>
              <span className="story-card-meta-value">{session.toLocaleUpperCase(locale === 'en' ? 'en-US' : 'fr-FR')}</span>
            </div>
            <div className="story-card-meta-divider" />
            <div className="story-card-meta-item">
              <span className="story-card-meta-label">{t('meta_discipline')}</span>
              <span className="story-card-meta-value">{disciplineLabel}</span>
            </div>
          </div>
          <div className="story-card-handle">{t('handle')}</div>
        </div>
      </div>
      </div>

      <button className="story-card-download" onClick={handleDownload} type="button">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
          <path d="M10 3v10m0 0l-3.5-3.5M10 13l3.5-3.5M3 16h14" />
        </svg>
        {t('download_button')}
      </button>
    </div>
  )
}

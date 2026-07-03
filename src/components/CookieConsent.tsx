'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

// Bandeau de consentement cookies pilotant Google Consent Mode v2.
// Par defaut (script <head> du layout) tous les signaux sont 'denied' : le tag
// gtag/Ads mesure alors sans cookies (modelisation). Ce bandeau permet a
// l'utilisateur d'accepter (passe les signaux a 'granted') ou de refuser
// (confirme 'denied'). Le choix est memorise dans le cookie `mkr_consent` 180j.

const COOKIE = 'mkr_consent'
const MAX_AGE = 60 * 60 * 24 * 180 // 180 jours

type Consent = 'granted' | 'denied'

function readConsent(): Consent | null {
  if (typeof document === 'undefined') return null
  const entry = document.cookie.split('; ').find((c) => c.startsWith(`${COOKIE}=`))
  if (!entry) return null
  const value = entry.slice(COOKIE.length + 1)
  return value === 'granted' || value === 'denied' ? value : null
}

function persist(value: Consent) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${COOKIE}=${value}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${secure}`
}

function updateConsent(value: Consent) {
  const w = window as unknown as { gtag?: (...args: unknown[]) => void }
  if (typeof w.gtag !== 'function') return
  w.gtag('consent', 'update', {
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
    analytics_storage: value,
  })
}

export default function CookieConsent() {
  const t = useTranslations('common.cookie_consent')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // On n'affiche le bandeau que si aucun choix n'a encore ete fait.
    if (readConsent() === null) setVisible(true)
  }, [])

  const choose = (value: Consent) => {
    persist(value)
    updateConsent(value)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="cookie-consent" role="dialog" aria-label={t('aria')} aria-live="polite">
      <p className="cookie-consent-text">
        {t('message')}{' '}
        <Link href="/politique-de-confidentialite" className="cookie-consent-link">
          {t('learn_more')}
        </Link>
      </p>
      <div className="cookie-consent-actions">
        <button
          type="button"
          className="cookie-consent-btn cookie-consent-btn--refuse"
          onClick={() => choose('denied')}
        >
          {t('refuse')}
        </button>
        <button
          type="button"
          className="cookie-consent-btn cookie-consent-btn--accept"
          onClick={() => choose('granted')}
        >
          {t('accept')}
        </button>
      </div>
    </div>
  )
}

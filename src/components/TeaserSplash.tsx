'use client'

/*
 * TeaserSplash — overlay teaser 15s joué UNE SEULE FOIS pour les nouveaux visiteurs.
 *
 * Cycle de vie :
 *  - Actif jusqu'au END_DATE (auto-désactivation). Après cette date le composant
 *    retourne null instantanément, plus aucun impact runtime ni SEO.
 *  - localStorage flag `STORAGE_KEY` empêche la rejouer après le premier visionnage.
 *  - prefers-reduced-motion → skip automatique (et flag posé).
 *  - Skip manuel via bouton (apparaît après 3s) ou touche Échap.
 *
 * Pour retirer définitivement (≥ END_DATE) :
 *  1. Supprimer la ligne `<TeaserSplash />` dans `app/(site)/layout.tsx`
 *  2. Supprimer l'import en tête de ce même fichier
 *  3. Supprimer ce composant + les 2 MP4 dans `public/videos/teaser/`
 *
 * SEO : composant 100% client (useEffect mount), retourne null au premier render
 * serveur. Le contenu réel de la page reste accessible aux crawlers (overlay
 * z-index 9999 mais DOM identique). Aucune modif des meta/canonical.
 */

import { useEffect, useRef, useState } from 'react'

const END_DATE = new Date('2026-05-27T00:00:00Z')
const STORAGE_KEY = 'mkr_teaser_seen_2026_05_v1'
const VIDEO_LENGTH_MS = 15500
const SKIP_DELAY_MS = 3000

const VIDEO_LANDSCAPE = '/videos/teaser/teaser-loading-desktop-15s.mp4'
const VIDEO_PORTRAIT = '/videos/teaser/teaser-loading-story-15s.mp4'

export default function TeaserSplash() {
  const [show, setShow] = useState(false)
  const [canSkip, setCanSkip] = useState(false)
  const [src, setSrc] = useState<string>('')
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (Date.now() >= END_DATE.getTime()) return
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') return
    } catch { return }

    if (typeof window.matchMedia === 'function') {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced) {
        try { localStorage.setItem(STORAGE_KEY, '1') } catch {}
        return
      }
      const isLandscape = window.matchMedia('(orientation: landscape)').matches
      setSrc(isLandscape ? VIDEO_LANDSCAPE : VIDEO_PORTRAIT)
    } else {
      setSrc(VIDEO_LANDSCAPE)
    }

    setShow(true)
    document.body.style.overflow = 'hidden'

    const skipTimer = window.setTimeout(() => setCanSkip(true), SKIP_DELAY_MS)
    const dismissTimer = window.setTimeout(() => dismiss(), VIDEO_LENGTH_MS)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      window.clearTimeout(skipTimer)
      window.clearTimeout(dismissTimer)
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, '1') } catch {}
    document.body.style.overflow = ''
    setShow(false)
  }

  if (!show || !src) return null

  return (
    <div
      role="dialog"
      aria-label="Présentation MKR Caucasian Camp"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#0E0E0E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={dismiss}
        onError={dismiss}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          background: '#0E0E0E',
        }}
        src={src}
      />

      {canSkip && (
        <button
          type="button"
          onClick={dismiss}
          aria-label="Passer l'intro"
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            background: 'rgba(255, 255, 255, 0.08)',
            color: 'rgba(248, 248, 248, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            padding: '10px 18px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: '12px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            transition: 'background 200ms ease, border-color 200ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)'
            e.currentTarget.style.borderColor = 'rgba(200, 75, 49, 0.6)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'
          }}
        >
          Passer
        </button>
      )}
    </div>
  )
}

'use client'

/*
 * TeaserSplash — overlay teaser 15s joué UNE SEULE FOIS pour les nouveaux visiteurs.
 *
 * Sequence : Teaser (15s, skip dispo après 2s) → SiteLoader MKR (animation existante) → site.
 * SiteLoader attend le custom event `mkr-teaser-end` avant de demarrer sa sequence.
 *
 * Cycle de vie :
 *  - Actif jusqu'au END_DATE (auto-désactivation). Apres cette date le composant
 *    retourne null instantanement, plus aucun impact runtime ni SEO.
 *  - localStorage flag `STORAGE_KEY` empeche la rejouer apres le premier visionnage.
 *  - prefers-reduced-motion → skip automatique (flag pose + event emis pour SiteLoader).
 *  - Skip manuel : un bouton "Passer l'intro" apparait apres SKIP_DELAY_MS pour
 *    laisser le visiteur ressentir le teaser avant de pouvoir l'esquiver.
 */

import { useEffect, useRef, useState } from 'react'

const END_DATE = new Date('2026-05-27T00:00:00Z')
const STORAGE_KEY = 'mkr_teaser_seen_2026_05_v1'
const VIDEO_LENGTH_MS = 15500
const SKIP_DELAY_MS = 2000
const TEASER_END_EVENT = 'mkr-teaser-end'

const VIDEO_LANDSCAPE = '/videos/teaser/teaser-loading-desktop-15s.mp4'
const VIDEO_PORTRAIT = '/videos/teaser/teaser-loading-story-15s.mp4'

function emitTeaserEnd() {
  document.documentElement.removeAttribute('data-teaser-active')
  window.dispatchEvent(new CustomEvent(TEASER_END_EVENT))
}

export default function TeaserSplash() {
  const [show, setShow] = useState(false)
  const [src, setSrc] = useState<string>('')
  const [canSkip, setCanSkip] = useState(false)
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
        // Skip silencieux : pas d'event car le teaser n'a jamais demarre, le SiteLoader
        // doit demarrer immediatement comme d'habitude. Le marker n'a pas ete pose.
        return
      }
      const isLandscape = window.matchMedia('(orientation: landscape)').matches
      setSrc(isLandscape ? VIDEO_LANDSCAPE : VIDEO_PORTRAIT)
    } else {
      setSrc(VIDEO_LANDSCAPE)
    }

    // Marker pour que SiteLoader sache qu'il doit attendre.
    document.documentElement.setAttribute('data-teaser-active', '1')
    setShow(true)
    document.body.style.overflow = 'hidden'

    // Filet de securite : si la video ne joue pas (autoplay bloque, erreur reseau),
    // on dismiss apres VIDEO_LENGTH_MS pour ne pas bloquer le visiteur.
    const dismissTimer = window.setTimeout(() => dismiss(), VIDEO_LENGTH_MS)
    const skipTimer = window.setTimeout(() => setCanSkip(true), SKIP_DELAY_MS)

    return () => {
      window.clearTimeout(dismissTimer)
      window.clearTimeout(skipTimer)
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, '1') } catch {}
    document.body.style.overflow = ''
    emitTeaserEnd()
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
      <button
        type="button"
        onClick={dismiss}
        aria-label="Passer l'intro"
        style={{
          position: 'absolute',
          right: 'max(20px, env(safe-area-inset-right))',
          bottom: 'max(24px, env(safe-area-inset-bottom))',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 16px',
          borderRadius: 999,
          border: '1px solid rgba(248, 248, 248, 0.28)',
          background: 'rgba(14, 14, 14, 0.55)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          color: 'rgba(248, 248, 248, 0.92)',
          fontFamily: 'inherit',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          cursor: canSkip ? 'pointer' : 'default',
          opacity: canSkip ? 1 : 0,
          pointerEvents: canSkip ? 'auto' : 'none',
          transform: canSkip ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
        }}
      >
        Passer l&apos;intro
        <span aria-hidden="true" style={{ fontSize: 14, lineHeight: 1 }}>→</span>
      </button>
    </div>
  )
}

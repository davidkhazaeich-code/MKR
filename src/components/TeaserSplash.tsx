'use client'

/*
 * TeaserSplash — overlay teaser 15s joué UNE SEULE FOIS pour les nouveaux visiteurs.
 *
 * Sequence : Teaser (15s, sans skip) → SiteLoader MKR (animation existante) → site.
 * SiteLoader attend le custom event `mkr-teaser-end` avant de demarrer sa sequence.
 *
 * Cycle de vie :
 *  - Actif jusqu'au END_DATE (auto-désactivation). Apres cette date le composant
 *    retourne null instantanement, plus aucun impact runtime ni SEO.
 *  - localStorage flag `STORAGE_KEY` empeche la rejouer apres le premier visionnage.
 *  - prefers-reduced-motion → skip automatique (flag pose + event emis pour SiteLoader).
 *  - Pas de skip manuel : le visiteur ne le voit qu'une seule fois, on impose les 15s.
 *
 * Pour retirer definitivement (≥ END_DATE) :
 *  1. Supprimer la ligne `<TeaserSplash />` dans `app/(site)/layout.tsx`
 *  2. Supprimer l'import en tete de ce meme fichier
 *  3. Supprimer ce composant + les 2 MP4 dans `public/videos/teaser/`
 *  4. Retirer la branche `data-teaser-active` dans `SiteLoader.tsx` (cleanup)
 *
 * SEO : composant 100% client (useEffect mount), retourne null au premier render
 * serveur. Le contenu reel de la page reste accessible aux crawlers (overlay
 * z-index 9999 mais DOM identique). Aucune modif des meta/canonical.
 */

import { useEffect, useRef, useState } from 'react'

const END_DATE = new Date('2026-05-27T00:00:00Z')
const STORAGE_KEY = 'mkr_teaser_seen_2026_05_v1'
const VIDEO_LENGTH_MS = 15500
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

    return () => {
      window.clearTimeout(dismissTimer)
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
    </div>
  )
}

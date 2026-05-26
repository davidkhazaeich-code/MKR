# Intégration vidéo « Antoine parcours » sur la page MMA — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Intégrer la vidéo verticale 9:16 d'Antoine Petit-Jean (montage 54s entraînement MMA à Grozny) sur la page `/programme/mma`, puis réutiliser le composant sur `/temoignages` et la homepage, avec un niveau d'exécution UX/UI premium (frame cinématographique, micro-animations, timeline interactive sync vidéo, glassmorphism).

**Architecture:** Nouveau composant client `VerticalVideoSplit.tsx` avec layout split (vidéo gauche + storytelling droite). Triple usage piloté par props. Cohabite avec `VideoModal.tsx` existant (réutilisé pour le clic plein écran). Assets vidéo encodés en MP4 H.264 + WebM VP9 avec poster JPG, autoplay mute + IntersectionObserver pour économie CPU.

**Tech Stack:** Next.js 16.2.2 + TypeScript + CSS vanilla (`globals.css`) + Remix Icon (`Icon.tsx` wrapper) + ffmpeg (encodage local) + Playwright (smoke test optionnel).

**Spec source :** `docs/superpowers/specs/2026-05-26-video-antoine-parcours-mma-design.md`

---

## File Structure

### Fichiers à créer
| Fichier | Responsabilité |
|---|---|
| `public/videos/testimonials/antoine-parcours.mp4` | Asset vidéo MP4 H.264, 1080×1920, ~18-22 MB |
| `public/videos/testimonials/antoine-parcours.webm` | Asset vidéo WebM VP9, 1080×1920, ~12-16 MB |
| `public/videos/testimonials/antoine-parcours-poster.jpg` | Poster JPG 1080×1920, frame à 1s, ~80-150 KB |
| `src/components/VerticalVideoSplit.tsx` | Composant client : video player + overlays + timeline + bloc texte |
| `src/data/antoine-parcours.ts` | Source unique des props (label, title, moments, etc.) — single source of truth pour les 3 surfaces |

### Fichiers à modifier
| Fichier | Modification |
|---|---|
| `src/components/Icon.tsx` | Ajouter 3 icônes : `volume-on`, `volume-off`, `fullscreen` |
| `src/app/globals.css` | Ajouter ~250 lignes CSS sous nouvelle section `/* Vertical Video Split */` |
| `src/app/(site)/programme/mma/page.tsx` | Insérer `<VerticalVideoSplit>` entre PageHero et `<div className="inner"><TldrBox>` |
| `src/app/(site)/temoignages/page.tsx` | Insérer `<VerticalVideoSplit>` (featured) avant `<VideoTestimonialsGrid>` + label séparateur |
| `src/app/(site)/page.tsx` | Dynamic-import `<VerticalVideoSplit>` entre `<Testimonials>` et `<VoyageReveal>` |
| `SITEMAP.md` | Sections §1 (mma + temoignages + homepage), §6 quick lookup, §6bis propagation map |

### Pas modifié
- `src/components/VideoModal.tsx` : réutilisé tel quel via props compatibles (src, poster, title, subtitle, onClose)

---

## Tâche 0 : Préparer la session

- [ ] **0.1 Vérifier qu'on est bien sur `main`, working tree propre**

```bash
cd "/Users/davidkhazaei/Documents/Client/DKDP.ch/CLAUDE RESSOURCES/DEV SPACE/clients Claude/MKR caucasian camp/nextjs"
git status
git branch --show-current
```
Expected : branche `main`, working tree clean (no uncommitted changes). Si dirty, demander à David avant de continuer.

- [ ] **0.2 Confirmer que ffmpeg est disponible**

```bash
which ffmpeg && ffmpeg -version | head -1
```
Expected : chemin affiché + version (≥4.x). Si absent : `brew install ffmpeg` puis re-tester.

- [ ] **0.3 Confirmer que le dossier vidéos source existe**

```bash
ls -la "/Users/davidkhazaei/Documents/Client/DKDP.ch/CLAUDE RESSOURCES/DEV SPACE/clients Claude/MKR caucasian camp/Images Ruslan/Testimonie/VIDEO - Antoine parcous.mp4"
```
Expected : fichier listé, ~104 MB. Si absent : stop, demander à David.

---

## Tâche 1 : Encoder les assets vidéo

**Files:**
- Create: `public/videos/testimonials/antoine-parcours.mp4`
- Create: `public/videos/testimonials/antoine-parcours.webm`
- Create: `public/videos/testimonials/antoine-parcours-poster.jpg`

- [ ] **1.1 Définir variables shell**

```bash
SRC="/Users/davidkhazaei/Documents/Client/DKDP.ch/CLAUDE RESSOURCES/DEV SPACE/clients Claude/MKR caucasian camp/Images Ruslan/Testimonie/VIDEO - Antoine parcous.mp4"
DST="/Users/davidkhazaei/Documents/Client/DKDP.ch/CLAUDE RESSOURCES/DEV SPACE/clients Claude/MKR caucasian camp/nextjs/public/videos/testimonials"
```

- [ ] **1.2 Encoder MP4 H.264 (Safari/iOS) — durée ~2 min**

```bash
ffmpeg -y -i "$SRC" -vf "crop=1080:1920" -c:v libx264 -preset slow -crf 24 \
  -c:a aac -b:a 128k -movflags +faststart "$DST/antoine-parcours.mp4"
```
Expected : fichier généré, taille 18-22 MB. Si la commande échoue avec "Invalid argument" (source plus petite que la cible), fallback :
```bash
ffmpeg -y -i "$SRC" -vf "pad=1080:1920:0:3:black" -c:v libx264 -preset slow -crf 24 \
  -c:a aac -b:a 128k -movflags +faststart "$DST/antoine-parcours.mp4"
```

- [ ] **1.3 Vérifier la taille du MP4**

```bash
ls -lh "$DST/antoine-parcours.mp4"
```
Expected : entre 15 MB et 30 MB. Si >30 MB, augmenter CRF à 26 et ré-encoder.

- [ ] **1.4 Encoder WebM VP9 (Chrome/Firefox) — durée ~3-5 min**

```bash
ffmpeg -y -i "$SRC" -vf "crop=1080:1920" -c:v libvpx-vp9 -crf 32 -b:v 0 \
  -c:a libopus -b:a 96k "$DST/antoine-parcours.webm"
```
Expected : fichier généré, taille 12-16 MB. Même fallback pad si crop échoue.

- [ ] **1.5 Vérifier la taille du WebM**

```bash
ls -lh "$DST/antoine-parcours.webm"
```
Expected : entre 10 MB et 20 MB.

- [ ] **1.6 Générer le poster JPG (frame à 1s)**

```bash
ffmpeg -y -ss 1 -i "$SRC" -vframes 1 -vf "crop=1080:1920" -q:v 4 \
  "$DST/antoine-parcours-poster.jpg"
```
Expected : fichier généré, taille 80-150 KB.

- [ ] **1.7 Vérifier que le poster s'affiche correctement**

```bash
open "$DST/antoine-parcours-poster.jpg"
```
Expected : aperçu macOS affiche une frame de la vidéo, pas de zone vide ou de glitch.

- [ ] **1.8 Commit assets vidéo**

```bash
cd "/Users/davidkhazaei/Documents/Client/DKDP.ch/CLAUDE RESSOURCES/DEV SPACE/clients Claude/MKR caucasian camp/nextjs"
git add public/videos/testimonials/antoine-parcours.mp4 public/videos/testimonials/antoine-parcours.webm public/videos/testimonials/antoine-parcours-poster.jpg
git commit -m "feat(mma): add Antoine parcours video assets (MP4 + WebM + poster)"
```

---

## Tâche 2 : Ajouter les 3 nouvelles icônes au wrapper Icon.tsx

**Files:**
- Modify: `src/components/Icon.tsx`

- [ ] **2.1 Lire la section imports de Icon.tsx pour comprendre le pattern**

Lis les lignes 16-95 du fichier `src/components/Icon.tsx`. Les imports suivent ce pattern :
```ts
import { RiCheckLine, RiCloseLine, ... } from '@remixicon/react'
```
Le `MAP` à la fin associe `'kebab-case'` → composant. Le `IconName` type est généré depuis les clés du MAP.

- [ ] **2.2 Ajouter 3 imports Remix Icon dans le bloc d'imports**

Dans `src/components/Icon.tsx`, ajouter ces lignes au bloc `import { ... } from '@remixicon/react'` (ordre alphabétique préservé selon le pattern existant) :
```ts
  RiVolumeUpFill,
  RiVolumeMuteFill,
  RiFullscreenLine,
```

- [ ] **2.3 Ajouter 3 entrées au MAP**

Dans le `const MAP` du même fichier, ajouter sous la section appropriée (créer une nouvelle section commentée `// media controls` après la section `// content`) :
```ts
  // media controls
  'volume-on': RiVolumeUpFill,
  'volume-off': RiVolumeMuteFill,
  'fullscreen': RiFullscreenLine,
```

- [ ] **2.4 Vérifier que le type IconName s'auto-met-à-jour**

Si `IconName` est défini comme `type IconName = keyof typeof MAP`, rien à faire. Sinon, ajouter `'volume-on' | 'volume-off' | 'fullscreen'` à l'union manuelle. Vérifier en lisant la fin du fichier.

- [ ] **2.5 Smoke test compilation TypeScript**

```bash
cd "/Users/davidkhazaei/Documents/Client/DKDP.ch/CLAUDE RESSOURCES/DEV SPACE/clients Claude/MKR caucasian camp/nextjs"
npx tsc --noEmit 2>&1 | head -20
```
Expected : pas d'erreur liée à Icon.tsx ou aux 3 nouveaux noms. Si erreur "Cannot find name 'RiVolumeUpFill'", vérifier que `@remixicon/react` exporte bien ces icônes (cf. catalogue https://remixicon.com).

- [ ] **2.6 Commit**

```bash
git add src/components/Icon.tsx
git commit -m "feat(icon): add volume-on, volume-off, fullscreen icons for video player"
```

---

## Tâche 3 : Créer le data file source unique

**Files:**
- Create: `src/data/antoine-parcours.ts`

- [ ] **3.1 Créer le fichier avec la copy pour les 3 surfaces**

Créer `src/data/antoine-parcours.ts` avec ce contenu :

```ts
/**
 * Source unique pour le composant <VerticalVideoSplit /> "Antoine parcours".
 * Utilisé sur /programme/mma (variant 'mma'), /temoignages (variant 'temoignages')
 * et la homepage (variant 'home'). Les 3 surfaces partagent les assets vidéo
 * et la timeline de moments, mais ont des label/title/intro/CTA distincts.
 */

export interface VideoMoment {
  timestamp: string
  timeSeconds: number
  text: string
}

export interface AntoineParcoursVariant {
  label: string
  title: string
  intro: string
  primaryCta: { href: string; label: string }
  secondaryCta?: { href: string; label: string }
}

export const ANTOINE_PARCOURS_ASSETS = {
  src: '/videos/testimonials/antoine-parcours.mp4',
  webmSrc: '/videos/testimonials/antoine-parcours.webm',
  poster: '/videos/testimonials/antoine-parcours-poster.jpg',
  duration: '0:54',
  identityLabel: 'ANTOINE · MKR DE LA SESSION ÉTÉ',
} as const

// Timestamps indicatifs — à ajuster après visionnage de la vidéo encodée
export const ANTOINE_PARCOURS_MOMENTS: VideoMoment[] = [
  { timestamp: '00:06', timeSeconds: 6,  text: 'Sparring avec un combattant Akhmat' },
  { timestamp: '00:18', timeSeconds: 18, text: 'Travail de pads avec un coach Grozny' },
  { timestamp: '00:31', timeSeconds: 31, text: 'Drills clinch dans la salle principale' },
  { timestamp: '00:42', timeSeconds: 42, text: 'Débrief technique individuel' },
  { timestamp: '00:50', timeSeconds: 50, text: 'Vie au camp · hors tapis' },
]

export const ANTOINE_PARCOURS_VARIANTS: Record<'mma' | 'temoignages' | 'home', AntoineParcoursVariant> = {
  mma: {
    label: 'APERÇU DE TON CAMP',
    title: 'CE QUE TU VAS VIVRE EN TCHÉTCHÉNIE',
    intro: "Antoine, MKR de la session précédente, a filmé ses moments forts à Grozny. 54 secondes pour comprendre ce qu'est un camp MMA dans l'écurie Akhmat.",
    primaryCta: { href: '/inscription?type=session', label: 'POSTULER · MMA TCHÉTCHÉNIE' },
  },
  temoignages: {
    label: 'EN VIDÉO',
    title: "LE CAMP D'ANTOINE EN 54 SECONDES",
    intro: 'Antoine a filmé ses moments forts en Tchétchénie. Sparring, technique, débrief, vie au camp.',
    primaryCta: { href: '/inscription?type=session', label: 'POSTULER À UN CAMP' },
    secondaryCta: { href: '/programme/mma', label: 'VOIR LE PROGRAMME MMA' },
  },
  home: {
    label: 'EN VIDÉO',
    title: "LE CAMP D'ANTOINE EN 54 SECONDES",
    intro: 'Antoine a filmé ses moments forts en Tchétchénie. Sparring, technique, débrief, vie au camp.',
    primaryCta: { href: '/inscription?type=session', label: 'POSTULER À UN CAMP' },
    secondaryCta: { href: '/programme/mma', label: 'VOIR LE PROGRAMME MMA' },
  },
}
```

- [ ] **3.2 Vérifier la compilation TS**

```bash
npx tsc --noEmit 2>&1 | grep "antoine-parcours" | head -5
```
Expected : aucune erreur.

- [ ] **3.3 Commit**

```bash
git add src/data/antoine-parcours.ts
git commit -m "feat(data): add antoine-parcours single source for vertical video"
```

---

## Tâche 4 : Squelette du composant `VerticalVideoSplit.tsx` (structure JSX, sans logique runtime)

**Files:**
- Create: `src/components/VerticalVideoSplit.tsx`

- [ ] **4.1 Créer le fichier avec la structure JSX de base (sans IntersectionObserver, sans toggle son, sans modal)**

Créer `src/components/VerticalVideoSplit.tsx` :

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Icon from './Icon'
import VideoModal from './VideoModal'

export interface VideoMomentProp {
  timestamp: string
  timeSeconds: number
  text: string
}

export interface VerticalVideoSplitProps {
  src: string
  webmSrc?: string
  poster: string
  duration: string
  identityLabel: string
  label: string
  title: string
  intro: string
  moments: VideoMomentProp[]
  primaryCta: { href: string; label: string }
  secondaryCta?: { href: string; label: string }
  videoOnLeft?: boolean
  ariaLabel?: string
}

export default function VerticalVideoSplit({
  src,
  webmSrc,
  poster,
  duration,
  identityLabel,
  label,
  title,
  intro,
  moments,
  primaryCta,
  secondaryCta,
  videoOnLeft = true,
  ariaLabel,
}: VerticalVideoSplitProps) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <section
      className="vvs-section"
      aria-label={ariaLabel || `Aperçu vidéo : ${title}`}
    >
      <div className="vvs-glow-orb" aria-hidden />
      <div className="inner">
        <div className={`vvs-grid${videoOnLeft ? '' : ' vvs-grid--reverse'}`}>
          <div className="vvs-media">
            <div className="vvs-frame">
              <video
                className="vvs-video"
                poster={poster}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={ariaLabel || `Vidéo : ${identityLabel}`}
              >
                {webmSrc && <source src={webmSrc} type="video/webm" />}
                <source src={src} type="video/mp4" />
              </video>

              <img
                src="/logo-white.webp"
                className="vvs-watermark"
                alt=""
                aria-hidden
              />

              <span className="vvs-timestamp">
                <Icon name="camera" size={12} /> {duration}
              </span>

              <span className="vvs-identity">
                <span className="vvs-identity-dot" aria-hidden /> {identityLabel}
              </span>

              <button
                type="button"
                className="vvs-expand-btn"
                onClick={() => setModalOpen(true)}
                aria-label="Voir en plein écran"
              >
                <Icon name="fullscreen" size={18} />
              </button>
            </div>
          </div>

          <div className="vvs-content">
            <span className="vvs-label">{label}</span>
            <h2 className="vvs-title">{title}</h2>
            <p className="vvs-intro">{intro}</p>

            <ol className="vvs-moments">
              {moments.map((m) => (
                <li key={m.timestamp} className="vvs-moment-item">
                  <button type="button" className="vvs-moment-btn">
                    <span className="vvs-moment-dot" aria-hidden />
                    <span className="vvs-moment-time">{m.timestamp}</span>
                    <span className="vvs-moment-text">{m.text}</span>
                  </button>
                </li>
              ))}
            </ol>

            <div className="vvs-cta-row">
              <Link href={primaryCta.href} className="btn-primary">
                {primaryCta.label} <Icon name="arrow-right" size={16} />
              </Link>
              {secondaryCta && (
                <Link href={secondaryCta.href} className="btn-ghost">
                  {secondaryCta.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <VideoModal
        src={modalOpen ? src : null}
        poster={poster}
        title={identityLabel}
        subtitle={title}
        onClose={() => setModalOpen(false)}
      />
    </section>
  )
}
```

- [ ] **4.2 Vérifier compilation TS**

```bash
npx tsc --noEmit 2>&1 | grep -i "VerticalVideoSplit" | head -10
```
Expected : aucune erreur.

- [ ] **4.3 Commit squelette**

```bash
git add src/components/VerticalVideoSplit.tsx
git commit -m "feat(component): scaffold VerticalVideoSplit JSX skeleton"
```

---

## Tâche 5 : Ajouter la logique runtime (refs, IntersectionObserver, son, timeline sync)

**Files:**
- Modify: `src/components/VerticalVideoSplit.tsx`

- [ ] **5.1 Remplacer le contenu complet par la version avec runtime**

Réécrire entièrement `src/components/VerticalVideoSplit.tsx` :

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Icon from './Icon'
import VideoModal from './VideoModal'

export interface VideoMomentProp {
  timestamp: string
  timeSeconds: number
  text: string
}

export interface VerticalVideoSplitProps {
  src: string
  webmSrc?: string
  poster: string
  duration: string
  identityLabel: string
  label: string
  title: string
  intro: string
  moments: VideoMomentProp[]
  primaryCta: { href: string; label: string }
  secondaryCta?: { href: string; label: string }
  videoOnLeft?: boolean
  ariaLabel?: string
}

export default function VerticalVideoSplit({
  src,
  webmSrc,
  poster,
  duration,
  identityLabel,
  label,
  title,
  intro,
  moments,
  primaryCta,
  secondaryCta,
  videoOnLeft = true,
  ariaLabel,
}: VerticalVideoSplitProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [activeMomentIndex, setActiveMomentIndex] = useState(-1)
  const [showSoundHint, setShowSoundHint] = useState(false)
  const [hasReducedMotion, setHasReducedMotion] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)

  // Detect prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setHasReducedMotion(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setHasReducedMotion(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // IntersectionObserver — autoplay smart + reveal trigger
  useEffect(() => {
    const section = sectionRef.current
    const video = videoRef.current
    if (!section || !video) return

    const playbackObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          if (!hasReducedMotion && !modalOpen) {
            video.play().catch(() => {})
          }
        } else {
          video.pause()
        }
      },
      { threshold: [0, 0.5] }
    )
    playbackObserver.observe(section)

    const revealObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting && entry.intersectionRatio >= 0.3) {
          setIsRevealed(true)
          revealObserver.disconnect()
        }
      },
      { threshold: [0, 0.3] }
    )
    revealObserver.observe(section)

    return () => {
      playbackObserver.disconnect()
      revealObserver.disconnect()
    }
  }, [hasReducedMotion, modalOpen])

  // Sound hint apparition (2s after mount, disappear 4s later)
  useEffect(() => {
    if (hasReducedMotion || !isMuted) return
    const showTimer = window.setTimeout(() => setShowSoundHint(true), 2000)
    const hideTimer = window.setTimeout(() => setShowSoundHint(false), 6000)
    return () => {
      window.clearTimeout(showTimer)
      window.clearTimeout(hideTimer)
    }
  }, [hasReducedMotion, isMuted])

  // Timeline sync (timeupdate event, throttled)
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    let lastUpdate = 0
    const onTimeUpdate = () => {
      const now = performance.now()
      if (now - lastUpdate < 250) return
      lastUpdate = now
      const t = video.currentTime
      let idx = -1
      for (let i = 0; i < moments.length; i++) {
        if (moments[i].timeSeconds <= t) idx = i
        else break
      }
      setActiveMomentIndex(idx)
    }
    video.addEventListener('timeupdate', onTimeUpdate)
    return () => video.removeEventListener('timeupdate', onTimeUpdate)
  }, [moments])

  // Pause video when modal opens
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (modalOpen) video.pause()
    else if (!hasReducedMotion) video.play().catch(() => {})
  }, [modalOpen, hasReducedMotion])

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setIsMuted(video.muted)
    setShowSoundHint(false)
  }

  const seekTo = (seconds: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = seconds
    if (!hasReducedMotion) video.play().catch(() => {})
  }

  const onVideoError = () => setVideoError(true)

  const sectionClasses = [
    'vvs-section',
    isRevealed ? 'is-revealed' : '',
    hasReducedMotion ? 'is-reduced' : '',
    videoError ? 'has-error' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section
      ref={sectionRef}
      className={sectionClasses}
      aria-label={ariaLabel || `Aperçu vidéo : ${title}`}
    >
      <div className="vvs-glow-orb" aria-hidden />
      <div className="inner">
        <div className={`vvs-grid${videoOnLeft ? '' : ' vvs-grid--reverse'}`}>
          <div className="vvs-media">
            <div className="vvs-frame">
              {!videoError && (
                <video
                  ref={videoRef}
                  className="vvs-video"
                  poster={poster}
                  autoPlay={!hasReducedMotion}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={ariaLabel || `Vidéo : ${identityLabel}`}
                  onError={onVideoError}
                >
                  {webmSrc && <source src={webmSrc} type="video/webm" />}
                  <source src={src} type="video/mp4" />
                </video>
              )}
              {videoError && (
                <img src={poster} alt={identityLabel} className="vvs-video-fallback" />
              )}

              <img
                src="/logo-white.webp"
                className="vvs-watermark"
                alt=""
                aria-hidden
              />

              <span className="vvs-timestamp">
                <Icon name="camera" size={12} /> {duration}
              </span>

              <span className="vvs-identity">
                <span className="vvs-identity-dot" aria-hidden /> {identityLabel}
              </span>

              {!videoError && (
                <button
                  type="button"
                  className={`vvs-sound-btn${isMuted ? '' : ' is-active'}`}
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
                >
                  <Icon name={isMuted ? 'volume-off' : 'volume-on'} size={20} />
                </button>
              )}

              <button
                type="button"
                className="vvs-expand-btn"
                onClick={() => setModalOpen(true)}
                aria-label="Voir en plein écran"
              >
                <Icon name="fullscreen" size={18} />
              </button>

              {showSoundHint && (
                <div className="vvs-sound-hint" aria-hidden>
                  <Icon name="volume-on" size={14} /> ACTIVER LE SON
                </div>
              )}
            </div>
          </div>

          <div className="vvs-content">
            <span className="vvs-label">{label}</span>
            <h2 className="vvs-title">{title}</h2>
            <p className="vvs-intro">{intro}</p>

            <ol className="vvs-moments">
              {moments.map((m, i) => (
                <li
                  key={m.timestamp}
                  className={`vvs-moment-item${activeMomentIndex === i ? ' is-active' : ''}`}
                >
                  <button
                    type="button"
                    className="vvs-moment-btn"
                    onClick={() => seekTo(m.timeSeconds)}
                  >
                    <span className="vvs-moment-dot" aria-hidden />
                    <span className="vvs-moment-time">{m.timestamp}</span>
                    <span className="vvs-moment-text">{m.text}</span>
                  </button>
                </li>
              ))}
            </ol>

            <div className="vvs-cta-row">
              <Link href={primaryCta.href} className="btn-primary">
                {primaryCta.label} <Icon name="arrow-right" size={16} />
              </Link>
              {secondaryCta && (
                <Link href={secondaryCta.href} className="btn-ghost">
                  {secondaryCta.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <VideoModal
        src={modalOpen ? src : null}
        poster={poster}
        title={identityLabel}
        subtitle={title}
        onClose={() => setModalOpen(false)}
      />
    </section>
  )
}
```

- [ ] **5.2 Vérifier compilation TS**

```bash
npx tsc --noEmit 2>&1 | grep -i "VerticalVideoSplit" | head -10
```
Expected : aucune erreur.

- [ ] **5.3 Commit runtime logic**

```bash
git add src/components/VerticalVideoSplit.tsx
git commit -m "feat(component): add runtime logic (IO autoplay, sound, timeline sync, modal)"
```

---

## Tâche 6 : Ajouter le CSS du composant

**Files:**
- Modify: `src/app/globals.css`

- [ ] **6.1 Identifier l'endroit où ajouter le CSS (en fin de fichier)**

```bash
wc -l src/app/globals.css
tail -20 src/app/globals.css
```
Expected : confirme qu'on peut ajouter ~250 lignes à la fin du fichier sans casser les media queries. Note la dernière ligne pour repère.

- [ ] **6.2 Ajouter la section CSS complète en fin de `globals.css`**

Append ce contenu à la fin de `src/app/globals.css` :

```css
/* ============================================================
   Vertical Video Split (composant /components/VerticalVideoSplit.tsx)
   Utilisé sur /programme/mma, /temoignages, et homepage
   ============================================================ */

.vvs-section {
  position: relative;
  padding-block: clamp(4rem, 8vw, 7rem);
  background: var(--surface-lowest);
  overflow: hidden;
  isolation: isolate;
}

.vvs-glow-orb {
  position: absolute;
  inset: 50% auto auto 50%;
  transform: translate(-50%, -50%);
  width: clamp(400px, 60vw, 700px);
  aspect-ratio: 1;
  background: var(--primary);
  filter: blur(80px);
  opacity: 0;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  transition: opacity 1.5s ease 0.4s;
}
.vvs-section.is-revealed .vvs-glow-orb {
  opacity: 0.18;
  animation: vvs-glow-pulse 6s ease-in-out infinite alternate;
}

@keyframes vvs-glow-pulse {
  0%   { opacity: 0.13; transform: translate(-50%, -50%) scale(0.95); }
  100% { opacity: 0.22; transform: translate(-50%, -50%) scale(1.05); }
}

.vvs-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(2rem, 4vw, 4rem);
  align-items: center;
}
.vvs-grid--reverse {
  direction: rtl;
}
.vvs-grid--reverse > * {
  direction: ltr;
}

@media (max-width: 880px) {
  .vvs-grid {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
}

/* === Media (vidéo + frame) === */

.vvs-media {
  position: relative;
  display: flex;
  justify-content: center;
}

.vvs-frame {
  position: relative;
  width: 100%;
  max-width: 480px;
  aspect-ratio: 9 / 16;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(135deg, var(--surface-low), var(--surface-lowest));
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.25),
    0 24px 48px -12px rgba(0, 0, 0, 0.55),
    0 0 80px -20px var(--primary);
  clip-path: inset(8% 8% 8% 8%);
  transition: clip-path 0.9s cubic-bezier(0.65, 0, 0.35, 1);
}
.vvs-section.is-revealed .vvs-frame {
  clip-path: inset(0);
}
.vvs-section.is-reduced .vvs-frame {
  clip-path: inset(0);
  transition: none;
}

@media (max-width: 880px) {
  .vvs-frame {
    border-radius: 12px;
    max-height: 70vh;
  }
}

.vvs-frame::before,
.vvs-frame::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 25%;
  pointer-events: none;
  z-index: 2;
}
.vvs-frame::before {
  top: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.35), transparent);
}
.vvs-frame::after {
  bottom: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.35), transparent);
}

.vvs-video,
.vvs-video-fallback {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  z-index: 1;
}

/* === Overlays vidéo === */

.vvs-watermark {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  opacity: 0.55;
  mix-blend-mode: screen;
  z-index: 3;
  pointer-events: none;
}

.vvs-timestamp {
  position: absolute;
  top: 12px;
  left: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 8px;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  color: #fff;
  z-index: 3;
  pointer-events: none;
}

.vvs-identity {
  position: absolute;
  bottom: 12px;
  left: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 999px;
  font-size: 0.7rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #fff;
  z-index: 3;
  pointer-events: none;
  max-width: calc(100% - 80px);
}
.vvs-identity-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ef4444;
  animation: vvs-pulse-dot 1.5s ease-in-out infinite;
  flex-shrink: 0;
}
.vvs-section.is-reduced .vvs-identity-dot {
  animation: none;
}

@keyframes vvs-pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.4; transform: scale(0.85); }
}

.vvs-sound-btn,
.vvs-expand-btn {
  position: absolute;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(20, 20, 20, 0.45);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #fff;
  cursor: pointer;
  z-index: 4;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1),
              background 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.vvs-sound-btn {
  bottom: 12px;
  right: 12px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
}
.vvs-expand-btn {
  top: 12px;
  right: 48px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
}

@media (max-width: 880px) {
  .vvs-sound-btn { width: 44px; height: 44px; }
  .vvs-expand-btn { width: 40px; height: 40px; right: 44px; }
}

@media (hover: hover) {
  .vvs-sound-btn:hover,
  .vvs-expand-btn:hover {
    transform: scale(1.08);
    box-shadow: 0 0 24px rgba(255, 122, 0, 0.55);
  }
}
.vvs-section.is-reduced .vvs-sound-btn,
.vvs-section.is-reduced .vvs-expand-btn {
  transition: none;
}
.vvs-section.is-reduced .vvs-sound-btn:hover,
.vvs-section.is-reduced .vvs-expand-btn:hover {
  transform: none;
  box-shadow: none;
}
.vvs-sound-btn:focus-visible,
.vvs-expand-btn:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}
.vvs-sound-btn.is-active {
  background: var(--primary);
  border-color: var(--primary);
  animation: vvs-pulse-sound 2s ease-in-out infinite;
}
.vvs-section.is-reduced .vvs-sound-btn.is-active {
  animation: none;
}

@keyframes vvs-pulse-sound {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 122, 0, 0.5); }
  50%      { box-shadow: 0 0 0 6px rgba(255, 122, 0, 0); }
}

.vvs-sound-hint {
  position: absolute;
  bottom: 76px;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--primary);
  color: #fff;
  border-radius: 999px;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  font-weight: 600;
  text-transform: uppercase;
  z-index: 4;
  white-space: nowrap;
  animation: vvs-hint-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}

@keyframes vvs-hint-in {
  from { opacity: 0; transform: translate(-50%, 12px); }
  to   { opacity: 1; transform: translate(-50%, 0); }
}

/* === Content (bloc texte droit) === */

.vvs-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.vvs-label {
  display: block;
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  color: var(--primary);
  text-transform: uppercase;
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.55s ease, transform 0.55s ease;
}
.vvs-label::after {
  content: '';
  display: block;
  width: 24px;
  height: 2px;
  background: var(--primary);
  margin-top: 8px;
}

.vvs-title {
  font-size: clamp(1.75rem, 3.5vw, 2.5rem);
  text-wrap: balance;
  line-height: 1.05;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: -0.01em;
  margin: 0;
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.55s ease 0.08s, transform 0.55s ease 0.08s;
}

.vvs-intro {
  font-size: 1.05rem;
  color: var(--text-secondary);
  max-width: 42ch;
  line-height: 1.55;
  margin: 0;
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.55s ease 0.16s, transform 0.55s ease 0.16s;
}

.vvs-section.is-revealed .vvs-label,
.vvs-section.is-revealed .vvs-title,
.vvs-section.is-revealed .vvs-intro {
  opacity: 1;
  transform: translateY(0);
}
.vvs-section.is-reduced .vvs-label,
.vvs-section.is-reduced .vvs-title,
.vvs-section.is-reduced .vvs-intro {
  opacity: 1;
  transform: none;
  transition: none;
}

/* === Timeline moments === */

.vvs-moments {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}
.vvs-moment-item {
  position: relative;
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.55s ease, transform 0.55s ease;
}
.vvs-section.is-revealed .vvs-moment-item {
  opacity: 1;
  transform: translateY(0);
}
.vvs-section.is-revealed .vvs-moment-item:nth-child(1) { transition-delay: 0.24s; }
.vvs-section.is-revealed .vvs-moment-item:nth-child(2) { transition-delay: 0.32s; }
.vvs-section.is-revealed .vvs-moment-item:nth-child(3) { transition-delay: 0.40s; }
.vvs-section.is-revealed .vvs-moment-item:nth-child(4) { transition-delay: 0.48s; }
.vvs-section.is-revealed .vvs-moment-item:nth-child(5) { transition-delay: 0.56s; }
.vvs-section.is-reduced .vvs-moment-item {
  opacity: 1;
  transform: none;
  transition: none;
}

.vvs-moment-btn {
  display: grid;
  grid-template-columns: 14px 56px 1fr;
  gap: 12px;
  align-items: center;
  width: 100%;
  padding: 12px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;
  color: inherit;
}
.vvs-moment-btn:hover {
  background: rgba(255, 255, 255, 0.03);
}
.vvs-moment-btn:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.vvs-moment-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--surface-lowest);
  border: 2px solid var(--border, rgba(255, 255, 255, 0.15));
  transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}
.vvs-moment-item.is-active .vvs-moment-dot {
  background: var(--primary);
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(255, 122, 0, 0.18);
}

.vvs-moment-time {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 0.85rem;
  color: var(--text-muted, var(--text-secondary));
  transition: color 0.2s ease;
}
.vvs-moment-item.is-active .vvs-moment-time {
  color: var(--primary);
}

.vvs-moment-text {
  font-size: 1rem;
  color: var(--text-secondary);
  transition: color 0.2s ease, font-weight 0.2s ease;
}
.vvs-moment-item.is-active .vvs-moment-text {
  color: var(--text-primary);
  font-weight: 600;
}

/* Mobile : chips horizontaux scrollables */
@media (max-width: 880px) {
  .vvs-moments {
    flex-direction: row;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    gap: 8px;
    padding-bottom: 4px;
    margin-inline: -1rem;
    padding-inline: 1rem;
  }
  .vvs-moment-item {
    flex-shrink: 0;
    scroll-snap-align: start;
  }
  .vvs-moment-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border-radius: 999px;
    border: 1px solid var(--border, rgba(255, 255, 255, 0.15));
    background: transparent;
    white-space: nowrap;
  }
  .vvs-moment-item.is-active .vvs-moment-btn {
    background: var(--primary);
    border-color: var(--primary);
  }
  .vvs-moment-item.is-active .vvs-moment-time,
  .vvs-moment-item.is-active .vvs-moment-text {
    color: #fff;
  }
}

/* === CTA row === */

.vvs-cta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
}
.vvs-cta-row .btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.vvs-cta-row .btn-primary svg {
  transition: transform 0.2s ease;
}
@media (hover: hover) {
  .vvs-cta-row .btn-primary:hover svg {
    transform: translateX(4px);
  }
}
.vvs-section.is-reduced .vvs-cta-row .btn-primary:hover svg {
  transform: none;
}

/* Hide glow orb on mobile (perf + cleaner look) */
@media (max-width: 880px) {
  .vvs-glow-orb { display: none; }
}
```

- [ ] **6.3 Vérifier que le CSS ne casse rien (build dev)**

```bash
npx next dev --turbopack > /tmp/mkr-dev.log 2>&1 &
DEV_PID=$!
sleep 8
curl -sI http://localhost:3000 | head -2
kill $DEV_PID
```
Expected : HTTP 200 OK. Si erreur CSS dans /tmp/mkr-dev.log, corriger avant de continuer.

- [ ] **6.4 Commit CSS**

```bash
git add src/app/globals.css
git commit -m "feat(css): add VerticalVideoSplit styles (frame, overlays, timeline, animations)"
```

---

## Tâche 7 : Intégrer sur `/programme/mma`

**Files:**
- Modify: `src/app/(site)/programme/mma/page.tsx`

- [ ] **7.1 Lire la structure actuelle du fichier**

Ouvrir `src/app/(site)/programme/mma/page.tsx`. Repérer :
- Imports en haut (lignes 1-8)
- Le `<PageHero>` (vers ligne 40-48)
- Le `<div className="inner"><TldrBox ... /></div>` qui suit (lignes 50-61)

- [ ] **7.2 Ajouter 2 imports en haut du fichier**

Sous l'import `import TldrBox from '@/components/TldrBox'`, ajouter :

```tsx
import VerticalVideoSplit from '@/components/VerticalVideoSplit'
import {
  ANTOINE_PARCOURS_ASSETS,
  ANTOINE_PARCOURS_MOMENTS,
  ANTOINE_PARCOURS_VARIANTS,
} from '@/data/antoine-parcours'
```

- [ ] **7.3 Insérer `<VerticalVideoSplit>` entre `<PageHero>` et `<div className="inner"><TldrBox>`**

Trouver la fermeture de `<PageHero ... />`. Juste après, et avant `<div className="inner">`, ajouter :

```tsx
<VerticalVideoSplit
  {...ANTOINE_PARCOURS_ASSETS}
  {...ANTOINE_PARCOURS_VARIANTS.mma}
  moments={ANTOINE_PARCOURS_MOMENTS}
/>
```

- [ ] **7.4 Vérifier compilation TS**

```bash
npx tsc --noEmit 2>&1 | grep -E "(programme/mma|VerticalVideoSplit|antoine)" | head -10
```
Expected : aucune erreur.

- [ ] **7.5 Smoke test visuel en dev**

```bash
npx next dev --turbopack > /tmp/mkr-dev.log 2>&1 &
DEV_PID=$!
sleep 8
open http://localhost:3000/programme/mma
```
Vérifier visuellement (~30s d'inspection) :
1. La vidéo apparait sous le hero, frame visible
2. Vidéo se lance autoplay mute après une fraction de seconde
3. Bouton son visible bottom-right, clic active le son
4. Bouton expand visible top-right, clic ouvre la modal plein écran
5. Cliquer sur un moment (00:18) jump la vidéo au bon endroit, highlight orange
6. Pas d'erreur console (`Cmd+Option+J`)

Puis tuer le serveur :
```bash
kill $DEV_PID
```

- [ ] **7.6 Commit intégration MMA**

```bash
git add src/app/(site)/programme/mma/page.tsx
git commit -m "feat(mma): integrate Antoine parcours vertical video after hero"
```

---

## Tâche 8 : Intégrer sur `/temoignages` (featured avant la grid)

**Files:**
- Modify: `src/app/(site)/temoignages/page.tsx`

- [ ] **8.1 Lire la structure actuelle (repérer le `<VideoTestimonialsGrid>` et le `<PageHero>`)**

Ouvrir `src/app/(site)/temoignages/page.tsx`. Identifier la position de `<VideoTestimonialsGrid />` (probablement juste après `<PageHero>`).

- [ ] **8.2 Ajouter les imports**

En haut du fichier, sous les imports existants :

```tsx
import VerticalVideoSplit from '@/components/VerticalVideoSplit'
import {
  ANTOINE_PARCOURS_ASSETS,
  ANTOINE_PARCOURS_MOMENTS,
  ANTOINE_PARCOURS_VARIANTS,
} from '@/data/antoine-parcours'
```

- [ ] **8.3 Insérer `<VerticalVideoSplit>` AVANT le `<VideoTestimonialsGrid>`, avec un séparateur label**

Avant `<VideoTestimonialsGrid />`, insérer :

```tsx
<VerticalVideoSplit
  {...ANTOINE_PARCOURS_ASSETS}
  {...ANTOINE_PARCOURS_VARIANTS.temoignages}
  moments={ANTOINE_PARCOURS_MOMENTS}
/>

<section className="logi-section" style={{ paddingBlock: '3rem 1rem' }}>
  <div className="inner">
    <div style={{ textAlign: 'center' }}>
      <span className="label-tag" style={{ color: 'var(--primary)' }}>
        AUTRES TÉMOIGNAGES
      </span>
      <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', textTransform: 'uppercase', marginTop: '0.6rem' }}>
        INTERVIEWS FACE CAMÉRA
      </h2>
    </div>
  </div>
</section>
```

- [ ] **8.4 Vérifier compilation TS**

```bash
npx tsc --noEmit 2>&1 | grep -E "(temoignages|VerticalVideoSplit)" | head -10
```
Expected : aucune erreur.

- [ ] **8.5 Smoke test visuel**

```bash
npx next dev --turbopack > /tmp/mkr-dev.log 2>&1 &
DEV_PID=$!
sleep 8
open http://localhost:3000/temoignages
```
Vérifier :
1. La vidéo Antoine en featured juste après le hero
2. Le label séparateur "AUTRES TÉMOIGNAGES · INTERVIEWS FACE CAMÉRA"
3. La grid existante (interview Antoine + LAMP) sous le séparateur, intacte
4. Pas de double lecture vidéo (la grid lance les vidéos uniquement au clic, pas autoplay)

```bash
kill $DEV_PID
```

- [ ] **8.6 Commit intégration témoignages**

```bash
git add src/app/(site)/temoignages/page.tsx
git commit -m "feat(temoignages): add featured Antoine parcours video above interview grid"
```

---

## Tâche 9 : Intégrer sur la homepage (dynamic import)

**Files:**
- Modify: `src/app/(site)/page.tsx`

- [ ] **9.1 Lire la structure actuelle**

Ouvrir `src/app/(site)/page.tsx`. Repérer :
- L'import `dynamic` de Next.js (probablement déjà présent pour les autres sections)
- L'ordre des sections : `<Testimonials />` puis `<VoyageReveal />` (selon SITEMAP.md, section #5 → section #7 actuel)

- [ ] **9.2 Ajouter l'import dynamic du composant**

Avec les autres dynamic imports en haut du fichier (en respectant le pattern existant) :

```tsx
const VerticalVideoSplit = dynamic(() => import('@/components/VerticalVideoSplit'), {
  loading: () => <div style={{ minHeight: 600 }} aria-hidden />,
})
```

Ajouter aussi l'import du data file (peut être en imports statiques en haut) :
```tsx
import {
  ANTOINE_PARCOURS_ASSETS,
  ANTOINE_PARCOURS_MOMENTS,
  ANTOINE_PARCOURS_VARIANTS,
} from '@/data/antoine-parcours'
```

- [ ] **9.3 Insérer `<VerticalVideoSplit>` entre `<Testimonials />` et `<VoyageReveal />`**

Dans le JSX du `return` de `HomePage`, trouver `<Testimonials />` (section #5) et ajouter juste après :

```tsx
<Testimonials />

<VerticalVideoSplit
  {...ANTOINE_PARCOURS_ASSETS}
  {...ANTOINE_PARCOURS_VARIANTS.home}
  moments={ANTOINE_PARCOURS_MOMENTS}
/>

<FacilitatorBand />
```

> Note SITEMAP.md : l'ordre actuel est `Testimonials → FacilitatorBand → VoyageReveal`. La spec demandait "entre Testimonials et VoyageReveal" mais FacilitatorBand est entre les deux. On l'insère bien entre Testimonials et FacilitatorBand pour respecter l'intention (preuve sociale carousel → preuve sociale vidéo → puis lever objection logistique avec FacilitatorBand). Si David préfère après FacilitatorBand, ajuster en review.

- [ ] **9.4 Vérifier compilation TS**

```bash
npx tsc --noEmit 2>&1 | grep -E "(\(site\)/page|VerticalVideoSplit)" | head -10
```
Expected : aucune erreur.

- [ ] **9.5 Smoke test visuel homepage**

```bash
npx next dev --turbopack > /tmp/mkr-dev.log 2>&1 &
DEV_PID=$!
sleep 8
open http://localhost:3000
```
Scroller jusqu'à après le carousel Testimonials. Vérifier :
1. La vidéo Antoine apparaît bien après Testimonials, avant FacilitatorBand
2. IntersectionObserver lance bien la vidéo quand on la voit
3. Vidéo se met en pause quand on scroll hors viewport (vérifier en DevTools Network > Media)

```bash
kill $DEV_PID
```

- [ ] **9.6 Commit intégration homepage**

```bash
git add src/app/(site)/page.tsx
git commit -m "feat(home): add Antoine parcours video section between Testimonials and FacilitatorBand"
```

---

## Tâche 10 : Build production + audit perf

- [ ] **10.1 Build production complet**

```bash
cd "/Users/davidkhazaei/Documents/Client/DKDP.ch/CLAUDE RESSOURCES/DEV SPACE/clients Claude/MKR caucasian camp/nextjs"
rm -rf .next
npx next build 2>&1 | tail -40
```
Expected : `✓ Compiled successfully`, ~35 routes statiques OK, pas d'erreur TypeScript ni de build error.

- [ ] **10.2 Lancer le serveur de prod**

```bash
npx next start > /tmp/mkr-prod.log 2>&1 &
PROD_PID=$!
sleep 5
```

- [ ] **10.3 Lighthouse mobile slow-4G sur `/programme/mma` — médiane 3 runs**

```bash
for i in 1 2 3; do
  npx lighthouse http://localhost:3000/programme/mma \
    --quiet --chrome-flags='--headless=new' \
    --preset=desktop \
    --form-factor=mobile \
    --throttling-method=simulate \
    --throttling.cpuSlowdownMultiplier=4 \
    --only-categories=performance \
    --output=json --output-path=/tmp/mkr-mma-lh-$i.json
done
# Calcul de la médiane des scores performance
for i in 1 2 3; do
  jq '.categories.performance.score * 100' /tmp/mkr-mma-lh-$i.json
done | sort -n | sed -n '2p'
```
Expected : médiane ≥85. Si <85, investiguer (taille vidéo, lazy load, glow blur).

- [ ] **10.4 Tuer le serveur prod**

```bash
kill $PROD_PID
```

- [ ] **10.5 Si score <85 : itérations possibles**

Si médiane <85 :
- Réduire la taille du WebM (`CRF 34` au lieu de 32) puis re-test
- Désactiver `vvs-glow-orb` sur desktop aussi si CLS/LCP impacté
- Vérifier que `loading="lazy"` est bien sur les autres assets de la page MMA

Si médiane ≥85, passer à la tâche suivante.

---

## Tâche 11 : Mettre à jour SITEMAP.md

**Files:**
- Modify: `SITEMAP.md`

- [ ] **11.1 Ajouter une entrée BREAKING en haut du fichier**

En haut de `SITEMAP.md`, juste sous la première ligne (mise à jour de la date), ajouter :

```markdown
## 🆕 Changements 2026-05-26 (vidéo verticale Antoine parcours sur 3 surfaces)

> Nouveau composant client `<VerticalVideoSplit />` qui affiche la vidéo verticale 9:16 d'Antoine Petit-Jean (montage 54s entraînement MMA Tchétchénie). Split layout : vidéo gauche + bloc storytelling droite (label + titre + timeline interactive de 5 moments + CTA). Autoplay mute + clic son + clic expand → VideoModal plein écran. Triple usage : `/programme/mma`, `/temoignages` (featured), homepage (entre Testimonials et FacilitatorBand).

**Assets** :
- `public/videos/testimonials/antoine-parcours.mp4` (H.264, 1080×1920, ~20 MB)
- `public/videos/testimonials/antoine-parcours.webm` (VP9, 1080×1920, ~14 MB)
- `public/videos/testimonials/antoine-parcours-poster.jpg` (1080×1920, ~100 KB)

**Single source of truth** : `src/data/antoine-parcours.ts` (assets + moments + 3 variants de copy mma/temoignages/home). Modifier la copy → toucher uniquement ce fichier.

**Composant** : `src/components/VerticalVideoSplit.tsx` (client, ~250 lignes, réutilise `<VideoModal />` pour le plein écran).

**CSS** : section dédiée `/* Vertical Video Split */` en fin de `src/app/globals.css` (~250 lignes, classes préfixées `.vvs-`).

**Icônes ajoutées** : `volume-on`, `volume-off`, `fullscreen` dans `src/components/Icon.tsx`.

**Fichiers touchés (intégration)** :
- `src/app/(site)/programme/mma/page.tsx` (entre PageHero et TldrBox)
- `src/app/(site)/temoignages/page.tsx` (avant VideoTestimonialsGrid + label séparateur "AUTRES TÉMOIGNAGES")
- `src/app/(site)/page.tsx` (dynamic import entre Testimonials et FacilitatorBand)

---
```

- [ ] **11.2 Mettre à jour la section `🥊 /programme/mma`**

Dans la section "🥊 `/programme/mma` — Programme MMA", remplacer la ligne **Sections** par :

```markdown
**Sections** : PageHero · **VerticalVideoSplit (Antoine parcours)** · Description split · CinematicReveal · Techniques grid-3x2 · Session timeline · SectionCTA `/sessions` + `/programme/lutte`
```

- [ ] **11.3 Mettre à jour la section `💬 /temoignages`**

Dans la section "💬 `/temoignages` — Témoignages", ajouter en haut de la liste **Sections** :
```markdown
**Sections** : PageHero · **VerticalVideoSplit (Antoine parcours — featured)** · Label séparateur "AUTRES TÉMOIGNAGES" · VideoTestimonialsGrid (Antoine interview + LAMP) · CinematicReveal · Témoignages écrits grid-3 · Stats · SectionCTA
```

- [ ] **11.4 Mettre à jour la section `🏠 /` Homepage**

Dans la section "🏠 `/` — Homepage", **Sections (ordre)**, insérer entre #5 et #6 :
```markdown
6. **`<VerticalVideoSplit />`** — vidéo verticale Antoine parcours (preuve sociale visuelle)
```
Et renuméroter les sections suivantes (6→7, 7→8, etc.). Total : 13 sections au lieu de 12.

- [ ] **11.5 Ajouter une ligne dans §6 "Où changer X ?"**

Dans le tableau §6, ajouter cette ligne :
```markdown
| **Vidéo Antoine parcours (props)** | `src/data/antoine-parcours.ts` (single source : assets + moments + 3 variants mma/temoignages/home). Pour changer la copy, toucher uniquement ce fichier. Composant : `src/components/VerticalVideoSplit.tsx`. Assets : `public/videos/testimonials/antoine-parcours.{mp4,webm,jpg}`. |
```

- [ ] **11.6 Ajouter une sous-section dans §6bis Propagation Map**

Sous la dernière sous-section existante de §6bis, ajouter :

```markdown
### Vidéo Antoine parcours (composant `VerticalVideoSplit`)
| Fichier | Forme |
|---|---|
| `src/data/antoine-parcours.ts` | source unique — props (assets, moments, 3 variants copy) |
| `src/components/VerticalVideoSplit.tsx` | composant client (autoplay, timeline sync, modal) |
| `src/components/VideoModal.tsx` | réutilisé pour clic plein écran (déjà existant) |
| `src/components/Icon.tsx` | ajouts `volume-on` / `volume-off` / `fullscreen` |
| `src/app/globals.css` | section `/* Vertical Video Split */` en fin de fichier (~250 lignes, `.vvs-*`) |
| `src/app/(site)/programme/mma/page.tsx` | usage variant `mma` après PageHero |
| `src/app/(site)/temoignages/page.tsx` | usage variant `temoignages` avant VideoTestimonialsGrid + label séparateur |
| `src/app/(site)/page.tsx` | usage variant `home` dynamic-importé entre Testimonials et FacilitatorBand |
| `public/videos/testimonials/antoine-parcours.{mp4,webm,jpg}` | 3 assets vidéo |
**⚠️** Si on change la copy d'une variant, modifier uniquement `data/antoine-parcours.ts`. Si on change les timestamps des moments, idem. Pour remplacer la vidéo entièrement : ré-encoder les 3 assets avec ffmpeg (commandes dans `docs/superpowers/plans/2026-05-26-video-antoine-parcours-mma.md` tâche 1).
```

- [ ] **11.7 Mettre à jour la date de "Dernière régénération" en bas de SITEMAP.md**

Remplacer la dernière ligne du fichier par :
```markdown
*Dernière régénération : 2026-05-26 — ajout VerticalVideoSplit + data/antoine-parcours.ts + assets vidéo Antoine parcours (3 surfaces : MMA, temoignages, home).*
```

- [ ] **11.8 Commit SITEMAP**

```bash
git add SITEMAP.md
git commit -m "docs(sitemap): document VerticalVideoSplit on mma/temoignages/home + assets"
```

---

## Tâche 12 : Tests d'acceptance manuels

- [ ] **12.1 Relancer le serveur prod**

```bash
cd "/Users/davidkhazaei/Documents/Client/DKDP.ch/CLAUDE RESSOURCES/DEV SPACE/clients Claude/MKR caucasian camp/nextjs"
npx next start > /tmp/mkr-prod.log 2>&1 &
PROD_PID=$!
sleep 5
```

- [ ] **12.2 Test 1 — Autoplay mute desktop Chrome**

```bash
open -a "Google Chrome" http://localhost:3000/programme/mma
```
Vérifier visuellement :
- [ ] Vidéo se lance autoplay sans son
- [ ] Pas de bouton play au centre (UX Instagram-like)
- [ ] Hint "ACTIVER LE SON" apparait après 2s, disparait après 4s

- [ ] **12.3 Test 2 — Toggle son (1 clic, pas double-tap)**

Sur la même page :
- [ ] Clic sur le bouton son bottom-right → son ON immédiat
- [ ] Bouton devient orange (state `is-active`)
- [ ] Re-clic → son OFF, bouton redevient gris

- [ ] **12.4 Test 3 — Timeline sync vidéo**

- [ ] Cliquer sur le moment "00:18" → vidéo jump à 0:18
- [ ] Le moment "00:18" se highlight en orange
- [ ] Quand la vidéo dépasse 0:31 naturellement, le moment "00:31" devient actif

- [ ] **12.5 Test 4 — Modal fullscreen**

- [ ] Clic sur le bouton fullscreen top-right → modal plein écran ouvre
- [ ] La vidéo de fond est en pause (vérifier pas de double audio)
- [ ] ESC ferme la modal, focus revient au bouton expand
- [ ] La vidéo de fond reprend la lecture

- [ ] **12.6 Test 5 — IntersectionObserver pause hors viewport**

- [ ] Scroller jusqu'en bas de la page (vidéo hors viewport)
- [ ] Vérifier en DevTools (Cmd+Option+J) → onglet Network → filter "Media" → la vidéo ne consomme plus de bande passante
- [ ] Re-scroller vers la vidéo → lecture reprend automatiquement

- [ ] **12.7 Test 6 — prefers-reduced-motion**

Activer Reduce Motion dans macOS (Préférences Système → Accessibilité → Affichage → Réduire les animations).
- [ ] Recharger la page
- [ ] La vidéo ne s'auto-lance plus
- [ ] Le poster est visible
- [ ] Pas d'animations clip-path/stagger/glow pulse
- [ ] Boutons toujours cliquables (clic son fonctionne, clic expand ouvre modal)

Désactiver Reduce Motion à la fin.

- [ ] **12.8 Test 7 — Mobile responsive (DevTools)**

DevTools → Toggle device toolbar → iPhone 14 Pro :
- [ ] Layout passe en 1 colonne (vidéo dessus, texte dessous)
- [ ] Vidéo max-height 70vh
- [ ] Pas de glow orb visible
- [ ] Timeline en chips horizontaux scrollables
- [ ] Boutons overlay 44px (zone tactile OK)

- [ ] **12.9 Test 8 — iOS Safari (autoplay mute crucial)**

Si possible (Mac avec iOS simulator ou iPhone branché) :
- [ ] Ouvrir http://(IP_LOCAL):3000/programme/mma sur Safari iOS
- [ ] Vidéo se lance autoplay mute ✓
- [ ] Clic son → activation immédiate (pas de blocage Apple)
- [ ] Modal fullscreen ouvre avec contrôles natifs

Si pas possible : noter "à tester sur device avant prod" et continuer.

- [ ] **12.10 Test 9 — Accessibilité keyboard**

Sur desktop, Tab à travers la page MMA :
- [ ] Focus passe sur bouton son
- [ ] Focus passe sur bouton expand
- [ ] Focus passe sur chaque moment de la timeline
- [ ] Focus passe sur CTA primary
- [ ] Espace/Enter active les boutons
- [ ] Outline visible (2px) sur chaque focus

- [ ] **12.11 Test 10 — Vérifier sur /temoignages et homepage**

- [ ] http://localhost:3000/temoignages : vidéo featured + label séparateur + grid OK
- [ ] http://localhost:3000 : scroller jusqu'à après Testimonials, vidéo visible et fonctionnelle

- [ ] **12.12 Tuer le serveur prod**

```bash
kill $PROD_PID
```

---

## Tâche 13 : Audit grep final + push

- [ ] **13.1 Audit grep MKR (cf. SITEMAP.md §8)**

```bash
cd "/Users/davidkhazaei/Documents/Client/DKDP.ch/CLAUDE RESSOURCES/DEV SPACE/clients Claude/MKR caucasian camp/nextjs"
# Confirmer aucune régression sur les règles SITEMAP §8
grep -ri "3 repas\|trois repas" src/ | grep -v node_modules | head -5
grep -ri "wa\.me/41\|XXXXXXXXX" src/ | grep -v node_modules | head -5
grep -ri "stripe\|paypal\|acompte" src/ | grep -v node_modules | head -5
```
Expected : aucune nouvelle occurrence (les anciennes occurrences éventuelles sont préservées).

- [ ] **13.2 Vérifier le statut git final**

```bash
git status
git log --oneline -15
```
Expected : working tree clean, 8-9 commits depuis le début (assets, icons, data, scaffold, runtime, css, 3 intégrations, sitemap).

- [ ] **13.3 Push direct sur main (conformément à feedback_git_workflow_mkr.md)**

```bash
git push origin main
```
Expected : push réussi, déclenche le redéploiement Vercel automatique.

- [ ] **13.4 Surveiller le déploiement Vercel**

```bash
sleep 60
open https://vercel.com/davidkhazaeich-code/mkrcamp/deployments
```
Vérifier que le build passe (sinon investiguer dans Vercel logs). Une fois prod up, vérifier visuellement sur https://mkrcamp.com/programme/mma.

- [ ] **13.5 Vérifier en prod (avec purge cache si nécessaire)**

Conformément à `feedback_purge_cache_on_push.md`, purger le cache si applicable :
```bash
open https://mkrcamp.com/programme/mma
```
Cmd+Shift+R (hard reload). Vérifier les 3 surfaces (mma, temoignages, home).

---

## Self-Review (à exécuter après écriture du plan)

### 1. Spec coverage

| Spec section | Tâche correspondante |
|---|---|
| §1 Objectif | Couvert globalement |
| §2 Décisions validées | Implicite (toutes appliquées dans les tâches) |
| §3.1 Nouveau composant | Tâches 4-5 |
| §3.2 API props | Tâche 4.1 |
| §3.3 Structure JSX | Tâches 4-5 |
| §3.4 Logique runtime (IO, sync, son, modal, reduced-motion, hint, erreur) | Tâche 5 |
| §4 Assets vidéo (ffmpeg, fallback pad) | Tâche 1 |
| §5.1 Intégration MMA | Tâche 7 |
| §5.2 Intégration /temoignages + label séparateur | Tâche 8 |
| §5.3 Intégration homepage (dynamic import, position) | Tâche 9 |
| §6.1 Frame (border-radius, shadow 3 couches, overlay, halo) | Tâche 6 CSS |
| §6.2 Overlays (watermark, timestamp, identity pill, sound, expand, hint) | Tâches 4-5 JSX + Tâche 6 CSS |
| §6.3 Animations d'entrée (clip-path, halo, stagger) | Tâche 6 CSS + Tâche 5 isRevealed state |
| §6.4 Timeline interactive (vertical desktop, chips mobile) | Tâche 5 + Tâche 6 CSS |
| §6.5 Typo (label underline, title balance, intro max-width) | Tâche 6 CSS |
| §6.6 Fond & couleurs (surface-lowest, pas de noir) | Tâche 6 CSS |
| §6.7 Fallbacks (erreur vidéo, autoplay bloqué) | Tâche 5 (videoError state + fallback img) |
| §6.8 Mobile spécifique | Tâche 6 CSS (media queries) |
| §7 CSS architecture (`.vvs-*` namespace) | Tâche 6 |
| §8 Propagation SITEMAP.md (sections + §6 + §6bis) | Tâche 11 |
| §9 Tests d'acceptance (10 tests) | Tâche 12 |
| §10 Liste fichiers touchés | Covered in File Structure |

Coverage : 100% ✓.

### 2. Placeholder scan

- Pas de "TBD" / "TODO" / "fill in details"
- Pas de "implement later"
- Tous les codes blocs contiennent le code complet (pas de "..." sauf dans la spec section qui montre l'intention)
- Les timestamps `00:06, 00:18, ...` sont indicatifs mais marqués comme tels dans le data file (commentaire `// Timestamps indicatifs — à ajuster après visionnage`). Acceptable car ajustement post-encodage.

### 3. Type consistency

- `VerticalVideoSplitProps` interface définie en tâche 4, utilisée en tâche 5 (réécriture complète préserve la signature)
- `VideoMomentProp` (tâche 4) ≈ `VideoMoment` (tâche 3 data file) — noms différents mais structure identique. Importé via `ANTOINE_PARCOURS_MOMENTS` qui est typé `VideoMoment[]` → assigné à prop `moments: VideoMomentProp[]`. Compatibilité par structure (TypeScript duck typing) ✓
- `ANTOINE_PARCOURS_ASSETS` (tâche 3) → spread sur props dans tâches 7/8/9. Les clés `src, webmSrc, poster, duration, identityLabel` matchent exactement les props attendues ✓
- `ANTOINE_PARCOURS_VARIANTS.{mma|temoignages|home}` (tâche 3) → spread sur props. Les clés `label, title, intro, primaryCta, secondaryCta?` matchent ✓
- Icons utilisés (`camera`, `volume-on`, `volume-off`, `fullscreen`, `arrow-right`) : `camera` et `arrow-right` existent déjà dans Icon.tsx ; les 3 autres sont ajoutés en tâche 2 ✓
- `VideoModal` props (`src`, `poster`, `title`, `subtitle`, `onClose`) matchent l'API existante du composant lue en pré-impl ✓

### Plan complet. Pas de modification inline nécessaire.

---

## Hors scope (rappel)

- Sous-titres WebVTT (vidéo sans paroles)
- Analytics events tracking
- Schema.org `VideoObject` JSON-LD (V2)
- Préchargement `<link rel="preload" as="video">`
- Variation alternance "video on right" (prop existe mais pas utilisée)

Tout cela est documenté dans la spec §11 et peut être ajouté en V2 si besoin.

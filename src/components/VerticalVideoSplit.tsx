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

  // Pause video when modal opens, resume when it closes
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

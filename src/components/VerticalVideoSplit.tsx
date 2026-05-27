'use client'

import { useEffect, useRef, useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import Icon from './Icon'
import VideoModal from './VideoModal'

export interface VerticalVideoSplitProps {
  src: string
  webmSrc?: string
  poster: string
  duration: string
  identityLabel: string
  label: string
  title: string
  intro: string
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
  primaryCta,
  secondaryCta,
  videoOnLeft = true,
  ariaLabel,
}: VerticalVideoSplitProps) {
  const t = useTranslations('home.vertical_video_split')
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showSoundHint, setShowSoundHint] = useState(false)
  const [hasReducedMotion, setHasReducedMotion] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)
  const [needsTap, setNeedsTap] = useState(false)

  // Detect prefers-reduced-motion (also surfaces play overlay)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setHasReducedMotion(mq.matches)
    if (mq.matches) setNeedsTap(true)
    const onChange = (e: MediaQueryListEvent) => {
      setHasReducedMotion(e.matches)
      if (e.matches) setNeedsTap(true)
    }
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
        // Lower threshold for mobile reliability — section is often taller than viewport
        if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
          if (!hasReducedMotion && !modalOpen) {
            video.play()
              .then(() => setNeedsTap(false))
              .catch(() => setNeedsTap(true))
          }
        } else {
          video.pause()
        }
      },
      { threshold: [0, 0.25] }
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

  // Pause video when modal opens, resume when it closes
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (modalOpen) video.pause()
    else if (!hasReducedMotion && !needsTap) video.play().catch(() => {})
  }, [modalOpen, hasReducedMotion, needsTap])

  const handlePlayTap = () => {
    const video = videoRef.current
    if (!video) return
    video.play()
      .then(() => setNeedsTap(false))
      .catch(() => {})
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setIsMuted(video.muted)
    setShowSoundHint(false)
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
      aria-label={ariaLabel || t('section_aria_default', { title })}
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
                  aria-label={ariaLabel || t('video_aria_default', { identity: identityLabel })}
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
                  aria-label={isMuted ? t('sound_on_aria') : t('sound_off_aria')}
                >
                  <Icon name={isMuted ? 'volume-off' : 'volume-on'} size={20} />
                </button>
              )}

              <button
                type="button"
                className="vvs-expand-btn"
                onClick={() => setModalOpen(true)}
                aria-label={t('fullscreen_aria')}
              >
                <Icon name="fullscreen" size={18} />
              </button>

              {showSoundHint && (
                <div className="vvs-sound-hint" aria-hidden>
                  <Icon name="volume-on" size={14} /> {t('sound_hint')}
                </div>
              )}

              {needsTap && !videoError && (
                <button
                  type="button"
                  className="vvs-play-overlay"
                  onClick={handlePlayTap}
                  aria-label={t('play_aria')}
                >
                  <span className="vvs-play-circle">
                    <Icon name="play" size={40} />
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="vvs-content">
            <span className="vvs-label">{label}</span>
            <h2 className="vvs-title">{title}</h2>
            <p className="vvs-intro">{intro}</p>

            <div className="vvs-cta-row">
              <Link href={primaryCta.href as Parameters<typeof Link>[0]['href']} className="btn-primary">
                {primaryCta.label} <Icon name="arrow-right" size={16} />
              </Link>
              {secondaryCta && (
                <Link href={secondaryCta.href as Parameters<typeof Link>[0]['href']} className="btn-ghost">
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

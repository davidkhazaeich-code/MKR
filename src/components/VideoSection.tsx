'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import Icon from './Icon'

export default function VideoSection() {
  const t = useTranslations('home.video_section')
  const videoRef = useRef<HTMLVideoElement>(null)
  const startedAtRef = useRef(0)
  const [hasStarted, setHasStarted] = useState(false)

  const startPlayback = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    startedAtRef.current = performance.now()
    setHasStarted(true)
    video.muted = false
    video.play().catch(() => setHasStarted(false))
  }, [])

  // Bouton « voir la vidéo » du hero : scroll vers la section + lecture immédiate
  // (le play() reste dans la fenêtre d'activation utilisateur du clic, son autorisé)
  useEffect(() => {
    const onPlayRequest = () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      videoRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' })
      startPlayback()
    }
    document.addEventListener('mkr:play-film', onPlayRequest)
    return () => document.removeEventListener('mkr:play-film', onPlayRequest)
  }, [startPlayback])

  // Pause la lecture quand la section sort du viewport (pas de reprise auto).
  // Période de grâce : pendant le smooth scroll déclenché depuis le hero, la
  // section n'est pas encore visible et l'observer pauserait immédiatement.
  useEffect(() => {
    const video = videoRef.current
    if (!video || !hasStarted) return
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        if (performance.now() - startedAtRef.current < 2000) return
        if (!entry.isIntersecting && !video.paused) video.pause()
      },
      { threshold: 0.2 }
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [hasStarted])

  const handleEnded = () => {
    // load() restaure le poster (title card) une fois le film terminé
    videoRef.current?.load()
    setHasStarted(false)
  }

  return (
    <section id="video-section" aria-labelledby="video-heading">
      <div className="video-glow" aria-hidden="true"></div>
      <div className="inner">
        <div className="video-section-header reveal">
          <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '1rem' }}>
            {t('label')}
          </span>
          <h2 id="video-heading" className="video-section-title">
            {t('title_line1')}<br />{t('title_line2_prefix')}<span>{t('title_line2_highlight')}</span>
          </h2>
          <p className="video-section-sub">{t('subtitle')}</p>
        </div>

        <div className={`video-main video-main--player reveal${hasStarted ? ' is-started' : ''}`}>
          <video
            ref={videoRef}
            className="video-real"
            poster="/videos/presentation-camp-poster.jpg"
            preload="none"
            playsInline
            controls={hasStarted}
            onEnded={handleEnded}
            aria-label={t('video_aria')}
          >
            <source src="/videos/presentation-camp.mp4" type="video/mp4" />
          </video>

          {!hasStarted && (
            <button
              type="button"
              className="video-main-inner video-start-btn"
              onClick={startPlayback}
              aria-label={t('play_aria')}
            >
              <span className="play-btn" aria-hidden="true">
                <Icon name="play" size={28} color="#F8F8F8" />
              </span>
              <span className="video-caption">{t('play_caption')}</span>
              <span className="video-duration">{t('duration')}</span>
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

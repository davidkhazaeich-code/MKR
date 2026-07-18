'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import Icon from './Icon'

// idle : poster + overlay play · loading : play() lancé, 1res frames pas encore là
// playing : lecture en cours · ended : film fini, poster + overlay « revoir »
type Phase = 'idle' | 'loading' | 'playing' | 'ended'

export default function VideoSection() {
  const t = useTranslations('home.video_section')
  const videoRef = useRef<HTMLVideoElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const startedAtRef = useRef(0)
  const [phase, setPhase] = useState<Phase>('idle')
  const started = phase === 'loading' || phase === 'playing'

  const startPlayback = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    startedAtRef.current = performance.now()
    setPhase('loading')
    video.muted = false
    video.play().catch(() => setPhase('idle'))
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

  // Zoom cinématique : l'écran grandit légèrement en entrant dans le viewport
  useEffect(() => {
    let cancelled = false
    let ctx: { revert: () => void } | undefined
    ;(async () => {
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      if (cancelled || !frameRef.current) return
      gsap.registerPlugin(ScrollTrigger)
      ctx = gsap.context(() => {
        const mm = gsap.matchMedia()
        mm.add('(prefers-reduced-motion: no-preference)', () => {
          gsap.fromTo(
            frameRef.current,
            { scale: 0.94 },
            {
              scale: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: frameRef.current,
                start: 'top 95%',
                end: 'top 42%',
                scrub: 0.4,
              },
            }
          )
        })
        mm.add('(prefers-reduced-motion: reduce)', () => {
          gsap.set(frameRef.current, { scale: 1 })
        })
      })
    })()
    return () => {
      cancelled = true
      ctx?.revert()
    }
  }, [])

  // Pause la lecture quand la section sort du viewport (pas de reprise auto).
  // Période de grâce : pendant le smooth scroll déclenché depuis le hero, la
  // section n'est pas encore visible et l'observer pauserait immédiatement.
  useEffect(() => {
    const video = videoRef.current
    if (!video || !started) return
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
  }, [started])

  const handleEnded = () => {
    // load() restaure le poster (title card), l'overlay revient en mode « revoir »
    videoRef.current?.load()
    setPhase('ended')
  }

  return (
    // is-playing éteint les lumières de la salle (header + générique en retrait)
    <section id="video-section" className={started ? 'is-playing' : undefined} aria-labelledby="video-heading">
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
      </div>

      {/* Salle de cinéma : bande breakout hors .inner (échappe aussi au parallax
          de ScrollParallax qui ne cible que le .inner → l'écran reste stable).
          Wrapper .reveal à className STATIQUE, obligatoire : RevealObserver pose
          la classe `visible` hors React puis cesse d'observer. Si `reveal` vivait
          sur un élément à className dynamique, React effacerait `visible` au
          re-render et le bloc refondrait à opacity 0 (bug « vidéo disparaît »). */}
      <div className="vs-cinema reveal">
        <p className="vs-presents" aria-hidden="true"><span>{t('presents')}</span></p>

        <div className="vs-frame" ref={frameRef}>
          <div className={`video-main video-main--player${started ? ' is-started' : ''}`}>
            <video
              ref={videoRef}
              className="video-real"
              poster="/videos/presentation-camp-poster.jpg"
              preload="none"
              playsInline
              controls={started}
              onPlaying={() => setPhase('playing')}
              onEnded={handleEnded}
              aria-label={t('video_aria')}
            >
              <source src="/videos/presentation-camp.mp4" type="video/mp4" />
            </video>

            {phase === 'loading' && (
              <span className="video-loading" aria-hidden="true">
                <span className="video-loading-spinner" />
              </span>
            )}

            {/* Overlay toujours monté : fondu d'ouverture / fermeture au lieu d'un
                mount/unmount abrupt. Masqué (visibility) pendant la lecture. */}
            <button
              type="button"
              className={`video-main-inner video-start-btn${started ? ' is-hidden' : ''}`}
              onClick={startPlayback}
              disabled={started}
              tabIndex={started ? -1 : 0}
              aria-hidden={started}
              aria-label={phase === 'ended' ? t('replay_aria') : t('play_aria')}
            >
              <span className="play-btn" aria-hidden="true">
                <Icon name={phase === 'ended' ? 'rotate-ccw' : 'play'} size={28} color="#F8F8F8" />
              </span>
              <span className="video-caption">
                {phase === 'ended' ? t('replay_caption') : t('play_caption')}
              </span>
            </button>

            {/* Coins caméra (repères de cadre), éteints pendant la lecture */}
            <span className="vs-corner vs-corner--a" aria-hidden="true" />
            <span className="vs-corner vs-corner--b" aria-hidden="true" />
          </div>
        </div>

        <div className="vs-billing" aria-hidden="true">
          <span>{t('shot_in')}</span>
          <span className="vs-billing-time">{t('duration')}</span>
        </div>
      </div>
    </section>
  )
}

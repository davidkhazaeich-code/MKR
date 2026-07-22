'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import Icon from './Icon'

// idle : poster + overlay play · loading : play() lancé, 1res frames pas encore là
// playing : lecture · paused : pause (salle rallumée + gros play de reprise)
// ended : film fini, poster + overlay « revoir »
type Phase = 'idle' | 'loading' | 'playing' | 'paused' | 'ended'

// Vidéo Safari iOS : fullscreen natif via webkitEnterFullscreen (l'API standard
// requestFullscreen sur un élément n'existe pas sur iPhone).
type FullscreenVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void }

export default function VideoSection() {
  const t = useTranslations('home.video_section')
  const locale = useLocale()
  // Assets du film versionnés par langue (-fr, -en). Un nom de fichier par langue
  // garantit aussi le rafraîchissement du cache (le CDN Vercel ignore la query
  // string sur les assets statiques). Encodé léger (CRF 31/33) : en CRF 25 les
  // vidéos débordaient le disque de build Vercel (ENOSPC). Cf. SITEMAP 2026-07-21.
  const filmBase = `/videos/presentation-camp-${locale}`

  const videoRef = useRef<HTMLVideoElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const startedAtRef = useRef(0)
  const [phase, setPhase] = useState<Phase>('idle')
  const [muted, setMuted] = useState(false)
  // Orientation de la source : 9:16 vertical sur mobile (<=700px), 16:9 sinon.
  // Les 2 exports par langue existent ; le bon est servi selon le viewport, et le
  // choix est gelé dès que la lecture démarre (pas de swap de source en plein film).
  const [isVertical, setIsVertical] = useState(false)
  const startedRef = useRef(false)
  // started : lecture engagée (poster/overlay masqués, contrôles natifs affichés)
  const started = phase === 'loading' || phase === 'playing' || phase === 'paused'
  startedRef.current = started
  // lumières éteintes uniquement pendant la projection (pause = salle rallumée)
  const lightsOff = phase === 'loading' || phase === 'playing'

  const startPlayback = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    startedAtRef.current = performance.now()
    setPhase('loading')
    video.muted = false
    video.play().catch(() => setPhase('idle'))
  }, [])

  // Source adaptée au viewport : 9:16 vertical sur mobile, 16:9 sinon. Gelée
  // pendant la lecture pour ne pas recharger le film si on redimensionne.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 700px)')
    const apply = () => {
      if (!startedRef.current) setIsVertical(mq.matches)
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
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

  const handlePause = () => {
    // 'pause' est aussi émis juste avant 'ended' : on laisse handleEnded conclure
    const video = videoRef.current
    if (video && !video.ended) setPhase('paused')
  }

  const resumePlayback = () => {
    videoRef.current?.play().catch(() => {})
  }

  // Son on/off : on bascule muted, l'état de l'icône suit via onVolumeChange
  // (couvre aussi une coupure faite depuis les contrôles natifs).
  const toggleMute = () => {
    const video = videoRef.current
    if (video) video.muted = !video.muted
  }

  // Plein écran natif : requestFullscreen (Android/desktop) sinon
  // webkitEnterFullscreen (iPhone). Les contrôles natifs s'affichent alors.
  const enterFullscreen = () => {
    const video = videoRef.current as FullscreenVideo | null
    if (!video) return
    if (typeof video.requestFullscreen === 'function') {
      void video.requestFullscreen().catch(() => {})
    } else if (typeof video.webkitEnterFullscreen === 'function') {
      video.webkitEnterFullscreen()
    }
  }

  return (
    // is-playing éteint les lumières de la salle (header + générique en retrait)
    <section id="video-section" className={lightsOff ? 'is-playing' : undefined} aria-labelledby="video-heading">
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

        <div className={`vs-frame${isVertical ? ' vs-frame--vertical' : ''}`} ref={frameRef}>
          <div className={`video-main video-main--player${started ? ' is-started' : ''}`}>
            <video
              ref={videoRef}
              className="video-real"
              poster={`${filmBase}${isVertical ? '-vertical' : ''}-poster.jpg`}
              src={`${filmBase}${isVertical ? '-vertical' : ''}.mp4`}
              preload="none"
              playsInline
              controls={started}
              onPlay={() => setPhase((prev) => (prev === 'paused' ? 'playing' : prev))}
              onPlaying={() => setPhase('playing')}
              onPause={handlePause}
              onEnded={handleEnded}
              onVolumeChange={() => {
                const v = videoRef.current
                if (v) setMuted(v.muted)
              }}
              aria-label={t('video_aria')}
            />

            {/* Contrôles rapides mobile : son on/off + plein écran, bien en
                évidence en haut à droite (les contrôles natifs restent en bas
                pour la lecture / la barre de progression). */}
            {started && isVertical && (
              <div className="vs-controls">
                <button
                  type="button"
                  className="vs-ctrl-btn"
                  onClick={toggleMute}
                  aria-label={muted ? t('unmute_aria') : t('mute_aria')}
                  aria-pressed={muted}
                >
                  <Icon name={muted ? 'volume-off' : 'volume-on'} size={22} />
                </button>
                <button
                  type="button"
                  className="vs-ctrl-btn"
                  onClick={enterFullscreen}
                  aria-label={t('fullscreen_aria')}
                >
                  <Icon name="fullscreen" size={22} />
                </button>
              </div>
            )}

            {phase === 'loading' && (
              <span className="video-loading" aria-hidden="true">
                <span className="video-loading-spinner" />
              </span>
            )}

            {/* Pause : gros play central pour reprendre (la zone des contrôles
                natifs en bas reste libre, cf. inset CSS) */}
            {phase === 'paused' && (
              <button
                type="button"
                className="video-resume"
                onClick={resumePlayback}
                aria-label={t('resume_aria')}
              >
                <span className="video-resume-btn" aria-hidden="true">
                  <Icon name="play" size={36} color="#F8F8F8" />
                </span>
              </button>
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

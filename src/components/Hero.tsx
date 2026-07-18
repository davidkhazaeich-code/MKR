'use client'

import { Link } from '@/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useRef, useState, useCallback } from 'react'
import Icon from '@/components/Icon'
import { SESSIONS } from '@/data/sessions'
import { hydrateSessions } from '@/lib/session-display'
import { MIN_PRICE_PER_ADULT_LABEL } from '@/lib/pricing-copy'
import PlacesRestantes from '@/components/PlacesRestantes'

const HERO_VIDEOS_DESKTOP = [
  '/videos/hero-mountains.mp4',
  '/videos/hero-mkr-core.mp4',
]
const HERO_VIDEOS_MOBILE = [
  '/videos/hero-mountains.mp4',
  '/videos/hero-mkr-core-vertical.mp4',
]
const HERO_POSTERS: Record<string, string> = {
  '/videos/hero-mountains.mp4': '/videos/hero-mountains-poster.jpg',
  '/videos/hero-mkr-core.mp4': '/videos/hero-mkr-core-poster.jpg',
  '/videos/hero-mkr-core-vertical.mp4': '/videos/hero-mkr-core-vertical-poster.jpg',
}
// Durees alignees sur la duree naturelle de chaque MKR core
// (desktop 55.66s, mobile vertical 46.2s) pour eviter de couper la video au milieu.
const VIDEO_DURATIONS_DESKTOP = [3500, 55000]
const VIDEO_DURATIONS_MOBILE = [3500, 45500]
const FADE_DURATION = 1500   // ms crossfade
const MOBILE_BREAKPOINT_QUERY = '(max-width: 700px)'

export default function Hero() {
  const t = useTranslations('home.hero')
  const locale = useLocale()
  const heroSectionRef = useRef<HTMLElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const embersCanvasRef = useRef<HTMLCanvasElement>(null)

  const HERO_VIDEOS = isMobile ? HERO_VIDEOS_MOBILE : HERO_VIDEOS_DESKTOP
  const VIDEO_DURATIONS = isMobile ? VIDEO_DURATIONS_MOBILE : VIDEO_DURATIONS_DESKTOP

  // ── Mobile detection (vertical MKR core variant) ─────────
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_BREAKPOINT_QUERY)
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // ── Video crossfade en boucle : montagne 3.5s -> MKR core 10s -> repeat ──
  useEffect(() => {
    const timeout = setTimeout(() => {
      setActiveIndex(prev => (prev + 1) % HERO_VIDEOS.length)
    }, VIDEO_DURATIONS[activeIndex])
    return () => clearTimeout(timeout)
  }, [activeIndex, HERO_VIDEOS.length])

  // ── Prefetch MKR core pendant l'intro montagne (~600ms apres mount)
  //    pour que le crossfade soit instant + pas de stall.
  //    Skip sur Save-Data / 2G pour respecter la connexion utilisateur. ──
  useEffect(() => {
    const nextSrc = HERO_VIDEOS[1]
    if (!nextSrc) return
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
    if (conn?.saveData) return
    if (conn?.effectiveType === 'slow-2g' || conn?.effectiveType === '2g') return

    let link: HTMLLinkElement | null = null
    const timer = setTimeout(() => {
      link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'video'
      link.href = nextSrc
      link.type = 'video/mp4'
      document.head.appendChild(link)
    }, 600)
    return () => {
      clearTimeout(timer)
      if (link?.parentNode) link.parentNode.removeChild(link)
    }
  }, [isMobile])

  // ── Force play sur mobile (iOS Safari/Android exigent .play() manuel
  //    quand preload est limité, même avec autoPlay + muted + playsInline) ──
  useEffect(() => {
    const section = heroSectionRef.current
    if (!section) return
    const videos = section.querySelectorAll<HTMLVideoElement>('video.hero-video')
    videos.forEach(v => {
      // playsInline est forcé côté JS aussi (parfois ignoré côté React sur certains UA)
      v.muted = true
      v.setAttribute('playsinline', '')
      v.setAttribute('webkit-playsinline', '')
      const tryPlay = () => v.play().catch(() => { /* iOS low-power mode : silent fail */ })
      tryPlay()
      v.addEventListener('loadedmetadata', tryPlay, { once: true })
      v.addEventListener('canplay', tryPlay, { once: true })
    })
  }, [activeIndex])

  // ── Embers canvas ─────────────────────────────────────────
  useEffect(() => {
    const canvas = embersCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const PARTICLE_COUNT = 65
    let animId: number | null = null
    let running = false

    function resize() {
      if (!canvas) return
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    function spawnEmber(i: number) {
      if (!canvas) return null
      return {
        x: canvas.width * (0.2 + Math.random() * 0.6),
        y: canvas.height * (0.72 + Math.random() * 0.28),
        vx: (Math.random() - 0.5) * 0.65,
        vy: -(Math.random() * 0.85 + 0.28),
        life: 0,
        maxLife: Math.random() * 190 + 75,
        size: Math.random() * 1.8 + 0.4,
        hue: Math.random() > 0.5 ? 'rgba(200,75,49,' : 'rgba(175,28,18,',
        _i: i,
      }
    }

    const embers: ReturnType<typeof spawnEmber>[] = []

    function buildEmbers() {
      embers.length = 0
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = spawnEmber(i)
        if (p) {
          p.life = Math.floor(Math.random() * p.maxLife)
          embers.push(p)
        }
      }
    }

    function drawEmbers() {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < embers.length; i++) {
        const p = embers[i]
        if (!p) continue
        p.life++
        if (p.life > p.maxLife) {
          embers[i] = spawnEmber(i)
          continue
        }
        const progress = p.life / p.maxLife
        const alpha = progress < 0.2
          ? (progress / 0.2) * 0.8
          : (1 - progress) * 0.8
        p.x += p.vx + Math.sin(p.life * 0.04) * 0.14
        p.y += p.vy
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * (1 - progress * 0.5), 0, Math.PI * 2)
        ctx.fillStyle = p.hue + alpha.toFixed(3) + ')'
        ctx.fill()
      }
      animId = requestAnimationFrame(drawEmbers)
    }

    function start() {
      if (running) return
      running = true
      animId = requestAnimationFrame(drawEmbers)
    }

    function stop() {
      running = false
      if (animId) { cancelAnimationFrame(animId); animId = null }
    }

    resize()
    buildEmbers()

    const onResize = () => { resize(); buildEmbers() }
    window.addEventListener('resize', onResize)

    const heroEl = document.getElementById('hero')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) start(); else stop() })
    }, { threshold: 0 })
    if (heroEl) obs.observe(heroEl)
    const deferId = setTimeout(() => start(), 150)

    return () => {
      stop()
      clearTimeout(deferId)
      window.removeEventListener('resize', onResize)
      obs.disconnect()
    }
  }, [])

  return (
    <section id="hero" ref={heroSectionRef} aria-label={t('section_aria')}>

      {/* Background videos with crossfade */}
      {HERO_VIDEOS.map((src, i) => (
        <video
          key={src}
          className={`hero-video${i === activeIndex ? ' hero-video--active' : ''}`}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={HERO_POSTERS[src]}
          aria-hidden="true"
          {...{ 'webkit-playsinline': '' }}
        >
          <source src={src} type="video/mp4" />
        </video>
      ))}

      {/* Dark overlay on video */}
      <div className="hero-video-overlay" aria-hidden="true" />

      {/* Embers canvas */}
      <canvas ref={embersCanvasRef} id="canvas-embers" aria-hidden="true"></canvas>

      {/* Hero content */}
      <div className="hero-content">
        <h1 className="hero-pill hero-eyebrow-h1">{t('pill')}</h1>

        <p className="hero-h1" role="text" aria-label={`${t('title_line1')} ${t('title_line2')} ${t('title_line3_prefix')}${t('title_line3_highlight')}`}>
          {t('title_line1')}<br />
          {t('title_line2')}<br />
          {t('title_line3_prefix')}<span className="highlight">{t('title_line3_highlight')}</span>
        </p>

        <p className="hero-subtitle">{t('subtitle')}</p>

        <div className="hero-ctas">
          <Link href="/inscription" className="btn-primary">{t('cta_primary')}</Link>
          {/* FR : le film remplace « Découvrir le camp » en CTA secondaire.
              EN garde l'ancien lien tant que la vidéo EN n'existe pas. */}
          {locale === 'fr' ? (
            <button
              type="button"
              className="btn-ghost hero-video-btn"
              onClick={() => document.dispatchEvent(new Event('mkr:play-film'))}
            >
              <Icon name="play" size={20} color="var(--primary)" />
              <span>{t('cta_video')}</span>
            </button>
          ) : (
            <a href="#facilitator" className="btn-ghost">{t('cta_secondary')}</a>
          )}
        </div>

        <div className="hero-stats">
          <div className="hero-stat-item">
            <span className="hero-stat-num">{t('stats.destinations_value')}</span>
            <span className="hero-stat-label hero-stat-label--desktop">{t('stats.destinations_label_desktop')}</span>
            <span className="hero-stat-label hero-stat-label--mobile">{t('stats.destinations_label_mobile')}</span>
          </div>
          <div className="hero-stat-item hero-stat-item--hide-mobile">
            <span className="hero-stat-num">{t('stats.disciplines_value')}</span>
            <span className="hero-stat-label">{t('stats.disciplines_label')}</span>
          </div>
          <div className="hero-stat-item hero-stat-item--hide-mobile">
            <span className="hero-stat-num">{t('stats.duration_value')}</span>
            <span className="hero-stat-label">{t('stats.duration_label')}</span>
          </div>
        </div>

        {/* Camp carousel - inline on mobile, absolute on desktop */}
        <HeroCampCarousel />
      </div>

    </section>
  )
}

function HeroCampCarousel() {
  const t = useTranslations('home.hero')
  const tData = useTranslations('data.sessions')
  const [active, setActive] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setActive(prev => (prev + 1) % SESSIONS.length)
    }, 4500)
  }, [])

  useEffect(() => {
    startTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [startTimer])

  const goTo = (i: number) => {
    setActive(i)
    startTimer()
  }

  const sessions = hydrateSessions(SESSIONS, tData as never)
  const session = sessions[active]
  const priceFrom = `${tData('price_from_prefix')} ${MIN_PRICE_PER_ADULT_LABEL}`

  return (
    <div className="hero-camps" aria-label={t('carousel_aria')}>
      <div className="hero-camps-card" key={active}>
        <div className="hero-camps-top">
          <span className="hero-camps-label">{session.label}</span>
          <span className={`hero-camps-status hero-camps-status--${session.status}`}>
            <PlacesRestantes
              sessionId={session.id}
              variant="dual"
            />
          </span>
        </div>
        <div className="hero-camps-dates">{session.dates}</div>
        <div className="hero-camps-bottom">
          <span className="hero-camps-price">{priceFrom}</span>
          <Link href={`/inscription?type=session&session=${session.id}` as Parameters<typeof Link>[0]['href']} className="hero-camps-cta">{t('carousel_cta')}</Link>
        </div>
      </div>
      {SESSIONS.length > 1 && (
        <div className="hero-camps-dots">
          {SESSIONS.map((_, i) => (
            <button
              key={i}
              className={`hero-camps-dot${i === active ? ' active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={t('carousel_dot_aria', { n: i + 1 })}
            />
          ))}
        </div>
      )}
    </div>
  )
}

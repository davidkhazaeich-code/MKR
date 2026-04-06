'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, useCallback } from 'react'
import { SESSIONS, formatPrice } from '@/data/sessions'

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const embersCanvasRef = useRef<HTMLCanvasElement>(null)

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
    <section id="hero" aria-label="En-tête héroïque">

      {/* Background video */}
      <video
        ref={videoRef}
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source src="/videos/hero-mountains.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay on video */}
      <div className="hero-video-overlay" aria-hidden="true" />

      {/* Embers canvas */}
      <canvas ref={embersCanvasRef} id="canvas-embers" aria-hidden="true"></canvas>

      {/* Hero content */}
      <div className="hero-content">
        <span className="hero-pill">MKR Caucasian Camp · MMA / Lutte</span>

        <h1 className="hero-h1">
          ENTRAÎNE-TOI LÀ<br />
          OÙ NAISSENT<br />
          LES <span className="highlight">CHAMPIONS</span>
        </h1>

        <p className="hero-subtitle">Camp d&apos;entraînement MMA &amp; Lutte au coeur du Caucase, Géorgie</p>

        <div className="hero-ctas">
          <Link href="#contact" className="btn-primary">POSTULER AU CAMP</Link>
          <Link href="#video-section" className="btn-ghost">DÉCOUVRIR</Link>
        </div>

        <div className="hero-stats">
          <div className="hero-stat-item">
            <span className="hero-stat-num">240+</span>
            <span className="hero-stat-label">Athlètes formés</span>
          </div>
          <div className="hero-stat-item">
            <span className="hero-stat-num">12</span>
            <span className="hero-stat-label">Disciplines</span>
          </div>
          <div className="hero-stat-item">
            <span className="hero-stat-num">3</span>
            <span className="hero-stat-label">Semaines d&apos;immersion</span>
          </div>
        </div>
      </div>

      {/* Camp carousel -bottom right */}
      <HeroCampCarousel />

      {/* Scroll indicator */}
      <div className="scroll-indicator" aria-hidden="true">
        <div className="scroll-line">
          <div className="scroll-line-fill"></div>
        </div>
        <span className="scroll-label">SCROLL</span>
      </div>

    </section>
  )
}

function HeroCampCarousel() {
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

  const session = SESSIONS[active]

  return (
    <div className="hero-camps" aria-label="Prochaines sessions">
      <div className="hero-camps-card" key={active}>
        <div className="hero-camps-top">
          <span className="hero-camps-label">{session.label}</span>
          <span className={`hero-camps-status hero-camps-status--${session.status}`}>
            {session.spotsLabel}
          </span>
        </div>
        <div className="hero-camps-dates">{session.dates}</div>
        <div className="hero-camps-bottom">
          <span className="hero-camps-price">{formatPrice(session)}</span>
          <Link href="/inscription" className="hero-camps-cta">S&apos;inscrire →</Link>
        </div>
      </div>
      <div className="hero-camps-dots">
        {SESSIONS.map((_, i) => (
          <button
            key={i}
            className={`hero-camps-dot${i === active ? ' active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Session ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

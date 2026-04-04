'use client'

import { useEffect, useRef } from 'react'

export default function Hero() {
  const starsCanvasRef = useRef<HTMLCanvasElement>(null)
  const embersCanvasRef = useRef<HTMLCanvasElement>(null)

  // ── Stars canvas ──────────────────────────────────────────
  useEffect(() => {
    const canvas = starsCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const STAR_COUNT = 220
    let stars: {
      x0: number
      y: number
      r: number
      twinkleSpd: number
      phase: number
      brightness: number
      driftSpeed: number
    }[] = []
    let animId: number | null = null
    let running = false

    function resize() {
      if (!canvas) return
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    function buildStars() {
      if (!canvas) return
      stars = []
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x0: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.2 + 0.3,
          twinkleSpd: Math.random() * 0.015 + 0.005,
          phase: Math.random() * Math.PI * 2,
          brightness: Math.random() * 0.5 + 0.3,
          driftSpeed: Math.random() * 18 + 10,
        })
      }
    }

    function drawStars(time: number) {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const W = canvas.width
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]
        const x = ((s.x0 - time * s.driftSpeed) % W + W) % W
        const twinkle = s.brightness + Math.sin(time * s.twinkleSpd + s.phase) * 0.25
        const alpha = Math.max(0.05, Math.min(1, twinkle))
        ctx.beginPath()
        ctx.arc(x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(248,248,248,${alpha.toFixed(3)})`
        ctx.fill()
      }
    }

    let startTime: number | null = null
    function loop(ts: number) {
      if (!startTime) startTime = ts
      drawStars((ts - startTime) * 0.001)
      animId = requestAnimationFrame(loop)
    }

    function start() {
      if (running) return
      running = true
      startTime = null
      animId = requestAnimationFrame(loop)
    }

    function stop() {
      running = false
      if (animId) { cancelAnimationFrame(animId); animId = null }
    }

    resize()
    buildStars()

    const onResize = () => { resize(); buildStars() }
    window.addEventListener('resize', onResize)

    const heroEl = document.getElementById('hero')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) start(); else stop() })
    }, { threshold: 0 })
    if (heroEl) obs.observe(heroEl)
    start()

    return () => {
      stop()
      window.removeEventListener('resize', onResize)
      obs.disconnect()
    }
  }, [])

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

    // spawnEmber MUST be defined before embers array declaration (per original bug note)
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

    // embers array declared AFTER spawnEmber function — required to avoid animation bug
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
    start()

    return () => {
      stop()
      window.removeEventListener('resize', onResize)
      obs.disconnect()
    }
  }, [])

  // ── Parallax mountains ────────────────────────────────────
  useEffect(() => {
    const MTN_SPEEDS: Record<string, number> = {
      mtn8: 0.42,
      mtn7: 0.35,
      mtn6: 0.28,
      mtn5: 0.22,
      mtn4: 0.16,
      mtn3: 0.10,
      mtn2: 0.05,
      mtn1: 0.02,
    }

    if (window.innerWidth < 768) return

    const mtnEls: Record<string, HTMLElement | null> = {}
    Object.keys(MTN_SPEEDS).forEach(id => {
      mtnEls[id] = document.getElementById(id)
    })

    const heroEl = document.getElementById('hero')
    const heroContent = document.querySelector('.hero-content') as HTMLElement | null

    let ticking = false
    let scrollY = 0

    function updateParallax() {
      // Montagnes — parallax normal
      Object.keys(MTN_SPEEDS).forEach(id => {
        const el = mtnEls[id]
        if (!el) return
        el.style.transform = `translateY(${scrollY * MTN_SPEEDS[id]}px)`
      })

      // Texte — épinglé jusqu'à 30% viewport, borné pour ne jamais sortir du #hero
      if (heroContent && heroEl) {
        const heroHeight = heroEl.offsetHeight
        const contentHeight = heroContent.offsetHeight
        const maxSafe = Math.max(0, heroHeight - contentHeight)
        const stopPoint = Math.min(window.innerHeight * 0.3, maxSafe)
        const clampedY = Math.min(scrollY, stopPoint)
        heroContent.style.transform = `translateY(${clampedY}px)`
      }

      ticking = false
    }

    const onScroll = () => {
      scrollY = window.scrollY
      if (!ticking) {
        requestAnimationFrame(updateParallax)
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section id="hero" aria-label="En-tête héroïque">

      {/* Sky placeholder zone */}
      <div className="hero-sky" aria-hidden="true"></div>

      {/* Stars canvas */}
      <canvas ref={starsCanvasRef} id="canvas-stars" aria-hidden="true"></canvas>

      {/* Summit Mountain Glow */}
      <div className="summit-glow" aria-hidden="true"></div>

      {/* Mountains — 8-layer SVG parallax */}
      <div className="mountains-wrap" aria-hidden="true" id="mtn-wrap">

        {/* Layer 8 — grande montagne sombre, visible à droite à l'écran.
             mountains-wrap a scaleX(-1) → pic à x≈110 SVG = x≈1330 à l'écran.
             fill: #1a1715 pour être visible sur fond #0C0C0C (plus sombre que mtn6 #222220) */}
        <div className="mtn-layer" id="mtn8">
          <svg viewBox="0 0 1440 520" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
            {/* Corps — masse colossale, pic à gauche SVG = droite visuelle après scaleX(-1) */}
            <polygon fill="#1a1715" points="
              0,520 0,460 8,390 18,310 32,228 52,148 76,78
              96,26 110,4 124,26 148,72 188,132 246,200
              328,272 436,344 572,408 740,460 950,492
              1200,510 1440,518 1440,520
            " />
            {/* Calotte neigeuse — large et bien marquée */}
            <polygon fill="rgba(244,240,232,0.52)" points="
              88,50 96,26 110,4 124,26 148,72 168,104
              158,118 142,110 126,118 110,122
              96,116 84,106 78,84
            " />
            {/* Arête secondaire haute gauche */}
            <polygon fill="rgba(244,240,232,0.28)" points="
              60,120 68,98 82,82 90,92 78,114
            " />
            {/* Arête tertiaire droite */}
            <polygon fill="rgba(244,240,232,0.18)" points="
              165,160 176,142 190,128 198,140 184,158
            " />
          </svg>
        </div>

        {/* Layer 6 — farthest, lightest */}
        <div className="mtn-layer" id="mtn6">
          <svg viewBox="0 0 1440 500" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
            <polygon fill="#222220" points="
              0,500 0,320 60,295 120,280 190,268 260,255 330,262
              400,248 470,238 530,244 600,230 660,220 710,228
              760,215 820,225 880,212 940,220 1000,232 1060,218
              1120,228 1180,240 1240,252 1300,262 1360,278
              1440,295 1440,500
            " />
          </svg>
        </div>

        {/* Layer 5 */}
        <div className="mtn-layer" id="mtn5">
          <svg viewBox="0 0 1440 500" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
            <polygon fill="#1d1b19" points="
              0,500 0,340 50,318 100,300 160,285 210,268 260,252
              310,240 360,248 400,232 440,218 480,225 520,205
              560,192 600,200 640,186 670,175 700,168 730,178
              760,162 800,172 840,182 880,168 920,178 970,195
              1020,208 1080,222 1140,238 1200,255 1260,270
              1320,285 1380,305 1440,320 1440,500
            " />
          </svg>
        </div>

        {/* Layer 4 */}
        <div className="mtn-layer" id="mtn4">
          <svg viewBox="0 0 1440 500" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
            <polygon fill="#201e1b" points="
              0,500 0,360 40,338 90,315 140,295 185,275 230,258
              275,242 310,228 340,215 370,202 400,188 430,175
              455,162 478,148 500,135 520,122 540,115 555,106
              565,118 575,108 585,98 595,110 610,120 630,132
              655,148 680,165 710,182 745,200 785,218 830,232
              880,248 935,265 990,280 1050,295 1110,312
              1170,328 1230,344 1300,360 1370,375 1440,388
              1440,500
            " />
          </svg>
        </div>

        {/* Layer 3 — dramatic peaks with snow cap */}
        <div className="mtn-layer" id="mtn3">
          <svg viewBox="0 0 1440 500" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
            <polygon fill="#181614" points="
              0,500 0,390 30,370 75,345 115,322 150,302 185,280
              215,260 240,242 262,225 280,208 300,192 320,175
              342,158 360,142 376,126 390,112 402,98 415,85
              425,70 432,58 438,46 444,36 450,28 455,20 460,14
              464,8 467,4 470,0 473,4 476,10 480,20 486,32
              493,46 502,62 512,80 524,98 538,116 554,134
              572,152 592,170 614,188 638,208 665,228 695,248
              728,268 762,286 798,302 836,318 875,332 916,348
              960,362 1006,376 1055,388 1105,400 1155,410
              1205,420 1260,432 1320,444 1380,455 1440,464
              1440,500
            " />
            {/* Snow cap */}
            <polygon fill="rgba(242,237,228,0.26)" points="
              440,80 444,36 450,28 455,20 460,14 464,8 467,4
              470,0 473,4 476,10 480,20 486,32 493,46 502,62
              512,80 505,90 495,100 482,108 468,112 454,108 444,100
            " />
          </svg>
        </div>

        {/* Layer 2 — foreground ridge */}
        <div className="mtn-layer" id="mtn2">
          <svg viewBox="0 0 1440 500" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
            <polygon fill="#131110" points="
              0,500 0,430 20,415 55,395 95,370 135,348 170,328
              205,308 240,290 270,272 298,255 325,238 348,222
              368,205 385,188 400,172 413,156 425,140 435,125
              443,110 450,95 456,82 461,70 465,60 469,52
              473,58 477,68 482,80 488,95 496,112 506,130
              518,148 533,168 550,188 570,210 594,232 622,254
              653,275 688,295 726,315 767,332 810,348 855,362
              902,376 952,390 1004,403 1058,415 1114,426
              1172,436 1232,446 1295,455 1360,463 1440,472
              1440,500
            " />
            {/* Neige mtn2 — très discrète, style mtn3 */}
            <polygon fill="rgba(242,237,228,0.18)" points="
              441,124 450,104 457,86 462,70 469,52
              474,58 478,72 484,90 492,112 500,128
              490,134 478,124 469,130 459,124 450,130
            " />
          </svg>
        </div>

        {/* Layer 1 — closest, darkest base */}
        <div className="mtn-layer" id="mtn1">
          <svg viewBox="0 0 1440 500" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
            <polygon fill="#0A0A0A" points="
              0,500 0,475 40,460 90,440 145,418 200,398 255,378
              305,358 350,338 392,318 432,298 468,278 502,258
              534,238 564,218 592,198 618,178 642,158 664,138
              684,118 702,98 718,80 732,64 744,50 754,40
              762,32 770,38 778,50 788,66 800,86 814,108
              830,132 848,156 870,180 895,206 923,232 954,256
              988,278 1024,298 1062,316 1102,334 1144,350
              1188,366 1234,380 1282,394 1332,408 1386,420
              1440,432 1440,500
            " />
            {/* Neige mtn1 — calot pic, style mtn3 */}
            <polygon fill="rgba(242,237,228,0.24)" points="
              694,116 710,92 726,72 740,54 752,40 762,32
              772,38 782,54 794,72 808,96 820,118
              808,126 794,116 778,124 762,130 746,124 730,130 714,122 700,128
            " />
            {/* Patch arête gauche */}
            <polygon fill="rgba(242,237,228,0.14)" points="
              606,196 618,178 634,164 644,170 630,188 616,204
            " />
            {/* Patch arête droite */}
            <polygon fill="rgba(242,237,228,0.12)" points="
              858,174 870,180 882,196 872,204 860,196 850,182
            " />
          </svg>
        </div>

      </div>

      {/* Embers canvas */}
      <canvas ref={embersCanvasRef} id="canvas-embers" aria-hidden="true"></canvas>

      {/* Hero content */}
      <div className="hero-content">
        <span className="hero-pill">Caucasus Peak</span>

        <h1 className="hero-h1">
          ENTRAÎNE-TOI LÀ<br />
          OÙ NAISSENT<br />
          LES <span className="highlight">CHAMPIONS</span>
        </h1>

        <p className="hero-subtitle">Camp d&apos;entraînement MMA &amp; Lutte , Caucase, Géorgie</p>

        <div className="hero-ctas">
          <a href="#contact" className="btn-primary">POSTULER AU CAMP</a>
          <a href="#video-section" className="btn-ghost">DÉCOUVRIR</a>
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

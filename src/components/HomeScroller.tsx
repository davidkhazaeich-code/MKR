'use client'

import { useEffect, useRef, useState } from 'react'

export type ScrollSection = {
  id: string
  label: string
}

interface HomeScrollerProps {
  sections: ScrollSection[]
}

export default function HomeScroller({ sections }: HomeScrollerProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const ratioMap = useRef<Map<string, number>>(new Map())

  // IntersectionObserver pour la section active
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          ratioMap.current.set(e.target.id, e.intersectionRatio)
        })
        let bestIdx = 0
        let best = 0
        sections.forEach((s, i) => {
          const r = ratioMap.current.get(s.id) ?? 0
          if (r > best) { best = r; bestIdx = i }
        })
        setActiveIdx(bestIdx)
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    )
    sections.forEach(s => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [sections])

  // Progression scroll + état "scrolled" (fade chevron)
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement
      const max = h.scrollHeight - h.clientHeight
      const p = max > 0 ? (window.scrollY / max) * 100 : 0
      setProgress(p)
      setScrolled(window.scrollY > 80)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const next = () => {
    const target = sections[Math.min(activeIdx + 1, sections.length - 1)]
    if (target) scrollTo(target.id)
  }

  return (
    <>
      {/* Mobile : barre de progression sticky en haut */}
      <div className="hs-progress-mobile" aria-hidden="true">
        <div className="hs-progress-mobile-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Desktop : dots verticaux à droite */}
      <nav className="hs-dots" aria-label="Navigation entre les sections">
        {sections.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => scrollTo(s.id)}
            aria-label={`Aller à : ${s.label}`}
            aria-current={i === activeIdx ? 'true' : undefined}
            className={`hs-dot${i === activeIdx ? ' is-active' : ''}`}
          >
            <span className="hs-dot-tooltip">{s.label}</span>
          </button>
        ))}
      </nav>

      {/* Chevron animé bas du hero (visible uniquement avant scroll) */}
      <button
        type="button"
        onClick={next}
        aria-label="Découvrir la section suivante"
        className={`hs-chevron${scrolled ? ' is-hidden' : ''}`}
      >
        <span className="hs-chevron-label">Découvrir</span>
        <span className="hs-chevron-arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
            <polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      <style jsx>{`
        /* ───── Mobile : progress bar top ───── */
        .hs-progress-mobile {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: rgba(255, 255, 255, 0.06);
          z-index: 60;
          pointer-events: none;
        }
        .hs-progress-mobile-fill {
          height: 100%;
          background: var(--primary);
          transition: width 0.15s ease-out;
          will-change: width;
        }
        @media (min-width: 1025px) {
          .hs-progress-mobile { display: none; }
        }

        /* ───── Desktop : dots verticaux à droite ───── */
        .hs-dots {
          position: fixed;
          right: 24px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 40;
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 14px 8px;
          background: rgba(0, 0, 0, 0.25);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        @media (max-width: 1024px) {
          .hs-dots { display: none; }
        }
        .hs-dot {
          position: relative;
          width: 10px;
          height: 10px;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          cursor: pointer;
          transition: all 0.3s ease;
          display: block;
        }
        .hs-dot:hover {
          background: rgba(255, 255, 255, 0.7);
          transform: scale(1.2);
        }
        .hs-dot.is-active {
          height: 28px;
          border-radius: 5px;
          background: var(--primary);
          box-shadow: 0 0 12px rgba(255, 107, 53, 0.4);
        }
        .hs-dot-tooltip {
          position: absolute;
          right: calc(100% + 14px);
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.85);
          color: #fff;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 0.78rem;
          font-weight: 500;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }
        .hs-dot:hover .hs-dot-tooltip,
        .hs-dot:focus-visible .hs-dot-tooltip {
          opacity: 1;
        }

        /* ───── Chevron hero (mobile + desktop) ───── */
        .hs-chevron {
          position: fixed;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 45;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
          border: 0;
          background: transparent;
          color: #fff;
          cursor: pointer;
          opacity: 0.85;
          transition: opacity 0.4s ease, transform 0.4s ease;
          will-change: opacity, transform;
        }
        .hs-chevron:hover { opacity: 1; }
        .hs-chevron.is-hidden {
          opacity: 0;
          pointer-events: none;
          transform: translateX(-50%) translateY(20px);
        }
        .hs-chevron-label {
          font-size: 0.7rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-weight: 600;
          text-shadow: 0 1px 8px rgba(0, 0, 0, 0.6);
        }
        .hs-chevron-arrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          animation: hsBounce 2.2s ease-in-out infinite;
        }
        @keyframes hsBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
        @media (max-width: 600px) {
          .hs-chevron { bottom: 90px; } /* laisse de la place pour StickyMobileCTA */
          .hs-chevron-label { font-size: 0.65rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hs-chevron-arrow { animation: none; }
          .hs-progress-mobile-fill { transition: none; }
          .hs-dot { transition: none; }
        }
      `}</style>
    </>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

type Section = { id: string; label: string }

const HIDE_BELOW = 3 // si < 3 sections détectées, on cache complètement
const LABEL_MAX = 32

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

function deriveLabel(el: HTMLElement, fallbackIdx: number): string {
  const explicit = el.getAttribute('data-scroll-label')
  if (explicit) return truncate(explicit, LABEL_MAX)
  const heading = el.querySelector('h1, h2, .label-tag, .insc-panel-title') as HTMLElement | null
  if (heading?.textContent) return truncate(heading.textContent.trim(), LABEL_MAX)
  return `Section ${fallbackIdx + 1}`
}

export default function ScrollNav() {
  const pathname = usePathname()
  const [sections, setSections] = useState<Section[]>([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const ratioMap = useRef<Map<string, number>>(new Map())
  const intersectionRef = useRef<IntersectionObserver | null>(null)

  // ─── Discover sections + watch DOM mutations ───
  useEffect(() => {
    const main = document.getElementById('main') || document.querySelector('main') || document.body
    let rescanTimer: ReturnType<typeof setTimeout> | null = null

    const discover = () => {
      // 1) Sources explicites (data-scroll-section)
      const tagged = Array.from(main.querySelectorAll<HTMLElement>('[data-scroll-section]'))
      // 2) Fallback : <section> directes filles de main avec un titre détectable
      //    (couvre les pages qui n'ont pas encore migré vers data-scroll-section)
      const inlineSections = Array.from(main.querySelectorAll<HTMLElement>(':scope > section, :scope > div > section'))
        .filter(s => !s.hasAttribute('data-scroll-section'))
        .filter(s => s.querySelector('h1, h2, .label-tag'))

      // Combine + retire les sections imbriquées dans une autre déjà retenue
      const all = [...tagged, ...inlineSections]
      const top = all.filter(el => {
        return !all.some(other => other !== el && other.contains(el))
      })
      // Trie par ordre d'apparition dans le DOM
      top.sort((a, b) => {
        if (a === b) return 0
        const pos = a.compareDocumentPosition(b)
        if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1
        if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1
        return 0
      })

      const found: Section[] = []
      top.forEach((el, i) => {
        if (!el.id) el.id = `scrollsec-${i}`
        found.push({ id: el.id, label: deriveLabel(el, i) })
      })
      setSections(prev => {
        // Évite les renders inutiles si rien n'a changé
        if (prev.length === found.length && prev.every((s, i) => s.id === found[i].id && s.label === found[i].label)) {
          return prev
        }
        return found
      })
    }

    // Première détection après mount (laisse le temps aux dynamic imports)
    const initialT = setTimeout(discover, 80)
    // Re-scan sur changements DOM (debounced)
    const observer = new MutationObserver(() => {
      if (rescanTimer) clearTimeout(rescanTimer)
      rescanTimer = setTimeout(discover, 200)
    })
    observer.observe(main, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-scroll-section', 'data-scroll-label'],
    })

    return () => {
      clearTimeout(initialT)
      if (rescanTimer) clearTimeout(rescanTimer)
      observer.disconnect()
    }
  }, [pathname])

  // ─── IntersectionObserver pour la section active (recréé quand sections changent) ───
  useEffect(() => {
    if (intersectionRef.current) {
      intersectionRef.current.disconnect()
      intersectionRef.current = null
    }
    if (sections.length < HIDE_BELOW) return

    ratioMap.current.clear()
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          ratioMap.current.set(e.target.id, e.intersectionRatio)
        })
        let bestIdx = 0
        let best = -1
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
    intersectionRef.current = observer
    return () => { observer.disconnect() }
  }, [sections])

  // ─── Scroll progression + chevron fade ───
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
  }, [pathname])

  if (sections.length < HIDE_BELOW) return null

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

      {/* Chevron animé en bas, visible au top de la page (avant scroll) */}
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

      <style jsx global>{`
        /* Toute section navigable : compense la nav sticky (~72px) */
        [data-scroll-section] { scroll-margin-top: 72px; }
      `}</style>

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

        /* ───── Desktop : dots verticaux ───── */
        .hs-dots {
          position: fixed;
          left: 24px;
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
          max-height: 80vh;
          overflow-y: auto;
        }
        .hs-dots::-webkit-scrollbar { display: none; }
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
          flex-shrink: 0;
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
          left: calc(100% + 14px);
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
          .hs-chevron { bottom: 90px; }
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

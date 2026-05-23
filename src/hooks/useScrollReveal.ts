'use client'

import { useEffect, useRef } from 'react'

interface ScrollRevealOptions {
  imgScale?: { from: number; to: number }
}

export function useScrollReveal(options: ScrollRevealOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgFrom = options.imgScale?.from ?? 1.25
  const imgTo = options.imgScale?.to ?? 1

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let cancelled = false
    let cleanup: (() => void) | undefined

    function applyVars(p: number) {
      if (!container) return
      const clipP = 30 * (1 - p)
      const clipQ = 70 + 30 * p
      const imgScale = imgFrom + (imgTo - imgFrom) * p
      const textT = Math.min(1, Math.max(0, (p - 0.5) * 2))
      const indT = Math.min(1, Math.max(0, p / 0.15))
      container.style.setProperty('--reveal-p', clipP.toFixed(2))
      container.style.setProperty('--reveal-q', clipQ.toFixed(2))
      container.style.setProperty('--reveal-img-scale', imgScale.toFixed(4))
      container.style.setProperty('--reveal-text-opacity', textT.toFixed(3))
      container.style.setProperty('--reveal-text-y', (30 * (1 - textT)).toFixed(2))
      container.style.setProperty('--reveal-indicator-opacity', (1 - indT).toFixed(3))
    }

    async function init() {
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      if (cancelled || !container) return

      applyVars(0)

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const state = { progress: 0 }
        let maxProgress = 0

        const st = ScrollTrigger.create({
          trigger: container,
          start: 'top bottom',
          end: 'center center',
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (self.progress > maxProgress) {
              maxProgress = self.progress
              gsap.to(state, {
                progress: maxProgress,
                duration: 0.18,
                ease: 'power2.out',
                overwrite: true,
                onUpdate: () => applyVars(state.progress),
              })
            }
          },
        })

        return () => st.kill()
      })

      mm.add('(min-width: 769px) and (prefers-reduced-motion: no-preference)', () => {
        const snap = ScrollTrigger.create({
          trigger: container,
          start: 'top top',
          end: 'bottom bottom',
          snap: {
            snapTo: [0, 1],
            duration: { min: 0.3, max: 0.7 },
            delay: 0.12,
            ease: 'power2.inOut',
          },
        })
        return () => snap.kill()
      })

      mm.add('(prefers-reduced-motion: reduce)', () => {
        applyVars(1)
      })

      cleanup = () => mm.revert()
    }

    init()

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [imgFrom, imgTo])

  return { containerRef }
}

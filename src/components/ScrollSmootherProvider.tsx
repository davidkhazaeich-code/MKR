'use client'

import { useEffect, useRef, type ReactNode } from 'react'

interface ScrollSmootherProviderProps {
  children: ReactNode
}

export default function ScrollSmootherProvider({ children }: ScrollSmootherProviderProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!wrapperRef.current || !contentRef.current) return

    let cancelled = false
    let cleanup: (() => void) | undefined

    async function init() {
      const { gsap } = await import('gsap')
      const { ScrollSmoother } = await import('gsap/ScrollSmoother')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollSmoother, ScrollTrigger)
      if (cancelled) return

      const mm = gsap.matchMedia()
      mm.add(
        '(min-width: 769px) and (prefers-reduced-motion: no-preference)',
        () => {
          const smoother = ScrollSmoother.create({
            wrapper: wrapperRef.current!,
            content: contentRef.current!,
            smooth: 1.2,
            effects: false,
            normalizeScroll: true,
            smoothTouch: 0,
            ignoreMobileResize: true,
          })
          return () => smoother.kill()
        },
      )

      cleanup = () => mm.revert()
    }

    init()

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [])

  return (
    <div id="smooth-wrapper" ref={wrapperRef}>
      <div id="smooth-content" ref={contentRef}>
        {children}
      </div>
    </div>
  )
}

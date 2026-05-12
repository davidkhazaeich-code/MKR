'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

const MIN_DURATION = 1700

export default function SiteLoader() {
  const pathname = usePathname()
  const skip = pathname !== '/'
  const [mounted, setMounted] = useState(true)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (skip || !mounted) return
    document.documentElement.classList.add('is-loading')

    const reducedMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    let cancelled = false

    const finish = () => {
      setMounted(false)
      document.documentElement.classList.remove('is-loading')
    }

    const run = async () => {
      await new Promise(r => setTimeout(r, MIN_DURATION))
      if (cancelled || !rootRef.current) return

      const scope = rootRef.current
      scope.classList.add('site-loader--exiting')

      if (reducedMotion) {
        scope.style.transition = 'opacity 140ms linear'
        scope.style.opacity = '0'
        window.setTimeout(finish, 160)
        return
      }

      const { gsap } = await import('gsap')
      if (cancelled || !rootRef.current) return

      const q = (sel: string) => scope.querySelector<HTMLElement>(sel)
      const logo = q('.site-loader-logo')
      const ring = q('.site-loader-ring')
      const label = q('.site-loader-label')
      const bar = q('.site-loader-bar')
      const glow = q('.site-loader-glow')
      const top = q('.site-loader-panel--top')
      const bottom = q('.site-loader-panel--bottom')

      const tl = gsap.timeline({ onComplete: finish })

      tl.to([label, bar], {
        y: -16,
        opacity: 0,
        duration: 0.42,
        stagger: 0.06,
        ease: 'power3.in',
      })
        .to(
          ring,
          { scale: 1.85, opacity: 0, duration: 0.55, ease: 'power2.out' },
          '<'
        )
        .to(
          logo,
          { scale: 1.12, opacity: 0, duration: 0.42, ease: 'power2.in' },
          '<+0.1'
        )
        .to(
          glow,
          { scale: 1.35, opacity: 0, duration: 0.6, ease: 'power2.out' },
          '<'
        )
        .to(
          top,
          { yPercent: -100, duration: 0.9, ease: 'power4.inOut' },
          '-=0.2'
        )
        .to(
          bottom,
          { yPercent: 100, duration: 0.9, ease: 'power4.inOut' },
          '<'
        )
    }

    run()

    return () => {
      cancelled = true
      document.documentElement.classList.remove('is-loading')
    }
  }, [skip, mounted])

  if (skip || !mounted) return null

  return (
    <div
      ref={rootRef}
      className="site-loader"
      role="status"
      aria-live="polite"
      aria-label="Chargement"
    >
      <div
        className="site-loader-panel site-loader-panel--top"
        aria-hidden="true"
      />
      <div
        className="site-loader-panel site-loader-panel--bottom"
        aria-hidden="true"
      />
      <div className="site-loader-content">
        <div className="site-loader-glow" aria-hidden="true" />
        <div className="site-loader-inner">
          <div className="site-loader-mark">
            <img
              src="/logo-white.webp"
              alt=""
              width={180}
              height={109}
              className="site-loader-logo"
              aria-hidden="true"
            />
            <span className="site-loader-ring" aria-hidden="true" />
          </div>
          <span className="site-loader-label">MKR · Caucasian Camp</span>
          <div className="site-loader-bar" aria-hidden="true">
            <div className="site-loader-bar-fill" />
          </div>
        </div>
      </div>
    </div>
  )
}

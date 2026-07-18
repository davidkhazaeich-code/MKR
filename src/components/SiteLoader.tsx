'use client'

import { useEffect, useRef, useState } from 'react'
// usePathname de next-intl, PAS next/navigation : cote serveur ce dernier voit
// le chemin reecrit par le middleware (/fr) -> skip=true -> le loader etait
// absent du HTML SSR et n'apparaissait qu'apres hydratation (site visible avant
// le loader). La version next-intl renvoie '/' des le SSR, loader au 1er paint.
import { usePathname } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

const MIN_DURATION = 600
const SAFETY_TIMEOUT = 4000

export default function SiteLoader() {
  const pathname = usePathname()
  const t = useTranslations('common.site_loader')
  const skip = pathname !== '/'
  const [mounted, setMounted] = useState(true)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (skip || !mounted) return

    const reducedMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    let cancelled = false
    let safetyTimer: number | null = null

    const finish = () => {
      if (safetyTimer !== null) {
        window.clearTimeout(safetyTimer)
        safetyTimer = null
      }
      setMounted(false)
      document.documentElement.classList.remove('is-loading')
    }

    const startSequence = () => {
      if (cancelled) return
      document.documentElement.classList.add('is-loading')

      // Filet de securite : si GSAP echoue a charger (bloqueur, reseau coupe,
      // hydration cassee), on dismiss le loader apres SAFETY_TIMEOUT pour
      // garantir qu'aucun visiteur ne reste bloque sur le preloader.
      safetyTimer = window.setTimeout(() => {
        if (!cancelled) finish()
      }, SAFETY_TIMEOUT)

      if (reducedMotion) {
        finish()
        return
      }
      run()
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

    startSequence()

    return () => {
      cancelled = true
      if (safetyTimer !== null) window.clearTimeout(safetyTimer)
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
      aria-label={t('loading_aria')}
    >
      {/* Sans JS, le loader SSR couvrirait la page pour toujours */}
      <noscript>
        <style>{'.site-loader{display:none}'}</style>
      </noscript>
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

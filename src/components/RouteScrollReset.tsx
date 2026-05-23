'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

/* Reset scroll au top a chaque changement de route — instant, jamais d'animation.
   - pathname + searchParams comme deps → couvre aussi /inscription?type=session → ?type=famille
   - history.scrollRestoration = 'manual' empeche le navigateur (Safari/Chrome iOS surtout)
     de restaurer la position d'une page precedente sur navigation client-side
   - 3 methodes de scroll en cascade pour blinder iOS Safari, Chrome Android, vieux Safari
   - Si l'URL contient #anchor, on respecte le navigateur (scroll vers l'ancre, pas vers le top) */
export default function RouteScrollReset() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  useEffect(() => {
    if (window.location.hash) return

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0

    const st = (window as unknown as { ScrollTrigger?: { refresh: () => void } }).ScrollTrigger
    if (st) requestAnimationFrame(() => st.refresh())
  }, [pathname, searchParams])

  return null
}

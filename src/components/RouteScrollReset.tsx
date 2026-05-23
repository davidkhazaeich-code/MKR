'use client'

import { useEffect, useLayoutEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

/* isomorphic-safe : useLayoutEffect cote client (avant le paint),
   useEffect cote serveur (evite le warning SSR React). */
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/* Reset scroll au top a chaque changement de route — instant, jamais d'animation.
   - pathname + searchParams comme deps → couvre aussi /inscription?type=session → ?type=famille
   - history.scrollRestoration = 'manual' empeche le navigateur (Safari/Chrome iOS surtout)
     de restaurer la position d'une page precedente sur navigation client-side
   - useLayoutEffect : scrollTo s'execute AVANT le paint du browser sur la nouvelle page,
     evite que l'utilisateur voit brievement la nouvelle page a l'ancienne scrollY
     (clampee en bas si la nouvelle page est plus courte → l'utilisateur voyait "le bas")
   - rAF retry : double-scroll en cas de momentum scroll iOS Safari
   - 3 methodes de scroll en cascade : window.scrollTo + documentElement + body
   - Si l'URL contient #anchor, on respecte le navigateur (scroll vers l'ancre) */
export default function RouteScrollReset() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  useIsoLayoutEffect(() => {
    if (window.location.hash) return

    const reset = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }
    reset()
    // Second pass sur la frame suivante pour blinder iOS Safari (momentum scroll)
    // et les cas ou un effet enfant scrolle apres le mount.
    requestAnimationFrame(reset)

    const st = (window as unknown as { ScrollTrigger?: { refresh: () => void } }).ScrollTrigger
    if (st) requestAnimationFrame(() => st.refresh())
  }, [pathname, searchParams])

  return null
}

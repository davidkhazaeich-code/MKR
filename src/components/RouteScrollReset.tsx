'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function RouteScrollReset() {
  const pathname = usePathname()

  useEffect(() => {
    if (window.location.hash) return

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })

    const st = (window as unknown as { ScrollTrigger?: { refresh: () => void } }).ScrollTrigger
    if (st) requestAnimationFrame(() => st.refresh())
  }, [pathname])

  return null
}

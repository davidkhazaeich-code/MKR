'use client'

import { useEffect, useState } from 'react'

export default function StickyMobileCTA() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <a
      href="/inscription"
      className={`sticky-cta-mobile${visible ? ' is-visible' : ''}`}
      aria-label="Reserver ton camp"
    >
      RESERVE TON CAMP
    </a>
  )
}

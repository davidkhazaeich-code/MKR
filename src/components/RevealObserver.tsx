'use client'

import { useEffect } from 'react'

export default function RevealObserver() {
  useEffect(() => {
    const reveals = document.querySelectorAll<HTMLElement>('.reveal')
    if (!reveals.length) return

    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            obs.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -36px 0px' }
    )

    reveals.forEach(el => obs.observe(el))

    return () => obs.disconnect()
  }, [])

  return null
}

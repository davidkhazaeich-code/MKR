'use client'

import { useEffect, useState } from 'react'

const MIN_DURATION = 1700
const FADE_DURATION = 450

export default function SiteLoader() {
  const [mounted, setMounted] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    document.documentElement.classList.add('is-loading')

    const fadeTimer = window.setTimeout(() => setFading(true), MIN_DURATION)
    const unmountTimer = window.setTimeout(() => {
      setMounted(false)
      document.documentElement.classList.remove('is-loading')
    }, MIN_DURATION + FADE_DURATION)

    return () => {
      window.clearTimeout(fadeTimer)
      window.clearTimeout(unmountTimer)
      document.documentElement.classList.remove('is-loading')
    }
  }, [])

  if (!mounted) return null

  return (
    <div
      className={`site-loader${fading ? ' site-loader--fade' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Chargement"
    >
      <div className="site-loader-glow" aria-hidden="true" />
      <div className="site-loader-inner">
        <div className="site-loader-mark">
          <img
            src="/logo-white.webp"
            alt=""
            width={132}
            height={136}
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
  )
}

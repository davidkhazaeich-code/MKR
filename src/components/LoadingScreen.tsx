'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

const QUOTES = [
  'Le combat commence avant le premier round.',
  'La montagne ne vient pas a toi. Tu montes.',
  'On ne nait pas champion. On le devient.',
  'Le Caucase forge ceux qui osent.',
  'La discipline est le pont entre tes objectifs et tes resultats.',
  'Chaque goutte de sueur est un pas vers la victoire.',
  'Seuls ceux qui risquent de tomber apprennent a se relever.',
  'Le tapis ne ment jamais.',
  'La douleur est temporaire. La fierte est eternelle.',
  'Ici, on ne s\'entraine pas pour le spectacle. On s\'entraine pour la guerre.',
]

const MIN_DISPLAY_MS = 1400
const EXIT_DURATION_MS = 700

export default function LoadingScreen() {
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)])
  const startTime = useRef(0)
  const dismissed = useRef(false)

  const dismiss = useCallback(() => {
    if (dismissed.current) return
    dismissed.current = true
    setProgress(100)
    // Small pause at 100% so user sees it complete
    setTimeout(() => {
      setExiting(true)
      setTimeout(() => {
        setVisible(false)
        document.body.style.overflow = ''
        sessionStorage.setItem('mkr-loaded', '1')
      }, EXIT_DURATION_MS)
    }, 200)
  }, [])

  const tryDismiss = useCallback(() => {
    const elapsed = performance.now() - startTime.current
    if (elapsed >= MIN_DISPLAY_MS) {
      dismiss()
    } else {
      setTimeout(dismiss, MIN_DISPLAY_MS - elapsed)
    }
  }, [dismiss])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem('mkr-loaded')) return

    startTime.current = performance.now()
    setVisible(true)
    document.body.style.overflow = 'hidden'

    // Track real loading progress
    let loaded = 0
    const total = 3 // fonts + DOM + hero video
    const step = () => {
      loaded++
      setProgress(Math.min(95, Math.round((loaded / total) * 95)))
      if (loaded >= total) tryDismiss()
    }

    // 1. Fonts ready
    if (document.fonts?.ready) {
      document.fonts.ready.then(step)
    } else {
      step()
    }

    // 2. DOM + subresources
    if (document.readyState === 'complete') {
      step()
    } else {
      window.addEventListener('load', step, { once: true })
    }

    // 3. Hero video can play
    const checkVideo = () => {
      const video = document.querySelector<HTMLVideoElement>('.hero-video')
      if (video) {
        if (video.readyState >= 3) {
          step()
        } else {
          video.addEventListener('canplay', step, { once: true })
        }
      } else {
        // No video on this page
        step()
      }
    }
    // Defer video check slightly to let DOM render
    requestAnimationFrame(checkVideo)

    // Safety: max 5s even if something stalls
    const maxTimer = setTimeout(() => {
      if (!dismissed.current) tryDismiss()
    }, 5000)

    return () => {
      clearTimeout(maxTimer)
      document.body.style.overflow = ''
    }
  }, [tryDismiss])

  if (!visible) return null

  return (
    <div className={`loading-screen${exiting ? ' loading-screen--exit' : ''}`}>
      <div className="loading-inner">
        <img
          src="/logo-white.webp"
          alt="MKR Caucasian Camp"
          className="loading-logo"
          width={120}
          height={120}
        />
        <div className="loading-bar-track">
          <div
            className="loading-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="loading-quote">&laquo; {quote} &raquo;</p>
      </div>
    </div>
  )
}

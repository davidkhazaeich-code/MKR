'use client'

import { useEffect, useState } from 'react'

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

export default function LoadingScreen() {
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const already = sessionStorage.getItem('mkr-loaded')
    if (already) return

    setVisible(true)
    document.body.style.overflow = 'hidden'

    const timer = setTimeout(() => {
      setExiting(true)
      setTimeout(() => {
        setVisible(false)
        document.body.style.overflow = ''
        sessionStorage.setItem('mkr-loaded', '1')
      }, 800)
    }, 2800)

    return () => {
      clearTimeout(timer)
      document.body.style.overflow = ''
    }
  }, [])

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
          <div className="loading-bar-fill" />
        </div>
        <p className="loading-quote">&laquo; {quote} &raquo;</p>
      </div>
    </div>
  )
}

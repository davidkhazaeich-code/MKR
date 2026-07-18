'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslations } from 'next-intl'
import Icon from './Icon'

interface VideoModalProps {
  src: string | null
  poster?: string
  title?: string
  subtitle?: string
  onClose: () => void
}

export default function VideoModal({ src, poster, title, subtitle, onClose }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const t = useTranslations('common.video_modal')

  useEffect(() => {
    if (!src) return

    const scrollY = window.scrollY
    const body = document.body
    const html = document.documentElement
    const prev = {
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
      bodyOverflow: body.style.overflow,
      htmlOverflow: html.style.overflow,
    }
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    body.style.overflow = 'hidden'
    html.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)

    closeBtnRef.current?.focus()

    const v = videoRef.current
    if (v) {
      v.currentTime = 0
      v.play().catch(() => {})
    }

    return () => {
      document.removeEventListener('keydown', onKey)
      if (v) v.pause()
      body.style.position = prev.bodyPosition
      body.style.top = prev.bodyTop
      body.style.left = prev.bodyLeft
      body.style.right = prev.bodyRight
      body.style.width = prev.bodyWidth
      body.style.overflow = prev.bodyOverflow
      html.style.overflow = prev.htmlOverflow
      window.scrollTo(0, scrollY)
    }
  }, [src, onClose])

  if (!src) return null

  // Portal vers <body> obligatoire : rendue dans une section, la modal fixed
  // reste piégée dans le stacking context de son ancêtre (ex. .vvs-section a
  // isolation: isolate) et les sections voisines z-indexées + la nav peignent
  // par-dessus (plein écran « coupé »). Au niveau body, z-10000 gagne partout.
  return createPortal(
    <div
      className="video-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={title ? t('dialog_aria_named', { name: title }) : t('dialog_aria')}
      onClick={onClose}
    >
      <button
        ref={closeBtnRef}
        type="button"
        className="video-modal-close"
        aria-label={t('close_aria')}
        onClick={onClose}
      >
        <Icon name="x" size={22} />
      </button>

      <div className="video-modal-frame" onClick={(e) => e.stopPropagation()}>
        <video
          ref={videoRef}
          className="video-modal-player"
          src={src}
          poster={poster}
          controls
          playsInline
          preload="metadata"
        />
        {(title || subtitle) && (
          <div className="video-modal-caption">
            {title && <span className="video-modal-title">{title}</span>}
            {subtitle && <span className="video-modal-subtitle">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

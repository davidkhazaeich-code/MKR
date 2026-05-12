'use client'

import { useEffect, useRef } from 'react'

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

  useEffect(() => {
    if (!src) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

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
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKey)
      if (v) {
        v.pause()
      }
    }
  }, [src, onClose])

  if (!src) return null

  return (
    <div
      className="video-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={title ? `Témoignage vidéo de ${title}` : 'Témoignage vidéo'}
      onClick={onClose}
    >
      <button
        ref={closeBtnRef}
        type="button"
        className="video-modal-close"
        aria-label="Fermer la vidéo"
        onClick={onClose}
      >
        <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
          <path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
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
    </div>
  )
}

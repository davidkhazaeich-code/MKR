'use client'

import { useCallback, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'

interface RuslanRevealSliderProps {
  beforeSrc: string
  beforeAlt: string
  beforeLabel?: string
  afterSrc: string
  afterAlt: string
  afterLabel?: string
  initialPosition?: number
  beforeObjectPosition?: string
  afterObjectPosition?: string
}

export default function RuslanRevealSlider({
  beforeSrc,
  beforeAlt,
  beforeLabel = 'LE FONDATEUR',
  afterSrc,
  afterAlt,
  afterLabel = 'L’ATHLÈTE',
  initialPosition = 72,
  beforeObjectPosition = 'center 22%',
  afterObjectPosition = 'center 18%',
}: RuslanRevealSliderProps) {
  const [pos, setPos] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const next = ((clientX - rect.left) / rect.width) * 100
    setPos(Math.max(0, Math.min(100, next)))
  }, [])

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsDragging(true)
    updateFromClientX(e.clientX)
  }
  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    updateFromClientX(e.clientX)
  }
  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    setIsDragging(false)
  }

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 3
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      setPos((p) => Math.max(0, p - step))
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      setPos((p) => Math.min(100, p + step))
    } else if (e.key === 'Home') {
      e.preventDefault()
      setPos(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      setPos(100)
    }
  }

  const sliderStyle = { ['--slider-pos' as string]: `${pos}%` } as CSSProperties

  return (
    <div
      ref={containerRef}
      className={`reveal-slider${isDragging ? ' is-dragging' : ''}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={sliderStyle}
    >
      {/* Image avant (visible par defaut) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="reveal-slider-img reveal-slider-before"
        src={beforeSrc}
        alt={beforeAlt}
        draggable={false}
        style={{ objectPosition: beforeObjectPosition }}
      />

      {/* Image apres (clippee a gauche du curseur) */}
      <div className="reveal-slider-after-wrap" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="reveal-slider-img reveal-slider-after"
          src={afterSrc}
          alt={afterAlt}
          draggable={false}
          style={{ objectPosition: afterObjectPosition }}
        />
      </div>

      {/* Tags d&apos;identification */}
      <span className="reveal-slider-tag reveal-slider-tag--before" aria-hidden="true">
        {beforeLabel}
      </span>
      <span className="reveal-slider-tag reveal-slider-tag--after" aria-hidden="true">
        {afterLabel}
      </span>

      {/* Knob + ligne verticale */}
      <div className="reveal-slider-knob-line" aria-hidden="true" />
      <div
        className="reveal-slider-knob"
        role="slider"
        tabIndex={0}
        aria-label="Curseur de revelation. Glisse a gauche ou a droite pour passer du fondateur en costume a l&apos;athlete de lutte"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        aria-valuetext={pos < 50 ? afterLabel : beforeLabel}
        onKeyDown={handleKeyDown}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="11 6 5 12 11 18" />
          <polyline points="13 6 19 12 13 18" />
        </svg>
      </div>

      {/* Hint au premier render */}
      <span className="reveal-slider-hint" aria-hidden="true">
        GLISSE POUR R&Eacute;V&Eacute;LER
      </span>
    </div>
  )
}

'use client'

import { useState } from 'react'
import VideoModal from './VideoModal'
import Icon from './Icon'

export interface VideoTestimonialItem {
  name: string
  discipline: string
  label: string
  poster: string
  video: string
}

interface Props {
  items: VideoTestimonialItem[]
}

export default function VideoTestimonialsGrid({ items }: Props) {
  const [active, setActive] = useState<VideoTestimonialItem | null>(null)

  return (
    <>
      <div className="grid-2">
        {items.map((v, i) => (
          <div key={i} className="content-card reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
            <div style={{ position: 'relative', marginBottom: '1rem', aspectRatio: '9 / 16', maxHeight: '70vh', overflow: 'hidden' }}>
              <img
                src={v.poster}
                alt={`Témoignage vidéo de ${v.name}`}
                loading="lazy"
                className="section-photo-img"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button
                type="button"
                className="video-card-play"
                onClick={() => setActive(v)}
                aria-label={`Lire le témoignage vidéo de ${v.name}`}
              >
                <Icon name="play" size={56} color="#F8F8F8" />
              </button>
              <span
                style={{
                  position: 'absolute',
                  top: '0.6rem',
                  left: '0.6rem',
                  background: 'var(--primary)',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontFamily: 'var(--font-barlow-condensed)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '0.2em 0.6em',
                  fontWeight: 600,
                  zIndex: 1,
                }}
              >
                {v.label}
              </span>
            </div>
            <span className="testi-name">{v.name}</span>
            <span className="testi-discipline">{v.discipline}</span>
          </div>
        ))}
      </div>

      <VideoModal
        src={active?.video ?? null}
        poster={active?.poster}
        title={active?.name}
        subtitle={active?.discipline}
        onClose={() => setActive(null)}
      />
    </>
  )
}

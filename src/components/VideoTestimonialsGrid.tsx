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
  alt: string
  playAria: string
}

interface Props {
  items: VideoTestimonialItem[]
}

export default function VideoTestimonialsGrid({ items }: Props) {
  const [active, setActive] = useState<VideoTestimonialItem | null>(null)

  return (
    <>
      <div className="vtg-grid">
        {items.map((v, i) => (
          <figure key={i} className="vtg-card reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
            <div className="vtg-media">
              <img
                src={v.poster}
                alt={v.alt}
                loading="lazy"
                className="vtg-poster"
              />
              <span className="vtg-badge">{v.label}</span>
              <button
                type="button"
                className="video-card-play"
                onClick={() => setActive(v)}
                aria-label={v.playAria}
              >
                <span className="vtg-play-circle">
                  <Icon name="play" size={26} color="#F8F8F8" />
                </span>
              </button>
            </div>
            <figcaption className="vtg-meta">
              <span className="testi-name">{v.name}</span>
              <span className="testi-discipline">{v.discipline}</span>
            </figcaption>
          </figure>
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

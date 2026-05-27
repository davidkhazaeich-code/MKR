/**
 * Testimonials: structural fields (id, asset paths) only.
 * Display copy (name, alt, discipline, quote, videoLabel) lives in
 * `messages/<locale>/data.testimonials.json`.
 *
 * Use `hydrateTestimonials(t)` at render time to merge the two.
 */

import type { TFn } from '@/lib/session-display'

export interface Testimonial {
  id: string
  img: string
  /** Vidéo de témoignage (optionnel) - déclenche l'affichage dans VideoTestimonialsGrid */
  video?: string
  videoPoster?: string
}

export interface TestimonialDisplay {
  name: string
  alt: string
  discipline: string
  quote: string
  /** Label badge affiché sur la card vidéo (ex: « Retour de session ») */
  video_label?: string
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'antoine-petit-jean',
    img: '/images/galerie-real/antoine-petit-jean.webp',
    video: '/videos/testimonials/antoine-testimonie.mp4',
    videoPoster: '/videos/testimonials/antoine-poster.jpg',
  },
  {
    id: 'lamp',
    img: '/images/testimonials/lamp-w.webp',
    video: '/videos/testimonials/lamp-testimonie.mp4',
    videoPoster: '/videos/testimonials/lamp-poster.jpg',
  },
  { id: 'mehdi-r', img: '/images/testimonials/mehdi-r.webp' },
  { id: 'karim-d', img: '/images/testimonials/karim-d.webp' },
  { id: 'thomas-b', img: '/images/testimonials/thomas-b.webp' },
  { id: 'yassine-k', img: '/images/testimonials/yassine-k.webp' },
  { id: 'romain-v', img: '/images/testimonials/romain-v.webp' },
  { id: 'adam-s', img: '/images/testimonials/adam-s.webp' },
  { id: 'lucas-m', img: '/images/testimonials/lucas-m.webp' },
  { id: 'amine-b', img: '/images/testimonials/amine-b.webp' },
  { id: 'pierre-l', img: '/images/testimonials/pierre-l.webp' },
]

export type HydratedTestimonial = Testimonial & TestimonialDisplay & {
  /** Convenience flat alias used by legacy components. */
  videoLabel?: string
}

export function hydrateTestimonial(testimonial: Testimonial, t: TFn): HydratedTestimonial {
  const raw = t.raw(testimonial.id) as TestimonialDisplay
  return {
    ...testimonial,
    name: raw.name,
    alt: raw.alt,
    discipline: raw.discipline,
    quote: raw.quote,
    video_label: raw.video_label,
    videoLabel: raw.video_label,
  }
}

export function hydrateTestimonials(t: TFn): HydratedTestimonial[] {
  return TESTIMONIALS.map(item => hydrateTestimonial(item, t))
}

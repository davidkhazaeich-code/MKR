/**
 * Source unique des assets de la vidéo "Antoine parcours" (montage 54s).
 * Utilisé sur /programme/mma (variant 'mma'), /temoignages (variant 'temoignages')
 * et la homepage (variant 'home').
 *
 * Display copy (identityLabel, label, title, intro, cta labels) lives in
 * `messages/<locale>/data.antoine-parcours.json`. Use the helpers below to
 * hydrate at render time.
 */

import type { TFn } from '@/lib/session-display'

export type AntoineParcoursVariantId = 'mma' | 'temoignages' | 'home'

export const ANTOINE_PARCOURS_ASSETS = {
  src: '/videos/testimonials/antoine-parcours.mp4',
  webmSrc: '/videos/testimonials/antoine-parcours.webm',
  poster: '/videos/testimonials/antoine-parcours-poster.jpg',
} as const

export const ANTOINE_PARCOURS_VARIANT_HREFS: Record<
  AntoineParcoursVariantId,
  { primary: string; secondary?: string }
> = {
  mma: {
    primary: '/inscription?type=session',
  },
  temoignages: {
    primary: '/inscription?type=session',
    secondary: '/programme/mma',
  },
  home: {
    primary: '/inscription?type=session',
    secondary: '/programme/mma',
  },
}

export interface AntoineParcoursVariantCopy {
  label: string
  title: string
  intro: string
  primary_cta_label: string
  secondary_cta_label?: string
}

export interface AntoineParcoursProps {
  src: string
  webmSrc?: string
  poster: string
  duration: string
  identityLabel: string
  label: string
  title: string
  intro: string
  primaryCta: { href: string; label: string }
  secondaryCta?: { href: string; label: string }
}

/**
 * Returns hydrated props ready to spread into <VerticalVideoSplit />.
 * `t` must be scoped to the `data.antoine-parcours` namespace.
 */
export function getAntoineParcoursProps(
  variant: AntoineParcoursVariantId,
  t: TFn,
): AntoineParcoursProps {
  const copy = t.raw(`variants.${variant}`) as AntoineParcoursVariantCopy
  const hrefs = ANTOINE_PARCOURS_VARIANT_HREFS[variant]
  return {
    ...ANTOINE_PARCOURS_ASSETS,
    duration: t('duration'),
    identityLabel: t('identity_label'),
    label: copy.label,
    title: copy.title,
    intro: copy.intro,
    primaryCta: { href: hrefs.primary, label: copy.primary_cta_label },
    secondaryCta:
      hrefs.secondary && copy.secondary_cta_label
        ? { href: hrefs.secondary, label: copy.secondary_cta_label }
        : undefined,
  }
}

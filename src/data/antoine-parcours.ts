/**
 * Source unique pour le composant <VerticalVideoSplit /> "Antoine parcours".
 * Utilisé sur /programme/mma (variant 'mma'), /temoignages (variant 'temoignages')
 * et la homepage (variant 'home'). Les 3 surfaces partagent les assets vidéo
 * mais ont des label/title/intro/CTA distincts.
 *
 * Contexte Antoine : combattant amateur en transition pro, est venu au camp
 * se tester contre les Tchétchènes et prendre du niveau en préparation d'un
 * championnat. La vidéo est un montage de sparring + entraînement brut, pas
 * un highlight reel structuré (pas de timeline).
 */

export interface AntoineParcoursVariant {
  label: string
  title: string
  intro: string
  primaryCta: { href: string; label: string }
  secondaryCta?: { href: string; label: string }
}

export const ANTOINE_PARCOURS_ASSETS = {
  src: '/videos/testimonials/antoine-parcours.mp4',
  webmSrc: '/videos/testimonials/antoine-parcours.webm',
  poster: '/videos/testimonials/antoine-parcours-poster.jpg',
  duration: '0:54',
  identityLabel: 'ANTOINE · PRÉPA CHAMPIONNAT',
} as const

export const ANTOINE_PARCOURS_VARIANTS: Record<'mma' | 'temoignages' | 'home', AntoineParcoursVariant> = {
  mma: {
    label: 'APERÇU DE TON CAMP',
    title: "DU SPARRING. DE L'INTENSITÉ. DU NIVEAU.",
    intro: "Antoine est combattant amateur en transition pro. Il est venu au camp se tester contre les Tchétchènes et prendre du niveau en préparation d'un championnat. 54 secondes de sparring brut à Grozny.",
    primaryCta: { href: '/inscription?type=session', label: 'POSTULER · MMA TCHÉTCHÉNIE' },
  },
  temoignages: {
    label: 'EN VIDÉO',
    title: 'ANTOINE · PRÉPARATION CHAMPIONNAT',
    intro: "Combattant amateur en transition pro, Antoine est venu se tester contre les Tchétchènes et prendre du niveau avant un championnat. 54 secondes de sparring à Grozny.",
    primaryCta: { href: '/inscription?type=session', label: 'POSTULER À UN CAMP' },
    secondaryCta: { href: '/programme/mma', label: 'VOIR LE PROGRAMME MMA' },
  },
  home: {
    label: 'EN VIDÉO',
    title: 'ANTOINE · PRÉPARATION CHAMPIONNAT',
    intro: "Combattant amateur en transition pro, Antoine est venu se tester contre les Tchétchènes et prendre du niveau avant un championnat. 54 secondes de sparring à Grozny.",
    primaryCta: { href: '/inscription?type=session', label: 'POSTULER À UN CAMP' },
    secondaryCta: { href: '/programme/mma', label: 'VOIR LE PROGRAMME MMA' },
  },
}

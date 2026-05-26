/**
 * Source unique pour le composant <VerticalVideoSplit /> "Antoine parcours".
 * Utilisé sur /programme/mma (variant 'mma'), /temoignages (variant 'temoignages')
 * et la homepage (variant 'home'). Les 3 surfaces partagent les assets vidéo
 * et la timeline de moments, mais ont des label/title/intro/CTA distincts.
 */

export interface VideoMoment {
  timestamp: string
  timeSeconds: number
  text: string
}

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
  identityLabel: 'ANTOINE · MKR DE LA SESSION ÉTÉ',
} as const

// Timestamps indicatifs — à ajuster après visionnage de la vidéo encodée
export const ANTOINE_PARCOURS_MOMENTS: VideoMoment[] = [
  { timestamp: '00:06', timeSeconds: 6,  text: 'Sparring avec un combattant Akhmat' },
  { timestamp: '00:18', timeSeconds: 18, text: 'Travail de pads avec un coach Grozny' },
  { timestamp: '00:31', timeSeconds: 31, text: 'Drills clinch dans la salle principale' },
  { timestamp: '00:42', timeSeconds: 42, text: 'Débrief technique individuel' },
  { timestamp: '00:50', timeSeconds: 50, text: 'Vie au camp · hors tapis' },
]

export const ANTOINE_PARCOURS_VARIANTS: Record<'mma' | 'temoignages' | 'home', AntoineParcoursVariant> = {
  mma: {
    label: 'APERÇU DE TON CAMP',
    title: 'CE QUE TU VAS VIVRE EN TCHÉTCHÉNIE',
    intro: "Antoine, MKR de la session précédente, a filmé ses moments forts à Grozny. 54 secondes pour comprendre ce qu'est un camp MMA dans l'écurie Akhmat.",
    primaryCta: { href: '/inscription?type=session', label: 'POSTULER · MMA TCHÉTCHÉNIE' },
  },
  temoignages: {
    label: 'EN VIDÉO',
    title: "LE CAMP D'ANTOINE EN 54 SECONDES",
    intro: 'Antoine a filmé ses moments forts en Tchétchénie. Sparring, technique, débrief, vie au camp.',
    primaryCta: { href: '/inscription?type=session', label: 'POSTULER À UN CAMP' },
    secondaryCta: { href: '/programme/mma', label: 'VOIR LE PROGRAMME MMA' },
  },
  home: {
    label: 'EN VIDÉO',
    title: "LE CAMP D'ANTOINE EN 54 SECONDES",
    intro: 'Antoine a filmé ses moments forts en Tchétchénie. Sparring, technique, débrief, vie au camp.',
    primaryCta: { href: '/inscription?type=session', label: 'POSTULER À UN CAMP' },
    secondaryCta: { href: '/programme/mma', label: 'VOIR LE PROGRAMME MMA' },
  },
}

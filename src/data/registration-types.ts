/**
 * MKR Caucasian Camp — 3 types d'inscription / produits
 *
 * MKR = facilitateur total. On organise tout (visa, vol intérieur Istanbul-Makhachkala,
 * transferts, hébergement, encadrement, repas, programme).
 */

export type RegistrationTypeId = 'session' | 'custom' | 'groupe'

export interface RegistrationType {
  id: RegistrationTypeId
  label: string
  shortLabel: string
  badge: string
  description: string
  longDescription: string
  cta: string
  href: string
  dates: string
  duration: string
  minPersons: number
  maxPersons?: number
  leadTime: string
  recommended?: boolean
  image: string
  imageAlt: string
}

export const REGISTRATION_TYPES: RegistrationType[] = [
  {
    id: 'session',
    label: 'Rejoindre la session groupe',
    shortLabel: 'Session groupe',
    badge: 'Session officielle 2026',
    description: 'Camp de 3 semaines au Daghestan. Esprit collectif, dates fixées, groupe constitué par MKR.',
    longDescription: "Tu rejoins notre session officielle du 17 août au 5 septembre 2026. Tu fais partie d'un groupe constitué d'athlètes du monde entier. MKR organise tout : visa, vol intérieur, transferts, hébergement, repas, programme, encadrement.",
    cta: "M'inscrire à la session",
    href: '/inscription?type=session',
    dates: '17 août - 5 sept 2026',
    duration: '3 semaines',
    minPersons: 1,
    maxPersons: 15,
    leadTime: 'Inscriptions ouvertes',
    recommended: true,
    image: '/images/ruslan/action/mma-cercle-session-demo-mkr.webp',
    imageAlt: 'Cercle de combattants autour d\'une démonstration grappling au camp MKR',
  },
  {
    id: 'custom',
    label: 'Camp sur mesure',
    shortLabel: 'Sur mesure',
    badge: 'Tes dates, ta durée',
    description: 'Tu choisis tes dates et ta durée (1, 2 ou 3 semaines). MKR organise tout pour toi, seul ou en famille.',
    longDescription: "Tu pars quand tu veux, pour la durée que tu veux. MKR coordonne tout sur place : coachs disponibles, hébergement, repas, transferts. Solo ou en famille avec tes enfants (8-17 ans avec parent obligatoire).",
    cta: 'Organiser mon camp',
    href: '/inscription?type=custom',
    dates: 'Dates au choix',
    duration: '1, 2 ou 3 semaines',
    minPersons: 1,
    leadTime: 'Réservation 90 jours minimum avant le départ',
    image: '/images/ruslan/coaches/Antoine-portrait-makhachkala-mkr.webp',
    imageAlt: 'Portrait d\'Antoine Petit-Jean, athlète MMA solo en immersion à Makhachkala',
  },
  {
    id: 'groupe',
    label: 'Clubs et groupes',
    shortLabel: 'Clubs / groupes',
    badge: 'Petits ou grands groupes',
    description: 'Tu viens avec ton club ? Camp dédié à tes dates, hébergement bloc, programme adapté au niveau.',
    longDescription: "Tu fédères ton club autour d'un objectif commun. MKR organise un camp dédié à ton groupe : dates choisies, hébergement bloc, transferts groupés, programme adapté au niveau collectif. Idéal de 2 à 20 personnes.",
    cta: 'Demander un camp groupe',
    href: '/inscription?type=groupe',
    dates: 'Dates au choix',
    duration: '1, 2 ou 3 semaines',
    minPersons: 2,
    maxPersons: 20,
    leadTime: 'Réservation 90 jours minimum avant le départ',
    image: '/images/ruslan/action/mma-adultes-cercle.webp',
    imageAlt: 'Cercle de fighters caucasiens en formation, équipe et fraternité du tapis',
  },
]

/** Helper : récupérer par id */
export function getRegistrationType(id: RegistrationTypeId): RegistrationType | undefined {
  return REGISTRATION_TYPES.find(t => t.id === id)
}

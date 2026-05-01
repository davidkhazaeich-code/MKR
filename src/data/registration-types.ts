/**
 * MKR Caucasian Camp — 3 types d'inscription / produits
 *
 * MKR = facilitateur total. On organise tout (visa, vol intérieur Istanbul-Makhachkala,
 * transferts, hébergement, encadrement, repas, programme).
 */

export type RegistrationTypeId = 'session' | 'custom' | 'famille' | 'groupe'

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
    label: 'MKR Camp 2026',
    shortLabel: 'MKR Camp',
    badge: 'Session officielle · Adultes',
    description: 'Rejoins la session de 3 semaines au Daghestan. Adultes uniquement, groupe constitué par MKR, esprit collectif.',
    longDescription: "Tu rejoins notre session officielle du 17 août au 5 septembre 2026. Tu fais partie d'un groupe constitué d'athlètes adultes du monde entier. MKR organise tout : visa, vol intérieur, transferts, hébergement, repas, programme, encadrement. Pour venir en famille avec un enfant, choisis le tunnel Famille.",
    cta: "M'inscrire au MKR Camp 2026",
    href: '/inscription?type=session',
    dates: '17 août - 5 sept 2026',
    duration: '3 semaines',
    minPersons: 1,
    maxPersons: 15,
    leadTime: 'Inscriptions ouvertes',
    recommended: true,
    image: '/images/ruslan/action/mma-cercle-session-demo-mkr.webp',
    imageAlt: 'Cercle de combattants autour d\'une démonstration grappling au MKR Camp 2026',
  },
  {
    id: 'custom',
    label: 'Sur Mesure',
    shortLabel: 'Sur Mesure',
    badge: 'Tes dates · 1 à 4 adultes',
    description: 'Camp individuel ou en petit groupe d\'amis (1 à 4 adultes). Tu choisis tes dates, ta durée. MKR coordonne tout.',
    longDescription: "Tu pars quand tu veux, pour la durée que tu veux (1, 2 ou 3 semaines), seul ou avec 2 à 3 amis adultes (max 4 personnes). MKR coordonne tout sur place : coachs disponibles, hébergement, repas, transferts, vol intérieur Istanbul-Makhachkala. Pour venir en famille avec un enfant, choisis le tunnel Famille. Pour un club/groupe organisé de 5+ personnes, choisis Club & Groupe.",
    cta: 'Organiser mon aventure',
    href: '/inscription?type=custom',
    dates: 'Dates au choix',
    duration: '1, 2 ou 3 semaines',
    minPersons: 1,
    maxPersons: 4,
    leadTime: 'Réservation 90 jours minimum avant le départ',
    image: '/images/ruslan/coaches/Antoine-portrait-makhachkala-mkr.webp',
    imageAlt: 'Portrait d\'Antoine Petit-Jean, athlète MMA solo en immersion à Makhachkala',
  },
  {
    id: 'famille',
    label: 'Famille',
    shortLabel: 'Famille',
    badge: 'Parent + enfant 8-17',
    description: 'Camp en famille au Daghestan. Parent et enfant 8-17 ans côte à côte, encadrement jeunesse spécialisé.',
    longDescription: "Tu pars en famille avec tes enfants (8-17 ans avec parent participant obligatoire). Programme parallèle : sessions adultes pour le parent, programme Lutte enfants pour l'ado. Tu peux rejoindre la session officielle 17 août, ou choisir tes propres dates (90 jours minimum).",
    cta: 'Inscrire ma famille',
    href: '/inscription?type=famille',
    dates: 'Session ou tes dates',
    duration: '1, 2 ou 3 semaines',
    minPersons: 2,
    maxPersons: 6,
    leadTime: 'Inscriptions ouvertes (session) ou 90j (sur mesure)',
    image: '/images/ruslan/kids/parent-enfant-tapis-mkr.webp',
    imageAlt: 'Père et fils côte à côte sur le tapis du camp MKR, transmission familiale',
  },
  {
    id: 'groupe',
    label: 'Club & Groupe',
    shortLabel: 'Club & Groupe',
    badge: 'Devis sur mesure · 5 à 20',
    description: 'Tu viens avec ton club ou un groupe organisé ? 5 à 20 personnes. Camp dédié à tes dates, hébergement bloc.',
    longDescription: "Tu fédères ton club ou un groupe d'au moins 5 personnes autour d'un objectif commun. MKR organise un camp dédié : dates choisies, hébergement bloc, transferts groupés, programme adapté au niveau collectif. Tarif par tête identique au tarif individuel. Si tu es 1 à 4 adultes amis, prends Sur Mesure. Si tu pars en famille, prends Famille.",
    cta: 'Demander un devis groupe',
    href: '/inscription?type=groupe',
    dates: 'Dates au choix',
    duration: '1, 2 ou 3 semaines',
    minPersons: 5,
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

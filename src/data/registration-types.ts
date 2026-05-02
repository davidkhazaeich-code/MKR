/**
 * MKR Caucasian Camp - 4 types d'inscription / produits
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
  /** URL d'entrée principale (page produit). AudienceSwitcher pointe ici. */
  href: string
  /** URL du formulaire d'inscription (depuis la page produit). */
  formHref: string
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
    label: 'Sessions officielles',
    shortLabel: 'Sessions',
    badge: 'Sessions officielles · Adultes',
    description: '3 semaines au Daghestan dans un groupe constitué par MKR. Quatre sessions par an calées sur les vacances scolaires, adultes uniquement, esprit collectif.',
    longDescription: "Tu rejoins une de nos quatre sessions officielles 2026 / 2027 (Été, Toussaint, Hiver Février, Pâques) calées sur les vacances scolaires francophones, avec des athlètes adultes venus du monde entier. On gère le visa, le vol intérieur Istanbul-Makhachkala, les transferts, l'hébergement, les repas, le programme et l'encadrement. Si tu pars avec un enfant 8-17 ans, choisis plutôt le tunnel Famille.",
    cta: 'Voir les 4 sessions',
    href: '/sessions',
    formHref: '/inscription?type=session',
    dates: '4 sessions par an',
    duration: '3 semaines',
    minPersons: 1,
    maxPersons: 15,
    leadTime: 'Inscriptions ouvertes',
    recommended: true,
    image: '/images/ruslan/action/mma-cercle-session-demo-mkr.webp',
    imageAlt: 'Cercle de combattants autour d\'une démonstration grappling au MKR Caucasian Camp',
  },
  {
    id: 'custom',
    label: 'Sur Mesure',
    shortLabel: 'Sur Mesure',
    badge: 'Tes dates · 1 à 4 adultes',
    description: 'Camp individuel ou en petit groupe d\'amis (1 à 4 adultes). Tu choisis tes dates et ta durée, on coordonne tout.',
    longDescription: "Tu pars quand tu veux, pour la durée que tu veux (1, 2 ou 3 semaines), seul ou avec 2 à 3 amis adultes (max 4 personnes). On gère sur place les coachs disponibles, l'hébergement, les repas, les transferts et le vol intérieur Istanbul-Makhachkala. Si tu viens avec un enfant 8-17 ans, prends Famille. Si vous êtes un club ou un groupe organisé de 5 personnes ou plus, prends Club et Groupe.",
    cta: 'Découvrir le Sur Mesure',
    href: '/sur-mesure',
    formHref: '/inscription?type=custom',
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
    description: 'Camp en famille au Daghestan. Parent et enfant 8-17 ans côte à côte, encadrement jeunesse dédié.',
    longDescription: "Tu pars en famille avec tes enfants 8-17 ans (parent participant obligatoire, c'est notre règle de sécurité). Programme parallèle : sessions adultes pour toi, programme Lutte enfants pour l'ado. Tu peux rejoindre une des quatre sessions officielles (Été 2026, Toussaint 2026, Hiver 2027, Pâques 2027), ou choisir tes propres dates (90 jours minimum).",
    cta: 'Découvrir le Camp Famille',
    href: '/familles',
    formHref: '/inscription?type=famille',
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
    label: 'Club et Groupe',
    shortLabel: 'Club et Groupe',
    badge: 'Devis sur mesure · 5 à 20',
    description: 'Tu viens avec ton club ou un groupe organisé de 5 à 20 personnes ? Camp dédié à vos dates, hébergement bloc.',
    longDescription: "Tu fédères ton club (ou un groupe d'au moins 5 personnes) autour d'un objectif commun. On organise un camp dédié : dates choisies, hébergement bloc, transferts groupés, programme adapté au niveau collectif. Le tarif par tête reste identique au tarif individuel. Si vous êtes 1 à 4 amis adultes, prenez plutôt Sur Mesure. Si tu pars en famille, c'est le tunnel Famille.",
    cta: 'Découvrir Club et Groupe',
    href: '/clubs-groupes',
    formHref: '/inscription?type=groupe',
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

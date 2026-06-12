/**
 * MKR Caucasian Camp - Grille tarifaire publique (révision 2026-05-11)
 *
 * Modèle par taille de groupe (adultes) + forfait Parent+Enfant pour les familles.
 * La grille est figée et identique pour Sur Mesure et Club & Groupe.
 * Enfants 8-17 ans obligatoirement avec parent participant (tunnel Famille uniquement).
 *
 * Paliers :
 * - 1-2 adultes : 1 690 / 2 790 / 3 490 € par personne (Solo / Duo)
 * - 3-5 adultes : 1 490 / 2 490 / 3 090 € par personne (Trio / Quatuor / Petit groupe)
 * - 6-10 adultes : 1 290 / 2 190 / 2 690 € par personne (Club / Groupe)
 * - 11+ : sur devis (privatisation totale)
 *
 * Famille :
 * - Forfait base 1 parent + 1 enfant : 2 490 / 4 390 / 5 890 €
 * - Enfant supplémentaire : +790 / +1 580 / +2 370 € (selon durée)
 * - Si conjoint(e) participe : 2 × tarif 1-2 adultes + N enfants × supp/sem
 */

export type Duration = 1 | 2 | 3

export type GroupTier = 'duo' | 'trio' | 'club' | 'private'

export interface TierPricing {
  /** Min d'adultes inclusif */
  min: number
  /** Max d'adultes inclusif. null = pas de plafond (devis privé). */
  max: number | null
  /** Prix par adulte par durée (EUR) */
  perAdult: Record<Duration, number>
  label: string
  rangeLabel: string
  pitch: string
}

export const PRICING_TIERS: Record<GroupTier, TierPricing> = {
  duo: {
    min: 1,
    max: 2,
    perAdult: { 1: 1690, 2: 2790, 3: 3490 },
    label: 'Solo / Duo',
    rangeLabel: '1 à 2 personnes',
    pitch: "Tarif appliqué au camp Sur Mesure en solo ou en binôme adulte, ou à la session officielle pour un adulte seul.",
  },
  trio: {
    min: 3,
    max: 5,
    perAdult: { 1: 1490, 2: 2490, 3: 3090 },
    label: 'Trio à 5',
    rangeLabel: '3 à 5 personnes',
    pitch: "Tarif appliqué au camp Sur Mesure en équipe (3 ou 4 amis) ou aux groupes/clubs de 5 athlètes.",
  },
  club: {
    min: 6,
    max: 10,
    perAdult: { 1: 1290, 2: 2190, 3: 2690 },
    label: 'Club / Groupe',
    rangeLabel: '6 à 10 personnes',
    pitch: "Tarif appliqué aux clubs ou groupes organisés de 6 à 10 athlètes adultes.",
  },
  private: {
    min: 11,
    max: null,
    perAdult: { 1: 0, 2: 0, 3: 0 },
    label: 'Salle privée',
    rangeLabel: '11 personnes et plus',
    pitch: "Privatisation totale d'une session pour un club entier. Devis personnalisé.",
  },
}

/** Forfait Famille : 1 parent + 1 enfant inclus dans le prix de base, +N enfants supplémentaires */
export const FAMILY_PRICING = {
  /** Prix de base 1 parent + 1 enfant (par durée) */
  base: { 1: 2490, 2: 4390, 3: 5890 } as Record<Duration, number>,
  /** Enfant supplémentaire (au-delà du 1er enfant inclus) */
  extraChildPerWeek: { 1: 790, 2: 1580, 3: 2370 } as Record<Duration, number>,
}

/** Récupère le palier groupe correspondant à N adultes */
export function getTierForAdults(adults: number): GroupTier {
  if (adults >= 11) return 'private'
  if (adults >= 6) return 'club'
  if (adults >= 3) return 'trio'
  return 'duo'
}

/** Prix par adulte selon le nombre total d'adultes et la durée */
export function pricePerAdult(adults: number, weeks: Duration): number {
  const tier = getTierForAdults(adults)
  return PRICING_TIERS[tier].perAdult[weeks]
}

/** Indique si la config bascule sur devis (au-delà de 10 adultes) */
export function isOnQuote(adults: number): boolean {
  return adults >= 11
}

export interface PricingInput {
  /** Nombre d'adultes participants (parents inclus) */
  adults: number
  /** Nombre d'enfants 8-17 ans (toujours avec parent participant) */
  children?: number
  /** Durée en semaines */
  weeks: Duration
}

/**
 * Calcule le prix total pour une configuration donnée.
 * - 11+ adultes : retourne 0 (UI doit afficher "Sur devis", utiliser isOnQuote)
 * - 1 parent + N enfants : forfait Parent+Enfant (1er enfant inclus) + (N-1) × supp
 * - 2 parents + N enfants : 2 × tarif Duo + N × supp
 * - 1-10 adultes sans enfant : N × tarif palier correspondant
 */
export function calculatePrice({ adults, children = 0, weeks }: PricingInput): number {
  if (adults <= 0 || weeks <= 0) return 0
  if (isOnQuote(adults)) return 0

  // Famille (au moins 1 enfant)
  if (children > 0) {
    if (adults === 1) {
      const base = FAMILY_PRICING.base[weeks]
      const extra = FAMILY_PRICING.extraChildPerWeek[weeks]
      return base + Math.max(0, children - 1) * extra
    }
    if (adults === 2) {
      const duoPrice = PRICING_TIERS.duo.perAdult[weeks]
      const extra = FAMILY_PRICING.extraChildPerWeek[weeks]
      return 2 * duoPrice + children * extra
    }
    // 3+ parents : config atypique, on facture chaque adulte au tarif de palier + enfants au tarif supp
    return adults * pricePerAdult(adults, weeks) + children * FAMILY_PRICING.extraChildPerWeek[weeks]
  }

  // Groupe d'adultes (1-10 adultes)
  return adults * pricePerAdult(adults, weeks)
}

/** Format prix EUR (séparateur milliers espace, symbole € espacé) */
export function formatEUR(amount: number): string {
  return `${amount.toLocaleString('fr-FR').replace(/ /g, ' ').replace(/ /g, ' ')} €`
}

/** Labels de durée pour UI */
export const DURATION_LABELS: Record<Duration, string> = {
  1: '1 semaine',
  2: '2 semaines',
  3: '3 semaines',
}

/** Exemples famille pour affichage marketing (base 1 semaine) */
export const FAMILY_EXAMPLES = [
  { parents: 1, children: 1, label: '1 parent + 1 enfant' },
  { parents: 1, children: 2, label: '1 parent + 2 enfants' },
  { parents: 2, children: 1, label: '2 parents + 1 enfant' },
  { parents: 2, children: 2, label: '2 parents + 2 enfants' },
] as const

/**
 * Détail de calcul lisible (pour tooltip ou récap)
 * Ex: "1 × 2 490 € (forfait 1P+1E) + 1 × 790 € (enfant supp)"
 */
export function priceBreakdown({ adults, children = 0, weeks }: PricingInput): string {
  if (adults <= 0 || weeks <= 0) return ''
  if (isOnQuote(adults)) return 'Devis sur mesure'

  if (children > 0) {
    if (adults === 1) {
      const base = FAMILY_PRICING.base[weeks]
      const extra = FAMILY_PRICING.extraChildPerWeek[weeks]
      const supp = Math.max(0, children - 1)
      if (supp === 0) return `Forfait 1 parent + 1 enfant : ${formatEUR(base)}`
      return `${formatEUR(base)} (forfait 1P + 1E) + ${supp} × ${formatEUR(extra)} (enfant supp.)`
    }
    if (adults === 2) {
      const duoPrice = PRICING_TIERS.duo.perAdult[weeks]
      const extra = FAMILY_PRICING.extraChildPerWeek[weeks]
      return `2 × ${formatEUR(duoPrice)} (parents, tarif Duo) + ${children} × ${formatEUR(extra)} (enfant)`
    }
  }
  const tier = getTierForAdults(adults)
  const pp = PRICING_TIERS[tier].perAdult[weeks]
  return `${adults} × ${formatEUR(pp)} (tarif ${PRICING_TIERS[tier].label})`
}

/**
 * Convertit un string de durée (form value) en Duration typée.
 * Accepte '1-semaine' | '2-semaines' | '3-semaines' (legacy form values).
 */
export function parseDuration(value: string): Duration | null {
  if (value === '1-semaine') return 1
  if (value === '2-semaines') return 2
  if (value === '3-semaines') return 3
  return null
}

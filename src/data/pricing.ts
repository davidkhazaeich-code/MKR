/**
 * MKR Caucasian Camp — Grille tarifaire fixe (publique)
 *
 * Pas de réductions. Tarif identique en groupe (par tête).
 * Enfants 8-17 ans toujours avec parent participant.
 */

export type PriceProfile = 'adult' | 'child'
export type Duration = 1 | 2 | 3

export interface PriceEntry {
  weeks: Duration
  price: number
  currency: 'EUR'
  label: string
}

/** Tarifs ADULTE 18+ */
export const ADULT_PRICING: Record<Duration, PriceEntry> = {
  1: { weeks: 1, price: 1500, currency: 'EUR', label: '1 semaine' },
  2: { weeks: 2, price: 2200, currency: 'EUR', label: '2 semaines' },
  3: { weeks: 3, price: 2900, currency: 'EUR', label: '3 semaines' },
}

/** Tarifs ENFANT/ADO 8-17 (avec parent obligatoire) */
export const CHILD_PRICING: Record<Duration, PriceEntry> = {
  1: { weeks: 1, price: 1000, currency: 'EUR', label: '1 semaine' },
  2: { weeks: 2, price: 1400, currency: 'EUR', label: '2 semaines' },
  3: { weeks: 3, price: 1900, currency: 'EUR', label: '3 semaines' },
}

/** Helper : récupérer un tarif unitaire */
export function getPrice(profile: PriceProfile, weeks: Duration): number {
  const grid = profile === 'adult' ? ADULT_PRICING : CHILD_PRICING
  return grid[weeks].price
}

export interface FamilyConfig {
  adults: number
  children: number
  weeks: Duration
}

/** Calcul prix total famille / groupe */
export function calculatePrice({ adults, children, weeks }: FamilyConfig): number {
  return adults * getPrice('adult', weeks) + children * getPrice('child', weeks)
}

/** Format prix EUR */
export function formatEUR(amount: number): string {
  return `${amount.toLocaleString('fr-FR').replace(/ /g, ' ')} €`
}

/** Configurations famille types pour affichage */
export const FAMILY_EXAMPLES = [
  { adults: 1, children: 1, label: '1 parent + 1 enfant' },
  { adults: 1, children: 2, label: '1 parent + 2 enfants' },
  { adults: 2, children: 1, label: '2 parents + 1 enfant' },
  { adults: 2, children: 2, label: '2 parents + 2 enfants' },
] as const

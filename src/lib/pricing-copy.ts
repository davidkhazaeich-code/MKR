/**
 * Helpers de copy marketing dérivés de `data/pricing.ts`.
 *
 * Tout le contenu textuel parlant de prix sur le site (pages, FAQ, CGV, registration types,
 * hero stats, hints admin) DOIT importer depuis ce module au lieu de hardcoder des chiffres.
 *
 * Comme Next.js Static Generation re-bake les pages à chaque modification d'une source,
 * un changement dans `pricing.ts` se propage automatiquement à toutes les pages au prochain build.
 */

import {
  PRICING_TIERS,
  FAMILY_PRICING,
  formatEUR,
  type Duration,
} from '@/data/pricing'

const DURATIONS: Duration[] = [1, 2, 3]

/* ─────────────── Prix minimal global (toutes durées, tous paliers, hors devis) ─────────────── */

/** Plus petit prix unitaire par adulte sur l'ensemble de la grille (palier Club, 1 sem). */
export const MIN_PRICE_PER_ADULT_EUR: number = PRICING_TIERS.club.perAdult[1]

/** "1 290 €" — utilisé pour les "à partir de" très généraux (cards sessions, métadonnées). */
export const MIN_PRICE_PER_ADULT_LABEL: string = formatEUR(MIN_PRICE_PER_ADULT_EUR)

/** Prix Solo/Duo 1 sem — ce qu'un athlète seul paye pour une session officielle. */
export const SOLO_PRICE_1WEEK_EUR: number = PRICING_TIERS.duo.perAdult[1]
export const SOLO_PRICE_1WEEK_LABEL: string = formatEUR(SOLO_PRICE_1WEEK_EUR)

/* ─────────────── Lignes one-liner par palier (1/2/3 sem) ─────────────── */

function tierOneLine(tierKey: keyof typeof PRICING_TIERS, suffix: string = '/ adulte'): string {
  const tier = PRICING_TIERS[tierKey]
  return DURATIONS
    .map(w => `${formatEUR(tier.perAdult[w])} / ${w} sem`)
    .join(' · ') + (suffix ? ` ${suffix}` : '')
}

/** "1 490 € / 1 sem · 2 290 € / 2 sem · 2 790 € / 3 sem / adulte" */
export const DUO_ONE_LINE: string = tierOneLine('duo')
/** Idem sans suffix " / adulte" */
export const DUO_ONE_LINE_BARE: string = tierOneLine('duo', '')

/** "1 390 € / 1 sem · 1 990 € / 2 sem · 2 690 € / 3 sem / adulte" */
export const TRIO_ONE_LINE: string = tierOneLine('trio')
export const TRIO_ONE_LINE_BARE: string = tierOneLine('trio', '')

/** "1 290 € / 1 sem · 1 790 € / 2 sem · 2 390 € / 3 sem / adulte" */
export const CLUB_ONE_LINE: string = tierOneLine('club')
export const CLUB_ONE_LINE_BARE: string = tierOneLine('club', '')

/* ─────────────── Forfait Famille ─────────────── */

/** "2 590 € (1 sem) · 4 790 € (2 sem) · 6 890 € (3 sem)" */
export const FAMILY_BASE_ONE_LINE: string = DURATIONS
  .map(w => `${formatEUR(FAMILY_PRICING.base[w])} (${w} sem)`)
  .join(' · ')

/** "2 590 € / 1 sem, 4 790 € / 2 sem, 6 890 € / 3 sem" — variante prose */
export const FAMILY_BASE_PROSE: string = DURATIONS
  .map(w => `${formatEUR(FAMILY_PRICING.base[w])} / ${w} sem`)
  .join(', ')

/** Prix forfait base 1 sem (le plus utilisé en accroche marketing) */
export const FAMILY_BASE_1WEEK_LABEL: string = formatEUR(FAMILY_PRICING.base[1])

/** Min et max du forfait Famille (1 parent + 1 enfant) */
export const FAMILY_BASE_RANGE_LABEL: string = `${formatEUR(FAMILY_PRICING.base[1])} - ${formatEUR(FAMILY_PRICING.base[3])}`

/** "+790 € par semaine" — supplément par enfant additionnel (utilise la valeur 1 sem comme base courante) */
export const FAMILY_EXTRA_CHILD_1WEEK_LABEL: string = `+${formatEUR(FAMILY_PRICING.extraChildPerWeek[1])} par semaine`

/** "+790 € / 1 sem, +1 580 € / 2 sem, +2 370 € / 3 sem" */
export const FAMILY_EXTRA_CHILD_FULL: string = DURATIONS
  .map(w => `+${formatEUR(FAMILY_PRICING.extraChildPerWeek[w])} / ${w} sem`)
  .join(', ')

/** Valeur brute extra child / sem (pour interpolations courtes) */
export const FAMILY_EXTRA_CHILD_PER_WEEK_LABEL: string = formatEUR(FAMILY_PRICING.extraChildPerWeek[1])

/* ─────────────── Plages générales (utilisées en logistique / budget) ─────────────── */

/** "1 290 - 2 790 €" — min/max du tarif par adulte hors famille, hors devis */
export const PACKAGE_PER_ADULT_RANGE_LABEL: string = `${formatEUR(PRICING_TIERS.club.perAdult[1])} - ${formatEUR(PRICING_TIERS.duo.perAdult[3])}`

/* ─────────────── Helper fonctionnel : tarif selon nombre d'adultes ─────────────── */

/** "1 390 € / pers" — utilisable inline */
export function pricePerAdultLabel(adults: number, weeks: Duration): string {
  if (adults >= 11) return 'Sur devis'
  if (adults >= 6) return `${formatEUR(PRICING_TIERS.club.perAdult[weeks])} / pers`
  if (adults >= 3) return `${formatEUR(PRICING_TIERS.trio.perAdult[weeks])} / pers`
  return `${formatEUR(PRICING_TIERS.duo.perAdult[weeks])} / pers`
}

/* ─────────────── Bloc admin hint (référence rapide pour saisie manuelle) ─────────────── */

/** "1490/2290/2790 € selon durée" — utilisé comme rappel admin */
export const ADMIN_SOLO_DUO_HINT: string = DURATIONS
  .map(w => PRICING_TIERS.duo.perAdult[w])
  .join('/') + ' € selon durée'

/* ─────────────── Phrases marketing prêtes à l'emploi ─────────────── */

/** Description courte "Forfait Famille à partir de 2 590 €" */
export const FAMILY_FORFAIT_TEASER: string = `Forfait Famille (1 parent + 1 enfant inclus) à partir de ${FAMILY_BASE_1WEEK_LABEL} la semaine`

/** Phrase canonique grille tarifaire pour CGV / FAQ. */
export const PRICING_GRID_PROSE: string =
  `Solo / Duo (1-2 personnes) : ${DUO_ONE_LINE_BARE} par adulte. ` +
  `Trio à 5 (3-5 personnes) : ${TRIO_ONE_LINE_BARE} par adulte. ` +
  `Club / Groupe (6-10 personnes) : ${CLUB_ONE_LINE_BARE} par adulte. ` +
  `11 personnes et plus / privatisation : sur devis personnalisé. ` +
  `Forfait Famille (1 parent + 1 enfant inclus) : ${FAMILY_BASE_PROSE}. ` +
  `Chaque enfant supplémentaire : ${FAMILY_EXTRA_CHILD_FULL}. ` +
  `Famille avec 2 parents participants : tarif Solo/Duo pour les deux parents (${formatEUR(PRICING_TIERS.duo.perAdult[1])} / pers / sem) + chaque enfant à ${FAMILY_EXTRA_CHILD_PER_WEEK_LABEL} / sem.`

/* ─────────────── Cas particuliers (page lutte-enfants, programme) ─────────────── */

/** "Forfait Famille : 2 590 € pour 1 parent + 1 enfant (1 sem), 4 790 € (2 sem), 6 890 € (3 sem). Chaque enfant supplémentaire : +790 € par semaine." */
export const FAMILY_FORFAIT_DETAIL: string =
  `Forfait Famille : ${formatEUR(FAMILY_PRICING.base[1])} pour 1 parent + 1 enfant (1 sem), ` +
  `${formatEUR(FAMILY_PRICING.base[2])} (2 sem), ` +
  `${formatEUR(FAMILY_PRICING.base[3])} (3 sem). ` +
  `Chaque enfant supplémentaire : ${FAMILY_EXTRA_CHILD_1WEEK_LABEL}.`

/**
 * Pricing copy helpers, derived from `data/pricing.ts`.
 *
 * Locale-aware: `getPricingCopy(locale)` returns the same shape for both
 * 'fr' and 'en'. For now (T9), both locales return the FR strings — EN content
 * lands in T13.
 *
 * Backwards-compat top-level constants (SOLO_PRICE_1WEEK_LABEL, DUO_ONE_LINE,
 * FAMILY_BASE_PROSE, etc.) are exported as the FR variant so that the dozens
 * of existing importers continue to compile. New code should call
 * `getPricingCopy(locale)` instead.
 */

import {
  PRICING_TIERS,
  FAMILY_PRICING,
  formatEUR,
  type Duration,
} from '@/data/pricing'

type Locale = 'fr' | 'en'

const DURATIONS: Duration[] = [1, 2, 3]

/* ─────────────── Builders (locale-agnostic numerics + suffixes) ─────────────── */

interface PricingCopyTexts {
  perAdultSuffix: string
  perPersonShort: string
  bareSeparator: string
  weekShort: (w: Duration) => string
  parenthesizedWeeks: (w: Duration) => string
  fromPrefix: string
  onQuote: string
  extraChildPerWeekLabel: (amount: string) => string
  forfaitFamilleTeaser: (price: string) => string
  pricingGridProse: (parts: GridProseParts) => string
  familyForfaitDetail: (parts: FamilyDetailParts) => string
  adminSoloDuoSuffix: string
}

interface GridProseParts {
  duoBare: string
  trioBare: string
  clubBare: string
  familyBaseProse: string
  familyExtraChildFull: string
  duoPerAdult1week: string
  familyExtraChildPerWeek: string
}

interface FamilyDetailParts {
  family1: string
  family2: string
  family3: string
  extraChild1Label: string
}

// TODO(i18n): EN pricing copy in T13. For now EN reuses the FR texts so the
// helper is callable from any locale without crashing.
const TEXTS: Record<Locale, PricingCopyTexts> = {
  fr: {
    perAdultSuffix: '/ adulte',
    perPersonShort: '/ pers',
    bareSeparator: ' · ',
    weekShort: (w) => `${w} sem`,
    parenthesizedWeeks: (w) => `(${w} sem)`,
    fromPrefix: 'À partir de',
    onQuote: 'Sur devis',
    extraChildPerWeekLabel: (amount) => `+${amount} par semaine`,
    forfaitFamilleTeaser: (price) =>
      `Forfait Famille (1 parent + 1 enfant inclus) à partir de ${price} la semaine`,
    pricingGridProse: (p) =>
      `Solo / Duo (1-2 personnes) : ${p.duoBare} par adulte. ` +
      `Trio à 5 (3-5 personnes) : ${p.trioBare} par adulte. ` +
      `Club / Groupe (6-10 personnes) : ${p.clubBare} par adulte. ` +
      `11 personnes et plus / privatisation : sur devis personnalisé. ` +
      `Forfait Famille (1 parent + 1 enfant inclus) : ${p.familyBaseProse}. ` +
      `Chaque enfant supplémentaire : ${p.familyExtraChildFull}. ` +
      `Famille avec 2 parents participants : tarif Solo/Duo pour les deux parents (${p.duoPerAdult1week} / pers / sem) + chaque enfant à ${p.familyExtraChildPerWeek} / sem.`,
    familyForfaitDetail: (p) =>
      `Forfait Famille : ${p.family1} pour 1 parent + 1 enfant (1 sem), ${p.family2} (2 sem), ${p.family3} (3 sem). ` +
      `Chaque enfant supplémentaire : ${p.extraChild1Label}.`,
    adminSoloDuoSuffix: ' € selon durée',
  },
  en: {
    // TODO(i18n): EN pricing copy in T13.
    perAdultSuffix: '/ adulte',
    perPersonShort: '/ pers',
    bareSeparator: ' · ',
    weekShort: (w) => `${w} sem`,
    parenthesizedWeeks: (w) => `(${w} sem)`,
    fromPrefix: 'À partir de',
    onQuote: 'Sur devis',
    extraChildPerWeekLabel: (amount) => `+${amount} par semaine`,
    forfaitFamilleTeaser: (price) =>
      `Forfait Famille (1 parent + 1 enfant inclus) à partir de ${price} la semaine`,
    pricingGridProse: (p) =>
      `Solo / Duo (1-2 personnes) : ${p.duoBare} par adulte. ` +
      `Trio à 5 (3-5 personnes) : ${p.trioBare} par adulte. ` +
      `Club / Groupe (6-10 personnes) : ${p.clubBare} par adulte. ` +
      `11 personnes et plus / privatisation : sur devis personnalisé. ` +
      `Forfait Famille (1 parent + 1 enfant inclus) : ${p.familyBaseProse}. ` +
      `Chaque enfant supplémentaire : ${p.familyExtraChildFull}. ` +
      `Famille avec 2 parents participants : tarif Solo/Duo pour les deux parents (${p.duoPerAdult1week} / pers / sem) + chaque enfant à ${p.familyExtraChildPerWeek} / sem.`,
    familyForfaitDetail: (p) =>
      `Forfait Famille : ${p.family1} pour 1 parent + 1 enfant (1 sem), ${p.family2} (2 sem), ${p.family3} (3 sem). ` +
      `Chaque enfant supplémentaire : ${p.extraChild1Label}.`,
    adminSoloDuoSuffix: ' € selon durée',
  },
}

export interface PricingCopy {
  MIN_PRICE_PER_ADULT_EUR: number
  MIN_PRICE_PER_ADULT_LABEL: string
  SOLO_PRICE_1WEEK_EUR: number
  SOLO_PRICE_1WEEK_LABEL: string
  DUO_ONE_LINE: string
  DUO_ONE_LINE_BARE: string
  TRIO_ONE_LINE: string
  TRIO_ONE_LINE_BARE: string
  CLUB_ONE_LINE: string
  CLUB_ONE_LINE_BARE: string
  FAMILY_BASE_ONE_LINE: string
  FAMILY_BASE_PROSE: string
  FAMILY_BASE_1WEEK_LABEL: string
  FAMILY_BASE_RANGE_LABEL: string
  FAMILY_EXTRA_CHILD_1WEEK_LABEL: string
  FAMILY_EXTRA_CHILD_FULL: string
  FAMILY_EXTRA_CHILD_PER_WEEK_LABEL: string
  PACKAGE_PER_ADULT_RANGE_LABEL: string
  ADMIN_SOLO_DUO_HINT: string
  FAMILY_FORFAIT_TEASER: string
  PRICING_GRID_PROSE: string
  FAMILY_FORFAIT_DETAIL: string
  pricePerAdultLabel: (adults: number, weeks: Duration) => string
}

export function getPricingCopy(locale: string = 'fr'): PricingCopy {
  const lang: Locale = locale === 'en' ? 'en' : 'fr'
  const tx = TEXTS[lang]

  const tierOneLine = (tierKey: keyof typeof PRICING_TIERS, suffix: string): string => {
    const tier = PRICING_TIERS[tierKey]
    return (
      DURATIONS.map(w => `${formatEUR(tier.perAdult[w])} / ${tx.weekShort(w)}`).join(tx.bareSeparator) +
      (suffix ? ` ${suffix}` : '')
    )
  }

  const MIN_PRICE_PER_ADULT_EUR = PRICING_TIERS.club.perAdult[1]
  const MIN_PRICE_PER_ADULT_LABEL = formatEUR(MIN_PRICE_PER_ADULT_EUR)

  const SOLO_PRICE_1WEEK_EUR = PRICING_TIERS.duo.perAdult[1]
  const SOLO_PRICE_1WEEK_LABEL = formatEUR(SOLO_PRICE_1WEEK_EUR)

  const DUO_ONE_LINE = tierOneLine('duo', tx.perAdultSuffix)
  const DUO_ONE_LINE_BARE = tierOneLine('duo', '')
  const TRIO_ONE_LINE = tierOneLine('trio', tx.perAdultSuffix)
  const TRIO_ONE_LINE_BARE = tierOneLine('trio', '')
  const CLUB_ONE_LINE = tierOneLine('club', tx.perAdultSuffix)
  const CLUB_ONE_LINE_BARE = tierOneLine('club', '')

  const FAMILY_BASE_ONE_LINE = DURATIONS.map(
    w => `${formatEUR(FAMILY_PRICING.base[w])} ${tx.parenthesizedWeeks(w)}`,
  ).join(tx.bareSeparator)

  const FAMILY_BASE_PROSE = DURATIONS.map(
    w => `${formatEUR(FAMILY_PRICING.base[w])} / ${tx.weekShort(w)}`,
  ).join(', ')

  const FAMILY_BASE_1WEEK_LABEL = formatEUR(FAMILY_PRICING.base[1])
  const FAMILY_BASE_RANGE_LABEL = `${formatEUR(FAMILY_PRICING.base[1])} - ${formatEUR(FAMILY_PRICING.base[3])}`

  const FAMILY_EXTRA_CHILD_PER_WEEK_LABEL = formatEUR(FAMILY_PRICING.extraChildPerWeek[1])
  const FAMILY_EXTRA_CHILD_1WEEK_LABEL = tx.extraChildPerWeekLabel(FAMILY_EXTRA_CHILD_PER_WEEK_LABEL)
  const FAMILY_EXTRA_CHILD_FULL = DURATIONS.map(
    w => `+${formatEUR(FAMILY_PRICING.extraChildPerWeek[w])} / ${tx.weekShort(w)}`,
  ).join(', ')

  const PACKAGE_PER_ADULT_RANGE_LABEL = `${formatEUR(PRICING_TIERS.club.perAdult[1])} - ${formatEUR(PRICING_TIERS.duo.perAdult[3])}`

  const ADMIN_SOLO_DUO_HINT =
    DURATIONS.map(w => PRICING_TIERS.duo.perAdult[w]).join('/') + tx.adminSoloDuoSuffix

  const FAMILY_FORFAIT_TEASER = tx.forfaitFamilleTeaser(FAMILY_BASE_1WEEK_LABEL)

  const PRICING_GRID_PROSE = tx.pricingGridProse({
    duoBare: DUO_ONE_LINE_BARE,
    trioBare: TRIO_ONE_LINE_BARE,
    clubBare: CLUB_ONE_LINE_BARE,
    familyBaseProse: FAMILY_BASE_PROSE,
    familyExtraChildFull: FAMILY_EXTRA_CHILD_FULL,
    duoPerAdult1week: formatEUR(PRICING_TIERS.duo.perAdult[1]),
    familyExtraChildPerWeek: FAMILY_EXTRA_CHILD_PER_WEEK_LABEL,
  })

  const FAMILY_FORFAIT_DETAIL = tx.familyForfaitDetail({
    family1: formatEUR(FAMILY_PRICING.base[1]),
    family2: formatEUR(FAMILY_PRICING.base[2]),
    family3: formatEUR(FAMILY_PRICING.base[3]),
    extraChild1Label: FAMILY_EXTRA_CHILD_1WEEK_LABEL,
  })

  const pricePerAdultLabel = (adults: number, weeks: Duration): string => {
    if (adults >= 11) return tx.onQuote
    if (adults >= 6) return `${formatEUR(PRICING_TIERS.club.perAdult[weeks])} ${tx.perPersonShort}`
    if (adults >= 3) return `${formatEUR(PRICING_TIERS.trio.perAdult[weeks])} ${tx.perPersonShort}`
    return `${formatEUR(PRICING_TIERS.duo.perAdult[weeks])} ${tx.perPersonShort}`
  }

  return {
    MIN_PRICE_PER_ADULT_EUR,
    MIN_PRICE_PER_ADULT_LABEL,
    SOLO_PRICE_1WEEK_EUR,
    SOLO_PRICE_1WEEK_LABEL,
    DUO_ONE_LINE,
    DUO_ONE_LINE_BARE,
    TRIO_ONE_LINE,
    TRIO_ONE_LINE_BARE,
    CLUB_ONE_LINE,
    CLUB_ONE_LINE_BARE,
    FAMILY_BASE_ONE_LINE,
    FAMILY_BASE_PROSE,
    FAMILY_BASE_1WEEK_LABEL,
    FAMILY_BASE_RANGE_LABEL,
    FAMILY_EXTRA_CHILD_1WEEK_LABEL,
    FAMILY_EXTRA_CHILD_FULL,
    FAMILY_EXTRA_CHILD_PER_WEEK_LABEL,
    PACKAGE_PER_ADULT_RANGE_LABEL,
    ADMIN_SOLO_DUO_HINT,
    FAMILY_FORFAIT_TEASER,
    PRICING_GRID_PROSE,
    FAMILY_FORFAIT_DETAIL,
    pricePerAdultLabel,
  }
}

/* ─────────────── Backwards-compat top-level constants (FR snapshot) ─────────────── */
// All existing importers (~15 files) keep working. New code should call
// `getPricingCopy(locale)` instead. EN translation arrives in T13.

const FR_COPY = getPricingCopy('fr')

export const MIN_PRICE_PER_ADULT_EUR = FR_COPY.MIN_PRICE_PER_ADULT_EUR
export const MIN_PRICE_PER_ADULT_LABEL = FR_COPY.MIN_PRICE_PER_ADULT_LABEL
export const SOLO_PRICE_1WEEK_EUR = FR_COPY.SOLO_PRICE_1WEEK_EUR
export const SOLO_PRICE_1WEEK_LABEL = FR_COPY.SOLO_PRICE_1WEEK_LABEL
export const DUO_ONE_LINE = FR_COPY.DUO_ONE_LINE
export const DUO_ONE_LINE_BARE = FR_COPY.DUO_ONE_LINE_BARE
export const TRIO_ONE_LINE = FR_COPY.TRIO_ONE_LINE
export const TRIO_ONE_LINE_BARE = FR_COPY.TRIO_ONE_LINE_BARE
export const CLUB_ONE_LINE = FR_COPY.CLUB_ONE_LINE
export const CLUB_ONE_LINE_BARE = FR_COPY.CLUB_ONE_LINE_BARE
export const FAMILY_BASE_ONE_LINE = FR_COPY.FAMILY_BASE_ONE_LINE
export const FAMILY_BASE_PROSE = FR_COPY.FAMILY_BASE_PROSE
export const FAMILY_BASE_1WEEK_LABEL = FR_COPY.FAMILY_BASE_1WEEK_LABEL
export const FAMILY_BASE_RANGE_LABEL = FR_COPY.FAMILY_BASE_RANGE_LABEL
export const FAMILY_EXTRA_CHILD_1WEEK_LABEL = FR_COPY.FAMILY_EXTRA_CHILD_1WEEK_LABEL
export const FAMILY_EXTRA_CHILD_FULL = FR_COPY.FAMILY_EXTRA_CHILD_FULL
export const FAMILY_EXTRA_CHILD_PER_WEEK_LABEL = FR_COPY.FAMILY_EXTRA_CHILD_PER_WEEK_LABEL
export const PACKAGE_PER_ADULT_RANGE_LABEL = FR_COPY.PACKAGE_PER_ADULT_RANGE_LABEL
export const ADMIN_SOLO_DUO_HINT = FR_COPY.ADMIN_SOLO_DUO_HINT
export const FAMILY_FORFAIT_TEASER = FR_COPY.FAMILY_FORFAIT_TEASER
export const PRICING_GRID_PROSE = FR_COPY.PRICING_GRID_PROSE
export const FAMILY_FORFAIT_DETAIL = FR_COPY.FAMILY_FORFAIT_DETAIL

export function pricePerAdultLabel(adults: number, weeks: Duration): string {
  return FR_COPY.pricePerAdultLabel(adults, weeks)
}

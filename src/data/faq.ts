/**
 * FAQ: structural shape + helpers. The Q/A content lives in
 * `messages/<locale>/data.faq.json` under the `homepage` array and the
 * `categories` array. Use `getFaqHomepage(t)` and `getFaqCategories(t)`
 * to retrieve hydrated copy at render time.
 */

import {
  PRICING_TIERS,
  FAMILY_PRICING,
  formatEUR,
} from './pricing'
import {
  FAMILY_BASE_1WEEK_LABEL,
  FAMILY_EXTRA_CHILD_1WEEK_LABEL,
  DUO_ONE_LINE_BARE,
} from '@/lib/pricing-copy'
import type { TFn } from '@/lib/session-display'

export interface FAQItem {
  question: string
  answer: string
}

export interface FAQCategory {
  id: string
  label: string
  items: FAQItem[]
}

/** Pricing placeholders injected into FAQ answers via ICU-style replacement. */
function faqPricingPlaceholders(): Record<string, string> {
  return {
    duoPerAdult1week: formatEUR(PRICING_TIERS.duo.perAdult[1]),
    duoPerAdult3week: formatEUR(PRICING_TIERS.duo.perAdult[3]),
    trioPerAdult1week: formatEUR(PRICING_TIERS.trio.perAdult[1]),
    clubPerAdult1week: formatEUR(PRICING_TIERS.club.perAdult[1]),
    familyBase1week: formatEUR(FAMILY_PRICING.base[1]),
    familyBase2week: formatEUR(FAMILY_PRICING.base[2]),
    familyBase3week: formatEUR(FAMILY_PRICING.base[3]),
    familyBase1weekLabel: FAMILY_BASE_1WEEK_LABEL,
    familyExtraChild1weekLabel: FAMILY_EXTRA_CHILD_1WEEK_LABEL,
    familyExtraChildPerWeek: formatEUR(FAMILY_PRICING.extraChildPerWeek[1]),
    duoOneLineBare: DUO_ONE_LINE_BARE,
  }
}

function interpolate(s: string, placeholders: Record<string, string>): string {
  return s.replace(/\{(\w+)\}/g, (_, key) =>
    Object.prototype.hasOwnProperty.call(placeholders, key) ? placeholders[key] : `{${key}}`,
  )
}

/** Hydrate FAQ_HOMEPAGE for client/server render. `t` scoped to `data.faq`. */
export function getFaqHomepage(t: TFn): FAQItem[] {
  const items = t.raw('homepage') as FAQItem[]
  const ph = faqPricingPlaceholders()
  return items.map(item => ({
    question: item.question,
    answer: interpolate(item.answer, ph),
  }))
}

/** Hydrate FAQ_CATEGORIES for client/server render. `t` scoped to `data.faq`. */
export function getFaqCategories(t: TFn): FAQCategory[] {
  const cats = t.raw('categories') as FAQCategory[]
  const ph = faqPricingPlaceholders()
  return cats.map(c => ({
    id: c.id,
    label: c.label,
    items: c.items.map(item => ({
      question: item.question,
      answer: interpolate(item.answer, ph),
    })),
  }))
}

/** All FAQ items flattened - used for JSON-LD FAQPage schema. */
export function getAllFaqItems(t: TFn): FAQItem[] {
  const home = getFaqHomepage(t)
  const cats = getFaqCategories(t)
  return [
    ...home,
    ...cats.flatMap(c => c.items).filter(
      item => !home.some(h => h.question === item.question),
    ),
  ]
}

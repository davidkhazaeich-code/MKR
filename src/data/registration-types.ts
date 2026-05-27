/**
 * MKR Caucasian Camp - 4 types d'inscription / produits
 *
 * Display copy (label, badge, description, longDescription, cta, imageAlt)
 * has moved to `messages/<locale>/data.registration-types.json`.
 *
 * This module keeps only structural fields: id, image asset path, hrefs,
 * capacity bounds, recommended flag, and a hydration helper.
 */

import type { TFn } from '@/lib/session-display'

export type RegistrationTypeId = 'session' | 'custom' | 'famille' | 'groupe'

export interface RegistrationType {
  id: RegistrationTypeId
  /** URL d'entrée principale (page produit). AudienceSwitcher pointe ici. */
  href: string
  /** URL du formulaire d'inscription (depuis la page produit). */
  formHref: string
  minPersons: number
  maxPersons?: number
  recommended?: boolean
  image: string
}

export interface RegistrationTypeDisplay {
  label: string
  short_label: string
  badge: string
  description: string
  long_description: string
  cta: string
  dates: string
  duration: string
  lead_time: string
  image_alt: string
}

export const REGISTRATION_TYPES: RegistrationType[] = [
  {
    id: 'session',
    href: '/sessions#sessions-list-heading',
    formHref: '/inscription?type=session',
    minPersons: 1,
    maxPersons: 15,
    recommended: true,
    image: '/images/ruslan/action/mma-cercle-session-demo-mkr.webp',
  },
  {
    id: 'custom',
    href: '/sur-mesure',
    formHref: '/inscription?type=custom',
    minPersons: 1,
    maxPersons: 4,
    image: '/images/ruslan/coaches/Antoine-portrait-makhachkala-mkr.webp',
  },
  {
    id: 'famille',
    href: '/familles',
    formHref: '/inscription?type=famille',
    minPersons: 2,
    maxPersons: 6,
    image: '/images/ruslan/kids/parent-enfant-tapis-mkr.webp',
  },
  {
    id: 'groupe',
    href: '/clubs-groupes',
    formHref: '/inscription?type=groupe',
    minPersons: 5,
    maxPersons: 20,
    image: '/images/ruslan/action/mma-adultes-cercle.webp',
  },
]

/** Helper : récupérer par id */
export function getRegistrationType(id: RegistrationTypeId): RegistrationType | undefined {
  return REGISTRATION_TYPES.find(t => t.id === id)
}

/**
 * Hydrate a registration type with translated display copy.
 * `t` must be scoped to the `data.registration-types` namespace.
 */
export function hydrateRegistrationType(
  type: RegistrationType,
  t: TFn,
  placeholders: {
    familyBase1weekLabel: string
    familyExtraChild1weekLabel: string
    duoPerAdult1week: string
    trioPerAdult1week: string
    clubPerAdult1week: string
  },
): RegistrationType & RegistrationTypeDisplay {
  const raw = t.raw(type.id) as RegistrationTypeDisplay
  const interpolate = (s: string): string =>
    s
      .replace(/\{familyBase1weekLabel\}/g, placeholders.familyBase1weekLabel)
      .replace(/\{familyExtraChild1weekLabel\}/g, placeholders.familyExtraChild1weekLabel)
      .replace(/\{duoPerAdult1week\}/g, placeholders.duoPerAdult1week)
      .replace(/\{trioPerAdult1week\}/g, placeholders.trioPerAdult1week)
      .replace(/\{clubPerAdult1week\}/g, placeholders.clubPerAdult1week)
  return {
    ...type,
    label: raw.label,
    short_label: raw.short_label,
    badge: raw.badge,
    description: interpolate(raw.description),
    long_description: interpolate(raw.long_description),
    cta: raw.cta,
    dates: raw.dates,
    duration: raw.duration,
    lead_time: raw.lead_time,
    image_alt: raw.image_alt,
  }
}

export function hydrateRegistrationTypes(
  t: TFn,
  placeholders: {
    familyBase1weekLabel: string
    familyExtraChild1weekLabel: string
    duoPerAdult1week: string
    trioPerAdult1week: string
    clubPerAdult1week: string
  },
): (RegistrationType & RegistrationTypeDisplay)[] {
  return REGISTRATION_TYPES.map(type => hydrateRegistrationType(type, t, placeholders))
}

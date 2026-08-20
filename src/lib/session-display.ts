/**
 * Hydratation de la copie d'affichage des sessions.
 *
 * `src/data/sessions.ts` calcule la structure (id, dates reelles, capacite).
 * `messages/<locale>/data.sessions.json` porte la copie, decrite PAR SAISON :
 * quatre blocs de saison, les noms de mois, et des gabarits de formatage.
 *
 * Les libelles dates ("17 Août - 5 Septembre", "AOÛT 2026") sont donc ECRITS
 * a partir des vraies dates, jamais recopies a la main. Une session 2029
 * s'affiche correctement sans qu'une seule cle de traduction soit ajoutee.
 */

import type { Session, SeasonKey } from '@/data/sessions'

export interface SessionDisplay {
  /** Nom complet de la carte, ex. « CAMP CAUCASIEN ». */
  name: string
  /** Nom sur deux lignes pour les cartes de session. */
  name_line1: string
  name_line2: string
  /** Mot de saison localise, ex. « Été » / « Summer ». */
  season: string
  /** Libelle de saison complet, ex. « Session Été · Août 2026 ». */
  season_label: string
  /** Ex. « AOÛT 2026 ». */
  label: string
  /** Abreviation du mois de debut pour le chiffre de fond, ex. « AOÛ ». */
  month_abbr: string
  /** Ex. « 17 Août - 5 Septembre ». */
  dates: string
  /** Ex. « 17 AOÛT · 5 SEPTEMBRE 2026 ». */
  dates_full: string
  /** Ex. « 17 août - 5 sept. 2026 », pour les menus. */
  dates_short: string
  /** Ex. « Été · 17 août - 5 sept. 2026 », pour les menus. */
  short_label: string
  spots_label: string
  intensity: string
  duration: string
  destination: string
}

export type SessionView = Session & SessionDisplay

interface SeasonCopy {
  season: string
  period: string
  name_line1: string
  name_line2: string
  intensity: string
}

interface RangeTemplates {
  same_month: string
  cross_month: string
}

/** Forme brute du namespace `data.sessions`. */
export interface SessionCopy {
  seasons: Record<SeasonKey, SeasonCopy>
  months: string[]
  months_short: string[]
  months_abbr: string[]
  templates: {
    label: string
    season_label: string
    form_label: string
    short_label: string
    list_item: string
    dates: RangeTemplates
    dates_full: RangeTemplates
    dates_short: RangeTemplates
  }
  spots_label: string
  duration: string
  destination: string
  price_from_prefix: string
}

/**
 * Interface de traduction laxiste, compatible avec le `t` serveur de next-intl
 * (`getTranslations`) et le `t` client (`useTranslations`). Les deux exposent
 * un appel `(cle, valeurs?)` et un `.raw(cle)`.
 */
export type TFn = ((key: string, values?: Record<string, unknown>) => string) & {
  raw: (key: string) => unknown
}

/** Remplacement `{cle}` simple : marche aussi bien depuis un `t.raw` que depuis un JSON importe. */
function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : `{${key}}`,
  )
}

/** Lit le namespace `data.sessions` depuis un `t` next-intl. */
export function readSessionCopy(t: TFn): SessionCopy {
  return {
    seasons: t.raw('seasons') as SessionCopy['seasons'],
    months: t.raw('months') as string[],
    months_short: t.raw('months_short') as string[],
    months_abbr: t.raw('months_abbr') as string[],
    templates: t.raw('templates') as SessionCopy['templates'],
    spots_label: t.raw('spots_label') as string,
    duration: t.raw('duration') as string,
    destination: t.raw('destination') as string,
    price_from_prefix: t.raw('price_from_prefix') as string,
  }
}

/** Jour du mois + index de mois (0-11) d'une date ISO, en UTC. */
function parts(iso: string): { day: number; month: number; year: number } {
  const [y, m, d] = iso.split('-').map(Number)
  return { day: d, month: m - 1, year: y }
}

function formatRange(
  session: Session,
  tpl: RangeTemplates,
  monthNames: string[],
  withYear: boolean,
): string {
  const a = parts(session.startDate)
  const b = parts(session.endDate)
  const m1 = monthNames[a.month] ?? ''
  const m2 = monthNames[b.month] ?? ''
  const year = withYear ? String(a.year) : ''
  return a.month === b.month
    ? fill(tpl.same_month, { d1: a.day, d2: b.day, month: m1, year })
    : fill(tpl.cross_month, { d1: a.day, d2: b.day, month1: m1, month2: m2, year })
}

/** Repli minimal si le namespace n'est pas charge : jamais de crash, jamais de cle brute affichee. */
function fallbackDisplay(session: Session): SessionDisplay {
  const year = session.startDate.slice(0, 4)
  const plain = `${session.startDate} / ${session.endDate}`
  return {
    name: session.id.toUpperCase(),
    name_line1: session.id.toUpperCase(),
    name_line2: '',
    season: session.seasonKey,
    season_label: `${session.seasonKey} ${year}`,
    label: `${session.seasonKey.toUpperCase()} ${year}`,
    month_abbr: '',
    dates: plain,
    dates_full: plain,
    dates_short: plain,
    short_label: plain,
    spots_label: '',
    intensity: '',
    duration: '',
    destination: '',
  }
}

/** Construit la copie affichable d'une session a partir du dictionnaire brut. */
export function buildSessionDisplay(session: Session, copy: SessionCopy): SessionDisplay {
  const season = copy?.seasons?.[session.seasonKey]
  if (!season || !copy.months || !copy.templates) return fallbackDisplay(session)

  const start = parts(session.startDate)
  const year = String(start.year)
  const monthsUpper = copy.months.map(m => m.toUpperCase())

  const dates = formatRange(session, copy.templates.dates, copy.months, false)
  const dates_full = formatRange(session, copy.templates.dates_full, monthsUpper, true)
  const dates_short = formatRange(session, copy.templates.dates_short, copy.months_short ?? copy.months, true)

  return {
    name: `${season.name_line1} ${season.name_line2}`.trim(),
    name_line1: season.name_line1,
    name_line2: season.name_line2,
    season: season.season,
    season_label: fill(copy.templates.season_label, { season: season.season, period: season.period, year }),
    label: fill(copy.templates.label, { month: monthsUpper[start.month] ?? '', year }),
    month_abbr: copy.months_abbr?.[start.month] ?? '',
    dates,
    dates_full,
    dates_short,
    short_label: fill(copy.templates.short_label, { season: season.season, dates_short }),
    spots_label: copy.spots_label,
    intensity: season.intensity,
    duration: copy.duration,
    destination: copy.destination,
  }
}

/**
 * Hydrate une session avec sa copie traduite.
 * `t` doit etre porte sur le namespace `data.sessions` :
 *   const t = await getTranslations('data.sessions')
 */
export function hydrateSession(session: Session, t: TFn): SessionView {
  return { ...session, ...buildSessionDisplay(session, readSessionCopy(t)) }
}

export function hydrateSessions(sessions: Session[], t: TFn): SessionView[] {
  // Le dictionnaire n'est lu qu'une fois pour toute la liste.
  const copy = readSessionCopy(t)
  return sessions.map(s => ({ ...s, ...buildSessionDisplay(s, copy) }))
}

/**
 * Enumeration des sessions ouvertes en une phrase, pour la prose (FAQ...).
 * Ex. « Automne 2026 : 17 Octobre - 7 Novembre. Hiver 2027 : 13 Février - 6 Mars. »
 * Evite d'ecrire les dates a la main dans des reponses qui perimeraient.
 */
export function sessionListSentence(sessions: Session[], t: TFn): string {
  const copy = readSessionCopy(t)
  const template = copy.templates?.list_item ?? '{season} {year} : {dates}'
  return sessions
    .map(s => {
      const view = buildSessionDisplay(s, copy)
      return fill(template, { season: view.season, year: s.startDate.slice(0, 4), dates: view.dates })
    })
    .join('. ')
}

/** Libelle d'option de formulaire, ex. « Été 2026 (17 Août - 5 Septembre) ». */
export function sessionFormLabel(session: Session, t: TFn): string {
  const copy = readSessionCopy(t)
  const view = buildSessionDisplay(session, copy)
  return fill(copy.templates?.form_label ?? '{season} {year} ({dates})', {
    season: view.season,
    year: session.startDate.slice(0, 4),
    dates: view.dates,
  })
}

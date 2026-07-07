/**
 * Session display hydration helpers.
 *
 * The structural session data lives in `src/data/sessions.ts` (numeric, IDs, dates).
 * The display copy lives in `messages/<locale>/data.sessions.json`.
 *
 * Use the helpers below to combine the two at render time, both server-side
 * (with `getTranslations`) and client-side (with `useTranslations`).
 */

import type { Session } from '@/data/sessions'

export interface SessionDisplay {
  name: string
  /** Localized season word only (e.g. "Summer"), derived from `season_names`. */
  season: string
  season_label: string
  label: string
  month_abbr: string
  dates: string
  dates_full: string
  spots_label: string
  intensity: string
  duration: string
  destination: string
}

/**
 * Loose-typed translator interface that matches both next-intl's server `t`
 * (returned by `getTranslations`) and client `t` (returned by `useTranslations`).
 * Both expose a callable `(key, values?)` plus `.raw(key)`.
 */
export type TFn = ((key: string, values?: Record<string, unknown>) => string) & {
  raw: (key: string) => unknown
}

/**
 * Hydrate a single session with its translated display copy.
 *
 * `t` must be scoped to the `data.sessions` namespace.
 *   const t = await getTranslations('data.sessions')
 *   const view = hydrateSession(session, t)
 */
/**
 * Maps the FR-canonical `season` (stored in `data/sessions.ts`) to the ASCII
 * slug used as a key in the `season_names` translation block. Lets us render a
 * localized season word ("Summer" / "Été") without duplicating it per session.
 */
const SEASON_SLUG: Record<Session['season'], string> = {
  'Été': 'ete',
  'Automne': 'automne',
  'Hiver': 'hiver',
  'Printemps': 'printemps',
}

export function hydrateSession(session: Session, t: TFn): Omit<Session, 'season'> & SessionDisplay {
  const seasonNames = t.raw('season_names') as Record<string, string> | undefined
  // Localized season word; falls back to the FR-canonical value if the block is missing.
  const season = seasonNames?.[SEASON_SLUG[session.season]] ?? session.season
  const raw = t.raw(session.id) as SessionDisplay | undefined
  if (!raw) {
    // Fallback: synthesize from the structural fields. Should never happen if
    // the namespace is loaded, but avoids a hard crash if a key is missing.
    const year = session.startDate.slice(0, 4)
    return {
      ...session,
      season,
      name: session.id.toUpperCase(),
      season_label: `${season} ${year}`,
      label: `${season.toUpperCase()} ${year}`,
      month_abbr: '',
      dates: '',
      dates_full: '',
      spots_label: '',
      intensity: '',
      duration: '',
      destination: 'Daghestan ou Tchétchénie',
    }
  }
  // `season` after the spread so the localized value wins over the FR-canonical one.
  return { ...session, ...raw, season }
}

export function hydrateSessions(sessions: Session[], t: TFn): (Omit<Session, 'season'> & SessionDisplay)[] {
  return sessions.map(s => hydrateSession(s, t))
}

/**
 * Builds the form-display label for a session, e.g. `Été 2026 (17 Août - 5 Septembre)`.
 * Uses the locale-aware `season` from translations + the `dates` field.
 */
export function sessionFormLabel(session: Session, t: TFn): string {
  const view = hydrateSession(session, t)
  const year = session.startDate.slice(0, 4)
  // ICU template defined in data.sessions.json — keeps locale flexibility.
  return t('form_label_template', {
    season: session.season,
    year,
    dates: view.dates,
  })
}

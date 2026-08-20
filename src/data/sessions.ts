/**
 * Sessions officielles : structure et roulement automatique.
 *
 * Le camp tourne sur QUATRE saisons par an, calees sur les vacances scolaires
 * francophones. Plutot que de lister les sessions a la main (et de devoir les
 * remplacer chaque annee), on decrit ici les quatre GABARITS de saison et on
 * calcule la fenetre glissante des prochaines sessions a l'execution.
 *
 * Consequence : des qu'une session demarre, elle sort d'elle-meme des
 * inscriptions et la meme saison de l'annee suivante apparait a la fin de la
 * liste. Aucune intervention, aucun redeploiement.
 *
 * La copie affichee (nom, libelle, dates ecrites, intensite) est derivee de
 * `messages/<locale>/data.sessions.json` par `lib/session-display.ts`. Elle est
 * decrite PAR SAISON, jamais par annee : rien a traduire au changement d'annee.
 *
 * Pour figer les dates exactes d'une session (quand Ruslan les a arretees, ou
 * quand les vacances scolaires tombent autrement que l'ancrage calcule),
 * ajouter une entree dans `SESSION_OVERRIDES` ci-dessous.
 */

export type SessionStatus = 'open' | 'limited' | 'closed'

export type CampDiscipline = 'lutte' | 'mma'

/** Cle ASCII de saison. Sert d'index vers la copie traduite. */
export type SeasonKey = 'hiver' | 'printemps' | 'ete' | 'automne'

export interface SessionCapacity {
  /** Places Lutte (Daghestan). Programme adultes + enfants en parallele. */
  lutte: number
  /** Places MMA (Tchetchenie). Niveau avance minimum requis. */
  mma: number
}

export interface Session {
  /** `<slug de saison>-<annee>`, ex. `aout-2027`. Stable et parsable. */
  id: string
  seasonKey: SeasonKey
  startDate: string
  endDate: string
  price: number
  priceCurrency: string
  /** Capacite separee par discipline. Total = lutte + mma. */
  maxCapacity: SessionCapacity
  status: SessionStatus
}

interface SeasonTemplate {
  key: SeasonKey
  /** Prefixe de l'id de session. Ne JAMAIS le changer : il est stocke en base. */
  slug: string
  /**
   * Ancrage de la date de debut : le `nth`-ieme `weekday` du mois `month`.
   * Cale sur le debut des vacances scolaires (samedi), sauf l'ete qui demarre
   * un lundi. Ces ancrages reproduisent exactement les dates 2026 / 2027
   * arretees avec Ruslan.
   */
  month: number
  /** 0 = dimanche ... 6 = samedi */
  weekday: number
  nth: number
  /** Duree de la fenetre de camp, en jours (le candidat y prend 1 a 3 semaines). */
  durationDays: number
}

/** Ordonnes par mois calendaire : l'annee de camp se lit de fevrier a octobre. */
const SEASON_TEMPLATES: readonly SeasonTemplate[] = [
  { key: 'hiver', slug: 'fevrier', month: 2, weekday: 6, nth: 2, durationDays: 21 },
  { key: 'printemps', slug: 'paques', month: 4, weekday: 6, nth: 1, durationDays: 21 },
  { key: 'ete', slug: 'aout', month: 8, weekday: 1, nth: 3, durationDays: 19 },
  { key: 'automne', slug: 'toussaint', month: 10, weekday: 6, nth: 3, durationDays: 21 },
]

/** Nombre de sessions affichees en permanence (une par saison). */
export const SESSION_WINDOW_SIZE = 4

/**
 * Marge avant le depart pendant laquelle la session reste ouverte.
 * 0 = la session disparait le jour ou le camp commence. MKR accepte les
 * dossiers tardifs (supplement -30j documente en CGV art. 6 bis), d'ou 0.
 */
export const REGISTRATION_CLOSES_DAYS_BEFORE_START = 0

const DEFAULT_PRICE_EUR = 2900
const DEFAULT_CAPACITY: SessionCapacity = { lutte: 15, mma: 15 }

/**
 * Reglages manuels par session. Tout est optionnel : ce qui n'est pas precise
 * est calcule depuis le gabarit de saison.
 *
 * Exemple : `'aout-2027': { startDate: '2027-08-14', endDate: '2027-09-04' }`
 * fige les vraies dates une fois le calendrier scolaire publie.
 */
export const SESSION_OVERRIDES: Record<string, Partial<Omit<Session, 'id' | 'seasonKey'>>> = {
  // Les quatre sessions 2026 / 2027 tombent exactement sur l'ancrage calcule.
  // Rien a figer pour l'instant.
}

/* ------------------------------------------------------------------ */
/* Calcul des dates                                                    */
/* ------------------------------------------------------------------ */

/** Tout est calcule en UTC : une date de camp est un jour calendaire, pas un instant. */
function nthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number): Date {
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1))
  const shift = (weekday - firstOfMonth.getUTCDay() + 7) % 7
  return new Date(Date.UTC(year, month - 1, 1 + shift + (nth - 1) * 7))
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return toIsoDate(d)
}

const TEMPLATE_BY_SLUG = new Map(SEASON_TEMPLATES.map(t => [t.slug, t]))
const TEMPLATE_BY_KEY = new Map(SEASON_TEMPLATES.map(t => [t.key, t]))

/** Construit la session d'une saison pour une annee donnee. */
export function buildSession(seasonKey: SeasonKey, year: number): Session {
  const tpl = TEMPLATE_BY_KEY.get(seasonKey)
  if (!tpl) throw new Error(`[sessions] saison inconnue: ${seasonKey}`)

  const id = `${tpl.slug}-${year}`
  const override = SESSION_OVERRIDES[id] ?? {}
  const startDate = override.startDate ?? toIsoDate(nthWeekdayOfMonth(year, tpl.month, tpl.weekday, tpl.nth))
  // La fin suit toujours le debut retenu, meme si seul le debut est force.
  const endDate = override.endDate ?? addDays(startDate, tpl.durationDays)

  return {
    id,
    seasonKey: tpl.key,
    startDate,
    endDate,
    price: override.price ?? DEFAULT_PRICE_EUR,
    priceCurrency: override.priceCurrency ?? 'EUR',
    maxCapacity: override.maxCapacity ?? DEFAULT_CAPACITY,
    status: override.status ?? 'open',
  }
}

const SESSION_ID_RE = /^([a-z]+)-(\d{4})$/

/**
 * Reconstruit une session depuis son id, y compris une session passee.
 * Indispensable cote admin : les dossiers en base referencent des sessions
 * qui sont sorties de la fenetre depuis longtemps.
 */
export function sessionFromId(id: string | null | undefined): Session | null {
  if (!id) return null
  const match = SESSION_ID_RE.exec(id)
  if (!match) return null
  const tpl = TEMPLATE_BY_SLUG.get(match[1])
  if (!tpl) return null
  const year = Number(match[2])
  if (!Number.isFinite(year) || year < 2000 || year > 2100) return null
  return buildSession(tpl.key, year)
}

/* ------------------------------------------------------------------ */
/* Fenetre glissante                                                   */
/* ------------------------------------------------------------------ */

let windowCache: { cutoff: string; sessions: Session[] } | null = null

/**
 * Les sessions ouvertes aux inscriptions : les `SESSION_WINDOW_SIZE`
 * prochaines, dans l'ordre chronologique.
 *
 * Memoise a la journee : un rendu serveur et l'hydratation cote client du meme
 * jour renvoient exactement la meme liste.
 */
export function getSessions(now: Date = new Date()): Session[] {
  const cutoff = addDays(toIsoDate(now), REGISTRATION_CLOSES_DAYS_BEFORE_START)
  if (windowCache && windowCache.cutoff === cutoff) return windowCache.sessions

  const firstYear = Number(cutoff.slice(0, 4))
  const candidates: Session[] = []
  // 4 annees de gabarits : largement de quoi remplir la fenetre meme en decembre.
  for (let year = firstYear; year <= firstYear + 3; year++) {
    for (const tpl of SEASON_TEMPLATES) candidates.push(buildSession(tpl.key, year))
  }

  const sessions = candidates
    .filter(s => s.startDate > cutoff)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, SESSION_WINDOW_SIZE)

  windowCache = { cutoff, sessions }
  return sessions
}

/** La session ouverte la plus proche. */
export function getNextSession(now: Date = new Date()): Session {
  return getSessions(now)[0]
}

/**
 * Sessions pas encore terminees : la fenetre d'inscription PLUS le camp
 * eventuellement en cours (deja parti, donc ferme aux inscriptions, mais encore
 * a suivre cote admin).
 */
export function getUnfinishedSessions(now: Date = new Date()): Session[] {
  const today = toIsoDate(now)
  const firstYear = Number(today.slice(0, 4))
  const out: Session[] = []
  for (let year = firstYear - 1; year <= firstYear + 3; year++) {
    for (const tpl of SEASON_TEMPLATES) {
      const session = buildSession(tpl.key, year)
      if (session.endDate >= today) out.push(session)
    }
  }
  return out
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, SESSION_WINDOW_SIZE + 1)
}

/** Vrai si la session est encore ouverte aux inscriptions. */
export function isSessionOpen(id: string, now: Date = new Date()): boolean {
  return getSessions(now).some(s => s.id === id)
}

/**
 * Plage d'annees couverte par la fenetre, ex. `2026 / 2027`.
 * Utilise par les libelles de section qui annoncaient une annee en dur.
 */
export function sessionYearRange(sessions: Session[] = getSessions()): string {
  const years = [...new Set(sessions.map(s => s.startDate.slice(0, 4)))]
  return years.length > 1 ? `${years[0]} / ${years[years.length - 1]}` : years[0] ?? ''
}

/** Annee derivee de la date de debut, utilisee par les libelles de formulaire. */
export function sessionYear(session: Session): string {
  return session.startDate.slice(0, 4)
}

/** Formateur numerique independant de la locale. Utilise par l'API / l'admin. */
export function formatPrice(session: Session): string {
  const symbol = session.priceCurrency === 'EUR' ? '€' : session.priceCurrency
  return `${session.price.toLocaleString('fr-FR')} ${symbol}`
}

// Formats du back office. Toujours en Europe/Zurich (le digest et Ruslan sont sur
// ce fuseau). Les dates seules (YYYY-MM-DD) sont lues a midi UTC pour ne jamais
// changer de jour a l'affichage.
export const TZ = 'Europe/Zurich'

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/
const toDate = (v: string | Date): Date => (v instanceof Date ? v : DATE_ONLY.test(v) ? new Date(`${v}T12:00:00Z`) : new Date(v))

const fmtKey = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' })
const fmtDayMonth = new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, day: 'numeric', month: 'short' })
const fmtDayLong = new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' })
const fmtNumeric = new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric' })
const fmtTime = new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })
const eur0 = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const eur2 = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** Jour calendaire a Zurich (YYYY-MM-DD). Une date seule est renvoyee telle quelle. */
export function zurichDay(v: Date | string): string {
  if (typeof v === 'string' && DATE_ONLY.test(v)) return v
  return fmtKey.format(toDate(v))
}

/** Nombre de jours calendaires de a vers b (b - a), dates YYYY-MM-DD. */
export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000)
}

export function formatEuros(cents: number): string {
  return cents % 100 === 0 ? eur0.format(cents / 100) : eur2.format(cents / 100)
}
export const formatDayMonth = (v: string): string => fmtDayMonth.format(toDate(v))
export const formatDayLong = (v: string): string => fmtDayLong.format(toDate(v))
export const formatNumericDate = (v: string): string => fmtNumeric.format(toDate(v))
export const formatTime = (v: string): string => fmtTime.format(toDate(v))
export const formatDateTime = (v: string): string => `${formatNumericDate(v)} a ${formatTime(v)}`

export function plural(n: number, one: string, many: string): string {
  return `${n} ${n > 1 ? many : one}`
}

export function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

/** « aujourd'hui », « demain », « hier », « dans 5 j », « il y a 3 j ». */
export function relativeDay(v: string, now: Date): string {
  const diff = daysBetween(zurichDay(now), zurichDay(v))
  if (diff === 0) return "aujourd'hui"
  if (diff === 1) return 'demain'
  if (diff === -1) return 'hier'
  return diff > 0 ? `dans ${diff} j` : `il y a ${-diff} j`
}

/** « aujourd'hui a 14:15 », « demain a 09:00 », « vendredi 9 octobre a 10:00 ». */
export function formatVisioMoment(iso: string, now: Date): string {
  const diff = daysBetween(zurichDay(now), zurichDay(iso))
  const time = formatTime(iso)
  if (diff === 0) return `aujourd'hui a ${time}`
  if (diff === 1) return `demain a ${time}`
  if (diff === -1) return `hier a ${time}`
  return `${formatDayLong(iso)} a ${time}`
}

/** Version courte pour une ligne : « aujourd'hui 14:15 », « demain 09:00 », « 9 oct. 10:00 ». */
export function formatVisioShort(iso: string, now: Date): string {
  const diff = daysBetween(zurichDay(now), zurichDay(iso))
  const time = formatTime(iso)
  if (diff === 0) return `aujourd'hui ${time}`
  if (diff === 1) return `demain ${time}`
  if (diff === -1) return `hier ${time}`
  return `${formatDayMonth(iso)} ${time}`
}

/** Anciennete : « a l'instant », « il y a 12 min », « il y a 3 h », « hier », « il y a 4 j », puis la date. */
export function formatAgo(iso: string, now: Date): string {
  const min = Math.floor((now.getTime() - Date.parse(iso)) / 60_000)
  if (min < 1) return "a l'instant"
  if (min < 60) return `il y a ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `il y a ${h} h`
  const d = daysBetween(zurichDay(iso), zurichDay(now))
  if (d <= 1) return 'hier'
  if (d < 30) return `il y a ${d} j`
  return `le ${formatNumericDate(iso)}`
}

export function ageOn(birth: string, now: Date): number | null {
  if (!DATE_ONLY.test(birth)) return null
  const today = zurichDay(now)
  let age = Number(today.slice(0, 4)) - Number(birth.slice(0, 4))
  if (today.slice(5) < birth.slice(5)) age -= 1
  return age
}

// Telephone du tunnel d'inscription : le candidat choisit un indicatif puis
// tape son numero national, et la base ne recoit qu'un E.164 (+33652042318).
// Avant ca, 4 numeros sur 10 arrivaient sans indicatif (0652042318, 07835255427,
// 2015545214…) et le bouton WhatsApp de l'admin pointait dans le vide.
// Metadonnees « min » de libphonenumber : validation par pays, ~30 Ko gz,
// importees seulement par la route inscription.
import {
  parsePhoneNumberFromString,
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from 'libphonenumber-js/min'

export type PhoneCountry = { iso: CountryCode; code: string; name: string; flag: string }

const ISO_SET = new Set<string>(getCountries())

export function isPhoneCountry(value: string): value is CountryCode {
  return ISO_SET.has(value)
}

/**
 * Numero national (avec ou sans 0 de tete, espaces, 00…) + pays du select
 * -> E.164, ou null si le numero n'est pas valide pour ce pays. Un numero
 * deja tape avec son « + » garde son propre indicatif, meme si le select
 * dit autre chose : le candidat sait mieux que nous.
 */
export function toE164(national: string, country: string): string | null {
  const raw = national.trim()
  if (!raw) return null
  const parsed = isPhoneCountry(country)
    ? parsePhoneNumberFromString(raw, country)
    : parsePhoneNumberFromString(raw)
  if (!parsed || !parsed.isValid()) return null
  return parsed.number
}

/** +33652042318 -> +33 6 52 04 23 18 (recap, emails, admin). */
export function formatIntl(e164: string): string {
  if (!e164.startsWith('+')) return e164
  const parsed = parsePhoneNumberFromString(e164)
  return parsed ? parsed.formatInternational() : e164
}

/** Inverse de toE164, pour re-remplir le select et le champ. */
export function splitE164(value: string): { country: CountryCode | ''; national: string } {
  const parsed = value.startsWith('+') ? parsePhoneNumberFromString(value) : undefined
  if (!parsed?.country) return { country: '', national: value }
  return { country: parsed.country, national: parsed.formatNational().replace(/^0/, '') }
}

/**
 * Drapeau du pays en indicateurs regionaux Unicode (FR -> U+1F1EB U+1F1F7).
 * C'est le seul « drapeau » qu'une <option> native accepte : macOS, iOS et
 * Android le dessinent ; Windows le rend en deux lettres, lisible quand meme.
 */
export function flagOf(iso: string): string {
  return iso.toUpperCase().replace(/[A-Z]/g, c => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
}

/**
 * Liste des indicatifs, nommee dans la langue du visiteur par Intl.DisplayNames
 * (rien a traduire ni a maintenir), triee par nom. Les territoires sans nom
 * ICU (Ascension, Tristan da Cunha) sont laisses de cote.
 */
export function phoneCountries(locale: string): PhoneCountry[] {
  const names = new Intl.DisplayNames([locale], { type: 'region', fallback: 'none' })
  const out: PhoneCountry[] = []
  for (const iso of getCountries()) {
    let name: string | undefined
    try { name = names.of(iso) } catch { name = undefined }
    if (!name || name === iso) continue
    out.push({ iso, code: getCountryCallingCode(iso), name, flag: flagOf(iso) })
  }
  return out.sort((a, b) => a.name.localeCompare(b.name, locale))
}

/** Pays pre-selectionne depuis la region des langues du navigateur (fr-FR -> FR). */
export function guessCountry(languages: readonly string[]): CountryCode | '' {
  for (const lang of languages) {
    const region = lang.split(/[-_]/)[1]?.toUpperCase()
    if (region && isPhoneCountry(region)) return region
  }
  return ''
}

// Attribution / acquisition tracking.
//
// Objectif : savoir si un candidat vient de Google Ads (ou d'une autre source
// marketing) au moment de l'inscription, et l'afficher sur le dossier dans le
// back office. Meme logique de capture que le systeme d'affiliation (cookie
// first-party lisible JS), mais ici on NE strippe PAS l'URL : gtag.js a besoin
// de lire le `gclid` dans l'URL pour ses propres conversions/Enhanced Conversions.
//
// Ce module est partage client (composant de capture + formulaire) et serveur
// (route /api/inscription qui re-classe et sanitize avant de persister).

export const ATTR_COOKIE_NAME = 'mkr_attr'
// 90 jours, aligne sur la fenetre d'attribution Google Ads et sur le cookie mkr_ref.
export const ATTR_COOKIE_MAX_AGE = 60 * 60 * 24 * 90

export type AttributionSource =
  | 'google_ads'
  | 'google_organic'
  | 'meta_ads'
  | 'instagram'
  | 'facebook'
  | 'referral'
  | 'direct'
  | 'other'

// Libelles FR pour le back office.
export const ATTRIBUTION_SOURCE_LABEL: Record<AttributionSource, string> = {
  google_ads: 'Google Ads',
  google_organic: 'Google (organique)',
  meta_ads: 'Meta Ads',
  instagram: 'Instagram',
  facebook: 'Facebook',
  referral: 'Site referent',
  direct: 'Direct',
  other: 'Autre',
}

// Couleurs de badge (Google Ads en bleu Google, paid social violet, organique neutre).
export const ATTRIBUTION_SOURCE_COLOR: Record<AttributionSource, string> = {
  google_ads: '#4285F4',
  google_organic: '#94a3b8',
  meta_ads: '#a78bfa',
  instagram: '#ec4899',
  facebook: '#3b82f6',
  referral: '#22d3ee',
  direct: 'var(--adm-text-muted)',
  other: 'var(--adm-text-secondary)',
}

// Champs d'attribution capturees depuis l'URL (query string).
// Click ids : signaux forts (paid). utm_* : taggage campagne.
export const CLICK_ID_KEYS = ['gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid', 'ttclid'] as const
export const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const
export const EXTRA_KEYS = ['gad_source', 'gclsrc'] as const

const ALL_PARAM_KEYS = [...CLICK_ID_KEYS, ...UTM_KEYS, ...EXTRA_KEYS] as const
type ParamKey = (typeof ALL_PARAM_KEYS)[number]

// Caps de taille (defense en profondeur cote serveur, valeurs volontairement genereuses).
const MAX_PARAM_LEN = 400
const MAX_REFERRER_LEN = 500
const MAX_LANDING_LEN = 300

export interface AttributionData {
  // Champs de tracking bruts (uniquement ceux presents).
  gclid?: string
  gbraid?: string
  wbraid?: string
  fbclid?: string
  msclkid?: string
  ttclid?: string
  gad_source?: string
  gclsrc?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  // Contexte.
  referrer?: string
  landing?: string
  ts?: string
}

function truncate(value: string, max: number): string {
  return value.length > max ? value.slice(0, max) : value
}

// Extrait les paires d'attribution d'une query string (URLSearchParams accepte
// le "?..." complet). Retourne uniquement les cles presentes et non vides.
export function extractParams(search: string): Partial<Record<ParamKey, string>> {
  const out: Partial<Record<ParamKey, string>> = {}
  let sp: URLSearchParams
  try {
    sp = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  } catch {
    return out
  }
  for (const key of ALL_PARAM_KEYS) {
    const raw = sp.get(key)
    if (raw && raw.trim().length > 0) {
      out[key] = truncate(raw.trim(), MAX_PARAM_LEN)
    }
  }
  return out
}

function hostOf(url: string | undefined): string {
  if (!url) return ''
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    return ''
  }
}

const PAID_MEDIUMS = new Set(['cpc', 'ppc', 'paid', 'paidsearch', 'paid-search', 'sem', 'ppc-ads', 'cpm', 'display', 'paid_social', 'paidsocial'])

// Classifie une capture d'attribution en source unique. Google Ads est le signal
// prioritaire (demande David) : tout gclid/gbraid/wbraid/gad_source => google_ads.
export function classifyAttribution(d: AttributionData): AttributionSource {
  const utmSource = (d.utm_source ?? '').toLowerCase()
  const utmMedium = (d.utm_medium ?? '').toLowerCase()
  const refHost = hostOf(d.referrer)

  // 1) Google Ads : click id Google, gad_source, ou utm google + medium payant.
  if (d.gclid || d.gbraid || d.wbraid || d.gad_source || d.gclsrc) return 'google_ads'
  if (utmSource === 'google' && (PAID_MEDIUMS.has(utmMedium) || utmMedium === 'cpc')) return 'google_ads'

  // 2) Meta Ads : fbclid, ou utm meta/facebook/instagram + medium payant.
  if (d.fbclid) return 'meta_ads'
  if (
    (utmSource === 'facebook' || utmSource === 'meta' || utmSource === 'instagram' || utmSource === 'ig' || utmSource === 'fb') &&
    PAID_MEDIUMS.has(utmMedium)
  ) {
    return 'meta_ads'
  }

  // 3) Sources organiques identifiees via utm_source ou referrer.
  if (utmSource === 'instagram' || utmSource === 'ig' || refHost.includes('instagram.')) return 'instagram'
  if (utmSource === 'facebook' || utmSource === 'fb' || refHost.includes('facebook.') || refHost.includes('fb.')) return 'facebook'
  if (utmSource === 'google' || refHost.includes('google.')) return 'google_organic'

  // 4) UTM present mais non classe, ou autre moteur/referent.
  if (utmSource || utmMedium || d.utm_campaign) return 'other'
  if (refHost && !refHost.includes('mkrcamp.com')) return 'referral'

  return 'direct'
}

// Priorite d'une source pour l'arbitrage last-touch : un contact payant ne doit
// pas etre ecrase par une visite organique/directe ulterieure (on veut savoir si
// un jour un clic Ad a amene ce lead).
export function sourcePriority(source: AttributionSource): number {
  switch (source) {
    case 'google_ads':
    case 'meta_ads':
      return 3
    case 'instagram':
    case 'facebook':
    case 'google_organic':
    case 'referral':
      return 2
    case 'other':
      return 1
    case 'direct':
    default:
      return 0
  }
}

// True si la capture porte un signal marketing exploitable (sinon on ne pose pas
// de cookie : une visite directe ne doit pas ecraser une attribution existante).
export function hasSignal(d: AttributionData): boolean {
  return (
    !!(d.gclid || d.gbraid || d.wbraid || d.fbclid || d.msclkid || d.ttclid || d.gad_source || d.gclsrc) ||
    !!(d.utm_source || d.utm_medium || d.utm_campaign || d.utm_term || d.utm_content)
  )
}

// Construit une AttributionData depuis l'URL courante (client). Retourne null si
// aucun signal marketing (query vide) : on ne trace pas les visites directes.
export function buildAttributionFromLocation(
  search: string,
  referrer: string,
  landingPath: string,
  isoTimestamp: string,
): AttributionData | null {
  const params = extractParams(search)
  const data: AttributionData = { ...params }
  if (!hasSignal(data)) return null
  const refHost = hostOf(referrer)
  // On ne garde le referrer que s'il est externe (utile pour distinguer organique/social).
  if (referrer && !refHost.includes('mkrcamp.com')) {
    data.referrer = truncate(referrer, MAX_REFERRER_LEN)
  }
  if (landingPath) data.landing = truncate(landingPath, MAX_LANDING_LEN)
  data.ts = isoTimestamp
  return data
}

// Sanitize + reclassification serveur d'une AttributionData recue du client.
// On ne fait JAMAIS confiance a une source envoyee par le client : on la
// recalcule. Retourne null si payload absent/vide/hors-format.
export function sanitizeAttribution(
  raw: unknown,
): { source: AttributionSource; attribution: AttributionData } | null {
  if (!raw || typeof raw !== 'object') return null
  const input = raw as Record<string, unknown>
  const clean: AttributionData = {}

  for (const key of [...CLICK_ID_KEYS, ...UTM_KEYS, ...EXTRA_KEYS] as string[]) {
    const v = input[key]
    if (typeof v === 'string' && v.trim().length > 0) {
      ;(clean as Record<string, string>)[key] = truncate(v.trim(), MAX_PARAM_LEN)
    }
  }
  if (typeof input.referrer === 'string' && input.referrer.trim()) {
    clean.referrer = truncate(input.referrer.trim(), MAX_REFERRER_LEN)
  }
  if (typeof input.landing === 'string' && input.landing.trim()) {
    clean.landing = truncate(input.landing.trim(), MAX_LANDING_LEN)
  }
  if (typeof input.ts === 'string' && input.ts.trim()) {
    clean.ts = truncate(input.ts.trim(), 40)
  }

  if (!hasSignal(clean) && !clean.referrer) return null
  return { source: classifyAttribution(clean), attribution: clean }
}

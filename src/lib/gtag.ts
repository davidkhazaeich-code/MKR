// Google Ads / gtag.js — helper centralise (MKR Caucasian Camp).
//
// La balise de base (gtag.js + config) est injectee une seule fois dans
// src/app/[locale]/layout.tsx (donc sur toutes les pages publiques FR + EN,
// pages /inscription incluses, mais PAS sur /admin qui a son propre layout).
//
// Ce module sert a declencher les conversions depuis les composants client
// (formulaires). Il est safe cote serveur et avant chargement de gtag.js :
// chaque appel est un no-op tant que window/gtag/dataLayer ne sont pas prets.

export const GADS_ID = 'AW-18296696470'

// Les actions de conversion qu'on suit. `inscription` est la conversion
// principale demandee par David (validation du formulaire de candidature).
export type ConversionAction = 'inscription' | 'contact' | 'guide' | 'visio'

// Labels de conversion Google Ads.
// Ou les trouver : Google Ads > Objectifs > Conversions > (ouvrir l'action) >
// "Configurer avec la balise Google" : dans le snippet `send_to: 'AW-18296696470/XXXX'`,
// le label est la partie apres le "/".
// Tant qu'un label reste vide, SEUL l'evenement GA nomme est envoye — ce qui
// suffit pour creer une "conversion a partir d'un evenement de balise" cote
// Google Ads (Nouvelle conversion > Depuis la balise Google > choisir l'evenement).
// Renseignables aussi via variables d'env NEXT_PUBLIC_GADS_LABEL_* (override).
const LABELS: Record<ConversionAction, string> = {
  inscription: process.env.NEXT_PUBLIC_GADS_LABEL_INSCRIPTION ?? 'biNBCOm8kMscEJbdxZRE',
  contact: process.env.NEXT_PUBLIC_GADS_LABEL_CONTACT ?? 'xvjLCLTLqMscEJbdxZRE',
  guide: process.env.NEXT_PUBLIC_GADS_LABEL_GUIDE ?? '1DwACO-8kMscEJbdxZRE',
  visio: process.env.NEXT_PUBLIC_GADS_LABEL_VISIO ?? 'nQxHCOy8kMscEJbdxZRE',
}

// Nom d'evenement GA4 refletant chaque action. Envoye systematiquement pour
// permettre une conversion basee sur evenement meme sans label configure.
const EVENT_NAME: Record<ConversionAction, string> = {
  inscription: 'generate_lead',
  contact: 'contact',
  guide: 'guide_download',
  visio: 'schedule_call',
}

type GtagParams = Record<string, unknown>

// ── Enhanced conversions (suivi avance) ──────────────────────────────────
// Actif au niveau du compte Google Ads 265-827-7574 (methode "balise Google",
// conditions d'utilisation des donnees client acceptees, verifie le 06/07/2026).
// On passe les donnees fournies par l'utilisateur NON hachees via
// gtag('set', 'user_data', ...) juste avant l'evenement de conversion :
// gtag.js normalise et hache (SHA-256) cote navigateur avant tout envoi.
// Consent Mode v2 : la balise n'envoie user_data QUE si ad_user_data est
// 'granted' (bandeau cookies accepte) — aucun garde-fou supplementaire ici.
// Doc : https://support.google.com/google-ads/answer/13258081

export interface ConversionUserData {
  email?: string
  // Numero brut du formulaire : envoye uniquement s'il est convertible en
  // E.164 (+41791234567). Un numero sans indicatif pays est inexploitable
  // pour le matching, on prefere ne rien envoyer.
  phone?: string
  firstName?: string
  lastName?: string
}

// Convertit une saisie libre en E.164, sinon null.
function toE164(raw: string | undefined): string | null {
  if (!raw) return null
  let v = raw.trim().replace(/[\s.\-()/]/g, '')
  if (v.startsWith('00')) v = '+' + v.slice(2)
  return /^\+[1-9]\d{7,14}$/.test(v) ? v : null
}

// Construit l'objet user_data au format attendu par la balise Google.
// Retourne null si aucune donnee exploitable (on ne set rien dans ce cas).
function buildUserData(u: ConversionUserData): Record<string, unknown> | null {
  const out: Record<string, unknown> = {}
  const email = u.email?.trim().toLowerCase()
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) out.email = email
  const phone = toE164(u.phone)
  if (phone) out.phone_number = phone
  const first = u.firstName?.trim()
  const last = u.lastName?.trim()
  // Prenom/nom seuls ne suffisent pas comme cle de matching (il faudrait
  // code postal + pays), mais ils affinent le matching combines a l'email.
  if (first && last) out.address = { first_name: first, last_name: last }
  return Object.keys(out).length > 0 ? out : null
}

interface GtagWindow {
  gtag?: (...args: unknown[]) => void
  dataLayer?: unknown[]
}

function gtag(...args: unknown[]): void {
  if (typeof window === 'undefined') return
  const w = window as unknown as GtagWindow
  if (typeof w.gtag === 'function') {
    w.gtag(...args)
  } else if (Array.isArray(w.dataLayer)) {
    // gtag.js pas encore charge : on empile quand meme dans la dataLayer.
    w.dataLayer.push(args)
  }
}

/** Evenement generique nomme (toujours envoye si gtag/dataLayer dispo). */
export function trackEvent(name: string, params: GtagParams = {}): void {
  gtag('event', name, params)
}

/**
 * Enregistre une conversion.
 * Envoie systematiquement l'evenement GA nomme (pour les conversions basees
 * sur evenement) ET, si un label Google Ads est configure pour l'action, la
 * conversion classique `send_to: 'AW-18296696470/<label>'`.
 *
 * `userData` (optionnel) alimente le suivi avance des conversions (enhanced
 * conversions) : gtag('set','user_data') DOIT preceder l'evenement de
 * conversion pour que la balise y attache les donnees hachees.
 */
export function trackConversion(
  action: ConversionAction,
  params: GtagParams = {},
  userData?: ConversionUserData,
): void {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  )
  if (userData) {
    const ud = buildUserData(userData)
    if (ud) gtag('set', 'user_data', ud)
  }
  trackEvent(EVENT_NAME[action], clean)
  const label = LABELS[action]
  if (label) {
    gtag('event', 'conversion', { send_to: `${GADS_ID}/${label}`, ...clean })
  }
}

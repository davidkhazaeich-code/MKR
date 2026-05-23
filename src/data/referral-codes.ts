// src/data/referral-codes.ts
//
// Codes de recommandation MKR - partenariats salles / influenceurs / coachs.
// Ajout d'un partenaire : éditer ce fichier + commit + push + Vercel redeploy.
// Pour désactiver sans perdre l'historique : passer active à false.

export type ReferralPartnerType = 'gym' | 'influencer' | 'coach' | 'other'

export type ReferralCode = {
  /** Code en uppercase. Matché après trim().toUpperCase() côté API et form. */
  code: string
  /** Nom complet du partenaire affiché en admin (snapshot stocké à l'inscription). */
  partnerName: string
  /** Contact interne (email, URL Insta, tel). Jamais affiché côté public. */
  partnerContact?: string
  type: ReferralPartnerType
  /** Bonus en euros versé au partenaire quand la candidature passe en status `soldee`. */
  bonusEur: number
  /** Si false, le code n'est plus accepté en nouvelle inscription mais reste traçable pour l'historique. */
  active: boolean
  /** Notes internes (contexte partenariat, date de signature, etc.). */
  notes?: string
}

export const REFERRAL_CODES: ReferralCode[] = [
  {
    code: 'STRIKE',
    partnerName: 'Strike Academy (Progress Gym SA)',
    type: 'gym',
    bonusEur: 50,
    active: true,
    notes: 'Kevin Leone - partenariat 2026',
  },
  {
    code: 'ZEZE74',
    partnerName: 'Zelimkhan (@zelimkhan_74)',
    partnerContact: 'https://instagram.com/zelimkhan_74',
    type: 'influencer',
    bonusEur: 50,
    active: true,
    notes: 'Lutteur champion - Tchélyabinsk (oblast 74)',
  },
  {
    code: 'RAKHIM86',
    partnerName: 'Rakhim (@rakhim.mgd)',
    partnerContact: 'https://instagram.com/rakhim.mgd',
    type: 'influencer',
    bonusEur: 50,
    active: true,
    notes: 'Lutteur champion - Khanty-Mansi (oblast 86)',
  },
]

/**
 * Cherche un code actif dans REFERRAL_CODES.
 * Normalise l'input via trim().toUpperCase() avant comparaison.
 * Retourne null si vide ou non reconnu.
 */
export function findReferralCode(input: string): ReferralCode | null {
  const normalized = input.trim().toUpperCase()
  if (!normalized) return null
  return REFERRAL_CODES.find((c) => c.code === normalized && c.active) ?? null
}

/**
 * Liste des codes actifs (utilisée pour le filtre dropdown admin).
 */
export function getActiveCodes(): ReferralCode[] {
  return REFERRAL_CODES.filter((c) => c.active)
}

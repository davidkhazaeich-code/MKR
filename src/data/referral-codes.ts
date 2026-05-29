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
  /** Libellé affiché dans le dropdown "Comment as-tu connu le camp ?" du form.
   *  Si défini, sélectionner cette option auto-remplit le code. */
  sourceDecouverteLabel?: string
  /** Valeur slug-safe stockée dans form.sourceDecouverte. Doit être unique parmi les partenaires. */
  sourceDecouverteValue?: string
}

export const REFERRAL_CODES: ReferralCode[] = [
  {
    code: 'STRIKE',
    partnerName: 'Strike Academy (Progress Gym SA)',
    type: 'gym',
    bonusEur: 50,
    active: true,
    notes: 'Kevin Leone - partenariat 2026',
    sourceDecouverteLabel: 'Salle Strike Academy',
    sourceDecouverteValue: 'strike-academy',
  },
  {
    code: 'ZEZE74',
    partnerName: 'Zelimkhan (@zelimkhan_74)',
    partnerContact: 'https://instagram.com/zelimkhan_74',
    type: 'influencer',
    bonusEur: 50,
    active: true,
    notes: 'Lutteur champion - Tchélyabinsk (oblast 74)',
    sourceDecouverteLabel: '@zelimkhan_74 (Zelimkhan)',
    sourceDecouverteValue: 'zelimkhan-74',
  },
  {
    code: 'RAKHIM86',
    partnerName: 'Rakhim (@rakhim.mgd)',
    partnerContact: 'https://instagram.com/rakhim.mgd',
    type: 'influencer',
    bonusEur: 50,
    active: true,
    notes: 'Lutteur champion - Khanty-Mansi (oblast 86)',
    sourceDecouverteLabel: '@rakhim.mgd (Rakhim)',
    sourceDecouverteValue: 'rakhim-mgd',
  },
  {
    code: 'TENGIZ',
    partnerName: 'Tengiz Dalakishvili (@tengiz_dalakishvili)',
    partnerContact: 'https://instagram.com/tengiz_dalakishvili',
    type: 'coach',
    bonusEur: 50,
    active: true,
    notes: 'Coach de lutte - influenceur Instagram',
    sourceDecouverteLabel: 'Coach Tengiz Dalakishvili',
    sourceDecouverteValue: 'tengiz-dalakishvili',
  },
  {
    code: 'MMASPIRIT',
    partnerName: 'MMA Spirit Academy (@mma_spirit_academy)',
    partnerContact: 'https://instagram.com/mma_spirit_academy',
    type: 'influencer',
    bonusEur: 50,
    active: true,
    notes: 'Créateur de contenu vidéo sur le MMA - partenariat Instagram (saisi MMASpirit, normalisé en MMASPIRIT)',
    sourceDecouverteLabel: '@mma_spirit_academy (MMA Spirit Academy)',
    sourceDecouverteValue: 'mma-spirit-academy',
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

/**
 * Liste des partenaires actifs qui apparaissent comme option dans le dropdown
 * "Comment as-tu connu le camp ?" du form d'inscription.
 */
export function getPartnersWithSourceOption(): ReferralCode[] {
  return REFERRAL_CODES.filter(
    (c) => c.active && c.sourceDecouverteValue && c.sourceDecouverteLabel,
  )
}

/**
 * Trouve un code referral via la valeur de sourceDecouverte sélectionnée dans le form.
 * Utilisé pour auto-remplir le champ code de recommandation quand le candidat choisit
 * "Salle Strike Academy", "@zelimkhan_74", etc.
 */
export function findCodeBySourceValue(value: string): ReferralCode | null {
  if (!value) return null
  return REFERRAL_CODES.find(
    (c) => c.active && c.sourceDecouverteValue === value,
  ) ?? null
}

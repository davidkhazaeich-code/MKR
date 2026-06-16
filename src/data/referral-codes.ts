// src/data/referral-codes.ts
//
// Codes de recommandation MKR - partenariats salles / influenceurs / coachs.
// Ajout d'un partenaire : éditer ce fichier + commit + push + Vercel redeploy.
// Pour désactiver sans perdre l'historique : passer active à false.

export type ReferralPartnerType = 'gym' | 'influencer' | 'coach' | 'other'

export type CommissionType = 'flat' | 'percent'

export type ReferralCode = {
  /** Code en uppercase. Matché après trim().toUpperCase() côté API et form. */
  code: string
  /** Nom complet du partenaire affiché en admin (snapshot stocké à l'inscription). */
  partnerName: string
  /** Contact interne (email, URL Insta, tel). Jamais affiché côté public. */
  partnerContact?: string
  type: ReferralPartnerType
  /** Modèle de commission : 'flat' (forfait fixe bonusEur) ou 'percent' (% du CA encaissé). */
  commissionType: CommissionType
  /** Forfait en euros versé quand la candidature passe en `soldee`. Requis si commissionType==='flat'. */
  bonusEur?: number
  /** Taux en % du CA (ex: 10). Requis si commissionType==='percent'. */
  commissionPct?: number
  /** Si false, le code n'est plus accepté en nouvelle inscription mais reste traçable. */
  active: boolean
  notes?: string
  sourceDecouverteLabel?: string
  sourceDecouverteValue?: string
}

export const REFERRAL_CODES: ReferralCode[] = [
  {
    code: 'STRIKE',
    partnerName: 'Strike Academy (Progress Gym SA)',
    type: 'gym',
    commissionType: 'flat',
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
    commissionType: 'flat',
    bonusEur: 100,
    active: false,
    notes: 'Lutteur champion - Tchélyabinsk (oblast 74). Désactivé le 2026-06-16 (décision David : pas de code pour Zelim). Forfait 100 EUR conservé pour l\'historique éventuel.',
    sourceDecouverteLabel: '@zelimkhan_74 (Zelimkhan)',
    sourceDecouverteValue: 'zelimkhan-74',
  },
  {
    code: 'RAKHIM86',
    partnerName: 'Rakhim (@rakhim.mgd)',
    partnerContact: 'https://instagram.com/rakhim.mgd',
    type: 'influencer',
    commissionType: 'flat',
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
    commissionType: 'flat',
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
    commissionType: 'flat',
    bonusEur: 50,
    active: true,
    notes: 'Créateur de contenu vidéo sur le MMA - partenariat Instagram (saisi MMASpirit, normalisé en MMASPIRIT)',
    sourceDecouverteLabel: '@mma_spirit_academy (MMA Spirit Academy)',
    sourceDecouverteValue: 'mma-spirit-academy',
  },
  {
    code: 'PAOLOZ',
    partnerName: 'PaoloZ (@paolo_irl)',
    partnerContact: 'https://instagram.com/paolo_irl · WhatsApp +33 6 38 49 17 22',
    type: 'influencer',
    commissionType: 'percent',
    commissionPct: 11.5,
    active: true,
    notes: 'Influenceur - partenariat 2026, commission 11,5% du CA TTC encaissé',
    sourceDecouverteLabel: '@paolo_irl (PaoloZ)',
    sourceDecouverteValue: 'paolo-irl',
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

/**
 * Calcule le montant de commission en euros (arrondi à l'entier) pour un partenaire.
 * - flat    : retourne bonusEur (indépendant du CA).
 * - percent : retourne round(packageAmountCents * pct / 100 / 100) si le CA est connu,
 *             sinon null (le montant sera calculable une fois le CA saisi).
 * Retourne null si le modèle est incohérent (sécurité).
 */
export function computeCommissionEur(
  partner: Pick<ReferralCode, 'commissionType' | 'bonusEur' | 'commissionPct'>,
  packageAmountCents: number | null,
): number | null {
  if (partner.commissionType === 'flat') {
    return typeof partner.bonusEur === 'number' ? partner.bonusEur : null
  }
  if (partner.commissionType === 'percent') {
    if (typeof partner.commissionPct !== 'number') return null
    if (packageAmountCents === null || packageAmountCents <= 0) return null
    return Math.round((packageAmountCents * partner.commissionPct) / 100 / 100)
  }
  return null
}

/** Base URL publique du site (sans slash final). */
export const SITE_BASE_URL = 'https://mkrcamp.com'

/** Construit le lien d'affiliation partageable d'un partenaire : https://mkrcamp.com/?ref=paoloz */
export function affiliateLink(code: string, baseUrl: string = SITE_BASE_URL): string {
  return `${baseUrl}/?ref=${encodeURIComponent(code.toLowerCase())}`
}

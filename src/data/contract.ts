/**
 * Contrat de participation — source unique du contenu (FR + EN).
 *
 * Tout le contenu statique du contrat (parties, RIB, prestations par défaut,
 * modalités de paiement, grille d'annulation, clauses) vit ici, PAS dans
 * `messages/**` : l'admin est FR-only et le contrat est généré côté serveur
 * dans la langue choisie (`contract_locale`). La parité i18n-check reste intacte.
 *
 * Les prestations incluses / non incluses par défaut sont le miroir des CGV
 * art. 5 / art. 6 (messages/{fr,en}/cgv.json). Si les CGV changent, mettre à
 * jour les deux. Les valeurs réellement contractuelles sont celles éditées et
 * persistées sur la candidature (contract_inclusions / contract_exclusions).
 *
 * Utilisé par : lib/contract-pdf.tsx (PDF), lib/contract-service.ts (email),
 * components/admin/ContractCard.tsx (pré-remplissage).
 */

import { REFUND_TIERS } from '@/data/refund-policy'

export type ContractLocale = 'fr' | 'en'

/* ───────────────────────── Parties ───────────────────────── */

export const MKR_PARTY = {
  name: 'MKR Caucasian Camp',
  representative: 'Ruslan Mukhtarov',
  representativeRole: { fr: 'Fondateur', en: 'Founder' },
  country: { fr: "Pays d'immatriculation : France", en: 'Country of registration: France' },
  email: 'contact@mkrcamp.com',
  phone: '+33 6 66 17 76 91',
  website: 'mkrcamp.com',
} as const

/* ───────────────────────── RIB ─────────────────────────
 * Compte EUR Revolut de Ruslan (fourni par David le 2026-07-03, checksum
 * mod-97 vérifié). BIC banque correspondante (virements hors SEPA) : CHASDEFX
 * — volontairement pas affiché sur le contrat pour ne pas embrouiller les
 * candidats SEPA ; à communiquer au cas par cas si un candidat vire en USD.
 * `isRibConfigured()` reste le garde-fou serveur : l'envoi est refusé si un
 * placeholder (caractère X) réapparaît dans l'IBAN.
 */

export const CONTRACT_RIB = {
  holder: 'Ruslan Mukhtarov',
  iban: 'FR76 2823 3000 0191 6735 1775 075',
  bic: 'REVOFRP2',
  bank: 'Revolut Bank SA',
  bankAddress: '10 avenue Kléber, 75116 Paris, France',
} as const

export function isRibConfigured(): boolean {
  return !CONTRACT_RIB.iban.includes('X')
}

/* ─────────────── Numéro de contrat ───────────────
 * `contract_number` = séquence Postgres (contract_number_seq), attribuée au
 * premier enregistrement des champs contrat. Affichage : MKR-YYYY-XXXX.
 */

export function formatContractNumber(seq: number, year: number): string {
  return `MKR-${year}-${String(seq).padStart(4, '0')}`
}

/* ─────────────── Prestations par défaut (miroir CGV art. 5 / 6) ───────────────
 * 1 item par ligne — l'admin édite librement dans la carte Contrat.
 */

export const DEFAULT_INCLUSIONS: Record<ContractLocale, string> = {
  fr: [
    'Visa russe : frais consulaires, lettre d’invitation officielle, questionnaire UE et accompagnement complet du dossier',
    'Vol intérieur Istanbul-Makhachkala (camp Lutte au Daghestan) ou Istanbul-Grozny (camp MMA en Tchétchénie)',
    'Transferts aéroport-camp et déplacements pendant le séjour',
    'Hébergement en logement de camp',
    '2 repas par jour (petit-déjeuner et déjeuner)',
    'Sessions d’entraînement biquotidiennes (6 jours par semaine)',
    'Excursions culturelles (en option)',
    'Suivi préparatoire à distance avant le départ',
  ].join('\n'),
  en: [
    'Russian visa: consular fees, official invitation letter, EU questionnaire, and full file support',
    'Domestic flight Istanbul-Makhachkala (Wrestling camp in Dagestan) or Istanbul-Grozny (MMA camp in Chechnya)',
    'Airport-to-camp transfers and travel during the stay',
    'Accommodation in camp lodging',
    '2 meals per day (breakfast and lunch)',
    'Twice-daily training sessions (6 days per week)',
    'Cultural excursions (optional)',
    'Remote preparation support before departure',
  ].join('\n'),
}

export const DEFAULT_EXCLUSIONS: Record<ContractLocale, string> = {
  fr: [
    'Vol international aller-retour jusqu’à Istanbul (arrivée IST ou SAW au moins 4 h avant le vol intérieur MKR)',
    'Assurance voyage couvrant le rapatriement médical et la pratique de sports de contact (obligatoire)',
    'Équipement personnel (gants, protège-tibias, protège-dents, coquille)',
    'Dépenses personnelles sur place (boissons, achats, pourboires, communication mobile)',
    'Frais liés au passeport (renouvellement, etc.)',
  ].join('\n'),
  en: [
    'Round-trip international flight to Istanbul (arrival at IST or SAW at least 4 hours before the MKR domestic flight)',
    'Travel insurance covering medical repatriation and the practice of contact sports (mandatory)',
    'Personal equipment (gloves, shin guards, mouthguard, groin protector)',
    'Personal expenses on site (drinks, purchases, tips, mobile communication)',
    'Any fees related to the passport (renewal, etc.)',
  ].join('\n'),
}

/* ─────────────── Disciplines ─────────────── */

export type ContractDiscipline = 'lutte' | 'mma' | 'combo_quote'

export const CONTRACT_DISCIPLINE_LABEL: Record<ContractLocale, Record<ContractDiscipline, string>> = {
  fr: {
    lutte: 'Lutte libre — Daghestan (Makhachkala / Kaspiysk)',
    mma: 'MMA — Tchétchénie (Grozny, Akhmat)',
    combo_quote: 'Combo Lutte + MMA — Daghestan et Tchétchénie',
  },
  en: {
    lutte: 'Freestyle wrestling — Dagestan (Makhachkala / Kaspiysk)',
    mma: 'MMA — Chechnya (Grozny, Akhmat)',
    combo_quote: 'Wrestling + MMA combo — Dagestan and Chechnya',
  },
}

/* ─────────────── Grille d'annulation ───────────────
 * Structure = REFUND_TIERS (source unique des pourcentages, data/refund-policy.ts).
 * Les libellés y sont FR-only : on fournit ici les libellés localisés, mappés
 * PAR INDEX (même ordre). Miroir de CGV art. 4. Si un palier est ajouté dans
 * REFUND_TIERS, compléter les deux tableaux ci-dessous.
 */

const REFUND_DELAY_LABELS: Record<ContractLocale, string[]> = {
  fr: ['Plus de 60 jours avant le début', 'Entre 30 et 60 jours', 'Moins de 30 jours'],
  en: ['More than 60 days before the start', 'Between 30 and 60 days', 'Less than 30 days'],
}

const REFUND_VALUE_LABELS: Record<ContractLocale, string[]> = {
  fr: ['Remboursement intégral (100%)', 'Remboursement partiel (50%)', 'Aucun remboursement'],
  en: ['Full refund (100%)', 'Partial refund (50%)', 'No refund'],
}

export interface LocalizedRefundTier {
  delay: string
  refund: string
  tone: 'success' | 'warning' | 'danger'
}

export function getRefundTiers(locale: ContractLocale): LocalizedRefundTier[] {
  return REFUND_TIERS.map((tier, i) => ({
    delay: REFUND_DELAY_LABELS[locale][i] ?? tier.delay,
    refund: REFUND_VALUE_LABELS[locale][i] ?? tier.refund,
    tone: tier.tone,
  }))
}

export const REFUND_POSTPONE_NOTE: Record<ContractLocale, string> = {
  fr: 'Le report sur une session ultérieure est possible sous réserve de disponibilité, si la demande est faite plus de 60 jours avant le début du camp.',
  en: 'Postponement to a later session is possible subject to availability, if the request is made more than 60 days before the start of the camp.',
}

/* ─────────────── Modalités de paiement ─────────────── */

export const PAYMENT_METHODS_NOTE: Record<ContractLocale, string> = {
  fr: 'Moyens de paiement acceptés : virement bancaire ou espèces. Toute autre modalité est étudiée au cas par cas.',
  en: 'Accepted payment methods: bank transfer or cash. Any other method is reviewed on a case-by-case basis.',
}

export function paymentInstruction(locale: ContractLocale, contractNumber: string): string {
  return locale === 'fr'
    ? `Référence à indiquer impérativement lors du virement : « ${contractNumber} + nom du Participant ».`
    : `Reference to include with the transfer: "${contractNumber} + Participant's name".`
}

export function paymentDeadlineSentence(locale: ContractLocale, deadlineLong: string): string {
  return locale === 'fr'
    ? `Le montant total est dû au plus tard le ${deadlineLong}.`
    : `The full amount is due no later than ${deadlineLong}.`
}

/* ─────────────── Clauses ─────────────── */

export const ACCEPTANCE_CLAUSE: Record<ContractLocale, string> = {
  fr: 'Le règlement du montant indiqué au présent contrat vaut acceptation pleine et entière de ses termes ainsi que des Conditions Générales de Vente. Pour tout Participant mineur, le présent contrat est conclu avec son représentant légal, qui en accepte les termes en son nom.',
  en: 'Payment of the amount stated in this agreement constitutes full acceptance of its terms and of the General Terms and Conditions of Sale. For any minor Participant, this agreement is entered into with their legal guardian, who accepts its terms on their behalf.',
}

export const INSURANCE_CLAUSE: Record<ContractLocale, string> = {
  fr: 'Le Participant s’engage à souscrire, avant le départ, une assurance voyage couvrant le rapatriement médical et la pratique de sports de contact. Cette assurance est obligatoire et reste à sa charge.',
  en: 'The Participant undertakes to take out, before departure, travel insurance covering medical repatriation and the practice of contact sports. This insurance is mandatory and at the Participant’s expense.',
}

export function cgvReference(locale: ContractLocale): { text: string; url: string } {
  return locale === 'fr'
    ? {
        text: 'Le présent contrat est complété par les Conditions Générales de Vente de MKR Caucasian Camp, consultables à l’adresse ci-dessous. En cas de contradiction, le présent contrat prévaut sur les CGV.',
        url: 'https://mkrcamp.com/cgv',
      }
    : {
        text: 'This agreement is supplemented by the MKR Caucasian Camp General Terms and Conditions of Sale, available at the address below. In the event of any conflict, this agreement prevails over the Terms.',
        url: 'https://mkrcamp.com/en/terms',
      }
}

/* ─────────────── Formatage dates / montants ───────────────
 * Dates "date-only" (YYYY-MM-DD) : parsing + formatage forcés en UTC pour
 * éviter tout décalage de jour selon le fuseau du serveur.
 */

export function formatDateLong(isoDate: string, locale: ContractLocale): string {
  const d = new Date(`${isoDate}T00:00:00.000Z`)
  if (Number.isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function formatEurCents(cents: number, locale: ContractLocale): string {
  const eur = cents / 100
  const formatted =
    locale === 'fr'
      ? `${eur.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
      : `€${eur.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  // ICU fr-FR groupe les milliers avec une espace fine insécable (U+202F) que
  // Teko/Barlow n'ont pas en glyphe → rendu « 2/900,00 € » dans le PDF.
  // On normalise toutes les espaces Unicode en espace simple (safe partout).
  return formatted.replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, ' ')
}

export function weeksLabel(weeks: number, locale: ContractLocale): string {
  if (locale === 'fr') return weeks > 1 ? `${weeks} semaines` : `${weeks} semaine`
  return weeks > 1 ? `${weeks} weeks` : `${weeks} week`
}

/* ─────────────── Sanitisation PDF ───────────────
 * Teko / Barlow ne couvrent que le latin : on translittère le cyrillique
 * courant et on retire les glyphes hors couverture pour éviter les carrés
 * blancs dans un document contractuel. Les données restent intactes en DB.
 */

const CYRILLIC_MAP: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh',
  щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

export function sanitizeForPdf(input: string): string {
  // Espaces Unicode (NBSP, fine insécable… — fréquentes dans du texte collé
  // depuis Word/site) → espace simple : Teko/Barlow n'ont pas ces glyphes.
  const normalized = input.replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, ' ')
  let out = ''
  for (const ch of normalized) {
    const lower = ch.toLowerCase()
    if (CYRILLIC_MAP[lower] !== undefined) {
      const mapped = CYRILLIC_MAP[lower]
      out += ch === lower ? mapped : mapped.charAt(0).toUpperCase() + mapped.slice(1)
      continue
    }
    // Latin-1 + latin étendu (é, ç, ğ…) + ponctuation usuelle : on garde.
    out += /[ -ɏ‐-‧€‹›]/.test(ch) ? ch : '?'
  }
  return out
}

/* ─────────────── Libellés PDF (titres de sections) ─────────────── */

export const PDF_LABELS: Record<ContractLocale, Record<string, string>> = {
  fr: {
    docTitle: 'CONTRAT DE PARTICIPATION',
    contractNo: 'Contrat n°',
    issuedOn: 'Établi le',
    parties: 'ENTRE LES PARTIES',
    organizer: 'L’Organisateur',
    participant: 'Le Participant',
    representedBy: 'Représenté par',
    email: 'Email',
    phone: 'Téléphone',
    birthdate: 'Date de naissance',
    country: 'Pays',
    departureCity: 'Ville de départ',
    stay: 'LE SÉJOUR',
    discipline: 'Camp',
    dates: 'Dates',
    datesTo: 'au',
    duration: 'Durée',
    session: 'Session',
    groupSize: 'Composition',
    groupSizeValue: 'participants (détail en annexe de la candidature)',
    inclusions: 'PRESTATIONS INCLUSES',
    exclusions: 'PRESTATIONS NON INCLUSES',
    payment: 'MONTANT & PAIEMENT',
    totalAmount: 'Montant total du séjour',
    deadline: 'Échéance de paiement',
    bankDetails: 'Coordonnées bancaires',
    holder: 'Titulaire',
    cancellation: 'POLITIQUE D’ANNULATION',
    specialConditions: 'CONDITIONS PARTICULIÈRES',
    insurance: 'ASSURANCE',
    cgv: 'CONDITIONS GÉNÉRALES',
    acceptance: 'ACCEPTATION',
    signatures: 'SIGNATURES',
    signOrganizer: 'Pour l’Organisateur',
    signParticipant: 'Le Participant (« lu et approuvé »)',
    previewWatermark: 'APERÇU',
    ribMissing: 'RIB INCOMPLET — IBAN à renseigner dans src/data/contract.ts avant envoi',
    page: 'Page',
  },
  en: {
    docTitle: 'PARTICIPATION AGREEMENT',
    contractNo: 'Agreement no.',
    issuedOn: 'Issued on',
    parties: 'BETWEEN THE PARTIES',
    organizer: 'The Organizer',
    participant: 'The Participant',
    representedBy: 'Represented by',
    email: 'Email',
    phone: 'Phone',
    birthdate: 'Date of birth',
    country: 'Country',
    departureCity: 'Departure city',
    stay: 'THE STAY',
    discipline: 'Camp',
    dates: 'Dates',
    datesTo: 'to',
    duration: 'Duration',
    session: 'Session',
    groupSize: 'Group',
    groupSizeValue: 'participants (details in the application annex)',
    inclusions: 'SERVICES INCLUDED',
    exclusions: 'SERVICES NOT INCLUDED',
    payment: 'AMOUNT & PAYMENT',
    totalAmount: 'Total amount of the stay',
    deadline: 'Payment deadline',
    bankDetails: 'Bank details',
    holder: 'Account holder',
    cancellation: 'CANCELLATION POLICY',
    specialConditions: 'SPECIAL CONDITIONS',
    insurance: 'INSURANCE',
    cgv: 'GENERAL TERMS',
    acceptance: 'ACCEPTANCE',
    signatures: 'SIGNATURES',
    signOrganizer: 'For the Organizer',
    signParticipant: 'The Participant ("read and approved")',
    previewWatermark: 'PREVIEW',
    ribMissing: 'BANK DETAILS INCOMPLETE — set the IBAN in src/data/contract.ts before sending',
    page: 'Page',
  },
}

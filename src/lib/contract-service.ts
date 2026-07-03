/**
 * Service contrat — logique partagée entre les routes preview / send / file.
 *
 * - Chargement candidature + candidat (SELECT unique).
 * - Garde-fous : `getFieldBlockers` (bloquent aperçu ET envoi : le PDF ne peut
 *   pas se rendre sans ces champs) + `getSendBlockers` (bloquent l'envoi
 *   uniquement : statut, email, IBAN placeholder).
 * - Assemblage `ContractPdfData` depuis la row.
 * - Email candidat (FR tutoiement = ton du site / EN), PDF en pièce jointe.
 *
 * Les messages de blocage sont en FR : ils ne sont montrés qu'à l'admin.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import {
  formatContractNumber,
  formatDateLong,
  formatEurCents,
  isRibConfigured,
  weeksLabel,
  CONTRACT_DISCIPLINE_LABEL,
  CONTRACT_RIB,
  MKR_PARTY,
  paymentInstruction,
  type ContractDiscipline,
  type ContractLocale,
} from '@/data/contract'
import type { ContractPdfData } from '@/lib/contract-pdf'
import { escapeHtml, row as emailRow, wrapEmail } from '@/lib/email'

export interface ContractCandidateRow {
  prenom: string
  nom: string
  email: string
  telephone: string | null
  date_naissance: string | null
  pays: string | null
  ville_depart: string | null
}

export interface ContractCandidatureRow {
  id: string
  status: string
  tunnel_type: 'session' | 'custom' | 'famille' | 'groupe'
  camp_discipline: ContractDiscipline | null
  submission_language: 'fr' | 'en'
  package_amount_cents: number | null
  group_members: unknown
  form_data: Record<string, unknown> | null
  contract_start_date: string | null
  contract_end_date: string | null
  contract_duration_weeks: number | null
  contract_inclusions: string | null
  contract_exclusions: string | null
  contract_note: string | null
  contract_payment_deadline: string | null
  contract_locale: ContractLocale | null
  contract_number: number | null
  contract_sent_at: string | null
  contract_sent_count: number
  contract_pdf_path: string | null
  candidate: ContractCandidateRow | null
}

export const CONTRACT_SELECT = `
  id, status, tunnel_type, camp_discipline, submission_language,
  package_amount_cents, group_members, form_data,
  contract_start_date, contract_end_date, contract_duration_weeks,
  contract_inclusions, contract_exclusions, contract_note,
  contract_payment_deadline, contract_locale, contract_number,
  contract_sent_at, contract_sent_count, contract_pdf_path,
  candidate:candidates ( prenom, nom, email, telephone, date_naissance, pays, ville_depart )
`

export async function loadContractRow(
  supabase: SupabaseClient,
  id: string,
): Promise<ContractCandidatureRow | null> {
  const { data, error } = await supabase
    .from('candidatures')
    .select(CONTRACT_SELECT)
    .eq('id', id)
    .maybeSingle()
  if (error || !data) return null
  return data as unknown as ContractCandidatureRow
}

/** Statuts sur lesquels un contrat peut partir. */
export const CONTRACT_SENDABLE_STATUSES = ['validee', 'soldee'] as const

/* ───────────────────────── Garde-fous ───────────────────────── */

/** Bloquent l'aperçu ET l'envoi : sans ces champs le PDF n'a pas de sens. */
export function getFieldBlockers(row: ContractCandidatureRow): string[] {
  const blockers: string[] = []
  if (row.contract_number === null) {
    blockers.push('Enregistre d’abord les infos contrat (le n° de contrat est attribué à l’enregistrement).')
  }
  if (!row.contract_start_date || !row.contract_end_date) {
    blockers.push('Dates du séjour manquantes (début et fin).')
  } else if (row.contract_end_date < row.contract_start_date) {
    blockers.push('La date de fin précède la date de début.')
  }
  if (!row.contract_duration_weeks) {
    blockers.push('Durée du séjour manquante.')
  }
  if (!row.package_amount_cents || row.package_amount_cents <= 0) {
    blockers.push('Montant du séjour manquant (« sur devis ») — saisis-le dans la carte Contrat ou Paiement.')
  }
  if (!row.contract_payment_deadline) {
    blockers.push('Échéance de paiement manquante.')
  } else if (row.contract_start_date && row.contract_payment_deadline > row.contract_start_date) {
    blockers.push('L’échéance de paiement doit être au plus tard le jour du début du camp.')
  }
  return blockers
}

/** Bloquent uniquement l'envoi (l'aperçu reste possible, avec bandeau). */
export function getSendBlockers(row: ContractCandidatureRow): string[] {
  const blockers: string[] = []
  if (!CONTRACT_SENDABLE_STATUSES.includes(row.status as (typeof CONTRACT_SENDABLE_STATUSES)[number])) {
    blockers.push(`Statut du dossier : « ${row.status} » — le contrat s’envoie sur un dossier validé ou soldé.`)
  }
  if (!row.candidate?.email) {
    blockers.push('Email du candidat manquant.')
  }
  if (!isRibConfigured()) {
    blockers.push('IBAN non renseigné dans src/data/contract.ts — envoi bloqué.')
  }
  return blockers
}

/* ───────────────────────── Assemblage PDF ───────────────────────── */

export function effectiveLocale(row: ContractCandidatureRow): ContractLocale {
  return row.contract_locale ?? (row.submission_language === 'en' ? 'en' : 'fr')
}

/** Nombre de participants (famille / groupe), best-effort depuis les données du form. */
export function deriveGroupSize(row: ContractCandidatureRow): number | null {
  if (Array.isArray(row.group_members) && row.group_members.length > 0) {
    return row.group_members.length
  }
  const fd = row.form_data ?? {}
  const num = (v: unknown): number | null => {
    const n = typeof v === 'string' ? parseInt(v, 10) : typeof v === 'number' ? v : NaN
    return Number.isFinite(n) && n > 0 ? n : null
  }
  if (row.tunnel_type === 'famille') {
    const parents = num((fd as Record<string, unknown>).nombre_parents) ?? 1
    const enfants = num((fd as Record<string, unknown>).nombre_enfants) ?? 0
    return parents + enfants > 1 ? parents + enfants : null
  }
  if (row.tunnel_type === 'groupe') {
    return num((fd as Record<string, unknown>).nombre_participants)
  }
  return null
}

/**
 * Construit les données PDF. Pré-condition : `getFieldBlockers(row)` vide
 * (les `!` ci-dessous sont couverts par cette validation).
 */
export function toPdfData(row: ContractCandidatureRow, issuedDate: string): ContractPdfData {
  const locale = effectiveLocale(row)
  const c = row.candidate
  const contractNumber = formatContractNumber(
    row.contract_number!,
    new Date(`${issuedDate}T00:00:00.000Z`).getUTCFullYear(),
  )
  return {
    contractNumber,
    issuedDate,
    locale,
    participant: {
      fullName: c ? `${c.prenom} ${c.nom}`.trim() : '—',
      email: c?.email ?? '—',
      phone: c?.telephone,
      birthdate: c?.date_naissance,
      country: c?.pays,
      departureCity: c?.ville_depart,
    },
    groupSize: deriveGroupSize(row),
    discipline: row.camp_discipline,
    startDate: row.contract_start_date!,
    endDate: row.contract_end_date!,
    durationWeeks: row.contract_duration_weeks!,
    amountCents: row.package_amount_cents!,
    paymentDeadline: row.contract_payment_deadline!,
    inclusions: splitLines(row.contract_inclusions),
    exclusions: splitLines(row.contract_exclusions),
    note: row.contract_note,
  }
}

function splitLines(value: string | null): string[] {
  return (value ?? '')
    .split('\n')
    .map((l) => l.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)
}

/* ───────────────────────── Email candidat ───────────────────────── */

export function buildContractEmail(
  data: ContractPdfData,
  prenom: string,
): { subject: string; html: string; text: string } {
  const locale = data.locale
  const disciplineLabel = data.discipline
    ? CONTRACT_DISCIPLINE_LABEL[locale][data.discipline]
    : '—'
  const amount = formatEurCents(data.amountCents, locale)
  const dates = `${formatDateLong(data.startDate, locale)} → ${formatDateLong(data.endDate, locale)}`
  const deadline = formatDateLong(data.paymentDeadline, locale)
  const reference = paymentInstruction(locale, data.contractNumber)

  if (locale === 'fr') {
    const subject = `Ton contrat MKR Caucasian Camp — ${data.contractNumber}`
    const body = `
<p style="color:#e2e8f0;font-size:15px;line-height:1.6;margin:0 0 16px">Salut ${escapeHtml(prenom)},</p>
<p style="color:#cbd5e1;font-size:14px;line-height:1.6;margin:0 0 16px">
Ta candidature est validée. Tu trouveras en pièce jointe ton <strong style="color:#f1f5f9">contrat de participation ${escapeHtml(data.contractNumber)}</strong> qui récapitule ton séjour, les prestations et les modalités de paiement.</p>
<table style="border-collapse:collapse;width:100%;margin:0 0 16px">
${emailRow('Camp', disciplineLabel)}
${emailRow('Dates', dates)}
${emailRow('Durée', weeksLabel(data.durationWeeks, locale))}
${emailRow('Montant total', amount)}
${emailRow('À régler avant le', deadline)}
</table>
<div style="background:#020617;border:1px solid #1e293b;border-radius:8px;padding:14px 16px;margin:0 0 16px">
<div style="color:#94a3b8;font-size:11px;letter-spacing:0.08em;font-weight:700;margin-bottom:8px">COORDONNÉES BANCAIRES</div>
<table style="border-collapse:collapse;width:100%">
${emailRow('Titulaire', CONTRACT_RIB.holder)}
${emailRow('IBAN', CONTRACT_RIB.iban)}
${emailRow('BIC', `${CONTRACT_RIB.bic} (${CONTRACT_RIB.bank})`)}
</table>
<p style="color:#cbd5e1;font-size:12.5px;line-height:1.5;margin:10px 0 0">${escapeHtml(reference)}</p>
</div>
<p style="color:#cbd5e1;font-size:14px;line-height:1.6;margin:0 0 12px">
Le règlement vaut acceptation du contrat : une fois le virement reçu, ta place est définitivement réservée et on enclenche la préparation (visa, vol intérieur, suivi avant départ).</p>
<p style="color:#cbd5e1;font-size:14px;line-height:1.6;margin:0 0 12px">
Pense aussi à ton <strong style="color:#f1f5f9">assurance voyage</strong> (rapatriement médical + sports de contact) : elle est obligatoire et reste à ta charge.</p>
<p style="color:#cbd5e1;font-size:14px;line-height:1.6;margin:0">Une question sur le contrat ou le paiement ? Réponds directement à cet email.</p>`
    const text = [
      `Salut ${prenom},`,
      '',
      `Ta candidature est validée. Ton contrat de participation ${data.contractNumber} est en pièce jointe.`,
      `Camp : ${disciplineLabel}`,
      `Dates : ${dates}`,
      `Durée : ${weeksLabel(data.durationWeeks, locale)}`,
      `Montant total : ${amount} — à régler avant le ${deadline}`,
      '',
      `Titulaire : ${CONTRACT_RIB.holder}`,
      `IBAN : ${CONTRACT_RIB.iban}`,
      `BIC : ${CONTRACT_RIB.bic}`,
      reference,
      '',
      'Le règlement vaut acceptation du contrat. Assurance voyage (rapatriement + sports de contact) obligatoire.',
      'Une question ? Réponds directement à cet email.',
      `${MKR_PARTY.name} — ${MKR_PARTY.website}`,
    ].join('\n')
    return {
      subject,
      html: wrapEmail('Ton contrat de participation', body, `${MKR_PARTY.name} — ${MKR_PARTY.website} — Contrat ${data.contractNumber}`),
      text,
    }
  }

  const subject = `Your MKR Caucasian Camp agreement — ${data.contractNumber}`
  const body = `
<p style="color:#e2e8f0;font-size:15px;line-height:1.6;margin:0 0 16px">Hi ${escapeHtml(prenom)},</p>
<p style="color:#cbd5e1;font-size:14px;line-height:1.6;margin:0 0 16px">
Your application is approved. Attached is your <strong style="color:#f1f5f9">participation agreement ${escapeHtml(data.contractNumber)}</strong> summarizing your stay, the services and the payment terms.</p>
<table style="border-collapse:collapse;width:100%;margin:0 0 16px">
${emailRow('Camp', disciplineLabel)}
${emailRow('Dates', dates)}
${emailRow('Duration', weeksLabel(data.durationWeeks, locale))}
${emailRow('Total amount', amount)}
${emailRow('Due before', deadline)}
</table>
<div style="background:#020617;border:1px solid #1e293b;border-radius:8px;padding:14px 16px;margin:0 0 16px">
<div style="color:#94a3b8;font-size:11px;letter-spacing:0.08em;font-weight:700;margin-bottom:8px">BANK DETAILS</div>
<table style="border-collapse:collapse;width:100%">
${emailRow('Account holder', CONTRACT_RIB.holder)}
${emailRow('IBAN', CONTRACT_RIB.iban)}
${emailRow('BIC', `${CONTRACT_RIB.bic} (${CONTRACT_RIB.bank})`)}
</table>
<p style="color:#cbd5e1;font-size:12.5px;line-height:1.5;margin:10px 0 0">${escapeHtml(reference)}</p>
</div>
<p style="color:#cbd5e1;font-size:14px;line-height:1.6;margin:0 0 12px">
Payment constitutes acceptance of the agreement: once the transfer is received, your spot is definitively reserved and we start the preparation (visa, domestic flight, pre-departure support).</p>
<p style="color:#cbd5e1;font-size:14px;line-height:1.6;margin:0 0 12px">
Also remember your <strong style="color:#f1f5f9">travel insurance</strong> (medical repatriation + contact sports): it is mandatory and at your expense.</p>
<p style="color:#cbd5e1;font-size:14px;line-height:1.6;margin:0">Any question about the agreement or the payment? Just reply to this email.</p>`
  const text = [
    `Hi ${prenom},`,
    '',
    `Your application is approved. Your participation agreement ${data.contractNumber} is attached.`,
    `Camp: ${disciplineLabel}`,
    `Dates: ${dates}`,
    `Duration: ${weeksLabel(data.durationWeeks, locale)}`,
    `Total amount: ${amount} — due before ${deadline}`,
    '',
    `Account holder: ${CONTRACT_RIB.holder}`,
    `IBAN: ${CONTRACT_RIB.iban}`,
    `BIC: ${CONTRACT_RIB.bic}`,
    reference,
    '',
    'Payment constitutes acceptance of the agreement. Travel insurance (repatriation + contact sports) is mandatory.',
    'Any question? Just reply to this email.',
    `${MKR_PARTY.name} — ${MKR_PARTY.website}`,
  ].join('\n')
  return {
    subject,
    html: wrapEmail('Your participation agreement', body, `${MKR_PARTY.name} — ${MKR_PARTY.website} — Agreement ${data.contractNumber}`),
    text,
  }
}

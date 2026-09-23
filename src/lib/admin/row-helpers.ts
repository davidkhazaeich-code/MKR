// Aides d'affichage d'une ligne de dossier, partagees par l'accueil "A faire"
// (composants serveur) et la liste des candidatures (composant client).
// Module neutre : ni JSX ni composant, seulement le type des icones.

import type { IconName } from '@/components/admin/ui/Icon'
import type { StepKind } from '@/lib/admin/next-step'
import type { DossierRow } from '@/lib/admin/types'
import { DISCIPLINE_LABEL, TUNNEL_LABEL, sessionShortNameFromId } from '@/lib/admin/labels'
import { ATTRIBUTION_SOURCE_LABEL, type AttributionSource } from '@/lib/attribution'

/** Icone de chaque etape (ligne de liste : icone 16 px + step.short au ton). */
export const STEP_ICON: Record<StepKind, IconName> = {
  camp_parti: 'alert-triangle',
  visio_a_venir: 'video',
  visio_passee: 'video',
  visio_reservee: 'video',
  devis_a_envoyer: 'edit',
  a_relancer: 'bell',
  nouvelle: 'inbox',
  a_solder: 'receipt',
  contrat_a_envoyer: 'file-text',
  contrat_sans_echeance: 'calendar',
  paiement_en_retard: 'clock',
  paiement_attendu: 'euro',
  camp_a_cloturer: 'flag',
  depart_a_venir: 'calendar-days',
  clos: 'check',
}

export function dossierHref(id: string): string {
  return `/admin/inscriptions/${id}`
}

export function candidateName(row: DossierRow): string {
  const c = row.candidate
  const name = c ? `${c.prenom ?? ''} ${c.nom ?? ''}`.trim() : ''
  return name || 'Nom non renseigné'
}

/** Prenom seul (nom accessible des boutons de contact), sinon le nom complet. */
export function firstNameOf(row: DossierRow): string {
  return row.candidate?.prenom?.trim() || candidateName(row)
}

/** Lien WhatsApp (wa.me attend les chiffres du numero E.164, sans le +). */
export function whatsappHref(phone: string | null | undefined): string | null {
  const digits = (phone ?? '').replace(/\D/g, '')
  return digits.length >= 8 ? `https://wa.me/${digits}` : null
}

/** Discipline puis session (ou le tunnel quand le sejour est hors session). */
export function campParts(row: DossierRow): string[] {
  const parts: string[] = []
  if (row.camp_discipline) parts.push(DISCIPLINE_LABEL[row.camp_discipline])
  parts.push(sessionShortNameFromId(row.session_id) ?? TUNNEL_LABEL[row.tunnel_type])
  return parts
}

/** Libelle d'une source d'acquisition (valeur brute si elle est inconnue du site). */
export function sourceLabel(source: string): string {
  return ATTRIBUTION_SOURCE_LABEL[source as AttributionSource] ?? source
}

/**
 * Origine du dossier en texte discret : le partenaire prime sur la source.
 * Code refuse a l'inscription = ton warn. Rien si ni code ni source.
 */
export function originOf(row: DossierRow): { text: string; warn: boolean } | null {
  if (row.referral_code) {
    return row.referral_code_valid === false
      ? { text: `Code invalide (${row.referral_code})`, warn: true }
      : { text: `Code ${row.referral_code}`, warn: false }
  }
  return row.attribution_source ? { text: sourceLabel(row.attribution_source), warn: false } : null
}

/**
 * Niveau MMA a verifier (ancien badge de la liste) : candidature MMA encore
 * "Recue", hors demande Club et Groupe (cadree par le devis).
 */
export function mmaLevelToCheck(row: DossierRow): boolean {
  return row.camp_discipline === 'mma' && row.status === 'recue' && row.tunnel_type !== 'groupe'
}

import { sessionFromId } from '@/data/sessions'
import { STATUS_LABEL } from '@/lib/admin-transitions'
import type { DossierRow, Tone } from '@/lib/admin/types'
import { PAYMENT_METHOD_LABEL, sessionShortName } from '@/lib/admin/labels'
import {
  daysBetween, formatAgo, formatDayLong, formatDayMonth, formatEuros,
  formatVisioMoment, formatVisioShort, plural, relativeDay, zurichDay,
} from '@/lib/admin/format'

export type StepKind =
  | 'camp_parti' | 'visio_a_venir' | 'visio_passee' | 'visio_reservee' | 'devis_a_envoyer'
  | 'a_relancer' | 'nouvelle' | 'a_solder' | 'contrat_a_envoyer' | 'contrat_sans_echeance'
  | 'paiement_en_retard' | 'paiement_attendu' | 'camp_a_cloturer' | 'depart_a_venir' | 'clos'

export interface NextStep {
  kind: StepKind
  tone: Tone
  /** Phrase de la fiche, ex. « Visio passée, décision à prendre ». */
  title: string
  /** Precision datee, ex. « Visio hier à 11:45. Valide ou refuse... ». */
  detail: string
  /** Ligne de liste, ex. « Visio passée · 18 sept. ». */
  short: string
  /** Vrai quand Ruslan doit agir (sert a l'emphase et au compteur de l'accueil). */
  needsAction: boolean
  /** Date pivot : debut de visio, echeance, depart. */
  dueAt: string | null
  /** Tri croissant a l'interieur d'une section. */
  sortKey: number
}

export type NextStepInput = Pick<DossierRow,
  | 'status' | 'created_at' | 'status_changed_at' | 'tunnel_type' | 'session_id'
  | 'visio_booked_at' | 'visio_starts_at' | 'visio_reminder_count' | 'visio_reminder_sent_at'
  | 'contract_sent_at' | 'contract_payment_deadline' | 'contract_start_date' | 'contract_end_date'
  | 'package_paid_at' | 'package_amount_cents' | 'payment_date' | 'payment_method'
  | 'rebooking_sent_at' | 'rebooking_sent_count'>

/** Une visio reste « a venir » 30 min apres son debut (appel en cours). */
export const VISIO_GRACE_MS = 30 * 60_000
/** Delai avant de considerer qu'un candidat sans visio est a relancer (comme le digest). */
export const RELANCE_AFTER_DAYS = 3
/** Une echeance a 3 jours ou moins demande une action. */
export const PAIEMENT_BIENTOT_DAYS = 3

const ms = (iso: string): number => Date.parse(iso)
const dayMs = (d: string): number => Date.parse(`${d}T00:00:00Z`)

const CLOS_TITLE = { refusee: 'Dossier refusé', annulee: 'Dossier annulé', reportee: 'Dossier reporté', camp_fait: 'Camp effectué' } as const

export function computeNextStep(row: NextStepInput, now: Date): NextStep {
  const nowMs = now.getTime()
  const today = zurichDay(now)
  const session = sessionFromId(row.session_id)
  const campName = session ? sessionShortName(session) : null

  if (row.status === 'refusee' || row.status === 'annulee' || row.status === 'reportee' || row.status === 'camp_fait') {
    return {
      kind: 'clos', tone: row.status === 'camp_fait' ? 'violet' : 'neutral',
      title: CLOS_TITLE[row.status],
      detail: `${STATUS_LABEL[row.status]} ${relativeDay(row.status_changed_at, now)}.`,
      short: STATUS_LABEL[row.status],
      needsAction: false, dueAt: null, sortKey: -ms(row.status_changed_at),
    }
  }

  // Rotation des saisons (meme regle que le digest) : un dossier actif sur un camp
  // deja parti ne partira jamais, c'est la premiere chose a voir.
  if ((row.status === 'recue' || row.status === 'validee') && session && session.startDate <= today) {
    const sent = (row.rebooking_sent_count ?? 0) > 0 && row.rebooking_sent_at
    return {
      kind: 'camp_parti', tone: 'danger',
      title: 'Camp parti sans ce candidat',
      detail: sent
        ? `Le camp ${campName} est parti le ${formatDayLong(session.startDate)}. Autre session proposée ${relativeDay(row.rebooking_sent_at as string, now)} (${plural(row.rebooking_sent_count ?? 1, 'envoi', 'envois')}). Sans réponse, annule ou reporte le dossier.`
        : `Le camp ${campName} est parti le ${formatDayLong(session.startDate)}. Propose-lui une autre session, ou annule ou reporte le dossier.`,
      short: sent ? 'Camp parti · autre session proposée' : 'Camp parti',
      needsAction: true, dueAt: session.startDate, sortKey: dayMs(session.startDate),
    }
  }

  if (row.status === 'recue') {
    if (row.visio_booked_at) {
      if (!row.visio_starts_at) {
        return {
          kind: 'visio_reservee', tone: 'info', title: 'Visio réservée',
          detail: `Réservation reçue ${formatAgo(row.visio_booked_at, now)}. Cal n'a pas transmis l'heure du rendez-vous.`,
          short: 'Visio réservée', needsAction: false, dueAt: null, sortKey: ms(row.visio_booked_at),
        }
      }
      const start = ms(row.visio_starts_at)
      if (start + VISIO_GRACE_MS > nowMs) {
        const isToday = zurichDay(row.visio_starts_at) === today
        return {
          kind: 'visio_a_venir', tone: 'info',
          title: `Visio ${formatVisioMoment(row.visio_starts_at, now)}`,
          detail: start <= nowMs
            ? `La visio a commencé ${formatAgo(row.visio_starts_at, now)}.`
            : `Rendez-vous ${relativeDay(row.visio_starts_at, now)}. Relis son profil et ses réponses avant l'appel.`,
          short: `Visio ${formatVisioShort(row.visio_starts_at, now)}`,
          needsAction: isToday, dueAt: row.visio_starts_at, sortKey: start,
        }
      }
      return {
        kind: 'visio_passee', tone: 'warn', title: 'Visio passée, décision à prendre',
        detail: `Visio ${formatVisioMoment(row.visio_starts_at, now)}. Valide ou refuse le dossier, ou renvoie le lien si le candidat ne s'est pas présenté.`,
        short: `Visio passée · ${formatDayMonth(row.visio_starts_at)}`,
        needsAction: true, dueAt: row.visio_starts_at, sortKey: -start,
      }
    }
    if (row.tunnel_type === 'groupe') {
      return {
        kind: 'devis_a_envoyer', tone: 'warn', title: 'Demande de devis Club et Groupe',
        detail: `Reçue ${formatAgo(row.created_at, now)}. À contacter sous 48 h pour cadrer le séjour (objectifs, dates, niveau, budget), puis envoyer un devis.`,
        short: 'Devis à envoyer', needsAction: true, dueAt: null, sortKey: ms(row.created_at),
      }
    }
    const age = daysBetween(zurichDay(row.created_at), today)
    if (age < RELANCE_AFTER_DAYS) {
      return {
        kind: 'nouvelle', tone: 'neutral', title: 'Nouvelle candidature',
        detail: `Reçue ${formatAgo(row.created_at, now)}. Le lien pour réserver la visio lui a été envoyé.`,
        short: 'Nouvelle · visio pas encore réservée', needsAction: false, dueAt: null, sortKey: -ms(row.created_at),
      }
    }
    const count = row.visio_reminder_count ?? 0
    const last = row.visio_reminder_sent_at ?? row.created_at
    const relances = count === 0
      ? 'Aucune relance envoyée.'
      : count === 1
        ? `1 relance envoyée ${relativeDay(last, now)}.`
        : `${count} relances, la dernière ${relativeDay(last, now)}.`
    return {
      kind: 'a_relancer', tone: 'warn', title: 'Pas encore de visio réservée',
      detail: `Reçue ${formatAgo(row.created_at, now)}. ${relances}`,
      short: count === 0 ? 'Sans visio · jamais relancé' : `Sans visio · ${plural(count, 'relance', 'relances')}`,
      needsAction: true, dueAt: null, sortKey: ms(last),
    }
  }

  if (row.status === 'validee') {
    if (row.package_paid_at) {
      const when = row.payment_date ? ` le ${formatDayMonth(row.payment_date)}` : ''
      const how = row.payment_method ? ` (${PAYMENT_METHOD_LABEL[row.payment_method].toLowerCase()})` : ''
      return {
        kind: 'a_solder', tone: 'warn', title: 'Paiement reçu, dossier à solder',
        detail: `Le paiement est marqué reçu${when}${how}, mais le dossier est encore « Validée ».`,
        short: 'Payé · à passer en Soldée', needsAction: true, dueAt: null, sortKey: ms(row.package_paid_at),
      }
    }
    if (!row.contract_sent_at) {
      return {
        kind: 'contrat_a_envoyer', tone: 'warn', title: 'Contrat à envoyer',
        detail: `Dossier validé ${relativeDay(row.status_changed_at, now)}. Vérifie les dates, le montant et l'échéance, puis envoie le contrat.`,
        short: 'Contrat à envoyer', needsAction: true, dueAt: null, sortKey: ms(row.status_changed_at),
      }
    }
    if (!row.contract_payment_deadline) {
      return {
        kind: 'contrat_sans_echeance', tone: 'warn', title: 'Contrat envoyé sans échéance',
        detail: `Contrat envoyé ${relativeDay(row.contract_sent_at, now)}. Ajoute une échéance de paiement pour suivre le règlement.`,
        short: 'Contrat sans échéance', needsAction: true, dueAt: null, sortKey: ms(row.contract_sent_at),
      }
    }
    const deadline = row.contract_payment_deadline
    const diff = daysBetween(today, deadline)
    const amount = row.package_amount_cents ? formatEuros(row.package_amount_cents) : null
    if (diff < 0) {
      return {
        kind: 'paiement_en_retard', tone: 'danger', title: 'Paiement en retard',
        detail: `${amount ? `${amount} attendus` : 'Paiement attendu'} le ${formatDayLong(deadline)}, en retard de ${plural(-diff, 'jour', 'jours')}. Relance le candidat.`,
        short: `Paiement en retard · ${-diff} j`, needsAction: true, dueAt: deadline, sortKey: dayMs(deadline),
      }
    }
    return {
      kind: 'paiement_attendu', tone: diff <= PAIEMENT_BIENTOT_DAYS ? 'warn' : 'info', title: 'Paiement attendu',
      detail: `${amount ? `${amount} à régler` : 'Paiement à recevoir'} au plus tard le ${formatDayLong(deadline)} (${relativeDay(deadline, now)}).`,
      short: `Paiement attendu · ${formatDayMonth(deadline)}`,
      needsAction: diff <= PAIEMENT_BIENTOT_DAYS, dueAt: deadline, sortKey: dayMs(deadline),
    }
  }

  // soldee
  const start = session?.startDate ?? row.contract_start_date
  const end = session?.endDate ?? row.contract_end_date
  if (end && end < today) {
    return {
      kind: 'camp_a_cloturer', tone: 'warn', title: 'Camp terminé, dossier à clôturer',
      detail: `Le camp s'est terminé le ${formatDayLong(end)}. Passe le dossier en « Camp fait ».`,
      short: 'Camp terminé · à clôturer', needsAction: true, dueAt: end, sortKey: dayMs(end),
    }
  }
  if (start && start <= today) {
    return {
      kind: 'depart_a_venir', tone: 'ok', title: 'Camp en cours',
      detail: `Parti le ${formatDayLong(start)}${campName ? ` (${campName})` : ''}.`,
      short: 'Soldé · camp en cours', needsAction: false, dueAt: start, sortKey: dayMs(start),
    }
  }
  return {
    kind: 'depart_a_venir', tone: 'ok',
    title: start ? `Soldé, départ ${relativeDay(start, now)}` : 'Dossier soldé',
    detail: start ? `Départ le ${formatDayLong(start)}${campName ? ` (${campName})` : ''}.` : 'Dates du séjour à confirmer dans le contrat.',
    short: start ? `Soldé · départ ${formatDayMonth(start)}` : 'Soldé',
    needsAction: false, dueAt: start ?? null, sortKey: start ? dayMs(start) : Number.MAX_SAFE_INTEGER,
  }
}

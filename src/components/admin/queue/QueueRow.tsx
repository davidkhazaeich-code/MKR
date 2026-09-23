// Lignes de l'accueil "A faire" (composants serveur, sans etat).
//
// QueueRow : une ligne de section. Le nom du candidat est le vrai lien de la
// ligne (etire par .adm-row-link, data-dossier-id pour le contexte
// precedent/suivant) ; les boutons passent au-dessus. Contenu :
//   nom (+ EN)
//   etape (step.short au ton de l'etape)
//   discipline . session (+ montant pour les paiements)
//   ligne en plus : age et derniere relance (A relancer), bonus et partenaire (Bonus)
// VisioRow : une ligne de l'agenda des visios (heure, nom, discipline .
// session, WhatsApp et lien vers la reservation Cal).
// Mise en page : grilles de la section "A faire" de admin.css, qui passent de
// la pile mobile aux colonnes selon la largeur de la liste (container query).

import Link from 'next/link'
import { ButtonLink } from '@/components/admin/ui/Button'
import Icon, { type IconName } from '@/components/admin/ui/Icon'
import { ToneText } from '@/components/admin/ui/StatusLabel'
import QuickReminderButton from './QuickReminderButton'
import type { StepKind } from '@/lib/admin/next-step'
import type { AgendaGroupKey, QueueItem, QueueSectionKey } from '@/lib/admin/queue'
import type { DossierRow } from '@/lib/admin/types'
import { DISCIPLINE_LABEL, TUNNEL_LABEL, sessionShortNameFromId } from '@/lib/admin/labels'
import { formatAgo, formatDayMonth, formatEuros, formatTime, relativeDay } from '@/lib/admin/format'

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

// Etapes dont la ligne affiche le montant du sejour.
const PAYMENT_KINDS: StepKind[] = ['paiement_en_retard', 'paiement_attendu', 'contrat_sans_echeance', 'a_solder']

export function dossierHref(id: string): string {
  return `/admin/inscriptions/${id}`
}

export function candidateName(row: DossierRow): string {
  const c = row.candidate
  const name = c ? `${c.prenom ?? ''} ${c.nom ?? ''}`.trim() : ''
  return name || 'Nom non renseigné'
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

function LangTag({ row }: { row: DossierRow }) {
  if (row.submission_language !== 'en') return null
  return (
    <span className="adm-todo-lang">
      <span aria-hidden="true">EN</span>
      <span className="adm-sr-only">candidature en anglais</span>
    </span>
  )
}

function NameLine({ row }: { row: DossierRow }) {
  return (
    <p className="adm-todo-name">
      <Link href={dossierHref(row.id)} className="adm-row-link adm-row-title" data-dossier-id={row.id}>
        {candidateName(row)}
      </Link>
      <LangTag row={row} />
    </p>
  )
}

function firstNameOf(row: DossierRow): string {
  return row.candidate?.prenom?.trim() || candidateName(row)
}

function WhatsAppButton({ row }: { row: DossierRow }) {
  const href = whatsappHref(row.candidate?.telephone)
  if (!href) return null
  return (
    <ButtonLink
      href={href}
      external
      variant="whatsapp"
      size="sm"
      iconOnly
      aria-label={`WhatsApp ${firstNameOf(row)}`}
    />
  )
}

/** Ligne de texte secondaire, termes separes par un point median (.adm-meta). */
function Meta({ className, parts, amount }: { className: string; parts: string[]; amount?: string | null }) {
  return (
    <p className={`adm-row-meta adm-meta ${className}`}>
      {parts.map((part, i) => (
        <span key={i}>{part}</span>
      ))}
      {amount ? <span className="adm-todo-amount">{amount}</span> : null}
    </p>
  )
}

export interface QueueRowProps {
  item: QueueItem
  section: QueueSectionKey
  now: Date
}

export default function QueueRow({ item, section, now }: QueueRowProps) {
  const { row, step } = item
  const amount = PAYMENT_KINDS.includes(step.kind) && row.package_amount_cents
    ? formatEuros(row.package_amount_cents)
    : null

  // Ligne en plus, propre a la section.
  const extra: string[] = []
  if (section === 'a_relancer') {
    extra.push(`Reçue ${formatAgo(row.created_at, now)}`)
    if ((row.visio_reminder_count ?? 0) > 0 && row.visio_reminder_sent_at) {
      extra.push(`dernière relance ${relativeDay(row.visio_reminder_sent_at, now)}`)
    }
  } else if (section === 'bonus') {
    if (row.referral_bonus_eur != null) extra.push(`Bonus de ${formatEuros(Math.round(row.referral_bonus_eur * 100))}`)
    const partner = row.referral_partner_name ?? row.referral_code
    if (partner) extra.push(partner)
  }

  const hasWhatsapp = whatsappHref(row.candidate?.telephone) !== null
  const hasReminder = section === 'a_relancer'
  const cls = ['adm-row', 'adm-todo-row']
  if (extra.length > 0) cls.push('adm-todo-row--extra')
  // Deux boutons : empiles a droite tant que la liste est etroite (mobile).
  if (hasWhatsapp && hasReminder) cls.push('adm-todo-row--pair')

  return (
    <li className={cls.join(' ')}>
      <NameLine row={row} />
      <p className="adm-todo-step">
        <ToneText tone={step.tone} icon={STEP_ICON[step.kind]} strong={step.needsAction}>
          {step.short}
        </ToneText>
      </p>
      <Meta className="adm-todo-ctx" parts={campParts(row)} amount={amount} />
      {extra.length > 0 && <Meta className="adm-todo-extra" parts={extra} />}
      {(hasWhatsapp || hasReminder) && (
        <div className="adm-row-actions adm-todo-actions">
          <WhatsAppButton row={row} />
          {hasReminder && (
            <QuickReminderButton
              id={row.id}
              name={candidateName(row)}
              email={row.candidate?.email ?? null}
              lang={row.submission_language ?? 'fr'}
              count={row.visio_reminder_count ?? 0}
            />
          )}
        </div>
      )}
    </li>
  )
}

export interface VisioRowProps {
  item: QueueItem
  group: AgendaGroupKey
  now: Date
}

/** Ligne de l'agenda : heure (et date au-dela de demain), puis le dossier. */
export function VisioRow({ item, group, now }: VisioRowProps) {
  const { row } = item
  const starts = row.visio_starts_at
  const showDay = group === 'week' || group === 'later'
  const live = starts !== null && Date.parse(starts) <= now.getTime()
  const booking = row.visio_booking_uid
    ? `https://cal.com/booking/${encodeURIComponent(row.visio_booking_uid)}`
    : null
  const hasWhatsapp = whatsappHref(row.candidate?.telephone) !== null

  // Heure inconnue : l'anciennete de la reservation, sur sa propre ligne.
  const booked = !starts && row.visio_booked_at ? `Réservée ${formatAgo(row.visio_booked_at, now)}` : null

  return (
    <li className="adm-row adm-todo-visio">
      <div className="adm-todo-time">
        {starts ? (
          <time dateTime={starts}>
            <span className="adm-todo-time-hour">{formatTime(starts)}</span>
            {showDay && <span className="adm-todo-time-day">{formatDayMonth(starts)}</span>}
            {live && <span className="adm-todo-time-live">en cours</span>}
          </time>
        ) : (
          <span className="adm-todo-time-unknown">
            <Icon name="clock" size={18} />
            <span className="adm-sr-only">Heure inconnue</span>
          </span>
        )}
      </div>
      <NameLine row={row} />
      <Meta className="adm-todo-ctx" parts={campParts(row)} />
      {booked && <Meta className="adm-todo-extra" parts={[booked]} />}
      {(hasWhatsapp || booking) && (
        <div className="adm-row-actions adm-todo-actions">
          <WhatsAppButton row={row} />
          {booking && (
            <ButtonLink
              href={booking}
              external
              variant="secondary"
              size="sm"
              aria-label={`Réservation de ${firstNameOf(row)}, ouvre Cal dans un nouvel onglet`}
            >
              Réservation
            </ButtonLink>
          )}
        </div>
      )}
    </li>
  )
}

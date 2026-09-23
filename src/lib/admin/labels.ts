import type { Session } from '@/data/sessions'
import { sessionFromId } from '@/data/sessions'
import frSessions from '../../../messages/fr/data.sessions.json'
import type { CampDiscipline, Lang, PaymentMethod, Status, Tone, TunnelType } from '@/lib/admin/types'

export { STATUS_LABEL } from '@/lib/admin-transitions'

export const STATUS_TONE: Record<Status, Tone> = {
  recue: 'warn', validee: 'ok', soldee: 'info', camp_fait: 'violet',
  refusee: 'danger', annulee: 'neutral', reportee: 'neutral',
}
export const ACTIVE_STATUSES: Status[] = ['recue', 'validee', 'soldee']
export const CLOSED_STATUSES: Status[] = ['camp_fait', 'refusee', 'annulee', 'reportee']

// Alignes sur le site public : « Club et Groupe », jamais d'esperluette.
export const TUNNEL_LABEL: Record<TunnelType, string> = {
  session: 'Session officielle', custom: 'Sur mesure', famille: 'Famille', groupe: 'Club et Groupe',
}
export const DISCIPLINE_LABEL: Record<CampDiscipline, string> = { lutte: 'Lutte', mma: 'MMA', combo_quote: 'Combo Lutte + MMA' }
export const DISCIPLINE_LABEL_FULL: Record<CampDiscipline, string> = {
  lutte: 'Lutte · Daghestan (Makhachkala, Kaspiysk)',
  mma: 'MMA · Tchétchénie (Grozny, Akhmat)',
  combo_quote: 'Combo Lutte + MMA · sur devis',
}
export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = { virement: 'Virement bancaire', cash: 'Espèces', autre: 'Autre' }
export const PARTNER_TYPE_LABEL: Record<string, string> = { gym: 'Salle', influencer: 'Influenceur', coach: 'Coach', other: 'Autre' }
export const PARTNER_TYPE_LABEL_LONG: Record<string, string> = { gym: 'Salle ou club partenaire', influencer: 'Influenceur', coach: 'Coach', other: 'Autre' }
export const PAYOUT_STATUS_LABEL: Record<string, string> = { not_applicable: 'Sans objet', pending: 'En attente', due: 'À payer', paid: 'Payé', cancelled: 'Annulé' }
export const PAYOUT_STATUS_TONE: Record<string, Tone> = { not_applicable: 'neutral', pending: 'neutral', due: 'warn', paid: 'ok', cancelled: 'neutral' }
export const LANG_LABEL: Record<Lang, string> = { fr: 'Français', en: 'Anglais' }

const SEASONS = (frSessions as unknown as { seasons: Record<string, { period: string }> }).seasons

/** Nom court d'une session tel que Ruslan en parle : « Toussaint 2026 », « Août 2027 ». */
export function sessionShortName(session: Session): string {
  return `${SEASONS[session.seasonKey]?.period ?? session.seasonKey} ${session.startDate.slice(0, 4)}`
}
export function sessionShortNameFromId(id: string | null): string | null {
  const s = sessionFromId(id)
  return s ? sessionShortName(s) : null
}

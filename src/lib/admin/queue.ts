import type { DossierRow } from '@/lib/admin/types'
import { computeNextStep, type NextStep, type StepKind } from '@/lib/admin/next-step'
import { daysBetween, zurichDay } from '@/lib/admin/format'

export interface QueueItem { row: DossierRow; step: NextStep }
export type QueueSectionKey = 'a_trancher' | 'paiements' | 'contrats' | 'devis' | 'a_relancer' | 'camp_parti' | 'a_cloturer' | 'bonus' | 'nouvelles'
export interface QueueSection { key: QueueSectionKey; title: string; hint: string; items: QueueItem[] }
export type AgendaGroupKey = 'today' | 'tomorrow' | 'week' | 'later' | 'unknown'
export interface AgendaGroup { key: AgendaGroupKey; label: string; items: QueueItem[] }
export interface QueueData {
  agenda: AgendaGroup[]
  sections: QueueSection[]
  actionCount: number
  pipeline: { recue: number; validee: number; soldee: number; camp_fait: number }
}

const SECTION_OF: Partial<Record<StepKind, QueueSectionKey>> = {
  visio_passee: 'a_trancher',
  paiement_en_retard: 'paiements', a_solder: 'paiements', contrat_sans_echeance: 'paiements', paiement_attendu: 'paiements',
  contrat_a_envoyer: 'contrats', devis_a_envoyer: 'devis', a_relancer: 'a_relancer',
  camp_parti: 'camp_parti', camp_a_cloturer: 'a_cloturer', nouvelle: 'nouvelles',
}
// Dans « Paiements » : retard d'abord, puis paye a solder, puis sans echeance, puis attendus.
const KIND_PRIORITY: Partial<Record<StepKind, number>> = { paiement_en_retard: 0, a_solder: 1, contrat_sans_echeance: 2, paiement_attendu: 3 }

export const SECTION_META: Record<QueueSectionKey, { title: string; hint: string }> = {
  a_trancher: { title: 'À trancher', hint: 'Visio passée, dossier encore « Reçue » : valide, refuse ou relance.' },
  paiements: { title: 'Paiements', hint: 'Contrats envoyés en attente de règlement, par échéance.' },
  contrats: { title: 'Contrats à envoyer', hint: 'Dossiers validés sans contrat.' },
  devis: { title: 'Devis Club et Groupe', hint: 'À contacter sous 48 h pour cadrer le séjour.' },
  a_relancer: { title: 'À relancer', hint: 'Aucune visio réservée depuis 3 jours ou plus.' },
  camp_parti: { title: 'Camp parti', hint: 'Dossiers encore ouverts sur un camp déjà parti : autre session, annulation ou report.' },
  a_cloturer: { title: 'Camps terminés', hint: 'Dossiers soldés à passer en « Camp fait ».' },
  bonus: { title: 'Bonus partenaires à payer', hint: 'Commission due au partenaire qui a recommandé le candidat.' },
  nouvelles: { title: 'Nouvelles candidatures', hint: 'Moins de 3 jours : le lien de réservation de la visio vient de leur être envoyé.' },
}
export const SECTION_ORDER: QueueSectionKey[] = ['a_trancher', 'paiements', 'contrats', 'devis', 'a_relancer', 'camp_parti', 'a_cloturer', 'bonus', 'nouvelles']
const AGENDA_LABEL: Record<AgendaGroupKey, string> = { today: "Aujourd'hui", tomorrow: 'Demain', week: 'Cette semaine', later: 'Plus tard', unknown: 'Heure non transmise' }

export function buildQueue(rows: DossierRow[], now: Date): QueueData {
  const today = zurichDay(now)
  const buckets = new Map<QueueSectionKey, QueueItem[]>()
  const agenda = new Map<AgendaGroupKey, QueueItem[]>()
  const pipeline = { recue: 0, validee: 0, soldee: 0, camp_fait: 0 }
  let actionCount = 0
  const push = <K,>(map: Map<K, QueueItem[]>, key: K, item: QueueItem) => { const list = map.get(key) ?? []; list.push(item); map.set(key, list) }

  for (const row of rows) {
    if (row.status in pipeline) pipeline[row.status as keyof typeof pipeline] += 1
    const step = computeNextStep(row, now)
    const item: QueueItem = { row, step }
    if (step.needsAction) actionCount += 1
    if (step.kind === 'visio_a_venir') {
      const diff = daysBetween(today, zurichDay(step.dueAt as string))
      push(agenda, diff <= 0 ? 'today' : diff === 1 ? 'tomorrow' : diff < 7 ? 'week' : 'later', item)
    } else if (step.kind === 'visio_reservee') {
      push(agenda, 'unknown', item)
    }
    const key = SECTION_OF[step.kind]
    if (key) push(buckets, key, item)
    if (row.referral_payout_status === 'due') push(buckets, 'bonus', item)
  }

  const byKey = (a: QueueItem, b: QueueItem) =>
    (KIND_PRIORITY[a.step.kind] ?? 0) - (KIND_PRIORITY[b.step.kind] ?? 0) || a.step.sortKey - b.step.sortKey
  const sections = SECTION_ORDER.filter((k) => (buckets.get(k)?.length ?? 0) > 0).map((k) => ({
    key: k, ...SECTION_META[k],
    items: k === 'bonus'
      ? (buckets.get(k) as QueueItem[]).sort((a, b) => Date.parse(a.row.created_at) - Date.parse(b.row.created_at))
      : (buckets.get(k) as QueueItem[]).sort(byKey),
  }))
  const agendaOrder: AgendaGroupKey[] = ['today', 'tomorrow', 'week', 'later', 'unknown']
  const agendaGroups = agendaOrder.filter((k) => (agenda.get(k)?.length ?? 0) > 0).map((k) => ({
    key: k, label: AGENDA_LABEL[k], items: (agenda.get(k) as QueueItem[]).sort((a, b) => a.step.sortKey - b.step.sortKey),
  }))
  return { agenda: agendaGroups, sections, actionCount, pipeline }
}

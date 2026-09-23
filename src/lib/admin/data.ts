import { getSupabaseAdmin } from '@/lib/supabase-admin'
import type { AuditRow } from '@/lib/admin/audit-labels'
import type { CandidateLite, DossierRow, Status, TunnelType } from '@/lib/admin/types'

// Lecture serveur du back office. Une seule requete pour la liste, l'accueil et
// les sessions : a ~50 dossiers (2 000 max), filtrer cote client est instantane.
export const DOSSIER_LIST_SELECT = `
  id, created_at, status_changed_at, tunnel_type, session_id, duree_semaines, date_debut_souhaitee,
  camp_discipline, status, package_amount_cents, package_paid_at, payment_method, payment_date, notes_admin,
  referral_code, referral_code_valid, referral_partner_name, referral_partner_type, referral_bonus_eur,
  referral_payout_status, submission_language, attribution_source,
  visio_booked_at, visio_starts_at, visio_booking_uid, visio_reminder_sent_at, visio_reminder_count,
  rebooking_sent_at, rebooking_sent_count, contract_sent_at, contract_payment_deadline,
  contract_start_date, contract_end_date,
  candidate:candidates ( prenom, nom, email, telephone, pays )
`

export async function loadDossierRows(): Promise<{ rows: DossierRow[]; error: string | null }> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('candidatures')
    .select(DOSSIER_LIST_SELECT)
    .order('created_at', { ascending: false })
    .limit(2000)
  return { rows: (data ?? []) as unknown as DossierRow[], error: error?.message ?? null }
}

const DETAIL_SELECT = `
  ${DOSSIER_LIST_SELECT.replace(/candidate:candidates \([^)]*\)/, '')}
  candidate_id, updated_at, status_changed_by_email, notes_visio, form_data, group_members,
  referral_commission_type, referral_commission_pct, referral_payout_paid_at, referral_payout_method,
  contract_duration_weeks, contract_inclusions, contract_exclusions, contract_note, contract_locale,
  contract_number, contract_sent_count, contract_pdf_path, attribution,
  payment_reminder_sent_at, payment_reminder_count, predeparture_sent_at,
  candidate:candidates ( prenom, nom, email, telephone, pays, date_naissance, ville_depart )
`

export interface DossierDetail extends Omit<DossierRow, 'candidate'> {
  candidate_id: string; updated_at: string; status_changed_by_email: string | null
  notes_visio: string | null; form_data: Record<string, unknown>; group_members: unknown
  referral_commission_type: string | null; referral_commission_pct: number | null
  referral_payout_paid_at: string | null; referral_payout_method: string | null
  contract_duration_weeks: number | null; contract_inclusions: string | null; contract_exclusions: string | null
  contract_note: string | null; contract_locale: 'fr' | 'en' | null; contract_number: number | null
  contract_sent_count: number | null; contract_pdf_path: string | null
  attribution: Record<string, unknown> | null
  payment_reminder_sent_at: string | null; payment_reminder_count: number | null; predeparture_sent_at: string | null
  candidate: (CandidateLite & { date_naissance: string | null; ville_depart: string | null }) | null
}
export interface SiblingDossier { id: string; status: Status; session_id: string | null; tunnel_type: TunnelType; created_at: string }

/** Lecture du dossier refusee par Supabase (panne, colonne, droits) : pas une 404. */
export class DossierReadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DossierReadError'
  }
}

/** Code PostgREST d'un id qui n'est pas un uuid : dossier introuvable. */
const INVALID_UUID = '22P02'

export async function loadDossierDetail(id: string): Promise<{ dossier: DossierDetail | null; audit: AuditRow[]; siblings: SiblingDossier[] }> {
  const supabase = getSupabaseAdmin()
  const [cand, audit] = await Promise.all([
    supabase.from('candidatures').select(DETAIL_SELECT).eq('id', id).maybeSingle(),
    supabase.from('audit_log').select('id, event, from_value, to_value, data, actor_email, at')
      .eq('candidature_id', id).order('at', { ascending: false }).limit(80),
  ])
  // Id invalide ou dossier absent : null (404). Toute autre erreur remonte,
  // la page affiche son erreur de chargement (jamais une fausse 404).
  if (cand.error && cand.error.code !== INVALID_UUID) throw new DossierReadError(cand.error.message)
  const dossier = cand.error ? null : ((cand.data as unknown as DossierDetail | null) ?? null)
  if (dossier && audit.error) throw new DossierReadError(audit.error.message)
  let siblings: SiblingDossier[] = []
  if (dossier?.candidate_id) {
    const { data } = await supabase.from('candidatures')
      .select('id, status, session_id, tunnel_type, created_at')
      .eq('candidate_id', dossier.candidate_id).neq('id', id).order('created_at', { ascending: false })
    siblings = (data ?? []) as SiblingDossier[]
  }
  return { dossier, audit: (audit.data ?? []) as AuditRow[], siblings }
}

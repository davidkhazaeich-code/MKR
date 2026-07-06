import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import {
  STATUS_VALUES,
  canTransition,
  TRANSITION_REMINDER,
  type Status,
} from '@/lib/admin-transitions'
import { computeCommissionEur } from '@/data/referral-codes'
import { sendSouvenirIfNeeded } from '@/lib/souvenir-notify'

// Runtime Node explicite : la validation d'un dossier declenche la generation
// server-side de l'image souvenir (Satori + lecture fs des polices/fonds).
export const runtime = 'nodejs'

// PATCH /api/admin/candidature/[id]
// Protege par le proxy (cookie httpOnly mkr_admin). Voir src/proxy.ts.
//
// Body partiel — chaque champ est optionnel, on update ce qui est present :
// {
//   status?: Status                               -> transition (canTransition garde-fous)
//   package_paid?: boolean                        -> set/clear package_paid_at
//   package_amount_cents?: number                 -> set le montant total package en cents EUR
//   payment_method?: 'virement' | 'cash' | 'autre' | null  -> méthode de paiement post-visio
//   payment_date?: string (YYYY-MM-DD) | null     -> date de réception du paiement
//   notes_admin?: string                          -> update notes_admin
//   notes_visio?: string                          -> update notes_visio
//   referral_payout_status?: 'not_applicable' | 'pending' | 'due' | 'paid' | 'cancelled' | null
//   referral_payout_paid_at?: string (YYYY-MM-DD) | null
//   referral_payout_method?: 'virement' | 'cash' | 'autre' | null
//   contract_start_date?: string (YYYY-MM-DD) | null      -> champs contrat (carte Contrat)
//   contract_end_date?: string (YYYY-MM-DD) | null
//   contract_duration_weeks?: number (1..12) | null
//   contract_inclusions?: string                          -> 1 item par ligne
//   contract_exclusions?: string
//   contract_note?: string
//   contract_payment_deadline?: string (YYYY-MM-DD) | null
//   contract_locale?: 'fr' | 'en'
// }
// Au premier enregistrement d'un champ contrat, contract_number est attribué
// via la séquence Postgres (rpc next_contract_number) — jamais réattribué.

export const dynamic = 'force-dynamic'

const MAX_NOTES = 5000
const PAYMENT_METHODS = ['virement', 'cash', 'autre'] as const
type PaymentMethod = (typeof PAYMENT_METHODS)[number]

const REFERRAL_PAYOUT_STATUSES = ['not_applicable', 'pending', 'due', 'paid', 'cancelled'] as const
type ReferralPayoutStatus = (typeof REFERRAL_PAYOUT_STATUSES)[number]

const REFERRAL_PAYOUT_METHODS = ['virement', 'cash', 'autre'] as const
type ReferralPayoutMethod = (typeof REFERRAL_PAYOUT_METHODS)[number]

const ALLOWED_PAYOUT_TRANSITIONS: Record<ReferralPayoutStatus, ReferralPayoutStatus[]> = {
  not_applicable: [],
  pending: ['cancelled'],
  due: ['paid', 'cancelled'],
  paid: ['due'],
  cancelled: [],
}

const CONTRACT_LOCALES = ['fr', 'en'] as const
type ContractLocale = (typeof CONTRACT_LOCALES)[number]
const MAX_CONTRACT_TEXT = 8000

interface PatchBody {
  status?: string
  package_paid?: boolean
  package_amount_cents?: number
  payment_method?: PaymentMethod | null
  payment_date?: string | null
  notes_admin?: string
  notes_visio?: string
  referral_payout_status?: ReferralPayoutStatus | null
  referral_payout_paid_at?: string | null
  referral_payout_method?: ReferralPayoutMethod | null
  contract_start_date?: string | null
  contract_end_date?: string | null
  contract_duration_weeks?: number | null
  contract_inclusions?: string
  contract_exclusions?: string
  contract_note?: string
  contract_payment_deadline?: string | null
  contract_locale?: ContractLocale
}

const CONTRACT_FIELD_KEYS = [
  'contract_start_date',
  'contract_end_date',
  'contract_duration_weeks',
  'contract_inclusions',
  'contract_exclusions',
  'contract_note',
  'contract_payment_deadline',
  'contract_locale',
] as const

interface AuditEntry {
  candidature_id: string
  event: string
  from_value?: Record<string, unknown> | null
  to_value?: Record<string, unknown> | null
  data?: Record<string, unknown>
  actor_email: string
}

function badRequest(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 400 })
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params
  if (!id || id.length < 32) {
    return badRequest('id candidature invalide')
  }

  let body: PatchBody
  try {
    body = (await request.json()) as PatchBody
  } catch {
    return badRequest('Body JSON invalide')
  }

  const supabase = getSupabaseAdmin()

  // 1. Lecture de l'etat courant pour valider transitions et generer diff audit
  const { data: current, error: readError } = await supabase
    .from('candidatures')
    .select('id, status, package_paid_at, package_amount_cents, payment_method, payment_date, notes_admin, notes_visio, referral_code, referral_code_valid, referral_partner_name, referral_commission_type, referral_commission_pct, referral_bonus_eur, referral_payout_status, referral_payout_paid_at, referral_payout_method, contract_start_date, contract_end_date, contract_duration_weeks, contract_inclusions, contract_exclusions, contract_note, contract_payment_deadline, contract_locale, contract_number')
    .eq('id', id)
    .maybeSingle()

  if (readError || !current) {
    return NextResponse.json({ ok: false, error: 'Candidature introuvable' }, { status: 404 })
  }

  const updates: Record<string, unknown> = {}
  const auditEntries: AuditEntry[] = []
  const nowIso = new Date().toISOString()
  const actor = 'admin' // V1.5 : un seul role admin (cookie unique). V2 : Supabase Auth + email reel.

  // 2. Transition de status
  if (typeof body.status === 'string') {
    const next = body.status as Status
    if (!STATUS_VALUES.includes(next)) {
      return badRequest(`Status inconnu: ${body.status}`)
    }
    if (next !== current.status) {
      if (!canTransition(current.status as Status, next)) {
        return badRequest(`Transition interdite: ${current.status} -> ${next}`)
      }
      updates.status = next
      updates.status_changed_at = nowIso
      updates.status_changed_by_email = actor
      auditEntries.push({
        candidature_id: id,
        event: 'status_change',
        from_value: { status: current.status },
        to_value: { status: next },
        data: TRANSITION_REMINDER[next] ? { reminder: TRANSITION_REMINDER[next] } : {},
        actor_email: actor,
      })
    }
  }

  // 2 bis. Auto-trigger du bonus referral selon la transition de status.
  // - status -> soldee + referral_code_valid=true + payout=pending  -> payout devient 'due'.
  // - status -> annulee/refusee + payout in (pending, due)          -> payout devient 'cancelled'.
  // Si payout deja 'paid', on ne touche pas (decision business manuelle).
  if (updates.status) {
    const newStatus = updates.status as Status
    const currentPayout = current.referral_payout_status as ReferralPayoutStatus | null

    if (
      newStatus === 'soldee'
      && current.referral_code_valid === true
      && currentPayout === 'pending'
    ) {
      updates.referral_payout_status = 'due'

      // Pour un partenaire 'percent', calculer le montant depuis le CA connu a cet instant.
      // CA absent -> on passe quand meme 'due', montant restera null (flagge en UI), calcule a la saisie du CA.
      if (current.referral_commission_type === 'percent') {
        const computed = computeCommissionEur(
          { commissionType: 'percent', commissionPct: current.referral_commission_pct ?? undefined },
          // si le CA est mis a jour dans le meme PATCH, utiliser la nouvelle valeur
          typeof body.package_amount_cents === 'number'
            ? body.package_amount_cents
            : (current.package_amount_cents ?? null),
        )
        if (computed !== null) {
          updates.referral_bonus_eur = computed
        }
      }

      auditEntries.push({
        candidature_id: id,
        event: 'referral_due',
        from_value: { referral_payout_status: 'pending' },
        to_value: { referral_payout_status: 'due' },
        data: {
          partner: current.referral_partner_name,
          bonus_eur: updates.referral_bonus_eur ?? current.referral_bonus_eur,
        },
        actor_email: actor,
      })
    }

    if (
      (newStatus === 'annulee' || newStatus === 'refusee')
      && (currentPayout === 'pending' || currentPayout === 'due')
    ) {
      updates.referral_payout_status = 'cancelled'
      auditEntries.push({
        candidature_id: id,
        event: 'referral_cancelled',
        from_value: { referral_payout_status: currentPayout },
        to_value: { referral_payout_status: 'cancelled' },
        data: { reason: `candidature_${newStatus}` },
        actor_email: actor,
      })
    }
  }

  // 3. Toggle package soldé
  if (typeof body.package_paid === 'boolean') {
    const target = body.package_paid ? nowIso : null
    if (target !== current.package_paid_at) {
      updates.package_paid_at = target
      auditEntries.push({
        candidature_id: id,
        event: 'package_paid_change',
        from_value: { package_paid_at: current.package_paid_at },
        to_value: { package_paid_at: target },
        actor_email: actor,
      })
    }
  }

  // 4. Montant package
  if (typeof body.package_amount_cents === 'number' && body.package_amount_cents >= 0) {
    if (body.package_amount_cents !== current.package_amount_cents) {
      updates.package_amount_cents = body.package_amount_cents
      auditEntries.push({
        candidature_id: id,
        event: 'package_amount_change',
        from_value: { package_amount_cents: current.package_amount_cents },
        to_value: { package_amount_cents: body.package_amount_cents },
        actor_email: actor,
      })

      // Recalcul du bonus pour les partenaires 'percent' tant que le payout n'est pas fige (paid/cancelled).
      const payoutNow = (updates.referral_payout_status ?? current.referral_payout_status) as ReferralPayoutStatus | null
      if (
        current.referral_commission_type === 'percent'
        && (payoutNow === 'pending' || payoutNow === 'due')
      ) {
        const recomputed = computeCommissionEur(
          { commissionType: 'percent', commissionPct: current.referral_commission_pct ?? undefined },
          body.package_amount_cents,
        )
        const prevBonus = (updates.referral_bonus_eur ?? current.referral_bonus_eur) ?? null
        // Un CA <= 0 renvoie recomputed=null ("montant inconnu/vide") : ne PAS effacer un bonus deja calcule.
        // La seule maniere de retirer un bonus reste le flux explicite d'annulation du payout.
        if (recomputed !== null && recomputed !== prevBonus) {
          updates.referral_bonus_eur = recomputed
          auditEntries.push({
            candidature_id: id,
            event: 'referral_bonus_recomputed',
            from_value: { referral_bonus_eur: prevBonus },
            to_value: { referral_bonus_eur: recomputed },
            data: { reason: 'package_amount_change', pct: current.referral_commission_pct },
            actor_email: actor,
          })
        }
      }
    }
  }

  // 5. Méthode de paiement
  if ('payment_method' in body) {
    const next = body.payment_method
    if (next !== null && next !== undefined && !PAYMENT_METHODS.includes(next)) {
      return badRequest(`Méthode de paiement inconnue: ${next}`)
    }
    const target = next ?? null
    if (target !== current.payment_method) {
      updates.payment_method = target
      auditEntries.push({
        candidature_id: id,
        event: 'payment_method_change',
        from_value: { payment_method: current.payment_method },
        to_value: { payment_method: target },
        actor_email: actor,
      })
    }
  }

  // 6. Date de paiement
  if ('payment_date' in body) {
    const next = body.payment_date
    if (next !== null && next !== undefined && !DATE_RE.test(next)) {
      return badRequest('payment_date invalide (format attendu YYYY-MM-DD)')
    }
    const target = next ?? null
    if (target !== current.payment_date) {
      updates.payment_date = target
      auditEntries.push({
        candidature_id: id,
        event: 'payment_date_change',
        from_value: { payment_date: current.payment_date },
        to_value: { payment_date: target },
        actor_email: actor,
      })
    }
  }

  // 7 bis. Mutation manuelle du payout referral (UI admin "Marquer paye" / "Annuler le paiement").
  // Transitions autorisees (whitelist) :
  //   due -> paid       : "Marquer paye"
  //   due -> cancelled  : "Annuler ce bonus"
  //   paid -> due       : "Annuler le paiement" (revert)
  //   pending -> cancelled : retirer le partenariat avant solde
  // Les autres transitions passent par le trigger auto ci-dessus.
  if ('referral_payout_status' in body) {
    const next = body.referral_payout_status
    if (next !== null && next !== undefined && !REFERRAL_PAYOUT_STATUSES.includes(next)) {
      return badRequest(`referral_payout_status inconnu: ${next}`)
    }
    const fromState = current.referral_payout_status as ReferralPayoutStatus | null
    if (fromState && next && next !== fromState) {
      const allowed = ALLOWED_PAYOUT_TRANSITIONS[fromState] ?? []
      if (!allowed.includes(next)) {
        return badRequest(`Transition payout interdite: ${fromState} -> ${next}`)
      }
      updates.referral_payout_status = next
      auditEntries.push({
        candidature_id: id,
        event: 'referral_payout_status_change',
        from_value: { referral_payout_status: fromState },
        to_value: { referral_payout_status: next },
        actor_email: actor,
      })
    }
  }

  if ('referral_payout_paid_at' in body) {
    const next = body.referral_payout_paid_at
    if (next !== null && next !== undefined && !DATE_RE.test(next)) {
      return badRequest('referral_payout_paid_at invalide (format attendu YYYY-MM-DD)')
    }
    // Stocke en UTC midnight pour avoir une representation deterministe independante du fuseau admin.
    // La date affichee en UI = YYYY-MM-DD de cette ISO.
    const target = next ? new Date(next + 'T00:00:00.000Z').toISOString() : null
    if (target !== current.referral_payout_paid_at) {
      updates.referral_payout_paid_at = target
      auditEntries.push({
        candidature_id: id,
        event: 'referral_payout_paid_at_change',
        from_value: { referral_payout_paid_at: current.referral_payout_paid_at },
        to_value: { referral_payout_paid_at: target },
        actor_email: actor,
      })
    }
  }

  if ('referral_payout_method' in body) {
    const next = body.referral_payout_method
    if (next !== null && next !== undefined && !REFERRAL_PAYOUT_METHODS.includes(next)) {
      return badRequest(`referral_payout_method inconnue: ${next}`)
    }
    const target = next ?? null
    if (target !== current.referral_payout_method) {
      updates.referral_payout_method = target
      auditEntries.push({
        candidature_id: id,
        event: 'referral_payout_method_change',
        from_value: { referral_payout_method: current.referral_payout_method },
        to_value: { referral_payout_method: target },
        actor_email: actor,
      })
    }
  }

  // 7. Notes
  if (typeof body.notes_admin === 'string') {
    if (body.notes_admin.length > MAX_NOTES) {
      return badRequest('notes_admin trop longues')
    }
    if (body.notes_admin !== (current.notes_admin ?? '')) {
      updates.notes_admin = body.notes_admin
      auditEntries.push({
        candidature_id: id,
        event: 'notes_admin_update',
        actor_email: actor,
      })
    }
  }
  if (typeof body.notes_visio === 'string') {
    if (body.notes_visio.length > MAX_NOTES) {
      return badRequest('notes_visio trop longues')
    }
    if (body.notes_visio !== (current.notes_visio ?? '')) {
      updates.notes_visio = body.notes_visio
      auditEntries.push({
        candidature_id: id,
        event: 'notes_visio_update',
        actor_email: actor,
      })
    }
  }

  // 8 bis. Champs contrat (carte Contrat du dashboard)
  const contractFieldsInBody = CONTRACT_FIELD_KEYS.filter((k) => k in body)
  if (contractFieldsInBody.length > 0) {
    // Validation de formats
    for (const key of ['contract_start_date', 'contract_end_date', 'contract_payment_deadline'] as const) {
      if (key in body) {
        const v = body[key]
        if (v !== null && v !== undefined && !DATE_RE.test(v)) {
          return badRequest(`${key} invalide (format attendu YYYY-MM-DD)`)
        }
      }
    }
    if ('contract_duration_weeks' in body) {
      const v = body.contract_duration_weeks
      if (v !== null && v !== undefined && (!Number.isInteger(v) || v < 1 || v > 12)) {
        return badRequest('contract_duration_weeks invalide (entier entre 1 et 12)')
      }
    }
    if ('contract_locale' in body && !CONTRACT_LOCALES.includes(body.contract_locale as ContractLocale)) {
      return badRequest(`contract_locale inconnue: ${body.contract_locale}`)
    }
    for (const key of ['contract_inclusions', 'contract_exclusions', 'contract_note'] as const) {
      if (key in body && typeof body[key] === 'string' && (body[key] as string).length > MAX_CONTRACT_TEXT) {
        return badRequest(`${key} trop long (max ${MAX_CONTRACT_TEXT} caractères)`)
      }
    }

    // Validation croisée sur l'état FUSIONNÉ (valeur du body sinon valeur courante)
    const cur = current as unknown as Record<string, unknown>
    const merged = (key: (typeof CONTRACT_FIELD_KEYS)[number]) =>
      (key in body ? (body as Record<string, unknown>)[key] : cur[key]) as string | null
    const mStart = merged('contract_start_date')
    const mEnd = merged('contract_end_date')
    const mDeadline = merged('contract_payment_deadline')
    if (mStart && mEnd && mEnd < mStart) {
      return badRequest('La date de fin du séjour précède la date de début.')
    }
    if (mStart && mDeadline && mDeadline > mStart) {
      return badRequest('L’échéance de paiement doit être au plus tard le jour du début du camp.')
    }

    // Diff → updates + un seul event d'audit (pas un par champ)
    const changed: string[] = []
    for (const key of contractFieldsInBody) {
      const next = (body as Record<string, unknown>)[key] ?? null
      const prev = cur[key] ?? null
      if (next !== prev) {
        updates[key] = next
        changed.push(key)
      }
    }
    if (changed.length > 0) {
      // Attribution du n° de contrat au premier enregistrement (séquence Postgres,
      // jamais réattribué ensuite — les trous de séquence sont acceptés).
      if (cur.contract_number === null || cur.contract_number === undefined) {
        const { data: seq, error: seqError } = await supabase.rpc('next_contract_number')
        if (seqError || typeof seq !== 'number') {
          console.error('[api/admin/candidature] next_contract_number échoué', seqError)
          return NextResponse.json(
            { ok: false, error: 'Attribution du n° de contrat échouée' },
            { status: 500 },
          )
        }
        updates.contract_number = seq
      }
      auditEntries.push({
        candidature_id: id,
        event: 'contract_fields_update',
        data: { fields: changed },
        actor_email: actor,
      })
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: true, candidatureId: id, message: 'Rien à mettre à jour' })
  }

  // 8. Update et retourne le row mis a jour (pour sync client sans refetch)
  const { data: updated, error: updateError } = await supabase
    .from('candidatures')
    .update(updates)
    .eq('id', id)
    .select('id, status, status_changed_at, package_paid_at, package_amount_cents, payment_method, payment_date, notes_admin, notes_visio, referral_code, referral_code_valid, referral_partner_name, referral_partner_type, referral_bonus_eur, referral_payout_status, referral_payout_paid_at, referral_payout_method, contract_start_date, contract_end_date, contract_duration_weeks, contract_inclusions, contract_exclusions, contract_note, contract_payment_deadline, contract_locale, contract_number, contract_sent_at, contract_sent_count, contract_pdf_path')
    .single()

  if (updateError || !updated) {
    console.error('[api/admin/candidature] update failed', updateError)
    return NextResponse.json({ ok: false, error: 'Update DB échoué' }, { status: 500 })
  }

  if (auditEntries.length > 0) {
    const { error: auditError } = await supabase.from('audit_log').insert(auditEntries)
    if (auditError) {
      console.error('[api/admin/candidature] audit insert failed', auditError)
      // pas de rollback — on log mais on ne casse pas le flow user
    }
  }

  // Dossier validé → envoi auto de l'image souvenir au candidat (idempotent via
  // souvenir_sent_at, ne throw jamais). Awaité pour garantir l'exécution en serverless
  // (le travail post-réponse n'est pas fiable sur Vercel) ; ajoute ~1-2s à l'action.
  if (updates.status === 'validee') {
    await sendSouvenirIfNeeded(id)
  }

  return NextResponse.json({
    ok: true,
    candidatureId: id,
    updated: Object.keys(updates),
    candidature: updated,
  })
}

// DELETE /api/admin/candidature/[id]
// Supprime definitivement le dossier (irreversible). audit_log cascade via FK.
// Si le candidat n'a plus aucun autre dossier, on supprime aussi le candidat
// (cleanup RGPD complet, pas de PII orpheline).
export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  if (!id || id.length < 32) {
    return NextResponse.json({ ok: false, error: 'id candidature invalide' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  // 1. Recupere candidate_id pour pouvoir nettoyer en cascade
  const { data: target, error: readErr } = await supabase
    .from('candidatures')
    .select('id, candidate_id')
    .eq('id', id)
    .maybeSingle()

  if (readErr || !target) {
    return NextResponse.json({ ok: false, error: 'Candidature introuvable' }, { status: 404 })
  }

  // 2. Delete candidature (audit_log cascade via FK ON DELETE CASCADE)
  const { error: delErr } = await supabase.from('candidatures').delete().eq('id', id)
  if (delErr) {
    console.error('[api/admin/candidature DELETE] candidature delete failed', delErr)
    return NextResponse.json({ ok: false, error: 'Suppression candidature echouee' }, { status: 500 })
  }

  // 3. Check si le candidat a d'autres candidatures
  const { count, error: countErr } = await supabase
    .from('candidatures')
    .select('id', { count: 'exact', head: true })
    .eq('candidate_id', target.candidate_id)

  let candidateDeleted = false
  if (!countErr && (count ?? 0) === 0) {
    const { error: candDelErr } = await supabase
      .from('candidates')
      .delete()
      .eq('id', target.candidate_id)
    if (candDelErr) {
      console.error('[api/admin/candidature DELETE] candidate delete failed', candDelErr)
      // Pas fatal : la candidature est bien supprimee, le candidat orphelin restera
    } else {
      candidateDeleted = true
    }
  }

  return NextResponse.json({ ok: true, candidateDeleted, candidatureId: id })
}

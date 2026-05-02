import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import {
  STATUS_VALUES,
  canTransition,
  TRANSITION_REMINDER,
  type Status,
} from '@/lib/admin-transitions'

// PATCH /api/admin/candidature/[id]
// Protege par le proxy (cookie httpOnly mkr_admin). Voir src/proxy.ts.
//
// Body partiel — chaque champ est optionnel, on update ce qui est present :
// {
//   status?: Status                         -> transition (validee garde-fous)
//   fee_paid?: boolean                      -> set/clear registration_fee_paid_at
//   package_paid?: boolean                  -> set/clear package_paid_at
//   package_amount_cents?: number           -> set le montant package
//   notes_admin?: string                    -> update notes_admin
//   notes_visio?: string                    -> update notes_visio
// }

export const dynamic = 'force-dynamic'

const MAX_NOTES = 5000

interface PatchBody {
  status?: string
  fee_paid?: boolean
  package_paid?: boolean
  package_amount_cents?: number
  notes_admin?: string
  notes_visio?: string
}

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
    .select('id, status, registration_fee_paid_at, package_paid_at, package_amount_cents, notes_admin, notes_visio')
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

  // 3. Toggle frais 100€ payés
  if (typeof body.fee_paid === 'boolean') {
    const target = body.fee_paid ? nowIso : null
    if (target !== current.registration_fee_paid_at) {
      updates.registration_fee_paid_at = target
      auditEntries.push({
        candidature_id: id,
        event: 'fee_paid_change',
        from_value: { registration_fee_paid_at: current.registration_fee_paid_at },
        to_value: { registration_fee_paid_at: target },
        actor_email: actor,
      })
    }
  }

  // 4. Toggle package soldé + montant
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
    }
  }

  // 5. Notes
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

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: true, candidatureId: id, message: 'Rien à mettre à jour' })
  }

  // 6. Update + insert audit en parallele
  const { error: updateError } = await supabase
    .from('candidatures')
    .update(updates)
    .eq('id', id)

  if (updateError) {
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

  return NextResponse.json({ ok: true, candidatureId: id, updated: Object.keys(updates) })
}

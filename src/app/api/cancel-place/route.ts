import { getSupabaseAdmin } from '@/lib/supabase-admin'
import {
  buildCancelPage,
  type CancelLocale,
  type CancelPageState,
} from '@/lib/cancel-page'

// GET/POST /api/cancel-place?c=<candidatureId>&t=<cancel_token>
//
// Lien public (non authentifie) inclus dans l'email de RELANCE visio : permet au
// candidat d'abandonner lui-meme sa place. La candidature passe en `annulee` et la
// place se libere automatiquement (statut exclu de CONSUMING_STATUSES dans lib/places).
//
// Securite :
// - Jeton `cancel_token` (uuid v4, 122 bits) non devinable, propre a chaque dossier.
//   Le couple (id, token) est verifie cote serveur ; token invalide = « lien invalide ».
// - **GET = page de confirmation uniquement (AUCUNE mutation)** pour ne PAS declencher
//   d'annulation via un pre-fetch de lien (scanners Outlook/Gmail, antivirus). L'annulation
//   se fait sur un **POST explicite** (soumission du formulaire de la page).
// - Annulation possible seulement depuis le statut `recue` (aucun paiement pris). Un dossier
//   deja avance (validee/soldee...) renvoie vers contact@ (pas d'auto-annulation).
//
// La logique d'annulation reflete api/admin/candidature/[id]/route.ts (transition annulee
// + annulation du payout referral pending/due + audit). Source d'autorite : cette route admin.

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function page(state: CancelPageState, opts: { locale?: CancelLocale; id?: string; token?: string } = {}): Response {
  const { html, status } = buildCancelPage(state, opts)
  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}

interface CancelRow {
  status: string
  submission_language: 'fr' | 'en' | null
  referral_payout_status: string | null
  referral_partner_name: string | null
}

async function loadByToken(id: string, token: string): Promise<CancelRow | null> {
  if (!UUID_RE.test(id) || !UUID_RE.test(token)) return null
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('candidatures')
    .select('status, submission_language, referral_payout_status, referral_partner_name')
    .eq('id', id)
    .eq('cancel_token', token)
    .maybeSingle()
  if (error) {
    console.error('[cancel-place] load échoué', error)
    return null
  }
  return (data as CancelRow) ?? null
}

function localeOf(row: CancelRow): CancelLocale {
  return row.submission_language === 'en' ? 'en' : 'fr'
}

// GET : page de confirmation (aucune mutation).
export async function GET(request: Request) {
  const url = new URL(request.url)
  const id = url.searchParams.get('c') ?? ''
  const token = url.searchParams.get('t') ?? ''

  const row = await loadByToken(id, token)
  if (!row) return page('invalid')

  const locale = localeOf(row)
  if (row.status === 'annulee') return page('already', { locale })
  if (row.status !== 'recue') return page('not_cancellable', { locale })
  return page('confirm', { locale, id, token })
}

// POST : annulation effective (soumission du formulaire de la page de confirmation).
export async function POST(request: Request) {
  let id = ''
  let token = ''
  try {
    const form = await request.formData()
    id = String(form.get('c') ?? '')
    token = String(form.get('t') ?? '')
  } catch {
    return page('invalid')
  }

  const row = await loadByToken(id, token)
  if (!row) return page('invalid')

  const locale = localeOf(row)
  if (row.status === 'annulee') return page('already', { locale }) // idempotent
  if (row.status !== 'recue') return page('not_cancellable', { locale })

  const supabase = getSupabaseAdmin()
  const nowIso = new Date().toISOString()

  // Transition recue -> annulee. Le garde-fou .eq('status','recue') protege d'une course
  // (double soumission, ou validation admin concurrente) : 0 ligne mise a jour si le statut
  // a change entre-temps.
  const { data: updated, error: updateError } = await supabase
    .from('candidatures')
    .update({
      status: 'annulee',
      status_changed_at: nowIso,
      status_changed_by_email: 'candidate',
    })
    .eq('id', id)
    .eq('status', 'recue')
    .select('id')
    .maybeSingle()

  if (updateError) {
    console.error('[cancel-place] update échoué', updateError)
    return page('not_cancellable', { locale })
  }
  if (!updated) {
    // Statut change entre le load et l'update (course) : plus annulable ici.
    return page('not_cancellable', { locale })
  }

  // Audit + annulation du payout referral (miroir de la route admin).
  const auditEntries: Array<Record<string, unknown>> = [
    {
      candidature_id: id,
      event: 'status_change',
      from_value: { status: 'recue' },
      to_value: { status: 'annulee' },
      data: { reminder: 'Abandon volontaire : le candidat a libéré sa place depuis le lien de l\'email de relance.' },
      actor_email: 'candidate',
    },
  ]

  const payout = row.referral_payout_status
  if (payout === 'pending' || payout === 'due') {
    await supabase
      .from('candidatures')
      .update({ referral_payout_status: 'cancelled' })
      .eq('id', id)
    auditEntries.push({
      candidature_id: id,
      event: 'referral_cancelled',
      from_value: { referral_payout_status: payout },
      to_value: { referral_payout_status: 'cancelled' },
      data: { reason: 'candidature_annulee_self', partner: row.referral_partner_name },
      actor_email: 'candidate',
    })
  }

  const { error: auditError } = await supabase.from('audit_log').insert(auditEntries)
  if (auditError) {
    console.error('[cancel-place] audit insert échoué (non-fatal)', auditError)
  }

  return page('done', { locale })
}

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { buildRebookingEmail, type RebookingDiscipline } from '@/lib/rebooking-email'
import { sendMail } from '@/lib/email'
import { sessionFromId } from '@/data/sessions'

// POST /api/admin/candidature/[id]/rebooking
//
// Propose une autre session a un candidat dont le camp est parti sans lui
// (bouton « Proposer une autre session » du back office).
//
// Sequence calquee sur visio-reminder : garde-fous -> email au candidat (bcc +
// replyTo contact@) -> update rebooking_sent_at + count++ + audit_log. Si
// l'email echoue, AUCUN etat n'est modifie (502) et le bouton reste cliquable.

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const COPY_TO = process.env.MKR_EMAIL_TO || 'contact@mkrcamp.com'

const SELECT = `status, submission_language, camp_discipline, duree_semaines, tunnel_type,
   session_id, rebooking_sent_count,
   candidate:candidates ( prenom, email )`

interface RebookingRow {
  status: string
  submission_language: 'fr' | 'en' | null
  camp_discipline: RebookingDiscipline | null
  duree_semaines: number | null
  tunnel_type: 'session' | 'custom' | 'famille' | 'groupe'
  session_id: string | null
  rebooking_sent_count: number | null
  candidate:
    | { prenom: string | null; email: string | null }
    | { prenom: string | null; email: string | null }[]
    | null
}

function normalizeCandidate(
  c: RebookingRow['candidate'],
): { prenom: string | null; email: string | null } | null {
  if (!c) return null
  return Array.isArray(c) ? (c[0] ?? null) : c
}

/**
 * Le dossier doit etre encore actif sur une session DEJA PARTIE. On ne propose
 * pas un report a quelqu'un qui part dans trois semaines, ni a un dossier
 * annule ou solde.
 */
export function isRebookable(row: {
  status: string
  session_id: string | null
}, now: Date = new Date()): boolean {
  if (row.status !== 'recue' && row.status !== 'validee') return false
  const session = sessionFromId(row.session_id)
  if (!session) return false
  return session.startDate <= now.toISOString().slice(0, 10)
}

export async function POST(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  if (!id || id.length < 32) {
    return NextResponse.json({ ok: false, error: 'id candidature invalide' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('candidatures')
    .select(SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('[rebooking] load candidature échoué', error)
    return NextResponse.json({ ok: false, error: 'lecture candidature impossible' }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ ok: false, error: 'candidature introuvable' }, { status: 404 })
  }

  const row = data as unknown as RebookingRow
  const candidate = normalizeCandidate(row.candidate)
  const email = candidate?.email?.trim()
  if (!email) {
    return NextResponse.json({ ok: false, error: 'aucun email sur ce dossier' }, { status: 400 })
  }
  if (!isRebookable(row)) {
    return NextResponse.json(
      { ok: false, error: 'ce dossier n’est pas sur un camp déjà parti' },
      { status: 400 },
    )
  }

  const locale = row.submission_language === 'en' ? 'en' : 'fr'
  const { subject, html, text } = buildRebookingEmail({
    locale,
    prenom: candidate?.prenom ?? null,
    // Le discours change selon que Ruslan avait deja valide le dossier ou non.
    variant: row.status === 'validee' ? 'validee' : 'recue',
    missedSessionId: row.session_id,
    campDiscipline: row.camp_discipline,
    dureeSemaines: row.duree_semaines,
    tunnel: row.tunnel_type,
  })

  const sent = await sendMail({
    to: email,
    bcc: COPY_TO,
    replyTo: COPY_TO,
    subject,
    html,
    text,
    tag: 'rebooking',
  })
  if (!sent) {
    return NextResponse.json({ ok: false, error: 'envoi email échoué' }, { status: 502 })
  }

  const nowIso = new Date().toISOString()
  const count = (row.rebooking_sent_count ?? 0) + 1
  const { error: updateError } = await supabase
    .from('candidatures')
    .update({ rebooking_sent_at: nowIso, rebooking_sent_count: count })
    .eq('id', id)
  if (updateError) {
    console.error('[rebooking] update état échoué (email parti)', updateError)
  }

  const { error: auditError } = await supabase.from('audit_log').insert({
    candidature_id: id,
    event: 'rebooking_sent',
    to_value: { rebooking_sent_at: nowIso, rebooking_sent_count: count },
    data: { to: email, locale, count, session_id: row.session_id },
    actor_email: 'admin',
  })
  if (auditError) {
    console.error('[rebooking] audit insert échoué', auditError)
  }

  return NextResponse.json({ ok: true, sentAt: nowIso, count })
}

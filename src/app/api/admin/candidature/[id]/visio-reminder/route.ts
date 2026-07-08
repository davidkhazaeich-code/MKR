import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { buildVisioEmail, type VisioCampDiscipline } from '@/lib/visio-email'
import { sendMail } from '@/lib/email'

// POST /api/admin/candidature/[id]/visio-reminder
//
// Renvoie au candidat l'email de RELANCE (bouton « Relance visio » du back office)
// pour qu'il reserve sa visio de selection avec Ruslan. Meme template que l'email
// post-inscription (buildVisioEmail), variante 'reminder'.
//
// Sequence (calquee sur contract/send) : garde-fous -> email au candidat (bcc +
// replyTo contact@) -> update visio_reminder_sent_at + count++ + audit_log.
// Si l'email echoue : AUCUNE mise a jour d'etat (502), le bouton est re-cliquable.

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const COPY_TO = process.env.MKR_EMAIL_TO || 'contact@mkrcamp.com'
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://mkrcamp.com').replace(/\/$/, '')

interface ReminderRow {
  status: string
  submission_language: 'fr' | 'en' | null
  camp_discipline: VisioCampDiscipline | null
  duree_semaines: number | null
  visio_reminder_count: number | null
  cancel_token: string | null
  candidate:
    | { prenom: string | null; email: string | null }
    | { prenom: string | null; email: string | null }[]
    | null
}

// PostgREST peut renvoyer la relation to-one en objet ou en tableau selon l'inference.
function normalizeCandidate(
  c: ReminderRow['candidate'],
): { prenom: string | null; email: string | null } | null {
  if (!c) return null
  return Array.isArray(c) ? (c[0] ?? null) : c
}

export async function POST(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  if (!id || id.length < 32) {
    return NextResponse.json({ ok: false, error: 'id candidature invalide' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('candidatures')
    .select(
      `status, submission_language, camp_discipline, duree_semaines, visio_reminder_count, cancel_token,
       candidate:candidates ( prenom, email )`,
    )
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('[visio-reminder] load candidature échoué', error)
    return NextResponse.json({ ok: false, error: 'Erreur base de données' }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ ok: false, error: 'Candidature introuvable' }, { status: 404 })
  }

  const row = data as unknown as ReminderRow
  const candidate = normalizeCandidate(row.candidate)
  const email = candidate?.email ?? null

  // Garde-fous (miroir de la carte admin ; le serveur reste l'autorite).
  if (row.status !== 'recue') {
    return NextResponse.json(
      { ok: false, error: 'Le rappel visio ne s\'envoie que sur un dossier en attente (statut Reçue).' },
      { status: 400 },
    )
  }
  if (!email) {
    return NextResponse.json({ ok: false, error: 'Email du candidat manquant.' }, { status: 400 })
  }

  const locale: 'fr' | 'en' = row.submission_language === 'en' ? 'en' : 'fr'
  const cancelUrl = row.cancel_token
    ? `${SITE_URL}/api/cancel-place?c=${id}&t=${row.cancel_token}`
    : undefined
  const { subject, html, text } = buildVisioEmail({
    prenom: candidate?.prenom ?? null,
    campDiscipline: row.camp_discipline ?? null,
    dureeSemaines: row.duree_semaines ?? null,
    locale,
    variant: 'reminder',
    cancelUrl,
  })

  const sent = await sendMail({
    to: email,
    bcc: COPY_TO,
    replyTo: COPY_TO,
    subject,
    html,
    text,
    tag: 'visio-reminder',
  })
  if (!sent) {
    return NextResponse.json(
      { ok: false, error: 'Envoi email échoué (Resend). Vérifie RESEND_API_KEY puis réessaye.' },
      { status: 502 },
    )
  }

  // Etat + audit (apres envoi reussi uniquement).
  const nowIso = new Date().toISOString()
  const nextCount = (row.visio_reminder_count ?? 0) + 1
  const { data: updated, error: updateError } = await supabase
    .from('candidatures')
    .update({ visio_reminder_sent_at: nowIso, visio_reminder_count: nextCount })
    .eq('id', id)
    .select('visio_reminder_sent_at, visio_reminder_count')
    .single()

  if (updateError || !updated) {
    // L'email est parti : on log fort mais on ne presente pas ca comme un echec d'envoi.
    console.error('[visio-reminder] update candidature échoué APRÈS envoi email', updateError)
  }

  const { error: auditError } = await supabase.from('audit_log').insert({
    candidature_id: id,
    event: 'visio_reminder_sent',
    to_value: { visio_reminder_sent_at: nowIso, visio_reminder_count: nextCount },
    data: { to: email, locale, count: nextCount },
    actor_email: 'admin',
  })
  if (auditError) {
    console.error('[visio-reminder] audit insert échoué', auditError)
  }

  return NextResponse.json({
    ok: true,
    candidatureId: id,
    reminder: updated ?? { visio_reminder_sent_at: nowIso, visio_reminder_count: nextCount },
  })
}

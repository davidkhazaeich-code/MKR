import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { escapeHtml, sendMail } from '@/lib/email'
import { buildVisioEmail, type VisioCampDiscipline } from '@/lib/visio-email'
import {
  buildDigestData,
  formatDigestSlack,
  selectVisioReminders,
  type AutomationRow,
} from '@/lib/automation/selectors'

// Cron quotidien d'automatisation email — cf. PLAN_EMAIL_AUTOMATION.md.
//
// Garde-fous (plan §5) :
//   1. CRON_SECRET obligatoire (header Authorization envoye par Vercel Cron).
//   2. Hors production (previews partagent la DB de prod !) -> dry-run force.
//   3. EMAIL_AUTOMATION_ENABLED != 'true' -> dry-run (le digest Slack part quand
//      meme : c'est du monitoring interne, jamais un email candidat).
//   4. Verrou optimiste AVANT chaque envoi (UPDATE conditionnel sur le compteur)
//      -> pas de double envoi meme si cron double ou course avec le bouton manuel.
//   5. Cap d'envois par run dans le selecteur (SEND_CAP_PER_RUN).
// Rollback : flipper EMAIL_AUTOMATION_ENABLED=false dans Vercel, effet au run suivant.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const COPY_TO = process.env.MKR_EMAIL_TO || 'contact@mkrcamp.com'
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://mkrcamp.com').replace(/\/$/, '')

const SELECT_FIELDS = `id, status, created_at, status_changed_at, submission_language,
  camp_discipline, duree_semaines, cancel_token, session_id,
  visio_booked_at, visio_reminder_sent_at, visio_reminder_count,
  contract_sent_at, contract_payment_deadline, package_paid_at, payment_method,
  candidate:candidates ( prenom, email )`

export async function GET(request: Request) {
  const started = Date.now()

  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const isProd = process.env.VERCEL_ENV === 'production'
  const automationEnabled = process.env.EMAIL_AUTOMATION_ENABLED === 'true'
  const dryRun = !isProd || !automationEnabled

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('candidatures')
    .select(SELECT_FIELDS)
    .in('status', ['recue', 'validee', 'soldee'])

  if (error) {
    console.error('[cron/daily-emails] load candidatures échoué', error)
    return NextResponse.json({ ok: false, error: 'Erreur base de données' }, { status: 500 })
  }

  const rows = (data ?? []) as unknown as AutomationRow[]
  const now = new Date()

  // --- A1 : relances visio automatiques -----------------------------------
  const targets = selectVisioReminders(rows, now)
  const sentVisio: string[] = []
  const wouldSendVisio: string[] = []
  const failures: string[] = []

  for (const t of targets) {
    const label = `${t.prenom ?? '?'} (${t.email}) — relance ${t.expectedCount + 1}`
    if (dryRun) {
      wouldSendVisio.push(label)
      continue
    }

    // Verrou optimiste : on reclame la cible AVANT d'envoyer. Si le compteur a
    // bouge (bouton manuel, autre run), zero ligne -> on saute sans envoyer.
    const nowIso = new Date().toISOString()
    const { data: claimed, error: claimError } = await supabase
      .from('candidatures')
      .update({ visio_reminder_sent_at: nowIso, visio_reminder_count: t.expectedCount + 1 })
      .eq('id', t.id)
      .eq('status', 'recue')
      .eq('visio_reminder_count', t.expectedCount)
      .is('visio_booked_at', null)
      .select('id')
      .maybeSingle()

    if (claimError) {
      console.error('[cron/daily-emails] claim échoué', t.id, claimError)
      failures.push(`${label} [claim]`)
      continue
    }
    if (!claimed) continue // course perdue : quelqu'un d'autre a agi, c'est OK

    const { subject, html, text } = buildVisioEmail({
      prenom: t.prenom,
      campDiscipline: (t.campDiscipline as VisioCampDiscipline | null) ?? null,
      dureeSemaines: t.dureeSemaines,
      locale: t.locale,
      variant: 'reminder',
      cancelUrl: t.cancelToken ? `${SITE_URL}/api/cancel-place?c=${t.id}&t=${t.cancelToken}` : undefined,
    })

    const sent = await sendMail({
      to: t.email,
      bcc: COPY_TO,
      replyTo: COPY_TO,
      subject,
      html,
      text,
      tag: 'visio-reminder-auto',
    })

    if (!sent) {
      // Envoi KO : on relache le verrou (best effort) pour retenter demain.
      failures.push(label)
      await supabase
        .from('candidatures')
        .update({ visio_reminder_count: t.expectedCount })
        .eq('id', t.id)
        .eq('visio_reminder_count', t.expectedCount + 1)
      continue
    }

    sentVisio.push(label)
    const { error: auditError } = await supabase.from('audit_log').insert({
      candidature_id: t.id,
      event: 'visio_reminder_sent',
      to_value: { visio_reminder_sent_at: nowIso, visio_reminder_count: t.expectedCount + 1 },
      data: { to: t.email, locale: t.locale, count: t.expectedCount + 1, auto: true },
      actor_email: 'system-cron',
    })
    if (auditError) console.error('[cron/daily-emails] audit insert échoué', auditError)
  }

  // --- B1 : digest interne (toujours en prod — heartbeat) ------------------
  // Canal : Slack si SLACK_WEBHOOK_URL est configuree, sinon FALLBACK EMAIL a
  // contact@mkrcamp.com (constat 2026-07-09 : la var Slack n'a jamais ete posee,
  // ni en local ni sur Vercel — l'email garantit que le heartbeat vit quand meme).
  const digest = buildDigestData(rows, now)
  const digestText = formatDigestSlack(digest, { dryRun, automationEnabled, sentVisio, wouldSendVisio })
  let digestPosted = false
  let digestChannel: 'slack' | 'email' | 'none' = 'none'
  if (isProd) {
    digestPosted = await postSlack(digestText)
    if (digestPosted) {
      digestChannel = 'slack'
    } else {
      const today = now.toLocaleDateString('fr-CH', { timeZone: 'Europe/Zurich' })
      digestPosted = await sendMail({
        to: COPY_TO,
        subject: `[MKR digest] Pipeline candidatures — ${today}`,
        html: `<pre style="font-family:ui-monospace,Menlo,monospace;font-size:13px;line-height:1.6;white-space:pre-wrap">${escapeHtml(digestText)}</pre>`,
        text: digestText,
        tag: 'digest-interne',
      })
      if (digestPosted) digestChannel = 'email'
    }
  }

  const summary = {
    ok: true,
    dryRun,
    automationEnabled,
    isProd,
    sentVisio,
    wouldSendVisio,
    failures,
    digest: {
      posted: digestPosted,
      channel: digestChannel,
      recueSansVisio: digest.recueSansVisio.length,
      valideeSansContrat: digest.valideeSansContrat.length,
      contratSansDeadline: digest.contratSansDeadline.length,
      impayes: digest.impayes.length,
    },
    tookMs: Date.now() - started,
  }
  console.log('[cron/daily-emails]', JSON.stringify(summary))
  return NextResponse.json(summary)
}

async function postSlack(text: string): Promise<boolean> {
  const url = process.env.SLACK_WEBHOOK_URL
  if (!url) return false
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 3000)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    })
    return res.ok
  } catch (err) {
    console.error('[cron/daily-emails] slack digest échoué (non-fatal)', err)
    return false
  } finally {
    clearTimeout(timeout)
  }
}

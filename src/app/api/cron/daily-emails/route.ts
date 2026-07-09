import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { escapeHtml, sendMail } from '@/lib/email'
import { buildVisioEmail, type VisioCampDiscipline } from '@/lib/visio-email'
import { buildPaymentEmail } from '@/lib/payment-email'
import { buildPredepartureEmail } from '@/lib/predeparture-email'
import {
  buildDigestData,
  formatDigestSlack,
  selectPaymentReminders,
  selectPredeparture,
  selectVisioReminders,
} from '@/lib/automation/selectors'
import type { AutomationRow } from '@/lib/automation/selectors'

// Cron quotidien d'automatisation email — cf. PLAN_EMAIL_AUTOMATION.md.
// Sequences candidat : A2 rappels paiement, A1 relances visio, A3 pre-depart
// (ordre = priorite : paiement > visio > pre-depart, 1 email max par candidat
// et par run). B1 digest interne toujours envoye en prod (heartbeat).
//
// Garde-fous (plan §5) :
//   1. CRON_SECRET obligatoire (header Authorization envoye par Vercel Cron).
//   2. Hors production (previews partagent la DB de prod !) -> dry-run force.
//   3. EMAIL_AUTOMATION_ENABLED != 'true' -> dry-run (digest non concerne).
//   4. Verrou optimiste AVANT chaque envoi (UPDATE conditionnel) -> zero double
//      envoi meme si cron double ou course avec une action manuelle.
//   5. Cap d'envois par run dans les selecteurs (SEND_CAP_PER_RUN).
// Rollback : EMAIL_AUTOMATION_ENABLED=false dans Vercel, effet au run suivant.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const COPY_TO = process.env.MKR_EMAIL_TO || 'contact@mkrcamp.com'
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://mkrcamp.com').replace(/\/$/, '')

const SELECT_FIELDS = `id, status, created_at, status_changed_at, submission_language,
  camp_discipline, duree_semaines, cancel_token, session_id,
  visio_booked_at, visio_reminder_sent_at, visio_reminder_count,
  contract_sent_at, contract_payment_deadline, package_paid_at, payment_method,
  package_amount_cents, contract_number, contract_start_date,
  payment_reminder_sent_at, payment_reminder_count, predeparture_sent_at,
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

  // 1 email max par candidat par run, priorite paiement > visio > pre-depart.
  const servedEmails = new Set<string>()

  const sentPayment: string[] = []
  const wouldSendPayment: string[] = []
  const sentVisio: string[] = []
  const wouldSendVisio: string[] = []
  const sentPredeparture: string[] = []
  const wouldSendPredeparture: string[] = []
  const failures: string[] = []

  // --- A2 : rappels de paiement (le levier cash, en premier) ---------------
  for (const t of selectPaymentReminders(rows, now)) {
    const label = `${t.prenom ?? '?'} (${t.email}) · palier ${t.stage} · échéance ${t.deadline}`
    if (servedEmails.has(t.email)) continue
    if (dryRun) {
      servedEmails.add(t.email)
      wouldSendPayment.push(label)
      continue
    }

    const nowIso = new Date().toISOString()
    const { data: claimed, error: claimError } = await supabase
      .from('candidatures')
      .update({ payment_reminder_sent_at: nowIso, payment_reminder_count: t.expectedCount + 1 })
      .eq('id', t.id)
      .eq('status', 'validee')
      .eq('payment_reminder_count', t.expectedCount)
      .is('package_paid_at', null)
      .select('id')
      .maybeSingle()
    if (claimError) {
      console.error('[cron/daily-emails] claim paiement échoué', t.id, claimError)
      failures.push(`${label} [claim]`)
      continue
    }
    if (!claimed) continue

    const { subject, html, text } = buildPaymentEmail({
      locale: t.locale,
      prenom: t.prenom,
      amountCents: t.amountCents,
      deadline: t.deadline,
      contractNumber: t.contractNumber,
      stage: t.stage,
    })
    const sent = await sendMail({
      to: t.email,
      bcc: COPY_TO,
      replyTo: COPY_TO,
      subject,
      html,
      text,
      tag: 'payment-reminder',
    })
    if (!sent) {
      failures.push(label)
      await supabase
        .from('candidatures')
        .update({ payment_reminder_count: t.expectedCount })
        .eq('id', t.id)
        .eq('payment_reminder_count', t.expectedCount + 1)
      continue
    }

    servedEmails.add(t.email)
    sentPayment.push(label)
    await insertAudit(supabase, t.id, 'payment_reminder_sent', {
      payment_reminder_sent_at: nowIso,
      payment_reminder_count: t.expectedCount + 1,
    }, { to: t.email, locale: t.locale, stage: t.stage, deadline: t.deadline, auto: true })
  }

  // --- A1 : relances visio --------------------------------------------------
  for (const t of selectVisioReminders(rows, now)) {
    const label = `${t.prenom ?? '?'} (${t.email}) · relance ${t.expectedCount + 1}`
    if (servedEmails.has(t.email)) continue
    if (dryRun) {
      servedEmails.add(t.email)
      wouldSendVisio.push(label)
      continue
    }

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
      console.error('[cron/daily-emails] claim visio échoué', t.id, claimError)
      failures.push(`${label} [claim]`)
      continue
    }
    if (!claimed) continue

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
      failures.push(label)
      await supabase
        .from('candidatures')
        .update({ visio_reminder_count: t.expectedCount })
        .eq('id', t.id)
        .eq('visio_reminder_count', t.expectedCount + 1)
      continue
    }

    servedEmails.add(t.email)
    sentVisio.push(label)
    await insertAudit(supabase, t.id, 'visio_reminder_sent', {
      visio_reminder_sent_at: nowIso,
      visio_reminder_count: t.expectedCount + 1,
    }, { to: t.email, locale: t.locale, count: t.expectedCount + 1, auto: true })
  }

  // --- A3 : infos pratiques pre-depart --------------------------------------
  for (const t of selectPredeparture(rows, now)) {
    const label = `${t.prenom ?? '?'} (${t.email}) · départ ${t.startDate}`
    if (servedEmails.has(t.email)) continue
    if (dryRun) {
      servedEmails.add(t.email)
      wouldSendPredeparture.push(label)
      continue
    }

    const nowIso = new Date().toISOString()
    const { data: claimed, error: claimError } = await supabase
      .from('candidatures')
      .update({ predeparture_sent_at: nowIso })
      .eq('id', t.id)
      .eq('status', 'soldee')
      .is('predeparture_sent_at', null)
      .select('id')
      .maybeSingle()
    if (claimError) {
      console.error('[cron/daily-emails] claim pré-départ échoué', t.id, claimError)
      failures.push(`${label} [claim]`)
      continue
    }
    if (!claimed) continue

    const { subject, html, text } = buildPredepartureEmail({
      locale: t.locale,
      prenom: t.prenom,
      startDate: t.startDate,
      dureeSemaines: t.dureeSemaines,
    })
    const sent = await sendMail({
      to: t.email,
      bcc: COPY_TO,
      replyTo: COPY_TO,
      subject,
      html,
      text,
      tag: 'predeparture',
    })
    if (!sent) {
      failures.push(label)
      await supabase
        .from('candidatures')
        .update({ predeparture_sent_at: null })
        .eq('id', t.id)
      continue
    }

    servedEmails.add(t.email)
    sentPredeparture.push(label)
    await insertAudit(supabase, t.id, 'predeparture_sent', { predeparture_sent_at: nowIso }, {
      to: t.email,
      locale: t.locale,
      start_date: t.startDate,
      auto: true,
    })
  }

  // --- B1 : digest interne (toujours en prod — heartbeat) --------------------
  // Canal : Slack si SLACK_WEBHOOK_URL est configuree, sinon FALLBACK EMAIL a
  // contact@mkrcamp.com (constat 2026-07-09 : la var Slack n'a jamais ete posee).
  const digest = buildDigestData(rows, now)
  const digestText = formatDigestSlack(digest, {
    dryRun,
    automationEnabled,
    sentVisio,
    wouldSendVisio,
    sentPayment,
    wouldSendPayment,
    sentPredeparture,
    wouldSendPredeparture,
  })
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
        subject: `[MKR digest] Pipeline candidatures · ${today}`,
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
    sentPayment,
    wouldSendPayment,
    sentVisio,
    wouldSendVisio,
    sentPredeparture,
    wouldSendPredeparture,
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

type SupabaseAdmin = ReturnType<typeof getSupabaseAdmin>

async function insertAudit(
  supabase: SupabaseAdmin,
  candidatureId: string,
  event: string,
  toValue: Record<string, unknown>,
  data: Record<string, unknown>,
): Promise<void> {
  const { error } = await supabase.from('audit_log').insert({
    candidature_id: candidatureId,
    event,
    to_value: toValue,
    data,
    actor_email: 'system-cron',
  })
  if (error) console.error('[cron/daily-emails] audit insert échoué', event, error)
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

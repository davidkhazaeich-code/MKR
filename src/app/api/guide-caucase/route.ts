import { NextResponse, after } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { sendMail, wrapEmail, row } from '@/lib/email'
import { buildGuideEmail, type GuideEmailLocale } from '@/lib/guide-email'
import { rateLimit, clientIp as rlClientIp } from '@/lib/rate-limit'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_EMAIL = 254
const MAX_STR = 200

type Payload = {
  email?: string
  locale?: string
  submission_language?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  referrer?: string
  _hp?: string
}

function badRequest(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 400 })
}

function safe(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim().slice(0, MAX_STR)
  return trimmed.length > 0 ? trimmed : null
}

export async function POST(request: Request) {
  // Rate-limit IP : 5 telechargements par 15 min suffit largement pour les vrais users.
  const ip = rlClientIp(request)
  const rl = rateLimit({ key: `guide:${ip}`, limit: 5, windowSeconds: 900 })
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: `Trop de tentatives. Reessaie dans ${Math.ceil(rl.resetIn / 60)} min.` },
      { status: 429 },
    )
  }

  let body: Payload
  try {
    body = (await request.json()) as Payload
  } catch {
    return badRequest('Body JSON invalide')
  }

  // Honeypot : reponse 200 fake pour ne pas signaler aux bots.
  if (typeof body._hp === 'string' && body._hp.trim().length > 0) {
    return NextResponse.json({ ok: true, downloadUrl: '/guide-caucase.pdf' })
  }

  const email = body.email?.trim().toLowerCase()
  if (!email || email.length > MAX_EMAIL || !EMAIL_RE.test(email)) {
    return badRequest('Email invalide')
  }

  const supabase = getSupabaseAdmin()
  // Langue de soumission du formulaire ('fr' par defaut, 'en' si page EN).
  const submissionLanguage: 'fr' | 'en' = body.submission_language === 'en' ? 'en' : 'fr'
  const row = {
    email,
    locale: safe(body.locale) ?? 'fr',
    submission_language: submissionLanguage,
    source: 'guide-caucase',
    utm_source: safe(body.utm_source),
    utm_medium: safe(body.utm_medium),
    utm_campaign: safe(body.utm_campaign),
    utm_term: safe(body.utm_term),
    utm_content: safe(body.utm_content),
    referrer: safe(body.referrer),
    ip,
    user_agent: request.headers.get('user-agent'),
  }

  const { error } = await supabase
    .from('guide_leads')
    .upsert(row, { onConflict: 'email,source', ignoreDuplicates: false })

  if (error) {
    console.error('[api/guide-caucase] upsert failed', error)
    return NextResponse.json(
      { ok: false, error: 'Impossible d enregistrer la demande' },
      { status: 500 },
    )
  }

  // Notifs : Slack + email interne + email lead (C0, transactionnel). Via after()
  // pour partir APRES la reponse sans etre tuees par le gel de la lambda.
  // (Bug historique corrige 2026-07-09 : Promise.all non awaite -> les notifs de
  // cette route ne partaient JAMAIS en serverless. Ne pas retirer le after().)
  after(async () => {
    await Promise.all([
      notifySlack({ email, utm_source: row.utm_source }).catch((err) => {
        console.error('[api/guide-caucase] slack notify failed (non-fatal)', err)
      }),
      notifyEmail({ email, utm_source: row.utm_source, locale: row.locale }).catch((err) => {
        console.error('[api/guide-caucase] email notify failed (non-fatal)', err)
      }),
      notifyLead({ email, locale: submissionLanguage }).catch((err) => {
        console.error('[api/guide-caucase] lead email failed (non-fatal)', err)
      }),
    ])
  })

  return NextResponse.json({ ok: true, downloadUrl: '/guide-caucase.pdf' })
}

// C0 (PLAN_EMAIL_AUTOMATION.md §4) : email « Ton guide » au lead. UN seul envoi,
// transactionnel (il vient de demander le guide) — toute sequence nurture derriere
// exigerait l'opt-in newsletter (C1). Reply-to = boite humaine contact@.
async function notifyLead(p: { email: string; locale: GuideEmailLocale }) {
  const { subject, html, text } = buildGuideEmail(p.locale)
  await sendMail({
    to: p.email,
    replyTo: process.env.MKR_EMAIL_TO || 'contact@mkrcamp.com',
    subject,
    html,
    text,
    tag: 'guide-lead',
  })
}

async function notifyEmail(p: { email: string; utm_source: string | null; locale: string }) {
  const bodyHtml = `
    <table style="width:100%;border-collapse:collapse;background:#0b1220;border:1px solid #1e293b;border-radius:6px">
      ${row('Email', p.email)}
      ${row('Locale', p.locale)}
      ${row('UTM source', p.utm_source)}
    </table>
    <p style="margin:16px 0 0;color:#94a3b8;font-size:13px;line-height:1.6">
      Le PDF a ete telecharge automatiquement. Lead capture dans Supabase table <code style="background:#020617;padding:2px 6px;border-radius:3px">guide_leads</code>.
    </p>
  `
  const html = wrapEmail('Nouveau lead Guide Caucase', bodyHtml, 'Notif automatique envoyee par /api/guide-caucase.')
  await sendMail({
    subject: `[MKR guide] Nouveau lead — ${p.email}`,
    html,
    text: `Nouveau lead Guide Caucase\nEmail : ${p.email}\nUTM : ${p.utm_source ?? '-'}`,
    replyTo: p.email,
    tag: 'guide-caucase',
  })
}

async function notifySlack(p: { email: string; utm_source: string | null }) {
  const url = process.env.SLACK_WEBHOOK_URL
  if (!url) return
  const text = [
    '*Nouveau lead Guide Caucase*',
    `Email : ${p.email}`,
    p.utm_source ? `Source : ${p.utm_source}` : null,
  ].filter(Boolean).join('\n')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 2000)
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }
}

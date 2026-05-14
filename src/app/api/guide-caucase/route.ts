import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_EMAIL = 254
const MAX_STR = 200

type Payload = {
  email?: string
  locale?: string
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

function clientIp(request: Request): string | null {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]?.trim() ?? null
  return request.headers.get('x-real-ip')
}

function safe(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim().slice(0, MAX_STR)
  return trimmed.length > 0 ? trimmed : null
}

export async function POST(request: Request) {
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
  const row = {
    email,
    locale: safe(body.locale) ?? 'fr',
    source: 'guide-caucase',
    utm_source: safe(body.utm_source),
    utm_medium: safe(body.utm_medium),
    utm_campaign: safe(body.utm_campaign),
    utm_term: safe(body.utm_term),
    utm_content: safe(body.utm_content),
    referrer: safe(body.referrer),
    ip: clientIp(request),
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

  // Slack fire-and-forget, ne bloque jamais.
  notifySlack({ email, utm_source: row.utm_source }).catch((err) => {
    console.error('[api/guide-caucase] slack notify failed (non-fatal)', err)
  })

  return NextResponse.json({ ok: true, downloadUrl: '/guide-caucase.pdf' })
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

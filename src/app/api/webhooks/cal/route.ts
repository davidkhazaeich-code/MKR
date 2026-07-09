import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// Webhook Cal.com -> tracking de la reservation visio en base.
// Cf. PLAN_EMAIL_AUTOMATION.md §3 B2. Prerequis de la relance visio auto (A1) :
// sans ce signal, on ne peut pas savoir qu'un candidat a deja reserve.
//
// Config cote Cal (compte Ruslan, cal.com/ruslan-mukhtarov-mkr) :
//   Settings -> Developer -> Webhooks -> New
//   URL : https://mkrcamp.com/api/webhooks/cal
//   Events : BOOKING_CREATED, BOOKING_CANCELLED, BOOKING_RESCHEDULED
//   Secret : valeur de CAL_WEBHOOK_SECRET (env Vercel)
//
// Toujours repondre 200 apres une signature valide (Cal retente sur non-2xx :
// un bug de matching ne doit pas declencher une tempete de retries).

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface CalAttendee {
  email?: string
  name?: string
}

interface CalPayload {
  triggerEvent?: string
  payload?: {
    uid?: string
    bookingId?: number | string
    rescheduleUid?: string
    attendees?: CalAttendee[]
    organizer?: { email?: string }
    startTime?: string
  }
}

export async function POST(request: Request) {
  const secret = process.env.CAL_WEBHOOK_SECRET
  if (!secret) {
    // Pas configure : on refuse proprement (503) pour le voir dans Cal.
    return NextResponse.json({ ok: false, error: 'Webhook non configuré' }, { status: 503 })
  }

  const raw = await request.text()
  const signature = request.headers.get('x-cal-signature-256') ?? ''
  const expected = createHmac('sha256', secret).update(raw).digest('hex')
  if (!safeEqual(signature, expected)) {
    return NextResponse.json({ ok: false, error: 'Signature invalide' }, { status: 401 })
  }

  let body: CalPayload
  try {
    body = JSON.parse(raw) as CalPayload
  } catch {
    return NextResponse.json({ ok: true, ignored: 'body non JSON' })
  }

  const event = body.triggerEvent ?? ''
  const p = body.payload ?? {}
  const uid = p.uid ?? (p.bookingId != null ? String(p.bookingId) : null)
  const attendeeEmail = p.attendees?.[0]?.email?.trim().toLowerCase() ?? null
  const supabase = getSupabaseAdmin()

  try {
    if (event === 'BOOKING_CREATED') {
      if (!attendeeEmail) return NextResponse.json({ ok: true, ignored: 'pas d email attendee' })

      // Matching : candidat par email -> candidature 'recue' la plus recente.
      const { data: candidate } = await supabase
        .from('candidates')
        .select('id, prenom')
        .ilike('email', attendeeEmail)
        .maybeSingle()

      if (!candidate) {
        await postSlack(`[Cal] Visio réservée sans candidature correspondante : ${attendeeEmail}`)
        return NextResponse.json({ ok: true, matched: false })
      }

      const { data: candidature } = await supabase
        .from('candidatures')
        .select('id, status')
        .eq('candidate_id', candidate.id)
        .in('status', ['recue', 'validee'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!candidature) {
        await postSlack(`[Cal] Visio réservée mais aucune candidature active : ${attendeeEmail}`)
        return NextResponse.json({ ok: true, matched: false })
      }

      const nowIso = new Date().toISOString()
      await supabase
        .from('candidatures')
        .update({ visio_booked_at: nowIso, visio_booking_uid: uid })
        .eq('id', candidature.id)
      await supabase.from('audit_log').insert({
        candidature_id: candidature.id,
        event: 'visio_booked',
        to_value: { visio_booked_at: nowIso, visio_booking_uid: uid },
        data: { email: attendeeEmail, start_time: p.startTime ?? null },
        actor_email: 'cal-webhook',
      })
      await postSlack(`[Cal] ${candidate.prenom ?? attendeeEmail} a réservé sa visio de sélection`)
      return NextResponse.json({ ok: true, matched: true })
    }

    if (event === 'BOOKING_CANCELLED') {
      // Match par uid d'abord (fiable), fallback email.
      const match = uid
        ? await supabase.from('candidatures').select('id').eq('visio_booking_uid', uid).maybeSingle()
        : { data: null }
      let candidatureId = match.data?.id ?? null

      if (!candidatureId && attendeeEmail) {
        const { data: candidate } = await supabase
          .from('candidates').select('id').ilike('email', attendeeEmail).maybeSingle()
        if (candidate) {
          const { data: cand } = await supabase
            .from('candidatures')
            .select('id')
            .eq('candidate_id', candidate.id)
            .not('visio_booked_at', 'is', null)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          candidatureId = cand?.id ?? null
        }
      }

      if (candidatureId) {
        await supabase
          .from('candidatures')
          .update({ visio_booked_at: null, visio_booking_uid: null })
          .eq('id', candidatureId)
        await supabase.from('audit_log').insert({
          candidature_id: candidatureId,
          event: 'visio_booking_cancelled',
          to_value: { visio_booked_at: null },
          data: { email: attendeeEmail, uid },
          actor_email: 'cal-webhook',
        })
        await postSlack(`[Cal] Visio ANNULÉE : ${attendeeEmail ?? uid} · le candidat redevient relançable`)
      }
      return NextResponse.json({ ok: true, matched: Boolean(candidatureId) })
    }

    if (event === 'BOOKING_RESCHEDULED') {
      // Toujours reserve : on rafraichit l'uid (nouveau booking) sans toucher au flag.
      const oldUid = p.rescheduleUid ?? null
      const nowIso = new Date().toISOString()
      if (oldUid && uid) {
        await supabase
          .from('candidatures')
          .update({ visio_booked_at: nowIso, visio_booking_uid: uid })
          .eq('visio_booking_uid', oldUid)
      }
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: true, ignored: event })
  } catch (err) {
    console.error('[webhooks/cal] traitement échoué (200 quand même, pas de retry storm)', err)
    return NextResponse.json({ ok: true, error: 'traitement partiel' })
  }
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ba.length !== bb.length) return false
  return timingSafeEqual(ba, bb)
}

async function postSlack(text: string): Promise<void> {
  const url = process.env.SLACK_WEBHOOK_URL
  if (!url) return
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 2000)
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    })
  } catch {
    // non-fatal
  } finally {
    clearTimeout(timeout)
  }
}

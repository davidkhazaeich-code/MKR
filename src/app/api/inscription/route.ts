import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const VALID_TUNNELS = ['session', 'custom', 'famille', 'groupe'] as const
type TunnelType = (typeof VALID_TUNNELS)[number]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Limites max pour eviter les payloads abusifs.
const MAX_NAME = 60
const MAX_EMAIL = 254
const MAX_PHONE = 30
const MAX_COUNTRY = 60
const MAX_CITY = 80
const MAX_FORM_DATA_BYTES = 20_000 // 20KB
const DEDUP_WINDOW_SECONDS = 60

type CandidatePayload = {
  prenom?: string
  nom?: string
  email?: string
  telephone?: string
  date_naissance?: string
  pays?: string
  ville_depart?: string
}

type InscriptionPayload = {
  tunnel_type?: string
  candidate?: CandidatePayload
  session_id?: string | null
  duree_semaines?: number | null
  date_debut_souhaitee?: string | null
  form_data?: Record<string, unknown>
  // Honeypot : champ invisible pour utilisateurs humains, rempli par bots.
  _hp?: string
}

function badRequest(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 400 })
}

function tooBig(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 413 })
}

function tooMany(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 429 })
}

function clientIp(request: Request): string | null {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]?.trim() ?? null
  return request.headers.get('x-real-ip')
}

export async function POST(request: Request) {
  let body: InscriptionPayload
  try {
    body = (await request.json()) as InscriptionPayload
  } catch {
    return badRequest('Body JSON invalide')
  }

  // 1. Honeypot. Reponse 200 fake pour pas signaler aux bots qu'on les detecte.
  if (typeof body._hp === 'string' && body._hp.trim().length > 0) {
    return NextResponse.json({ ok: true, candidatureId: 'noop', createdAt: new Date().toISOString() })
  }

  const tunnel = body.tunnel_type
  if (!tunnel || !VALID_TUNNELS.includes(tunnel as TunnelType)) {
    return badRequest('tunnel_type invalide')
  }

  const candidate = body.candidate ?? {}
  const prenom = candidate.prenom?.trim()
  const nom = candidate.nom?.trim()
  const email = candidate.email?.trim().toLowerCase()

  if (!prenom || !nom || !email) {
    return badRequest('prenom, nom et email obligatoires')
  }
  if (prenom.length > MAX_NAME || nom.length > MAX_NAME) {
    return badRequest('Prenom ou nom trop long')
  }
  if (email.length > MAX_EMAIL || !EMAIL_RE.test(email)) {
    return badRequest('Email invalide')
  }
  if (candidate.telephone && candidate.telephone.length > MAX_PHONE) {
    return badRequest('Telephone trop long')
  }
  if (candidate.pays && candidate.pays.length > MAX_COUNTRY) {
    return badRequest('Pays trop long')
  }
  if (candidate.ville_depart && candidate.ville_depart.length > MAX_CITY) {
    return badRequest('Ville trop longue')
  }

  // 2. Limite taille form_data (defense en profondeur, JSON deja parse au-dessus).
  const formData = body.form_data ?? {}
  const formDataSize = JSON.stringify(formData).length
  if (formDataSize > MAX_FORM_DATA_BYTES) {
    return tooBig('form_data trop volumineux')
  }

  const supabase = getSupabaseAdmin()

  const candidateRow = {
    prenom,
    nom,
    email,
    telephone: candidate.telephone?.trim() || null,
    date_naissance: candidate.date_naissance || null,
    pays: candidate.pays?.trim() || null,
    ville_depart: candidate.ville_depart?.trim() || null,
  }

  const { data: upsertedCandidate, error: candidateError } = await supabase
    .from('candidates')
    .upsert(candidateRow, { onConflict: 'email' })
    .select('id')
    .single()

  if (candidateError || !upsertedCandidate) {
    console.error('[api/inscription] candidate upsert failed', candidateError)
    return NextResponse.json(
      { ok: false, error: 'Impossible de creer le candidat' },
      { status: 500 }
    )
  }

  // 3. Dedup soft : refuse si une candidature pour le meme (candidate, tunnel)
  // a ete creee dans la fenetre DEDUP_WINDOW_SECONDS. Limite l'effet d'un user
  // qui spam le bouton OU d'un bot qui rejoue le POST en boucle.
  const dedupSince = new Date(Date.now() - DEDUP_WINDOW_SECONDS * 1000).toISOString()
  const { data: recent, error: recentError } = await supabase
    .from('candidatures')
    .select('id')
    .eq('candidate_id', upsertedCandidate.id)
    .eq('tunnel_type', tunnel)
    .gte('created_at', dedupSince)
    .limit(1)
    .maybeSingle()

  if (recentError) {
    console.error('[api/inscription] dedup check failed', recentError)
    // Pas de fail-fast : on log et on continue. Ne pas bloquer les vrais users.
  } else if (recent) {
    return tooMany('Une candidature recente existe deja pour ce candidat. Reessaye dans quelques secondes.')
  }

  const ip = clientIp(request)
  const candidatureRow = {
    candidate_id: upsertedCandidate.id,
    tunnel_type: tunnel,
    session_id: body.session_id || null,
    duree_semaines: body.duree_semaines ?? null,
    date_debut_souhaitee: body.date_debut_souhaitee || null,
    form_data: {
      ...formData,
      _meta: { ip: ip ?? null, ua: request.headers.get('user-agent') ?? null },
    },
    status: 'recue',
    status_changed_by_email: 'system',
  }

  const { data: candidature, error: candidatureError } = await supabase
    .from('candidatures')
    .insert(candidatureRow)
    .select('id, created_at')
    .single()

  if (candidatureError || !candidature) {
    console.error('[api/inscription] candidature insert failed', candidatureError)
    return NextResponse.json(
      { ok: false, error: 'Impossible de creer la candidature' },
      { status: 500 }
    )
  }

  await supabase.from('audit_log').insert({
    candidature_id: candidature.id,
    event: 'created',
    to_value: { status: 'recue', tunnel_type: tunnel },
    actor_email: 'system',
  })

  // Notification Slack (optionnelle — silencieux si SLACK_WEBHOOK_URL non defini).
  // Fait avant return mais avec timeout 2s pour ne jamais bloquer le user.
  // TODO V2: remplacer par Resend email quand domaine pro est configure.
  await notifySlack(
    {
      tunnel,
      prenom,
      nom,
      email,
      pays: candidate.pays?.trim() || null,
      duree_semaines: body.duree_semaines ?? null,
      candidature_id: candidature.id,
    },
  ).catch((err) => {
    console.error('[api/inscription] Slack notify failed (non-fatal)', err)
  })

  return NextResponse.json({
    ok: true,
    candidatureId: candidature.id,
    createdAt: candidature.created_at,
  })
}

interface SlackPayload {
  tunnel: string
  prenom: string
  nom: string
  email: string
  pays: string | null
  duree_semaines: number | null
  candidature_id: string
}

async function notifySlack(p: SlackPayload): Promise<void> {
  const url = process.env.SLACK_WEBHOOK_URL
  if (!url) return
  const tunnelLabel: Record<string, string> = {
    session: 'MKR Camp 2026',
    custom: 'Sur Mesure',
    famille: 'Famille',
    groupe: 'Club & Groupe',
  }
  const adminBase = process.env.NEXT_PUBLIC_SITE_URL || 'https://mkrcaucasiancamp.com'
  const text = [
    `🆕 *Nouvelle candidature MKR* (${tunnelLabel[p.tunnel] ?? p.tunnel})`,
    `*${p.prenom} ${p.nom}* — ${p.email}${p.pays ? ` — ${p.pays}` : ''}${p.duree_semaines ? ` — ${p.duree_semaines} sem.` : ''}`,
    `<${adminBase}/admin/inscriptions/${p.candidature_id}|Voir le dossier>`,
  ].join('\n')

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

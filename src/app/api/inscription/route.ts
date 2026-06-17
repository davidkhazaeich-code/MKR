import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { SESSIONS } from '@/data/sessions'
import { getSessionPlaces } from '@/lib/places'
import { sendMail, wrapEmail, row, escapeHtml } from '@/lib/email'
import { rateLimit, clientIp as rlClientIp } from '@/lib/rate-limit'
import { findReferralCode, type ReferralPartnerType } from '@/data/referral-codes'

const VALID_TUNNELS = ['session', 'custom', 'famille', 'groupe'] as const
type TunnelType = (typeof VALID_TUNNELS)[number]

const VALID_DISCIPLINES = ['lutte', 'mma', 'combo_quote'] as const
type CampDiscipline = (typeof VALID_DISCIPLINES)[number]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Limites max pour eviter les payloads abusifs.
const MAX_NAME = 60
const MAX_EMAIL = 254
const MAX_PHONE = 30
const MAX_COUNTRY = 60
const MAX_CITY = 80
const MAX_FORM_DATA_BYTES = 20_000 // 20KB
const MAX_REFERRAL_CODE = 40
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
  camp_discipline?: string | null
  form_data?: Record<string, unknown>
  code_recommandation?: string | null
  submission_language?: string | null
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

export async function POST(request: Request) {
  // Rate-limit IP : 10 candidatures par 15 min pour eviter le spam tunnel.
  // Largement plus permissif que /api/contact (les vrais users peuvent refaire un dossier).
  const ip = rlClientIp(request)
  const rl = rateLimit({ key: `inscription:${ip}`, limit: 10, windowSeconds: 900 })
  if (!rl.allowed) {
    return tooMany(`Trop de candidatures depuis cette IP. Reessaie dans ${Math.ceil(rl.resetIn / 60)} min.`)
  }

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

  // Validation discipline du camp.
  // - tunnel 'session' : obligatoire, 'lutte' ou 'mma' (pas combo)
  // - tunnel 'famille' : si fourni, doit etre 'lutte'. Si absent, on force 'lutte' cote serveur.
  // - tunnel 'custom' / 'groupe' : obligatoire, 'lutte', 'mma' ou 'combo_quote'
  let campDiscipline: CampDiscipline | null = null
  const rawDiscipline = body.camp_discipline?.trim() || null
  if (rawDiscipline) {
    if (!VALID_DISCIPLINES.includes(rawDiscipline as CampDiscipline)) {
      return badRequest('camp_discipline invalide')
    }
    campDiscipline = rawDiscipline as CampDiscipline
  }

  if (tunnel === 'session') {
    if (campDiscipline !== 'lutte' && campDiscipline !== 'mma') {
      return badRequest('Pour une session officielle, camp_discipline doit etre "lutte" ou "mma"')
    }
  } else if (tunnel === 'famille') {
    // On force 'lutte' cote serveur (pas de choix possible pour Famille).
    campDiscipline = 'lutte'
  } else {
    // custom / groupe
    if (!campDiscipline) {
      return badRequest('camp_discipline requis (lutte, mma ou combo_quote)')
    }
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

  // 3. Dedup soft : refuse si une candidature pour le meme (candidate, tunnel, discipline)
  // a ete creee dans la fenetre DEDUP_WINDOW_SECONDS.
  const dedupSince = new Date(Date.now() - DEDUP_WINDOW_SECONDS * 1000).toISOString()
  const dedupQuery = supabase
    .from('candidatures')
    .select('id')
    .eq('candidate_id', upsertedCandidate.id)
    .eq('tunnel_type', tunnel)
    .gte('created_at', dedupSince)
    .limit(1)
  if (campDiscipline) {
    dedupQuery.eq('camp_discipline', campDiscipline)
  }
  const { data: recent, error: recentError } = await dedupQuery.maybeSingle()

  if (recentError) {
    console.error('[api/inscription] dedup check failed', recentError)
    // Pas de fail-fast : on log et on continue. Ne pas bloquer les vrais users.
  } else if (recent) {
    return tooMany('Une candidature recente existe deja pour ce candidat. Reessaye dans quelques secondes.')
  }

  // 4. Verif capacite pour tunnel=session : refuser si la discipline choisie est pleine.
  // (combo_quote = pas applicable cote session, deja filtre plus haut)
  if (tunnel === 'session' && body.session_id && (campDiscipline === 'lutte' || campDiscipline === 'mma')) {
    const sessionExists = SESSIONS.some((s) => s.id === body.session_id)
    if (!sessionExists) {
      return badRequest('session_id inconnue')
    }
    const places = await getSessionPlaces(body.session_id)
    if (places) {
      const slice = campDiscipline === 'lutte' ? places.lutte : places.mma
      if (slice.is_full) {
        const label = campDiscipline === 'lutte' ? 'Lutte (Daghestan)' : 'MMA (Tchetchenie)'
        return NextResponse.json(
          { ok: false, error: `Session complete sur le camp ${label}. Choisis une autre session ou l'autre discipline.` },
          { status: 409 },
        )
      }
    }
  }

  // 4 bis. Code de recommandation : optionnel, non bloquant.
  // Si saisi mais non reconnu, on stocke quand même pour traçabilité admin
  // (peut être une faute de frappe ; Ruslan voit le code brut + le flag is_valid=false).
  const rawReferral = (body.code_recommandation ?? '').trim()
  if (rawReferral.length > MAX_REFERRAL_CODE) {
    return badRequest('code_recommandation trop long')
  }
  // Locale-safe upper-case so a Turkish 'i' doesn't break STRIKE-style matches on tr-TR servers.
  const normalizedReferral = rawReferral.toLocaleUpperCase('en-US')
  const matchedReferral = rawReferral ? findReferralCode(rawReferral) : null
  const referralFields: {
    referral_code: string | null
    referral_code_valid: boolean | null
    referral_partner_name: string | null
    referral_partner_type: ReferralPartnerType | null
    referral_commission_type: 'flat' | 'percent' | null
    referral_commission_pct: number | null
    referral_bonus_eur: number | null
    referral_payout_status: 'not_applicable' | 'pending'
  } = rawReferral
    ? {
        referral_code: normalizedReferral,
        referral_code_valid: matchedReferral !== null,
        referral_partner_name: matchedReferral?.partnerName ?? null,
        referral_partner_type: matchedReferral?.type ?? null,
        referral_commission_type: matchedReferral?.commissionType ?? null,
        referral_commission_pct: matchedReferral?.commissionPct ?? null,
        // flat : bonus connu des l'inscription. percent : montant inconnu (CA pas encore saisi) -> null.
        referral_bonus_eur:
          matchedReferral?.commissionType === 'flat'
            ? (matchedReferral.bonusEur ?? null)
            : null,
        referral_payout_status: matchedReferral ? 'pending' : 'not_applicable',
      }
    : {
        referral_code: null,
        referral_code_valid: null,
        referral_partner_name: null,
        referral_partner_type: null,
        referral_commission_type: null,
        referral_commission_pct: null,
        referral_bonus_eur: null,
        referral_payout_status: 'not_applicable',
      }

  // Langue de soumission du formulaire ('fr' par defaut, 'en' si page EN).
  // Sert a l'admin pour identifier les candidatures internationales et a Slack pour le flag.
  const submissionLanguage: 'fr' | 'en' = body.submission_language === 'en' ? 'en' : 'fr'

  const candidatureRow = {
    candidate_id: upsertedCandidate.id,
    tunnel_type: tunnel,
    session_id: body.session_id || null,
    duree_semaines: body.duree_semaines ?? null,
    date_debut_souhaitee: body.date_debut_souhaitee || null,
    camp_discipline: campDiscipline,
    submission_language: submissionLanguage,
    ...referralFields,
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

  if (referralFields.referral_code_valid === true) {
    await supabase.from('audit_log').insert({
      candidature_id: candidature.id,
      event: 'referral_attached',
      to_value: {
        code: referralFields.referral_code,
        partner: referralFields.referral_partner_name,
        bonus_eur: referralFields.referral_bonus_eur,
      },
      actor_email: 'system',
    })
  }

  // Notifs fire-and-forget : Slack + email Resend. Aucune ne bloque le user.
  const notifyPayload = {
    tunnel,
    prenom,
    nom,
    email,
    pays: candidate.pays?.trim() || null,
    telephone: candidate.telephone?.trim() || null,
    duree_semaines: body.duree_semaines ?? null,
    camp_discipline: campDiscipline,
    candidature_id: candidature.id,
    referral_code: referralFields.referral_code,
    referral_partner_name: referralFields.referral_partner_name,
    referral_bonus_eur: referralFields.referral_bonus_eur,
    referral_code_valid: referralFields.referral_code_valid,
    submission_language: submissionLanguage,
  }

  await Promise.all([
    notifySlack(notifyPayload).catch((err) => {
      console.error('[api/inscription] Slack notify failed (non-fatal)', err)
    }),
    notifyEmail(notifyPayload).catch((err) => {
      console.error('[api/inscription] Email notify failed (non-fatal)', err)
    }),
    notifyCandidate(notifyPayload).catch((err) => {
      console.error('[api/inscription] Candidate email failed (non-fatal)', err)
    }),
  ])

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
  telephone: string | null
  duree_semaines: number | null
  camp_discipline: CampDiscipline | null
  candidature_id: string
  referral_code: string | null
  referral_partner_name: string | null
  referral_bonus_eur: number | null
  referral_code_valid: boolean | null
  submission_language: 'fr' | 'en'
}

const TUNNEL_LABELS: Record<string, string> = {
  session: 'Session officielle',
  custom: 'Sur Mesure',
  famille: 'Famille',
  groupe: 'Club & Groupe',
}

const DISCIPLINE_LABELS: Record<CampDiscipline, string> = {
  lutte: 'Lutte · Daghestan',
  mma: 'MMA · Tchetchenie',
  combo_quote: 'Combo Lutte+MMA · sur devis',
}

async function notifyEmail(p: SlackPayload): Promise<void> {
  const tunnelLabel = TUNNEL_LABELS[p.tunnel] ?? p.tunnel
  const discipline = p.camp_discipline ? DISCIPLINE_LABELS[p.camp_discipline] : null
  const adminBase = process.env.NEXT_PUBLIC_SITE_URL || 'https://mkrcamp.com'

  const referralLabel = p.referral_code_valid === true
    ? `${p.referral_partner_name} (code ${p.referral_code}, bonus ${p.referral_bonus_eur} EUR pending)`
    : p.referral_code_valid === false
      ? `Code "${p.referral_code}" non reconnu - à vérifier`
      : null

  const bodyHtml = `
    <table style="width:100%;border-collapse:collapse;background:#0b1220;border:1px solid #1e293b;border-radius:6px">
      ${row('Tunnel', tunnelLabel)}
      ${row('Camp', discipline)}
      ${row('Recommandation', referralLabel)}
      ${row('Nom', `${p.prenom} ${p.nom}`)}
      ${row('Email', p.email)}
      ${row('Telephone', p.telephone)}
      ${row('Pays', p.pays)}
      ${row('Duree (semaines)', p.duree_semaines ? String(p.duree_semaines) : null)}
    </table>
    <p style="margin:20px 0 8px;color:#e2e8f0;font-size:14px">
      <a href="${adminBase}/admin/inscriptions/${p.candidature_id}" style="background:#C0392B;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block">Voir le dossier</a>
    </p>
  `
  const html = wrapEmail(`Nouvelle candidature · ${tunnelLabel}`, bodyHtml, 'Notif automatique envoyee par /api/inscription · Reply-To = candidat.')
  const text = `Nouvelle candidature ${tunnelLabel}\n${p.prenom} ${p.nom} <${p.email}>\nDossier: ${adminBase}/admin/inscriptions/${p.candidature_id}`

  await sendMail({
    subject: `[MKR candidature] ${tunnelLabel} — ${p.prenom} ${p.nom}`,
    html,
    text,
    replyTo: p.email,
    tag: 'inscription',
  })
}

// Lien Cal.com de Ruslan pour la visio de selection (event "15min").
const CAL_BOOKING_URL = `https://cal.com/${process.env.NEXT_PUBLIC_CAL_LINK || 'ruslan-mukhtarov-mkr/15min'}`

const DISCIPLINE_LABELS_EN: Record<CampDiscipline, string> = {
  lutte: 'Wrestling · Dagestan',
  mma: 'MMA · Chechnya',
  combo_quote: 'Combo Wrestling + MMA (on quote)',
}

// Email de confirmation au CANDIDAT (different de la notif interne a Ruslan).
// Contient le recap + le lien pour reserver la visio de selection qui valide
// le dossier. Fire-and-forget : ne bloque jamais la soumission.
async function notifyCandidate(p: SlackPayload): Promise<void> {
  if (!p.email || !EMAIL_RE.test(p.email)) return
  const en = p.submission_language === 'en'
  const discipline = p.camp_discipline
    ? (en ? DISCIPLINE_LABELS_EN[p.camp_discipline] : DISCIPLINE_LABELS[p.camp_discipline])
    : null
  const duree = p.duree_semaines ? String(p.duree_semaines) : null

  const title = en ? 'Application received' : 'Candidature reçue'
  const subject = en
    ? 'Your MKR application, book your selection call'
    : 'Votre candidature MKR, réservez votre visio de sélection'

  const intro = en
    ? `Hi ${p.prenom}, thank you for your application to MKR Caucasian Camp. To validate your file, please book your selection call with Ruslan below. You will automatically receive a calendar invite.`
    : `Bonjour ${p.prenom}, merci pour votre candidature au MKR Caucasian Camp. Pour valider votre dossier, réservez votre visio de sélection avec Ruslan ci-dessous. Vous recevrez automatiquement une invitation dans votre calendrier.`

  const recapLabel = en ? 'Your application' : 'Votre candidature'
  const campLabel = en ? 'Camp' : 'Camp'
  const durationLabel = en ? 'Duration (weeks)' : 'Durée (semaines)'
  const ctaLabel = en ? 'Book my selection call' : 'Réserver ma visio de sélection'
  const footer = en
    ? 'The call validates your application. See you soon. MKR Caucasian Camp.'
    : 'La visio valide votre dossier. À très vite. MKR Caucasian Camp.'

  const recapRows = `${row(campLabel, discipline)}${row(durationLabel, duree)}`
  const bodyHtml = `
    <p style="margin:0 0 18px;color:#e2e8f0;font-size:15px;line-height:1.6">${escapeHtml(intro)}</p>
    ${recapRows ? `<table style="width:100%;border-collapse:collapse;background:#0b1220;border:1px solid #1e293b;border-radius:6px;margin:0 0 22px"><tbody>${recapRows}</tbody></table>` : ''}
    <p style="margin:0 0 8px">
      <a href="${CAL_BOOKING_URL}" style="background:#C0392B;color:#fff;padding:13px 22px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block;font-size:15px">${escapeHtml(ctaLabel)}</a>
    </p>
    <p style="margin:14px 0 0;color:#94a3b8;font-size:13px">${escapeHtml(CAL_BOOKING_URL)}</p>
  `
  const text = `${intro}\n\n${ctaLabel}: ${CAL_BOOKING_URL}\n\n${footer}`

  await sendMail({
    to: p.email,
    subject,
    html: wrapEmail(title, bodyHtml, footer),
    text,
    tag: 'inscription-candidate',
  })
}

async function notifySlack(p: SlackPayload): Promise<void> {
  const url = process.env.SLACK_WEBHOOK_URL
  if (!url) return
  const adminBase = process.env.NEXT_PUBLIC_SITE_URL || 'https://mkrcamp.com'
  const referralLine =
    p.referral_code_valid === true
      ? `*Recommandé par* : ${p.referral_partner_name} (code ${p.referral_code} - bonus ${p.referral_bonus_eur} EUR pending)`
      : p.referral_code_valid === false
        ? `*Code recommandation non reconnu* : "${p.referral_code}" (à vérifier)`
        : null

  // Flag [EN] prepende pour les candidatures soumises depuis les pages anglaises
  // (cf. memory feedback_no_emoji_use_svg : ASCII only, pas de drapeau emoji).
  const enFlag = p.submission_language === 'en' ? '[EN] ' : ''

  const text = [
    `${enFlag}*Nouvelle candidature MKR* (${TUNNEL_LABELS[p.tunnel] ?? p.tunnel})`,
    `*${p.prenom} ${p.nom}* — ${p.email}${p.pays ? ` — ${p.pays}` : ''}${p.duree_semaines ? ` — ${p.duree_semaines} sem.` : ''}`,
    p.camp_discipline ? `*Camp* : ${DISCIPLINE_LABELS[p.camp_discipline]}` : null,
    referralLine,
    `<${adminBase}/admin/inscriptions/${p.candidature_id}|Voir le dossier>`,
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

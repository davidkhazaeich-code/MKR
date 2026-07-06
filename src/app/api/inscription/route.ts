import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { SESSIONS } from '@/data/sessions'
import { getSessionPlaces } from '@/lib/places'
import { sendMail, wrapEmail, row, escapeHtml } from '@/lib/email'
import { rateLimit, clientIp as rlClientIp } from '@/lib/rate-limit'
import { isDisposableEmail } from '@/lib/disposable-email'
import { findReferralCode, type ReferralPartnerType } from '@/data/referral-codes'
import { estimateDemandAmountCents } from '@/data/pricing'
import {
  sanitizeAttribution,
  ATTRIBUTION_SOURCE_LABEL,
  type AttributionSource,
  type AttributionData,
} from '@/lib/attribution'

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
// Time-trap : un humain met plusieurs secondes a parcourir le tunnel multi-etapes.
const MIN_FILL_MS = 4000
// Rate-limit durable (Supabase) : candidatures reellement creees par IP / fenetre.
const DURABLE_IP_LIMIT = 10
const DURABLE_IP_WINDOW_SECONDS = 3600

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
  // Attribution marketing capturee cote client (cookie mkr_attr). Re-classee serveur.
  attribution?: unknown
  // Honeypot : champ invisible pour utilisateurs humains, rempli par bots.
  _hp?: string
  // Horodatage (ms epoch) du montage du formulaire cote client (time-trap anti-bot).
  form_started_at?: number
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

  // 1 bis. Time-trap. Un humain met plusieurs secondes a parcourir le tunnel
  // multi-etapes ; un envoi quasi instantane = bot qui poste direct sur l'API.
  // Meme reponse 200 fake que le honeypot pour ne pas signaler la detection.
  // Absence de form_started_at toleree (client en cache pendant un deploiement).
  if (typeof body.form_started_at === 'number') {
    const elapsed = Date.now() - body.form_started_at
    if (elapsed >= 0 && elapsed < MIN_FILL_MS) {
      return NextResponse.json({ ok: true, candidatureId: 'noop', createdAt: new Date().toISOString() })
    }
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
  // Refus des boites jetables / temporaires (anti-spam, message user-facing clair).
  if (isDisposableEmail(email)) {
    return badRequest(body.submission_language === 'en'
      ? 'Please use a permanent email address; temporary inboxes are not accepted.'
      : 'Merci d’utiliser une adresse email permanente. Les boîtes temporaires ne sont pas acceptées.')
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

  // Rate-limit DURABLE : contrairement au bucket in-memory (qui leak au cold
  // start serverless et n'est pas partage entre instances Vercel), on compte les
  // candidatures reellement creees par cette IP sur la fenetre. Fail-open : un
  // souci d'infra ne doit jamais bloquer un vrai candidat.
  if (ip && ip !== 'unknown') {
    try {
      const durableSince = new Date(Date.now() - DURABLE_IP_WINDOW_SECONDS * 1000).toISOString()
      const { count, error: durableError } = await supabase
        .from('candidatures')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', durableSince)
        .eq('form_data->_meta->>ip', ip)
      if (!durableError && typeof count === 'number' && count >= DURABLE_IP_LIMIT) {
        return tooMany('Trop de candidatures depuis cette adresse. Reessaie plus tard.')
      }
    } catch (err) {
      console.error('[api/inscription] durable rate-limit check failed (non-fatal)', err)
    }
  }

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

  // Montant package estime (centimes EUR), calcule SERVEUR depuis la demande validee,
  // en miroir exact du recap du formulaire. On le persiste pour que le backend reflete
  // la demande et son prix des l'inscription (l'admin peut l'ajuster ensuite).
  // null = sur devis (combo, 11+, club 6-10, duree absente) -> reste a saisir.
  const fdCustom = (formData as { custom?: { composition?: unknown } }).custom
  const fdFamille = (formData as { famille?: { nombre_parents?: unknown; enfants?: unknown } }).famille
  const fdGroupe = (formData as { groupe?: { nombre_participants?: unknown } }).groupe
  const compositionNum =
    typeof fdCustom?.composition === 'number'
      ? fdCustom.composition
      : typeof fdCustom?.composition === 'string'
        ? parseInt(fdCustom.composition, 10)
        : null
  const parentsNum =
    typeof fdFamille?.nombre_parents === 'number'
      ? fdFamille.nombre_parents
      : typeof fdFamille?.nombre_parents === 'string'
        ? parseInt(fdFamille.nombre_parents, 10)
        : null
  const childrenCount = Array.isArray(fdFamille?.enfants) ? fdFamille.enfants.length : 0
  const groupSize = typeof fdGroupe?.nombre_participants === 'string' ? fdGroupe.nombre_participants : null
  const weeksInput =
    body.duree_semaines === 1 || body.duree_semaines === 2 || body.duree_semaines === 3
      ? body.duree_semaines
      : null

  const packageAmountCents = estimateDemandAmountCents({
    tunnel: tunnel as TunnelType,
    weeks: weeksInput,
    campDiscipline,
    composition: Number.isNaN(compositionNum) ? null : compositionNum,
    parents: Number.isNaN(parentsNum) ? null : parentsNum,
    children: childrenCount,
    groupSize,
  })

  // Attribution marketing : re-classee et sanitize serveur (jamais confiance au
  // client). null si aucun signal (visite directe). Sert au back office a savoir
  // si le lead vient de Google Ads.
  const attributionResult = sanitizeAttribution(body.attribution)
  const attributionSource: AttributionSource | null = attributionResult?.source ?? null
  const attributionData: AttributionData | null = attributionResult?.attribution ?? null

  const candidatureRow = {
    candidate_id: upsertedCandidate.id,
    tunnel_type: tunnel,
    session_id: body.session_id || null,
    duree_semaines: body.duree_semaines ?? null,
    date_debut_souhaitee: body.date_debut_souhaitee || null,
    camp_discipline: campDiscipline,
    package_amount_cents: packageAmountCents,
    submission_language: submissionLanguage,
    attribution_source: attributionSource,
    attribution: attributionData,
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

  // Trace du montant estime par le systeme (selon la grille publique). Permet a
  // l'admin de distinguer un montant auto-calcule d'un montant saisi a la main.
  if (packageAmountCents !== null) {
    await supabase.from('audit_log').insert({
      candidature_id: candidature.id,
      event: 'package_amount_estimated',
      to_value: { package_amount_cents: packageAmountCents },
      actor_email: 'system',
    })
  }

  // Trace l'acquisition (hors direct) dans l'historique, pour que Ruslan voie
  // "vient de Google Ads" dans la timeline du dossier.
  if (attributionSource && attributionSource !== 'direct') {
    await supabase.from('audit_log').insert({
      candidature_id: candidature.id,
      event: 'attribution_captured',
      to_value: {
        source: attributionSource,
        gclid: attributionData?.gclid ?? attributionData?.gbraid ?? attributionData?.wbraid ?? null,
        utm_campaign: attributionData?.utm_campaign ?? null,
      },
      actor_email: 'system',
    })
  }

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
    package_amount_cents: packageAmountCents,
    candidature_id: candidature.id,
    referral_code: referralFields.referral_code,
    referral_partner_name: referralFields.referral_partner_name,
    referral_bonus_eur: referralFields.referral_bonus_eur,
    referral_code_valid: referralFields.referral_code_valid,
    submission_language: submissionLanguage,
    attribution_source: attributionSource,
    utm_campaign: attributionData?.utm_campaign ?? null,
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
    // Montant estime (centimes EUR) pour la valeur de conversion Google Ads cote client.
    // null = sur devis (aucune valeur envoyee).
    packageAmountCents,
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
  package_amount_cents: number | null
  candidature_id: string
  referral_code: string | null
  referral_partner_name: string | null
  referral_bonus_eur: number | null
  referral_code_valid: boolean | null
  submission_language: 'fr' | 'en'
  attribution_source: AttributionSource | null
  utm_campaign: string | null
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

// Montant lisible pour les notifs admin. null = pas de total ferme (sur devis).
function formatAmountLabel(cents: number | null): string {
  if (cents === null) return 'Sur devis'
  return `${(cents / 100).toLocaleString('fr-FR')} €`
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

  const montantLabel = formatAmountLabel(p.package_amount_cents)

  const acquisitionLabel = p.attribution_source
    ? `${ATTRIBUTION_SOURCE_LABEL[p.attribution_source]}${p.utm_campaign ? ` (campagne ${p.utm_campaign})` : ''}`
    : null

  const bodyHtml = `
    <table style="width:100%;border-collapse:collapse;background:#0b1220;border:1px solid #1e293b;border-radius:6px">
      ${row('Tunnel', tunnelLabel)}
      ${row('Camp', discipline)}
      ${row('Montant (selon demande)', montantLabel)}
      ${row('Acquisition', acquisitionLabel)}
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

// URL publique du site (images d'email : logo + photo de Ruslan servis en absolu).
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://mkrcamp.com').replace(/\/$/, '')

// Email de confirmation au CANDIDAT (different de la notif interne a Ruslan).
// Objectif = pousser la prise de la visio de selection avec Ruslan, seule etape qui valide
// le dossier. HTML responsive table-based (compat Gmail/Apple/Outlook), theme sombre marque,
// logo + photo de Ruslan + un seul CTA fort. Fire-and-forget : ne bloque jamais la soumission.
async function notifyCandidate(p: SlackPayload): Promise<void> {
  if (!p.email || !EMAIL_RE.test(p.email)) return
  const en = p.submission_language === 'en'
  const prenom = escapeHtml(p.prenom || (en ? 'there' : ''))
  const discipline = p.camp_discipline
    ? (en ? DISCIPLINE_LABELS_EN[p.camp_discipline] : DISCIPLINE_LABELS[p.camp_discipline])
    : null
  const duree = p.duree_semaines ? String(p.duree_semaines) : null

  const c = en
    ? {
        subject: 'One step left, book your call with Ruslan',
        preheader: 'Your MKR file is validated only after your selection call with Ruslan.',
        eyebrow: 'FINAL STEP, REQUIRED',
        title: 'Book your call with Ruslan',
        caption: 'Ruslan Mukhtarov, former French national wrestling team, INSEP',
        intro: `Hi ${prenom}, we received your application to MKR Caucasian Camp. One step remains to validate your file: your selection call with Ruslan. He personally reviews every applicant, and spots are limited.`,
        campLabel: 'Camp',
        durationLabel: 'Duration (weeks)',
        cta: 'Book my selection call',
        urgency: 'Without this call, your file cannot be validated. Pick your slot now, you will receive the calendar invite automatically.',
        footer: 'MKR Caucasian Camp. Immersion among champions.',
      }
    : {
        subject: 'Il te reste une étape, réserve ta visio avec Ruslan',
        preheader: 'Ton dossier MKR n\'est validé qu\'après ta visio de sélection avec Ruslan.',
        eyebrow: 'DERNIÈRE ÉTAPE, OBLIGATOIRE',
        title: 'Réserve ta visio avec Ruslan',
        caption: 'Ruslan Mukhtarov, ex-équipe de France de lutte, INSEP',
        intro: `Bonjour ${prenom}, ta candidature au MKR Caucasian Camp est bien reçue. Une seule étape reste pour valider ton dossier : ta visio de sélection avec Ruslan. Il valide personnellement chaque candidat, et les places sont limitées.`,
        campLabel: 'Camp',
        durationLabel: 'Durée (semaines)',
        cta: 'Réserver ma visio de sélection',
        urgency: 'Sans cet échange, ton dossier ne peut pas être validé. Choisis ton créneau maintenant, tu recevras l\'invitation dans ton calendrier.',
        footer: 'MKR Caucasian Camp. L\'immersion au milieu des champions.',
      }

  const recapCell = (label: string, value: string) =>
    `<tr><td style="padding:8px 14px;color:#8A8A84;font-size:13px;border-bottom:1px solid #262626">${escapeHtml(label)}</td><td style="padding:8px 14px;color:#F1F1EF;font-size:14px;font-weight:600;border-bottom:1px solid #262626;text-align:right">${escapeHtml(value)}</td></tr>`
  const recapRows = `${discipline ? recapCell(c.campLabel, discipline) : ''}${duree ? recapCell(c.durationLabel, duree) : ''}`

  const html = `<!DOCTYPE html>
<html lang="${en ? 'en' : 'fr'}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"></head>
<body style="margin:0;padding:0;background:#000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(c.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000"><tr><td align="center" style="padding:24px 12px">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#0E0E0E;border:1px solid #262626;border-radius:14px;overflow:hidden">
    <tr><td align="center" style="padding:22px 24px 18px;background:#050505;border-bottom:1px solid #1c1c1c">
      <img src="${SITE_URL}/logo-white.png" width="132" alt="MKR Caucasian Camp" style="display:block;width:132px;height:auto;border:0">
    </td></tr>
    <tr><td style="padding:26px 26px 6px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="76" valign="top" style="width:76px">
          <img src="${SITE_URL}/images/ruslan/ruslan-portrait-chemise-noire.jpg" width="64" height="64" alt="Ruslan Mukhtarov" style="display:block;width:64px;height:64px;border-radius:50%;object-fit:cover;border:2px solid #C84B31">
        </td>
        <td valign="middle" style="padding-left:14px">
          <div style="color:#C84B31;font-size:12px;font-weight:700;letter-spacing:0.12em">${escapeHtml(c.eyebrow)}</div>
          <div style="color:#F8F8F8;font-size:22px;font-weight:700;line-height:1.2;margin-top:3px">${escapeHtml(c.title)}</div>
        </td>
      </tr></table>
      <div style="color:#8A8A84;font-size:12px;margin-top:10px">${escapeHtml(c.caption)}</div>
    </td></tr>
    <tr><td style="padding:16px 26px 4px">
      <p style="margin:0 0 18px;color:#C9C9C4;font-size:15px;line-height:1.65">${escapeHtml(c.intro)}</p>
      ${recapRows ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#141412;border:1px solid #262626;border-radius:8px;margin:0 0 22px"><tbody>${recapRows}</tbody></table>` : ''}
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 14px"><tr>
        <td align="center" style="border-radius:8px;background:#C0392B">
          <a href="${CAL_BOOKING_URL}" style="display:inline-block;padding:15px 30px;color:#fff;font-size:16px;font-weight:700;text-decoration:none;border-radius:8px">${escapeHtml(c.cta)} &rarr;</a>
        </td>
      </tr></table>
      <p style="margin:0 0 20px;text-align:center;color:#6f6f6a;font-size:12px;word-break:break-all">${escapeHtml(CAL_BOOKING_URL)}</p>
      <p style="margin:0 0 8px;padding:14px 16px;background:rgba(200,75,49,0.08);border-left:3px solid #C84B31;border-radius:6px;color:#C9C9C4;font-size:13px;line-height:1.6">${escapeHtml(c.urgency)}</p>
    </td></tr>
    <tr><td style="padding:20px 26px;background:#050505;border-top:1px solid #1c1c1c;color:#6f6f6a;font-size:12px;line-height:1.6">${escapeHtml(c.footer)}</td></tr>
  </table>
</td></tr></table>
</body></html>`

  const text = `${c.intro}\n\n${c.cta}: ${CAL_BOOKING_URL}\n\n${c.urgency}\n\n${c.footer}`

  await sendMail({
    to: p.email,
    subject: c.subject,
    html,
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
    `*Montant (selon demande)* : ${formatAmountLabel(p.package_amount_cents)}`,
    p.attribution_source
      ? `*Acquisition* : ${ATTRIBUTION_SOURCE_LABEL[p.attribution_source]}${p.utm_campaign ? ` (campagne ${p.utm_campaign})` : ''}`
      : null,
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

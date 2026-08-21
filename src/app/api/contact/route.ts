import { NextResponse } from 'next/server'
import { sendMail, wrapEmail, row, escapeHtml } from '@/lib/email'
import { rateLimit, clientIp } from '@/lib/rate-limit'

// POST /api/contact
// Form de contact public. Envoie un email Resend vers MKR_EMAIL_TO (contact@mkrcamp.com).
// Pas de persistence Supabase (volume faible, mailbox = source of truth pour /contact).
//
// Securite :
// - Honeypot _hp (bot detection)
// - Validation stricte (email regex, max lengths)
// - Rate-limit IP : 5 req / 15 min
// - Reply-To = email user (le destinataire peut repondre direct sans copier-coller)
// - Aucune info renvoyee au client autre que ok:true/false (pas de leak de config)

export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const MAX_NAME = 80
const MAX_EMAIL = 254
const MAX_SUBJECT = 60
const MAX_MESSAGE = 5000
// Champ OPTIONNEL (2026-08-21) : le visiteur le remplit s'il prefere etre
// rappele. Jamais bloquant, donc on ne valide QUE la longueur : un numero mal
// forme n'a aucune raison de faire echouer l'envoi du message.
const MAX_PHONE = 30

const VALID_SUBJECTS = ['general', 'partenariat', 'clubs', 'presse', 'autre'] as const
type Subject = (typeof VALID_SUBJECTS)[number]

const SUBJECT_LABELS: Record<Subject, string> = {
  general: 'Question générale',
  partenariat: 'Partenariat',
  clubs: 'Clubs et groupes',
  presse: 'Presse et médias',
  autre: 'Autre',
}

interface Payload {
  name?: string
  email?: string
  phone?: string
  subject?: string
  message?: string
  _hp?: string
}

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

export async function POST(request: Request) {
  // 1. Rate-limit (avant parse pour eviter de bouffer du CPU sur les bots).
  const ip = clientIp(request)
  const rl = rateLimit({ key: `contact:${ip}`, limit: 5, windowSeconds: 900 })
  if (!rl.allowed) {
    return bad(`Trop de tentatives. Reessaie dans ${Math.ceil(rl.resetIn / 60)} min.`, 429)
  }

  let body: Payload
  try {
    body = (await request.json()) as Payload
  } catch {
    return bad('Body JSON invalide')
  }

  // 2. Honeypot : 200 fake pour ne pas signaler aux bots qu'on les detecte.
  if (typeof body._hp === 'string' && body._hp.trim().length > 0) {
    return NextResponse.json({ ok: true })
  }

  const name = body.name?.trim()
  const email = body.email?.trim().toLowerCase()
  const phone = body.phone?.trim()
  const subjectRaw = body.subject?.trim().toLowerCase()
  const message = body.message?.trim()

  if (!name || !email || !subjectRaw || !message) {
    return bad('Tous les champs sont requis')
  }
  if (name.length > MAX_NAME) return bad('Nom trop long')
  if (email.length > MAX_EMAIL || !EMAIL_RE.test(email)) return bad('Email invalide')
  if (phone && phone.length > MAX_PHONE) return bad('Telephone trop long')
  if (subjectRaw.length > MAX_SUBJECT) return bad('Sujet invalide')
  if (!VALID_SUBJECTS.includes(subjectRaw as Subject)) return bad('Sujet inconnu')
  if (message.length > MAX_MESSAGE) return bad('Message trop long (5000 caracteres max)')

  const subject = subjectRaw as Subject
  const subjectLabel = SUBJECT_LABELS[subject]

  // 3. Compose l'email. HTML simple, dark-style aligne avec la brand MKR.
  const bodyHtml = `
    <table style="width:100%;border-collapse:collapse;background:#0b1220;border:1px solid #1e293b;border-radius:6px;margin-bottom:16px">
      ${row('Sujet', subjectLabel)}
      ${row('Nom', name)}
      ${row('Email', email)}
      ${row('Telephone', phone)}
      ${row('IP', ip)}
    </table>
    <div style="background:#0b1220;border:1px solid #1e293b;border-radius:6px;padding:16px;color:#e2e8f0;font-size:14px;line-height:1.6;white-space:pre-wrap">${escapeHtml(message)}</div>
  `
  const html = wrapEmail(`Contact MKR · ${subjectLabel}`, bodyHtml, "Email envoye via le formulaire mkrcamp.com/contact · Reply-To = email du visiteur.")
  const phoneLine = phone ? `Telephone : ${phone}\n` : ''
  const text = `Sujet : ${subjectLabel}\nNom : ${name}\nEmail : ${email}\n${phoneLine}IP : ${ip}\n\n${message}`

  const ok = await sendMail({
    subject: `[MKR contact] ${subjectLabel} · ${name}`,
    html,
    text,
    replyTo: email,
    tag: 'contact',
  })

  if (!ok) {
    // Log mais ne renvoie pas 500 : le user a fait sa part, c'est nous qui avons un probleme.
    // En attendant Resend op, on peut rajouter ici un fallback Slack si besoin.
    return NextResponse.json(
      { ok: false, error: 'Service email momentanement indisponible. Reessaie dans quelques minutes.' },
      { status: 503 },
    )
  }

  return NextResponse.json({ ok: true })
}

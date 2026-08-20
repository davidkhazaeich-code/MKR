import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { sendMail, escapeHtml } from '@/lib/email'
import { renderSouvenirPng, type SouvenirDiscipline } from '@/lib/souvenir-image'
import { frSessionDisplayFromId } from '@/lib/session-display-fr'

// Envoi automatique de l'image souvenir au candidat quand son dossier passe en
// `validee`. Declenche en fire-and-forget depuis la route admin PATCH : ne bloque
// jamais la transition de statut et ne throw jamais. Idempotent via la colonne
// candidatures.souvenir_sent_at (garde-fou anti-double-envoi).

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://mkrcamp.com').replace(/\/$/, '')
const COPY_TO = process.env.MKR_EMAIL_TO || 'contact@mkrcamp.com'

const DISCIPLINE_FR: Record<SouvenirDiscipline, string> = {
  lutte: 'Lutte · Daghestan',
  mma: 'MMA · Tchétchénie',
  combo_quote: 'Lutte + MMA · Caucase',
}
const DISCIPLINE_EN: Record<SouvenirDiscipline, string> = {
  lutte: 'Wrestling · Dagestan',
  mma: 'MMA · Chechnya',
  combo_quote: 'Wrestling + MMA · Caucasus',
}

function sessionLabel(sessionId: string | null): string | null {
  // `frSessionDisplayFromId` reconstruit la session depuis son id, y compris
  // une session deja passee : l'image souvenir d'un dossier ancien reste juste.
  return frSessionDisplayFromId(sessionId)?.season_label ?? null
}

interface CandidatureRow {
  id: string
  status: string
  camp_discipline: SouvenirDiscipline | null
  session_id: string | null
  submission_language: 'fr' | 'en' | null
  souvenir_sent_at: string | null
  candidate: { prenom: string | null; email: string | null } | null
}

/**
 * Envoie l'email + image souvenir si le dossier est `validee` et pas deja envoye.
 * Silencieux et sans effet si conditions non remplies. Ne throw jamais.
 */
export async function sendSouvenirIfNeeded(candidatureId: string): Promise<void> {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('candidatures')
      .select('id, status, camp_discipline, session_id, submission_language, souvenir_sent_at, candidate:candidates!candidate_id(prenom, email)')
      .eq('id', candidatureId)
      .single<CandidatureRow>()

    if (error || !data) return
    if (data.status !== 'validee') return
    if (data.souvenir_sent_at) return // deja envoye
    const email = data.candidate?.email
    if (!email) return

    const en = data.submission_language === 'en'
    const prenom = (data.candidate?.prenom || (en ? 'Champion' : 'Champion')).trim()
    const key: SouvenirDiscipline = data.camp_discipline ?? 'lutte'
    const disciplineLabel = en ? DISCIPLINE_EN[key] : DISCIPLINE_FR[key]
    const session = sessionLabel(data.session_id)

    // 1. Genere le PNG souvenir (jamais bloquant : si echec, on log et on sort).
    let png: Buffer
    try {
      png = await renderSouvenirPng({
        prenom,
        campDiscipline: data.camp_discipline,
        session,
        locale: en ? 'en' : 'fr',
      })
    } catch (err) {
      console.error('[souvenir] rendu image echoue', err)
      return
    }

    // 2. Email de felicitations + image en piece jointe.
    const safePrenom = escapeHtml(prenom)
    const c = en
      ? {
          subject: `Congratulations ${prenom}, your MKR file is validated`,
          preheader: 'Your file is validated. Your keepsake image is attached, share it and tag @mkrcamp.',
          eyebrow: 'FILE VALIDATED',
          title: `Welcome to the Caucasus, ${safePrenom}`,
          intro: 'Ruslan validated your file. Your personalized keepsake image is attached, share it on Instagram and tag @mkrcamp.',
          stepsTitle: 'Next steps',
          steps: [
            'Ruslan sends you the participation agreement and the payment details.',
            'Prepare your trip: Russian visa (handled by MKR) and your flight to Istanbul.',
            'You receive the detailed program before departure.',
          ],
          footer: 'MKR Caucasian Camp. Immersion among champions.',
          attachName: `mkr-${prenom.toLowerCase()}-souvenir.png`,
        }
      : {
          subject: `Félicitations ${prenom}, ton dossier MKR est validé`,
          preheader: 'Ton dossier est validé. Ton image souvenir est en pièce jointe, partage-la et tague @mkrcamp.',
          eyebrow: 'DOSSIER VALIDÉ',
          title: `Bienvenue au Caucase, ${safePrenom}`,
          intro: 'Ruslan a validé ton dossier. Ton image souvenir personnalisée est en pièce jointe, partage-la sur Instagram et tague @mkrcamp.',
          stepsTitle: 'Prochaines étapes',
          steps: [
            'Ruslan t\'envoie le contrat de participation et les modalités de paiement.',
            'Prépare ton voyage : visa russe (géré par MKR) et ton vol jusqu\'à Istanbul.',
            'Tu reçois le programme détaillé avant le départ.',
          ],
          footer: 'MKR Caucasian Camp. L\'immersion au milieu des champions.',
          attachName: `mkr-${prenom.toLowerCase()}-souvenir.png`,
        }

    const stepsHtml = c.steps
      .map(
        (s, i) =>
          `<tr><td valign="top" style="padding:6px 10px 6px 0;color:#C84B31;font-weight:700;font-size:14px">${i + 1}.</td><td style="padding:6px 0;color:#C9C9C4;font-size:14px;line-height:1.55">${escapeHtml(s)}</td></tr>`,
      )
      .join('')

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
      <div style="color:#C84B31;font-size:12px;font-weight:700;letter-spacing:0.12em">${escapeHtml(c.eyebrow)}</div>
      <div style="color:#F8F8F8;font-size:24px;font-weight:700;line-height:1.2;margin-top:4px">${c.title}</div>
    </td></tr>
    <tr><td style="padding:14px 26px 4px">
      <p style="margin:0 0 18px;color:#C9C9C4;font-size:15px;line-height:1.65">${escapeHtml(c.intro)}</p>
      <div style="margin:0 0 6px;color:#8A8A84;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase">${escapeHtml(c.stepsTitle)}</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px">${stepsHtml}</table>
      <p style="margin:0 0 6px;padding:12px 16px;background:rgba(200,75,49,0.08);border-left:3px solid #C84B31;border-radius:6px;color:#C9C9C4;font-size:13px;line-height:1.6">${escapeHtml(disciplineLabel)}${session ? ` · ${escapeHtml(session)}` : ''}</p>
    </td></tr>
    <tr><td style="padding:20px 26px;background:#050505;border-top:1px solid #1c1c1c;color:#6f6f6a;font-size:12px;line-height:1.6">${escapeHtml(c.footer)}</td></tr>
  </table>
</td></tr></table>
</body></html>`

    const text = `${c.intro}\n\n${c.stepsTitle}:\n${c.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n${c.footer}`

    const sent = await sendMail({
      to: email,
      bcc: COPY_TO,
      subject: c.subject,
      html,
      text,
      tag: 'inscription-candidate',
      attachments: [{ filename: c.attachName, content: png }],
    })
    if (!sent) {
      // On ne marque PAS souvenir_sent_at → un renvoi manuel reste possible plus tard.
      console.error('[souvenir] envoi email echoue pour', candidatureId)
      return
    }

    // 3. Marque l'envoi (idempotence) + audit.
    const nowIso = new Date().toISOString()
    await supabase.from('candidatures').update({ souvenir_sent_at: nowIso }).eq('id', candidatureId)
    await supabase.from('audit_log').insert({
      candidature_id: candidatureId,
      event: 'souvenir_sent',
      to_value: { souvenir_sent_at: nowIso },
      data: { to: email, discipline: key, session },
      actor_email: 'system',
    })
  } catch (err) {
    console.error('[souvenir] sendSouvenirIfNeeded a throw (ignore)', err)
  }
}

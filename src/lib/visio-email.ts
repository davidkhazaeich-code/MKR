import { escapeHtml } from '@/lib/email'
import { renderWhatsAppButtonHtml } from '@/lib/email-layout'
import { whatsappUrl } from '@/data/site'

// Source UNIQUE de l'email « visio de selection » envoye au candidat.
//
// Deux variantes, meme mise en page (logo + photo de Ruslan + un seul CTA Cal,
// thème sombre marque, HTML responsive table-based compat Gmail/Apple/Outlook) :
//   - 'confirmation' : envoye automatiquement au submit du formulaire d'inscription
//     (fonction notifyCandidate dans api/inscription). Objectif : pousser la prise
//     de la visio, seule etape qui valide le dossier.
//   - 'reminder'     : renvoye a la demande depuis le back office (bouton « Relance
//     visio »), quand le candidat n'a pas encore reserve. Meme layout, ton « rappel ».
//
// Extraire ce template ici garantit qu'il n'y a qu'UN seul rendu a maintenir : les
// deux emails ne peuvent plus deriver l'un de l'autre.

export type VisioEmailVariant = 'confirmation' | 'reminder'
export type VisioCampDiscipline = 'lutte' | 'mma' | 'combo_quote'

export interface VisioEmailInput {
  /** Prenom du candidat (tutoiement). Fallback neutre si absent. */
  prenom: string | null
  campDiscipline: VisioCampDiscipline | null
  dureeSemaines: number | null
  locale: 'fr' | 'en'
  variant: VisioEmailVariant
  /**
   * Lien public d'abandon de place (`/api/cancel-place?c=...&t=...`). Rendu UNIQUEMENT
   * pour `variant='reminder'`. Absent = pas de bloc « J'abandonne ma place ».
   */
  cancelUrl?: string
}

export interface BuiltVisioEmail {
  subject: string
  html: string
  text: string
}

// Lien Cal.com de Ruslan pour la visio de selection (event "15min").
const CAL_BOOKING_URL = `https://cal.com/${process.env.NEXT_PUBLIC_CAL_LINK || 'ruslan-mukhtarov-mkr/15min'}`

// URL publique du site (images d'email : logo + photo de Ruslan servis en absolu).
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://mkrcamp.com').replace(/\/$/, '')

const DISCIPLINE_LABELS_FR: Record<VisioCampDiscipline, string> = {
  lutte: 'Lutte · Daghestan',
  mma: 'MMA · Tchetchenie',
  combo_quote: 'Combo Lutte+MMA · sur devis',
}

const DISCIPLINE_LABELS_EN: Record<VisioCampDiscipline, string> = {
  lutte: 'Wrestling · Dagestan',
  mma: 'MMA · Chechnya',
  combo_quote: 'Combo Wrestling + MMA (on quote)',
}

interface Copy {
  subject: string
  preheader: string
  eyebrow: string
  title: string
  caption: string
  intro: string
  campLabel: string
  durationLabel: string
  cta: string
  urgency: string
  footer: string
  /** Bloc « une question ? WhatsApp » (les 2 variantes). */
  waIntro: string
  waLabel: string
  /** Message pre-rempli dans WhatsApp. */
  waPrefill: string
  /** Bloc « abandon de place » (reminder only). */
  giveUpPrefix?: string
  giveUpLink?: string
}

// Copy par variante x locale. `prenom` est deja echappe (safe HTML) avant interpolation.
function buildCopy(variant: VisioEmailVariant, locale: 'fr' | 'en', prenom: string): Copy {
  const en = locale === 'en'

  if (variant === 'reminder') {
    return en
      ? {
          subject: 'A quick reminder, book your call with Ruslan',
          preheader: 'Your MKR file is validated only after your selection call with Ruslan.',
          eyebrow: 'REMINDER · FINAL STEP',
          title: 'Book your call with Ruslan',
          caption: 'Ruslan Mukhtarov, former French national wrestling team, INSEP',
          intro: `Hi ${prenom}, your application to MKR Caucasian Camp is registered, but we have not seen your selection call booked yet. It is the only step that validates your file: Ruslan personally reviews every applicant, and spots are limited.`,
          campLabel: 'Camp',
          durationLabel: 'Duration (weeks)',
          cta: 'Book my call now',
          urgency: 'Heads up: without a reply from you in the coming days, we will unfortunately have to release the place we reserved for you. Pick your slot now, you will receive the calendar invite automatically.',
          footer: 'MKR Caucasian Camp. Immersion among champions.',
          waIntro: 'A doubt, a question, a scheduling issue? Write to Ruslan directly on WhatsApp, he answers himself.',
          waLabel: 'Message Ruslan on WhatsApp',
          waPrefill: 'Hi Ruslan, about my MKR application and the selection call.',
          giveUpPrefix: 'Can\'t join the camp anymore?',
          giveUpLink: 'I give up my place',
        }
      : {
          subject: 'Petit rappel, réserve ta visio avec Ruslan',
          preheader: 'Ton dossier MKR n\'est validé qu\'après ta visio de sélection avec Ruslan.',
          eyebrow: 'RAPPEL · DERNIÈRE ÉTAPE',
          title: 'Réserve ta visio avec Ruslan',
          caption: 'Ruslan Mukhtarov, ex-équipe de France de lutte, INSEP',
          intro: `Bonjour ${prenom}, ta candidature au MKR Caucasian Camp est bien enregistrée, mais on n\'a pas encore vu passer ta visio de sélection. C\'est la seule étape qui valide ton dossier : Ruslan reçoit personnellement chaque candidat, et les places sont limitées.`,
          campLabel: 'Camp',
          durationLabel: 'Durée (semaines)',
          cta: 'Réserver ma visio maintenant',
          urgency: 'Important : sans réponse de ta part dans les prochains jours, on devra malheureusement libérer la place qu\'on t\'a réservée. Choisis ton créneau maintenant, tu recevras l\'invitation dans ton calendrier.',
          footer: 'MKR Caucasian Camp. L\'immersion au milieu des champions.',
          waIntro: 'Un doute, une question, un empêchement ? Écris directement à Ruslan sur WhatsApp, c\'est lui qui répond.',
          waLabel: 'Écrire à Ruslan sur WhatsApp',
          waPrefill: 'Bonjour Ruslan, c\'est au sujet de ma candidature MKR et de la visio de sélection.',
          giveUpPrefix: 'Tu ne peux plus venir au camp ?',
          giveUpLink: 'J\'abandonne ma place',
        }
  }

  // variant === 'confirmation' (email post-inscription, copy historique inchangee)
  return en
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
        waIntro: 'A question before booking, or need to plan the call at a specific time? Write to Ruslan directly on WhatsApp.',
        waLabel: 'Message Ruslan on WhatsApp',
        waPrefill: 'Hi Ruslan, I just applied to the MKR camp and I have a question.',
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
        waIntro: 'Une question avant de réserver, ou besoin de caler l\'appel à une heure précise ? Écris directement à Ruslan sur WhatsApp.',
        waLabel: 'Écrire à Ruslan sur WhatsApp',
        waPrefill: 'Bonjour Ruslan, je viens de postuler au camp MKR et j\'ai une question.',
      }
}

/**
 * Construit l'email « visio de selection » (objet + HTML + texte).
 * Pur : aucune I/O, aucun envoi. Le caller decide du destinataire et du tag Resend.
 */
export function buildVisioEmail(input: VisioEmailInput): BuiltVisioEmail {
  const en = input.locale === 'en'
  const prenom = escapeHtml(input.prenom || (en ? 'there' : ''))
  const c = buildCopy(input.variant, input.locale, prenom)

  const discipline = input.campDiscipline
    ? (en ? DISCIPLINE_LABELS_EN[input.campDiscipline] : DISCIPLINE_LABELS_FR[input.campDiscipline])
    : null
  const duree = input.dureeSemaines ? String(input.dureeSemaines) : null

  const recapCell = (label: string, value: string) =>
    `<tr><td style="padding:8px 14px;color:#8A8A84;font-size:13px;border-bottom:1px solid #262626">${escapeHtml(label)}</td><td style="padding:8px 14px;color:#F1F1EF;font-size:14px;font-weight:600;border-bottom:1px solid #262626;text-align:right">${escapeHtml(value)}</td></tr>`
  const recapRows = `${discipline ? recapCell(c.campLabel, discipline) : ''}${duree ? recapCell(c.durationLabel, duree) : ''}`

  // Bloc « J'abandonne ma place » (reminder only, si un lien d'annulation est fourni).
  // Lien secondaire, muted, volontairement discret sous le CTA principal.
  const showGiveUp = input.variant === 'reminder' && !!input.cancelUrl && !!c.giveUpLink
  const giveUpHtml = showGiveUp
    ? `<div style="margin:18px 0 4px;padding-top:16px;border-top:1px solid #1c1c1c;text-align:center">
        <span style="color:#6f6f6a;font-size:12px">${escapeHtml(c.giveUpPrefix || '')}</span><br>
        <a href="${escapeHtml(input.cancelUrl || '')}" style="display:inline-block;margin-top:8px;padding:9px 18px;color:#9a9a95;font-size:13px;font-weight:600;text-decoration:none;border:1px solid #2e2e2e;border-radius:7px">${escapeHtml(c.giveUpLink || '')}</a>
      </div>`
    : ''

  // Porte de sortie humaine : le candidat qui a une question n'a pas a chercher
  // un canal. Secondaire, sous l'encart d'urgence, jamais au-dessus du CTA Cal.
  const waUrl = whatsappUrl(c.waPrefill)
  const whatsAppHtml = `<div style="margin:20px 0 4px;padding-top:18px;border-top:1px solid #1c1c1c">
        <p style="margin:0 0 12px;color:#8A8A84;font-size:13px;line-height:1.65">${escapeHtml(c.waIntro)}</p>
        ${renderWhatsAppButtonHtml(waUrl, c.waLabel)}
      </div>`

  const html = `<!DOCTYPE html>
<html lang="${en ? 'en' : 'fr'}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"></head>
<body style="margin:0;padding:0;background:#000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(c.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000"><tr><td align="center" style="padding:24px 12px">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#0E0E0E;border:1px solid #262626;border-radius:14px;overflow:hidden">
    <tr><td align="center" style="padding:24px 24px 22px;background:#ffffff;border-bottom:1px solid #e5e5e5">
      <img src="${SITE_URL}/logo-dark.png" width="150" alt="MKR Caucasian Camp" style="display:block;width:150px;height:auto;border:0">
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
      ${whatsAppHtml}
      ${giveUpHtml}
    </td></tr>
    <tr><td style="padding:20px 26px;background:#050505;border-top:1px solid #1c1c1c;color:#6f6f6a;font-size:12px;line-height:1.6">${escapeHtml(c.footer)}</td></tr>
  </table>
</td></tr></table>
</body></html>`

  const giveUpText = showGiveUp ? `\n\n${c.giveUpPrefix} ${c.giveUpLink}: ${input.cancelUrl}` : ''
  const text = `${c.intro}\n\n${c.cta}: ${CAL_BOOKING_URL}\n\n${c.urgency}\n\n${c.waIntro}\n${c.waLabel}: ${waUrl}${giveUpText}\n\n${c.footer}`

  return { subject: c.subject, html, text }
}

import { escapeHtml } from '@/lib/email'

// Pages HTML brandees de la route publique /api/cancel-place (abandon de place depuis
// l'email de relance). Isole du route handler pour rester testable / previsualisable.
// Meme langage visuel que l'email visio (bandeau logo blanc + carte sombre).

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://mkrcamp.com').replace(/\/$/, '')
const CAL_BOOKING_URL = `https://cal.com/${process.env.NEXT_PUBLIC_CAL_LINK || 'ruslan-mukhtarov-mkr/15min'}`
const CONTACT_EMAIL = 'contact@mkrcamp.com'

export type CancelLocale = 'fr' | 'en'
export type CancelPageState = 'confirm' | 'done' | 'already' | 'not_cancellable' | 'invalid'

export interface CancelPageResult {
  html: string
  status: number
}

interface ShellInput {
  locale: CancelLocale
  status: number
  accent: string
  heading: string
  /** Peut contenir du HTML de confiance (liens mailto/site) -> non echappe. */
  lead: string
  actionsHtml?: string
}

function shell({ locale, status, accent, heading, lead, actionsHtml }: ShellInput): CancelPageResult {
  const footer =
    locale === 'en'
      ? 'MKR Caucasian Camp. Immersion among champions.'
      : 'MKR Caucasian Camp. L\'immersion au milieu des champions.'
  const html = `<!DOCTYPE html>
<html lang="${locale}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>MKR Caucasian Camp</title></head>
<body style="margin:0;padding:0;background:#000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000;min-height:100vh"><tr><td align="center" valign="middle" style="padding:32px 14px">
  <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="width:100%;max-width:520px;background:#0E0E0E;border:1px solid #262626;border-radius:16px;overflow:hidden">
    <tr><td align="center" style="padding:26px 24px 24px;background:#ffffff;border-bottom:1px solid #e5e5e5">
      <img src="${SITE_URL}/logo-dark.png" width="150" alt="MKR Caucasian Camp" style="display:block;width:150px;height:auto;border:0">
    </td></tr>
    <tr><td style="padding:34px 30px 30px">
      <h1 style="margin:0 0 14px;color:${accent};font-size:24px;font-weight:800;line-height:1.2">${heading}</h1>
      <p style="margin:0 0 24px;color:#C9C9C4;font-size:15px;line-height:1.7">${lead}</p>
      ${actionsHtml ?? ''}
    </td></tr>
    <tr><td style="padding:20px 30px;background:#050505;border-top:1px solid #1c1c1c;color:#6f6f6a;font-size:12px;line-height:1.6">${escapeHtml(footer)}</td></tr>
  </table>
</td></tr></table>
</body></html>`
  return { html, status }
}

function primaryButton(href: string, label: string): string {
  return `<div style="text-align:center;margin:0 0 8px"><a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 28px;background:#C0392B;color:#fff;font-size:15px;font-weight:700;text-decoration:none;border-radius:9px">${escapeHtml(label)}</a></div>`
}

function ghostLink(href: string, label: string): string {
  return `<div style="text-align:center;margin:14px 0 0"><a href="${escapeHtml(href)}" style="color:#9a9a95;font-size:13px;text-decoration:underline">${escapeHtml(label)}</a></div>`
}

function mailtoContact(color = '#C84B31'): string {
  return `<a href="mailto:${CONTACT_EMAIL}" style="color:${color}">${CONTACT_EMAIL}</a>`
}

/**
 * Construit la page (html + code HTTP) pour un etat du flux d'abandon de place.
 * `confirm` requiert `id` + `token` (formulaire POST). Les autres etats les ignorent.
 */
export function buildCancelPage(
  state: CancelPageState,
  opts: { locale?: CancelLocale; id?: string; token?: string } = {},
): CancelPageResult {
  const locale: CancelLocale = opts.locale ?? 'fr'
  const en = locale === 'en'

  switch (state) {
    case 'confirm': {
      const id = opts.id ?? ''
      const token = opts.token ?? ''
      const form = `<form method="POST" action="/api/cancel-place" style="margin:0">
    <input type="hidden" name="c" value="${escapeHtml(id)}">
    <input type="hidden" name="t" value="${escapeHtml(token)}">
    <div style="text-align:center;margin:0 0 8px">
      <button type="submit" style="display:inline-block;padding:14px 28px;background:#C0392B;color:#fff;font-size:15px;font-weight:700;border:0;border-radius:9px;cursor:pointer">${en ? 'I give up my place' : 'J\'abandonne ma place'}</button>
    </div>
  </form>`
      return shell({
        locale,
        status: 200,
        accent: '#F8F8F8',
        heading: en ? 'Give up your place?' : 'Abandonner ta place ?',
        lead: en
          ? 'You are about to release your place at MKR Caucasian Camp. This is final: your application will be cancelled and your place made available to someone else.'
          : 'Tu es sur le point de libérer ta place au MKR Caucasian Camp. Cette action est définitive : ta candidature sera annulée et ta place rendue disponible pour quelqu\'un d\'autre.',
        actionsHtml:
          form + ghostLink(CAL_BOOKING_URL, en ? 'No, I will book my call instead' : 'Non, je réserve plutôt ma visio'),
      })
    }

    case 'done':
      return shell({
        locale,
        status: 200,
        accent: '#22C55E',
        heading: en ? 'Your place is released' : 'Ta place est libérée',
        lead: en
          ? 'Done. Your application is cancelled and your place is available again. Thanks for letting us know. If you change your mind, you can apply again anytime.'
          : 'C\'est fait. Ta candidature est annulée et ta place est de nouveau disponible. Merci de nous avoir prévenus. Si tu changes d\'avis, tu peux repostuler à tout moment.',
        actionsHtml: primaryButton(SITE_URL, en ? 'Back to mkrcamp.com' : 'Retour sur mkrcamp.com'),
      })

    case 'already':
      return shell({
        locale,
        status: 200,
        accent: '#9a9a95',
        heading: en ? 'Place already cancelled' : 'Place déjà annulée',
        lead: en
          ? `Your application was already cancelled, there is nothing more to do. If this is a mistake, email us at ${mailtoContact()}.`
          : `Ta candidature était déjà annulée, il n'y a rien de plus à faire. Si c'est une erreur, écris-nous à ${mailtoContact()}.`,
        actionsHtml: ghostLink(SITE_URL, 'mkrcamp.com'),
      })

    case 'not_cancellable':
      return shell({
        locale,
        status: 409,
        accent: '#E0A800',
        heading: en ? 'Your file has moved on' : 'Ton dossier a avancé',
        lead: en
          ? `Your file has already progressed and can no longer be cancelled from this link. For any change, email us at ${mailtoContact()} and we will take care of it.`
          : `Ton dossier a déjà évolué et ne peut plus être annulé depuis ce lien. Pour toute modification, écris-nous à ${mailtoContact()} et on s'en occupe.`,
        actionsHtml: ghostLink(SITE_URL, 'mkrcamp.com'),
      })

    case 'invalid':
    default:
      // Token KO : langue inconnue -> FR par defaut (canonical).
      return shell({
        locale: 'fr',
        status: 404,
        accent: '#9a9a95',
        heading: 'Lien invalide',
        lead: `Ce lien n'est plus valide. Si tu voulais annuler ou modifier ta candidature, écris-nous à ${mailtoContact()}.`,
        actionsHtml: ghostLink(SITE_URL, 'mkrcamp.com'),
      })
  }
}

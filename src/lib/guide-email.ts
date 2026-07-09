import { escapeHtml } from '@/lib/email'

// Email transactionnel « Ton guide du Caucase » envoyé au lead juste après le
// download — cf. PLAN_EMAIL_AUTOMATION.md §4 C0.
//
// Règles email MKR (David, 2026-07-09) :
//   - JAMAIS de tiret cadratin dans le contenu (séparateur autorisé : « · »)
//   - photos hébergées sur le site en JPEG (public/images/email/, compat Outlook)
//   - dark mode ET light mode gérés : design sombre de marque FIXE, verrouillé
//     par bgcolor + couleurs inline + garde prefers-color-scheme (!important)
//     pour empêcher les inversions partielles des clients mail
//   - responsive (fluide 560px, media query < 480px)
//   - FR + EN, français avec accents corrects
//
// Règle stricte (LCD) : C0 = UN SEUL email, déclenché par la demande du lead
// (transactionnel). Aucune séquence nurture derrière sans opt-in explicite (C1).

export type GuideEmailLocale = 'fr' | 'en'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://mkrcamp.com').replace(/\/$/, '')

interface GuideEmailCopy {
  subject: string
  preheader: string
  hello: string
  intro: string
  cta: string
  tipsTitle: string
  tips: string[]
  candidatureLine: string
  ctaCandidature: string
  signoff: string
  signatureName: string
  signatureRole: string
  footer: string
  pdfPath: string
  tunnelPath: string
  heroAlt: string
  actionAlt: string
}

const COPY: Record<GuideEmailLocale, GuideEmailCopy> = {
  fr: {
    subject: 'Ton guide du Caucase est là',
    preheader: 'La région, les salles, la logistique : tout ce qu il faut savoir avant de venir t entraîner.',
    hello: 'Salut,',
    intro:
      'Merci pour ton intérêt pour le camp. Voici ton guide : la région, les salles, l ambiance des entraînements, la logistique. Tout ce qu il faut savoir avant de venir t entraîner au Daghestan ou en Tchétchénie.',
    cta: 'Télécharger le guide (PDF)',
    tipsTitle: 'Trois choses à savoir',
    tips: [
      'Le niveau n est pas un critère d entrée : les entraînements sont adaptés, des amateurs motivés aux pros.',
      'Une session = 15 places maximum. Les dossiers sont validés dans l ordre des visios de sélection.',
      'Tout est pris en charge sur place (transferts, hébergement, repas, salles). Tu n as que ton billet à gérer.',
    ],
    candidatureLine: 'Si tu te projettes déjà, la candidature prend 3 minutes :',
    ctaCandidature: 'Poser ma candidature',
    signoff: 'À bientôt,',
    signatureName: 'Ruslan Mukhtarov',
    signatureRole: 'Fondateur · MKR Caucasian Camp',
    footer:
      'Tu reçois cet email parce que tu as demandé le guide sur mkrcamp.com. Une question ? Réponds directement à ce message.',
    pdfPath: '/guide-caucase.pdf',
    tunnelPath: '/mkr-camp-2026',
    heroAlt: 'Le guide du Caucase MKR, ouvert sur la carte de la région',
    actionAlt: 'Entraînement de lutte au Daghestan, travail de takedown',
  },
  en: {
    subject: 'Your Caucasus guide is here',
    preheader: 'The region, the gyms, the logistics: everything you need to know before coming to train.',
    hello: 'Hey,',
    intro:
      'Thanks for your interest in the camp. Here is your guide: the region, the gyms, the training culture, the logistics. Everything you need to know before coming to train in Dagestan or Chechnya.',
    cta: 'Download the guide (PDF)',
    tipsTitle: 'Three things to know',
    tips: [
      'Your level is not an entry barrier: training is adapted, from motivated amateurs to pros.',
      'One session = 15 spots maximum. Applications are validated in the order of selection calls.',
      'Everything is handled on site (transfers, accommodation, meals, gyms). You only book your flight.',
    ],
    candidatureLine: 'Already picturing yourself there? Applying takes 3 minutes:',
    ctaCandidature: 'Apply now',
    signoff: 'See you soon,',
    signatureName: 'Ruslan Mukhtarov',
    signatureRole: 'Founder · MKR Caucasian Camp',
    footer:
      'You are receiving this email because you requested the guide on mkrcamp.com. Questions? Just reply to this message.',
    pdfPath: '/caucasus-guide.pdf',
    tunnelPath: '/en/mkr-camp-2026',
    heroAlt: 'The MKR Caucasus guide, open on the map of the region',
    actionAlt: 'Wrestling training in Dagestan, takedown work',
  },
}

export interface BuiltGuideEmail {
  subject: string
  html: string
  text: string
}

// Palette de marque (identique aux emails visio) : fond noir, orange #C84B31,
// gris chauds. Couleurs FIXES quel que soit le mode du client mail.
const C = {
  bodyBg: '#000000',
  cardBg: '#111110',
  border: '#2e2e2e',
  text: '#ffffff',
  muted: '#9a9a95',
  faint: '#6f6f6a',
  orange: '#C84B31',
} as const

export function buildGuideEmail(locale: GuideEmailLocale): BuiltGuideEmail {
  const c = COPY[locale]
  const pdfUrl = `${SITE_URL}${c.pdfPath}`
  const tunnelUrl = `${SITE_URL}${c.tunnelPath}`

  const tipsHtml = c.tips
    .map(
      (t) => `
        <tr>
          <td valign="top" style="width:18px;padding:0 0 12px;color:${C.orange};font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;line-height:1.6">&middot;</td>
          <td style="padding:0 0 12px;color:${C.muted};font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7" class="mob-text">${escapeHtml(t)}</td>
        </tr>`,
    )
    .join('')

  const html = `<!DOCTYPE html>
<html lang="${locale}" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark light">
  <meta name="supported-color-schemes" content="dark light">
  <title>${escapeHtml(c.subject)}</title>
  <style>
    :root { color-scheme: dark light; supported-color-schemes: dark light; }
    body { margin: 0; padding: 0; }
    img { border: 0; outline: none; text-decoration: none; }
    /* Design sombre de marque : on VERROUILLE les couleurs dans les deux modes
       pour neutraliser les inversions automatiques partielles. */
    @media (prefers-color-scheme: dark) {
      .bg-body { background-color: ${C.bodyBg} !important; }
      .bg-card { background-color: ${C.cardBg} !important; }
      .t-main { color: ${C.text} !important; }
      .t-muted { color: ${C.muted} !important; }
      .t-faint { color: ${C.faint} !important; }
    }
    @media (prefers-color-scheme: light) {
      .bg-body { background-color: ${C.bodyBg} !important; }
      .bg-card { background-color: ${C.cardBg} !important; }
      .t-main { color: ${C.text} !important; }
      .t-muted { color: ${C.muted} !important; }
      .t-faint { color: ${C.faint} !important; }
    }
    @media only screen and (max-width: 480px) {
      .container { width: 100% !important; }
      .mob-pad { padding-left: 20px !important; padding-right: 20px !important; }
      .mob-text { font-size: 15px !important; }
      .mob-btn a { display: block !important; text-align: center !important; }
    }
  </style>
</head>
<body class="bg-body" style="margin:0;padding:0;background-color:${C.bodyBg}" bgcolor="${C.bodyBg}">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${escapeHtml(c.preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bg-body" style="background-color:${C.bodyBg}" bgcolor="${C.bodyBg}">
    <tr><td align="center" style="padding:28px 12px">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" class="container" style="max-width:560px;width:100%">

        <tr><td style="padding:0 4px 22px">
          <img src="${SITE_URL}/logo-dark.png" width="140" alt="MKR Caucasian Camp" style="display:block;width:140px;height:auto">
        </td></tr>

        <tr><td class="bg-card" style="background-color:${C.cardBg};border:1px solid ${C.border};border-radius:12px;overflow:hidden" bgcolor="${C.cardBg}">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">

            <tr><td>
              <a href="${pdfUrl}" style="text-decoration:none">
                <img src="${SITE_URL}/images/email/guide-mockup.jpg" width="558" alt="${escapeHtml(c.heroAlt)}" style="display:block;width:100%;height:auto">
              </a>
            </td></tr>

            <tr><td class="mob-pad" style="padding:28px 32px 0">
              <p class="t-main" style="margin:0 0 14px;color:${C.text};font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6">${escapeHtml(c.hello)}</p>
              <p class="t-muted mob-text" style="margin:0 0 24px;color:${C.muted};font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.75">${escapeHtml(c.intro)}</p>
            </td></tr>

            <tr><td class="mob-pad mob-btn" style="padding:0 32px 28px">
              <a href="${pdfUrl}" style="display:inline-block;padding:14px 28px;background-color:${C.orange};color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;text-decoration:none;border-radius:8px">${escapeHtml(c.cta)}</a>
            </td></tr>

            <tr><td class="mob-pad" style="padding:0 32px 6px">
              <p class="t-main" style="margin:0 0 12px;color:${C.text};font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;letter-spacing:0.3px;text-transform:uppercase">${escapeHtml(c.tipsTitle)}</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${tipsHtml}</table>
            </td></tr>

            <tr><td style="padding:8px 0 0">
              <img src="${SITE_URL}/images/email/action-takedown.jpg" width="558" alt="${escapeHtml(c.actionAlt)}" style="display:block;width:100%;height:auto">
            </td></tr>

            <tr><td class="mob-pad" style="padding:26px 32px 6px">
              <p class="t-muted mob-text" style="margin:0 0 16px;color:${C.muted};font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7">${escapeHtml(c.candidatureLine)}</p>
            </td></tr>
            <tr><td class="mob-pad mob-btn" style="padding:0 32px 30px">
              <a href="${tunnelUrl}" style="display:inline-block;padding:12px 24px;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;text-decoration:none;border:1px solid ${C.orange};border-radius:8px">${escapeHtml(c.ctaCandidature)}</a>
            </td></tr>

            <tr><td class="mob-pad" style="padding:0 32px 30px">
              <table role="presentation" cellpadding="0" cellspacing="0" style="border-top:1px solid ${C.border};width:100%">
                <tr>
                  <td style="padding:22px 14px 0 0;width:56px">
                    <img src="${SITE_URL}/images/ruslan/ruslan-portrait-chemise-noire.jpg" width="56" height="56" alt="${escapeHtml(c.signatureName)}" style="display:block;width:56px;height:56px;border-radius:50%;border:2px solid ${C.orange}">
                  </td>
                  <td style="padding:22px 0 0">
                    <p class="t-faint" style="margin:0 0 2px;color:${C.faint};font-family:Arial,Helvetica,sans-serif;font-size:13px">${escapeHtml(c.signoff)}</p>
                    <p class="t-main" style="margin:0;color:${C.text};font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700">${escapeHtml(c.signatureName)}</p>
                    <p class="t-muted" style="margin:2px 0 0;color:${C.muted};font-family:Arial,Helvetica,sans-serif;font-size:12px">${escapeHtml(c.signatureRole)}</p>
                  </td>
                </tr>
              </table>
            </td></tr>

          </table>
        </td></tr>

        <tr><td style="padding:18px 8px 0">
          <p class="t-faint" style="margin:0;color:${C.faint};font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6">${escapeHtml(c.footer)}</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  const text = [
    c.hello,
    '',
    c.intro,
    '',
    `${c.cta} : ${pdfUrl}`,
    '',
    `${c.tipsTitle} :`,
    ...c.tips.map((t) => `- ${t}`),
    '',
    `${c.candidatureLine} ${tunnelUrl}`,
    '',
    c.signoff,
    `${c.signatureName} · ${c.signatureRole}`,
    '',
    c.footer,
  ].join('\n')

  return { subject: c.subject, html, text }
}

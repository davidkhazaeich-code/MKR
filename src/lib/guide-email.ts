import { escapeHtml } from '@/lib/email'

// Email transactionnel « Ton guide du Caucase » envoye au lead juste apres le
// download — cf. PLAN_EMAIL_AUTOMATION.md §4 C0.
//
// Regle stricte (LCD) : C0 = UN SEUL email, declenche par la demande du lead
// (transactionnel). Aucune sequence nurture derriere sans opt-in explicite (C1).
// Meme mise en page que les emails candidat (logo, theme sombre, CTA orange).

export type GuideEmailLocale = 'fr' | 'en'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://mkrcamp.com').replace(/\/$/, '')

interface GuideEmailCopy {
  subject: string
  hello: string
  intro: string
  cta: string
  tipsTitle: string
  tips: string[]
  ctaCandidature: string
  candidatureLine: string
  signoff: string
  signature: string
  footer: string
  pdfPath: string
  tunnelPath: string
}

const COPY: Record<GuideEmailLocale, GuideEmailCopy> = {
  fr: {
    subject: 'Ton guide du Caucase est la — MKR Caucasian Camp',
    hello: 'Salut,',
    intro:
      'Merci pour ton interet pour le camp. Voici ton guide : la region, les salles, l ambiance des entrainements, la logistique — tout ce qu il faut savoir avant de venir t entrainer au Dagestan ou en Tchetchenie.',
    cta: 'Telecharger le guide (PDF)',
    tipsTitle: 'Trois choses a savoir :',
    tips: [
      'Le niveau n est pas un critere d entree : les entrainements sont adaptes, des amateurs motives aux pros.',
      'Une session = 15 places maximum. Les dossiers sont valides dans l ordre des visios de selection.',
      'Tout est pris en charge sur place (transferts, hebergement, repas, salles) — tu n as que ton billet a gerer.',
    ],
    candidatureLine: 'Si tu te projettes deja, la candidature prend 3 minutes :',
    ctaCandidature: 'Poser ma candidature',
    signoff: 'A bientot,',
    signature: 'Ruslan — MKR Caucasian Camp',
    footer: 'Tu recois cet email parce que tu as demande le guide sur mkrcamp.com. Une question ? Reponds directement a ce message.',
    pdfPath: '/guide-caucase.pdf',
    tunnelPath: '/mkr-camp-2026',
  },
  en: {
    subject: 'Your Caucasus guide is here — MKR Caucasian Camp',
    hello: 'Hey,',
    intro:
      'Thanks for your interest in the camp. Here is your guide: the region, the gyms, the training culture, logistics — everything you need to know before coming to train in Dagestan or Chechnya.',
    cta: 'Download the guide (PDF)',
    tipsTitle: 'Three things to know:',
    tips: [
      'Your level is not an entry barrier: training is adapted, from motivated amateurs to pros.',
      'One session = 15 spots maximum. Applications are validated in the order of selection calls.',
      'Everything is handled on site (transfers, accommodation, meals, gyms) — you only book your flight.',
    ],
    candidatureLine: 'Already picturing yourself there? Applying takes 3 minutes:',
    ctaCandidature: 'Apply now',
    signoff: 'See you soon,',
    signature: 'Ruslan — MKR Caucasian Camp',
    footer: 'You are receiving this email because you requested the guide on mkrcamp.com. Questions? Just reply to this message.',
    pdfPath: '/caucasus-guide.pdf',
    tunnelPath: '/en/mkr-camp-2026',
  },
}

export interface BuiltGuideEmail {
  subject: string
  html: string
  text: string
}

export function buildGuideEmail(locale: GuideEmailLocale): BuiltGuideEmail {
  const c = COPY[locale]
  const pdfUrl = `${SITE_URL}${c.pdfPath}`
  const tunnelUrl = `${SITE_URL}${c.tunnelPath}`

  const tipsHtml = c.tips
    .map(
      (t) =>
        `<tr><td style="padding:0 0 10px;color:#9a9a95;font-size:14px;line-height:1.6"><span style="color:#C84B31;font-weight:700">&bull;</span>&nbsp; ${escapeHtml(t)}</td></tr>`,
    )
    .join('')

  const html = `<!DOCTYPE html>
<html lang="${locale}">
<body style="margin:0;padding:0;background:#000000">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000000">
    <tr><td align="center" style="padding:32px 16px">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
        <tr><td style="padding:0 0 24px">
          <img src="${SITE_URL}/logo-dark.png" width="150" alt="MKR Caucasian Camp" style="display:block;width:150px;height:auto;border:0">
        </td></tr>
        <tr><td style="padding:0 0 16px;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6">
          ${escapeHtml(c.hello)}
        </td></tr>
        <tr><td style="padding:0 0 20px;color:#9a9a95;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7">
          ${escapeHtml(c.intro)}
        </td></tr>
        <tr><td style="padding:0 0 28px">
          <a href="${pdfUrl}" style="display:inline-block;padding:13px 26px;background:#C84B31;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;text-decoration:none;border-radius:8px">${escapeHtml(c.cta)}</a>
        </td></tr>
        <tr><td style="padding:0 0 8px;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700">
          ${escapeHtml(c.tipsTitle)}
        </td></tr>
        <tr><td style="padding:0 0 20px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif">${tipsHtml}</table>
        </td></tr>
        <tr><td style="padding:0 0 12px;color:#9a9a95;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6">
          ${escapeHtml(c.candidatureLine)}
        </td></tr>
        <tr><td style="padding:0 0 28px">
          <a href="${tunnelUrl}" style="display:inline-block;padding:11px 22px;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;text-decoration:none;border:1px solid #C84B31;border-radius:8px">${escapeHtml(c.ctaCandidature)}</a>
        </td></tr>
        <tr><td style="padding:0 0 4px;color:#9a9a95;font-family:Arial,Helvetica,sans-serif;font-size:14px">${escapeHtml(c.signoff)}</td></tr>
        <tr><td style="padding:0 0 28px;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700">${escapeHtml(c.signature)}</td></tr>
        <tr><td style="padding:16px 0 0;border-top:1px solid #2e2e2e;color:#6f6f6a;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6">
          ${escapeHtml(c.footer)}
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
    c.tipsTitle,
    ...c.tips.map((t) => `- ${t}`),
    '',
    `${c.candidatureLine} ${tunnelUrl}`,
    '',
    c.signoff,
    c.signature,
    '',
    c.footer,
  ].join('\n')

  return { subject: c.subject, html, text }
}

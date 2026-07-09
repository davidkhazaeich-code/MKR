import { escapeHtml } from '@/lib/email'
import {
  renderEmailShell,
  renderHeroImage,
  renderParagraph,
  renderSectionTitle,
  renderBullets,
  renderButton,
  renderSignature,
  SITE_URL,
  type EmailLocale,
} from '@/lib/email-layout'

// Email transactionnel « Ton guide du Caucase » envoyé au lead juste après le
// download — cf. PLAN_EMAIL_AUTOMATION.md §4 C0. Shell partagé : email-layout.ts.
//
// Règle stricte (LCD) : C0 = UN SEUL email, déclenché par la demande du lead
// (transactionnel). Aucune séquence nurture derrière sans opt-in explicite (C1).

export type GuideEmailLocale = EmailLocale

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
    footer:
      'Tu reçois cet email parce que tu as demandé le guide sur mkrcamp.com. Une question ? Réponds directement à ce message.',
    pdfPath: '/guide-caucase.pdf',
    tunnelPath: '/mkr-camp-2026',
    heroAlt: 'Le guide du Caucase MKR, ouvert sur la carte de la région',
    actionAlt: 'Séance au camp : le groupe réuni en cercle autour de la démonstration',
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
    footer:
      'You are receiving this email because you requested the guide on mkrcamp.com. Questions? Just reply to this message.',
    pdfPath: '/caucasus-guide.pdf',
    tunnelPath: '/en/mkr-camp-2026',
    heroAlt: 'The MKR Caucasus guide, open on the map of the region',
    actionAlt: 'Camp session: the group gathered around the demonstration',
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

  const contentRows = [
    renderHeroImage('guide-mockup.jpg', c.heroAlt, pdfUrl),
    renderParagraph(escapeHtml(c.hello), { main: true, padTop: true }),
    renderParagraph(escapeHtml(c.intro)),
    renderButton(pdfUrl, c.cta),
    renderSectionTitle(c.tipsTitle),
    renderBullets(c.tips),
    renderHeroImage('guide-action.jpg', c.actionAlt),
    renderParagraph(escapeHtml(c.candidatureLine), { padTop: true }),
    renderButton(tunnelUrl, c.ctaCandidature, { primary: false }),
    renderSignature(locale, c.signoff),
  ].join('')

  const html = renderEmailShell({
    locale,
    title: c.subject,
    preheader: c.preheader,
    contentRows,
    footer: c.footer,
  })

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
    'Ruslan Mukhtarov · MKR Caucasian Camp',
    '',
    c.footer,
  ].join('\n')

  return { subject: c.subject, html, text }
}

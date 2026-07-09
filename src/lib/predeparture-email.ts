import { escapeHtml } from '@/lib/email'
import {
  renderEmailShell,
  renderHeroImage,
  renderParagraph,
  renderSectionTitle,
  renderBullets,
  renderButton,
  renderSignature,
  formatDateLocale,
  SITE_URL,
  type EmailLocale,
} from '@/lib/email-layout'

// A3 — infos pratiques pré-départ (PLAN_EMAIL_AUTOMATION.md §2).
// Envoyé une seule fois, environ 2 semaines avant contract_start_date, aux
// candidatures soldées. Checklist volontairement générique : le détail vit sur
// /preparer-son-camp (source unique maintenue sur le site, pas dans l'email).

export interface PredepartureEmailInput {
  locale: EmailLocale
  prenom: string | null
  /** YYYY-MM-DD */
  startDate: string
  dureeSemaines: number | null
}

export interface BuiltPredepartureEmail {
  subject: string
  html: string
  text: string
}

export function buildPredepartureEmail(input: PredepartureEmailInput): BuiltPredepartureEmail {
  const { locale } = input
  const prenom = input.prenom?.trim() || null
  const date = formatDateLocale(input.startDate, locale)

  const fr = {
    subject: `Départ le ${date} · prépare ton camp`,
    preheader: 'Passeport, équipement, arrivée : la checklist pour partir serein. Sur place, on s’occupe du reste.',
    hello: prenom ? `Salut ${prenom},` : 'Salut,',
    intro: `Ça se concrétise : ton camp commence le ${date}${input.dureeSemaines ? ` pour ${input.dureeSemaines} semaine${input.dureeSemaines > 1 ? 's' : ''}` : ''}. Voici l’essentiel pour arriver prêt.`,
    checklistTitle: 'Ta checklist avant le départ',
    checklist: [
      'Passeport valide au moins 6 mois après la date de retour.',
      'Visa ou e-visa selon ta nationalité : vérifie maintenant, les délais varient (tout est détaillé dans le guide de préparation).',
      'Billet d’avion : l’arrivée et le transfert sur place sont organisés par nos soins, envoie-nous tes horaires dès que c’est réservé.',
      'Équipement d’entraînement : maillot ou rashguard, chaussures de lutte, protège-dents. Le reste peut se trouver sur place.',
      'Assurance voyage qui couvre la pratique sportive.',
    ],
    onSite: 'Une fois sur place, tu n’as plus à penser à rien : transferts, hébergement, repas et salles sont pris en charge. Ton seul travail, c’est de t’entraîner.',
    cta: 'Consulter le guide de préparation',
    reply: 'Une question sur le voyage ou l’équipement ? Réponds directement à cet email.',
    footer: 'Email automatique lié à ton inscription MKR Caucasian Camp. Réponds directement à ce message pour parler à un humain.',
    signoff: 'On se voit très bientôt,',
    heroAlt: 'Lever de soleil sur le lac Kezenoy, dans les montagnes du Caucase',
    mealAlt: 'Repas d’équipe au camp après l’entraînement',
    guidePath: '/preparer-son-camp',
  }

  const en = {
    subject: `Departure on ${date} · get ready for camp`,
    preheader: 'Passport, gear, arrival: the checklist to leave with peace of mind. On site, we handle the rest.',
    hello: prenom ? `Hey ${prenom},` : 'Hey,',
    intro: `It is getting real: your camp starts on ${date}${input.dureeSemaines ? ` for ${input.dureeSemaines} week${input.dureeSemaines > 1 ? 's' : ''}` : ''}. Here is what you need to arrive ready.`,
    checklistTitle: 'Your pre-departure checklist',
    checklist: [
      'Passport valid at least 6 months after your return date.',
      'Visa or e-visa depending on your nationality: check now, processing times vary (all detailed in the preparation guide).',
      'Flight ticket: arrival and on-site transfers are organized by us, send us your schedule as soon as it is booked.',
      'Training gear: singlet or rashguard, wrestling shoes, mouthguard. The rest can be found locally.',
      'Travel insurance covering sports practice.',
    ],
    onSite: 'Once you are there, you have nothing left to think about: transfers, accommodation, meals and gyms are all handled. Your only job is to train.',
    cta: 'Read the preparation guide',
    reply: 'Any question about the trip or the gear? Just reply to this email.',
    footer: 'Automated email related to your MKR Caucasian Camp registration. Reply directly to this message to talk to a human.',
    signoff: 'See you very soon,',
    heroAlt: 'Sunrise over Lake Kezenoy in the Caucasus mountains',
    mealAlt: 'Team meal at the camp after training',
    guidePath: '/en/preparer-son-camp',
  }

  const c = locale === 'en' ? en : fr

  const contentRows = [
    renderHeroImage('predeparture-lake.jpg', c.heroAlt),
    renderParagraph(escapeHtml(c.hello), { main: true, padTop: true }),
    renderParagraph(escapeHtml(c.intro)),
    renderSectionTitle(c.checklistTitle),
    renderBullets(c.checklist),
    renderButton(`${SITE_URL}${c.guidePath}`, c.cta),
    renderHeroImage('predeparture-meal.jpg', c.mealAlt),
    renderParagraph(escapeHtml(c.onSite), { padTop: true }),
    renderParagraph(escapeHtml(c.reply)),
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
    `${c.checklistTitle} :`,
    ...c.checklist.map((t) => `- ${t}`),
    '',
    `${c.cta} : ${SITE_URL}${c.guidePath}`,
    '',
    c.onSite,
    '',
    c.reply,
    '',
    c.signoff,
    'Ruslan Mukhtarov · MKR Caucasian Camp',
    '',
    c.footer,
  ].join('\n')

  return { subject: c.subject, html, text }
}

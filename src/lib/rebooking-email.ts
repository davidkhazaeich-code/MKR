import { escapeHtml } from '@/lib/email'
import {
  renderEmailShell,
  renderHeroImage,
  renderParagraph,
  renderSectionTitle,
  renderBullets,
  renderButton,
  renderSignature,
  renderWhatsAppBlock,
  whatsAppTextLine,
  SITE_URL,
  type EmailLocale,
} from '@/lib/email-layout'
import { whatsappUrl } from '@/data/site'
import { getSessions, sessionFromId, type SeasonKey } from '@/data/sessions'
import { sessionDisplayStatic } from '@/lib/session-display-static'

/**
 * Email de repositionnement : proposer une autre session a un candidat dont le
 * camp est parti sans lui.
 *
 * Regle de ton posee par David : ne JAMAIS renvoyer la faute au candidat. On ne
 * dit pas qu'il n'a pas donne suite, qu'il n'a pas repondu, ni qu'il a laisse
 * passer sa place. On constate que le camp est parti, et on avance. Le seul
 * fait mentionne est factuel et sans reproche.
 *
 * Deux variantes, parce que les deux situations ne se ressemblent pas :
 *  - `validee` : Ruslan avait deja fait la visio et valide le dossier. On le
 *    dit, c'est valorisant et c'est vrai. Le candidat n'a plus qu'a choisir
 *    une date, il n'a rien a re-prouver.
 *  - `recue`   : la visio n'a jamais eu lieu. C'est l'etape qui manquait, donc
 *    l'appel passe en action principale.
 */

export type RebookingVariant = 'validee' | 'recue'
/** Premier envoi, ou rappel 3 jours plus tard si rien n'a bouge. */
export type RebookingStage = 'first' | 'reminder'
export type RebookingDiscipline = 'lutte' | 'mma' | 'combo_quote'

const CAL_BOOKING_URL = `https://cal.com/${process.env.NEXT_PUBLIC_CAL_LINK || 'ruslan-mukhtarov-mkr/15min'}`

export interface RebookingEmailInput {
  locale: EmailLocale
  prenom: string | null
  /** Statut du dossier : pilote la variante de discours. */
  variant: RebookingVariant
  /** Session que le candidat visait, ex. `aout-2026`. */
  missedSessionId: string | null
  campDiscipline: RebookingDiscipline | null
  dureeSemaines: number | null
  /** Tunnel d'origine : le lien de candidature doit y ramener. */
  tunnel?: 'session' | 'custom' | 'famille' | 'groupe' | null
  /** `reminder` = relance courte, 3 jours apres, sans rien reprocher. */
  stage?: RebookingStage
  /** Injectable pour les tests et les apercus. */
  now?: Date
}

export interface BuiltRebookingEmail {
  subject: string
  html: string
  text: string
}

const DESTINATION: Record<RebookingDiscipline, { fr: string; en: string }> = {
  lutte: { fr: 'la lutte au Daghestan', en: 'wrestling in Dagestan' },
  mma: { fr: 'le MMA en Tchétchénie', en: 'MMA in Chechnya' },
  combo_quote: { fr: 'le combo lutte et MMA', en: 'the wrestling and MMA combo' },
}

/**
 * « Le camp d'été », « le camp de printemps » : l'elision francaise depend de la
 * saison. Quatre cas, ecrits une fois, plutot qu'une regle a deviner.
 */
const MISSED_CAMP_FR: Record<SeasonKey, string> = {
  ete: 'd\u2019\u00e9t\u00e9',
  automne: 'd\u2019automne',
  hiver: 'd\u2019hiver',
  printemps: 'de printemps',
}

/** Les prenoms arrivent tels que saisis : « louis » doit s'afficher « Louis ». */
function capitalize(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

function applyPath(locale: EmailLocale, tunnel: RebookingEmailInput['tunnel']): string {
  const type = tunnel === 'famille' ? 'famille' : tunnel === 'groupe' ? 'groupe' : 'session'
  return locale === 'en' ? `/en/apply?type=${type}` : `/inscription?type=${type}`
}

export function buildRebookingEmail(input: RebookingEmailInput): BuiltRebookingEmail {
  const { locale, variant } = input
  const now = input.now ?? new Date()
  const raw = input.prenom?.trim()
  const prenom = raw ? capitalize(raw) : null
  const open = getSessions(now)
  const next = open[0]
  const nextView = sessionDisplayStatic(next, locale)
  const nextYear = next.startDate.slice(0, 4)
  const missedSession = sessionFromId(input.missedSessionId)
  const missedYear = missedSession?.startDate.slice(0, 4) ?? ''
  const missedFr = missedSession ? `Le camp ${MISSED_CAMP_FR[missedSession.seasonKey]} ${missedYear}` : 'Le camp d\u2019ao\u00fbt'
  const missedEn = missedSession
    ? `The ${sessionDisplayStatic(missedSession, 'en').season.toLowerCase()} ${missedYear} camp`
    : 'The August camp'
  const discipline = input.campDiscipline ? DESTINATION[input.campDiscipline][locale] : null
  const weeks = input.dureeSemaines
  const isReminder = input.stage === 'reminder'

  // Une ligne par session ouverte : dates reelles, ecrites depuis la fenetre
  // glissante, donc jamais perimees (cf. data/sessions.ts).
  const sessionLines = open.map((s) => {
    const v = sessionDisplayStatic(s, locale)
    return `${v.season} ${s.startDate.slice(0, 4)} · ${v.dates}`
  })

  const fr = {
    subject: `${prenom ? `${prenom}, ` : ''}on te trouve une autre date pour le Caucase`,
    preheader: `Quatre sessions ouvertes. La prochaine : ${nextView.dates}. Ta place t’attend.`,
    hello: prenom ? `Salut ${prenom},` : 'Salut,',
    // Constat neutre : c'est le camp qui est parti, pas le candidat qui a failli.
    intro: `${missedFr} est parti, et tu n\u2019en étais pas. Les dates ne se sont pas alignées cette fois. \u00c7a arrive plus souvent qu\u2019on ne le croit : un visa qui traîne, un imprévu, une saison de compétition qui déborde.`,
    reassure:
      variant === 'validee'
        ? `Ce que je retiens, c’est que ton dossier était validé de notre côté. Tu n’as donc rien à refaire pour être pris : il te manque juste une date qui tombe bien.`
        : `Ta candidature est bien arrivée chez nous, on n’a simplement pas eu l’occasion de se parler avant le départ. C’est la seule étape qu’il reste.`,
    wantTitle: 'Ce qui t’attend là-bas',
    want: discipline
      ? `Deux entraînements par jour dans les salles où se forme l’élite, ${discipline}, avec des gars qui luttent depuis l’enfance. On s’occupe du visa, du vol intérieur depuis Istanbul, des transferts, du logement et des repas. Toi, tu t’entraînes.`
      : `Deux entraînements par jour dans les salles où se forme l’élite du Caucase, avec des gars qui luttent depuis l’enfance. On s’occupe du visa, du vol intérieur depuis Istanbul, des transferts, du logement et des repas. Toi, tu t’entraînes.`,
    sessionsTitle: 'Les sessions ouvertes',
    sessionsIntro: weeks
      ? `Tu visais ${weeks} semaine${weeks > 1 ? 's' : ''}. C’est possible sur les quatre, tu choisis ta durée dans la fenêtre.`
      : `Tu choisis 1, 2 ou 3 semaines dans la fenêtre de la session.`,
    ctaApply: 'Choisir ma session',
    ctaCall: 'Réserver 15 min avec Ruslan',
    callIntro:
      variant === 'validee'
        ? `Si tu préfères qu’on en parle de vive voix avant de bloquer une date, prends 15 minutes dans mon agenda.`
        : `Le plus simple reste de se parler 15 minutes : je réponds à tes questions et on cale la session qui te convient.`,
    waPrefill: 'Bonjour Ruslan, je voudrais reporter mon camp sur une autre session.',
    footer: 'Tu reçois ce message parce que tu avais candidaté au MKR Caucasian Camp. Réponds directement, c’est Ruslan qui lit.',
    signoff: 'On se rattrape,',
    heroAlt: 'Session d’entraînement sur les tapis au Caucase',
    // Relance : courte, sans reproche, sans pression. On remet juste le lien.
    reminderSubject: `${prenom ? `${prenom}, ` : ''}je te remets le lien pour le Caucase`,
    reminderPreheader: `Prochaine session : ${nextView.dates}. Deux clics et tu es dessus.`,
    reminderIntro: `Je reviens vers toi une dernière fois, au cas où mon message se serait perdu dans ta boîte.`,
    reminderBody: `Les sessions sont toujours ouvertes et il reste des places. La prochaine, c’est ${nextView.season} ${nextYear} : ${nextView.dates}.`,
    reminderClose: `Si le moment n’est pas le bon, aucun souci : dis-le moi d’un mot et je te recontacterai quand ça le sera.`,
    reminderSignoff: 'À très vite,',
  }

  const en = {
    subject: `${prenom ? `${prenom}, ` : ''}let\u2019s find you another date in the Caucasus`,
    preheader: `Four sessions are open. Next one: ${nextView.dates}. Your spot is waiting.`,
    hello: prenom ? `Hey ${prenom},` : 'Hey,',
    intro: `${missedEn} has left, and you were not on it. The dates did not line up this time. It happens more often than you would think: a visa that drags, something unexpected, a competition season that runs long.`,
    reassure:
      variant === 'validee'
        ? `What matters to me is that your file was already approved on our side. So there is nothing to redo to get in: you are only missing a date that works.`
        : `Your application reached us, we simply never got the chance to talk before departure. That is the only step left.`,
    wantTitle: 'What is waiting for you',
    want: discipline
      ? `Two training sessions a day in the gyms where the elite is built, ${discipline}, alongside guys who have been wrestling since childhood. We handle the visa, the domestic flight from Istanbul, the transfers, the accommodation and the meals. You train.`
      : `Two training sessions a day in the gyms where the Caucasus elite is built, alongside guys who have been wrestling since childhood. We handle the visa, the domestic flight from Istanbul, the transfers, the accommodation and the meals. You train.`,
    sessionsTitle: 'Open sessions',
    sessionsIntro: weeks
      ? `You were aiming for ${weeks} week${weeks > 1 ? 's' : ''}. That works on all four, you pick your duration inside the window.`
      : `You pick 1, 2 or 3 weeks inside the session window.`,
    ctaApply: 'Choose my session',
    ctaCall: 'Book 15 min with Ruslan',
    callIntro:
      variant === 'validee'
        ? `If you would rather talk it through before locking a date, take 15 minutes in my calendar.`
        : `The simplest way is to talk for 15 minutes: I answer your questions and we settle on the session that fits you.`,
    waPrefill: 'Hi Ruslan, I would like to move my camp to another session.',
    footer: 'You are receiving this because you applied to MKR Caucasian Camp. Reply directly, Ruslan reads it.',
    signoff: 'Let’s make it happen,',
    heroAlt: 'Training session on the mats in the Caucasus',
    reminderSubject: `${prenom ? `${prenom}, ` : ''}here is that Caucasus link again`,
    reminderPreheader: `Next session: ${nextView.dates}. Two clicks and you are on it.`,
    reminderIntro: `I am coming back to you one last time, in case my message got buried in your inbox.`,
    reminderBody: `The sessions are still open and spots are left. The next one is ${nextView.season} ${nextYear}: ${nextView.dates}.`,
    reminderClose: `If the timing is not right, no problem at all: just say the word and I will come back to you when it is.`,
    reminderSignoff: 'Talk soon,',
  }

  const c = locale === 'en' ? en : fr

  const applyHref = `${SITE_URL}${applyPath(locale, input.tunnel)}`

  // Le rappel est volontairement court : pas de photo pleine largeur, pas de
  // bloc « ce qui t'attend ». Tout ca a deja ete lu il y a trois jours. On
  // remet le lien, on laisse une porte de sortie, on s'arrete.
  const contentRows = (
    isReminder
      ? [
          renderParagraph(escapeHtml(c.hello), { main: true, padTop: true }),
          renderParagraph(escapeHtml(c.reminderIntro)),
          renderParagraph(escapeHtml(c.reminderBody)),
          renderBullets(sessionLines),
          renderButton(applyHref, c.ctaApply),
          renderParagraph(escapeHtml(c.callIntro)),
          renderButton(CAL_BOOKING_URL, c.ctaCall, { primary: false }),
          renderParagraph(escapeHtml(c.reminderClose)),
          renderWhatsAppBlock(locale, whatsappUrl(c.waPrefill)),
          renderSignature(locale, c.reminderSignoff),
        ]
      : [
          renderHeroImage('predeparture-team.jpg', c.heroAlt),
          renderParagraph(escapeHtml(c.hello), { main: true, padTop: true }),
          renderParagraph(escapeHtml(c.intro)),
          renderParagraph(escapeHtml(c.reassure)),
          renderSectionTitle(c.sessionsTitle),
          renderBullets(sessionLines),
          renderParagraph(escapeHtml(c.sessionsIntro)),
          renderButton(applyHref, c.ctaApply),
          renderSectionTitle(c.wantTitle),
          renderParagraph(escapeHtml(c.want)),
          renderParagraph(escapeHtml(c.callIntro), { padTop: true }),
          renderButton(CAL_BOOKING_URL, c.ctaCall, { primary: false }),
          renderWhatsAppBlock(locale, whatsappUrl(c.waPrefill)),
          renderSignature(locale, c.signoff),
        ]
  ).join('')

  const subject = isReminder ? c.reminderSubject : c.subject
  const html = renderEmailShell({
    locale,
    title: subject,
    preheader: isReminder ? c.reminderPreheader : c.preheader,
    contentRows,
    footer: c.footer,
  })

  const text = (
    isReminder
      ? [
          c.hello,
          '',
          c.reminderIntro,
          '',
          c.reminderBody,
          ...sessionLines.map((l) => `- ${l}`),
          '',
          `${c.ctaApply} : ${applyHref}`,
          '',
          c.callIntro,
          `${c.ctaCall} : ${CAL_BOOKING_URL}`,
          '',
          c.reminderClose,
          '',
          whatsAppTextLine(locale, whatsappUrl(c.waPrefill)),
          '',
          c.reminderSignoff,
          'Ruslan Mukhtarov',
          '',
          c.footer,
        ]
      : [
          c.hello,
          '',
          c.intro,
          '',
          c.reassure,
          '',
          `${c.sessionsTitle} :`,
          ...sessionLines.map((l) => `- ${l}`),
          '',
          c.sessionsIntro,
          `${c.ctaApply} : ${applyHref}`,
          '',
          c.wantTitle,
          c.want,
          '',
          c.callIntro,
          `${c.ctaCall} : ${CAL_BOOKING_URL}`,
          '',
          whatsAppTextLine(locale, whatsappUrl(c.waPrefill)),
          '',
          c.signoff,
          'Ruslan Mukhtarov',
          '',
          c.footer,
        ]
  ).join('\n')

  return { subject, html, text }
}

import { escapeHtml } from '@/lib/email'
import {
  renderEmailShell,
  renderParagraph,
  renderSectionTitle,
  renderInfoPanel,
  renderButton,
  renderSignature,
  renderWhatsAppBlock,
  whatsAppTextLine,
  SITE_URL,
  type EmailLocale,
} from '@/lib/email-layout'
import { whatsappUrl } from '@/data/site'

// Accuse de reception du formulaire de contact, envoye a la personne qui ecrit.
// Shell partage : email-layout.ts (meme charte que le guide, les rappels de
// paiement et le pre-depart).
//
// Objectif : lever le doute « est-ce que c'est parti ? », dire QUI repond et
// SOUS QUEL DELAI, et poser la porte de sortie WhatsApp pour les urgences. Le
// delai annonce (48 h) est le meme que l'ecran de succes du formulaire et que
// la page contact : les trois doivent bouger ensemble.
//
// ⚠️ Le message libre du visiteur n'est VOLONTAIREMENT pas recopie dans cet
// email. Il serait attaquant-controle et partirait vers une adresse elle aussi
// attaquant-controlee : le formulaire deviendrait un relais pour ecrire du
// texte arbitraire depuis contact@mkrcamp.com, au prix de la reputation du
// domaine. On ne rappelle que le SUJET, qui vient d'une liste fermee.

export type ContactSubject = 'general' | 'partenariat' | 'clubs' | 'presse' | 'autre'

export interface ContactEmailInput {
  /** Nom saisi dans le formulaire. Le prenom en est extrait pour la salutation. */
  name: string
  subject: ContactSubject
  locale: EmailLocale
}

export interface BuiltContactEmail {
  subject: string
  html: string
  text: string
}

const SUBJECT_LABELS: Record<EmailLocale, Record<ContactSubject, string>> = {
  fr: {
    general: 'Question générale',
    partenariat: 'Partenariat',
    clubs: 'Clubs et groupes',
    presse: 'Presse et médias',
    autre: 'Autre',
  },
  en: {
    general: 'General question',
    partenariat: 'Partnership',
    clubs: 'Clubs and groups',
    presse: 'Press and media',
    autre: 'Other',
  },
}

interface Copy {
  subject: string
  preheader: string
  helloNamed: (prenom: string) => string
  helloPlain: string
  intro: string
  recapTitle: string
  subjectLabel: string
  waitLine: string
  cta: string
  campPath: string
  waIntro: string
  waPrefill: string
  signoff: string
  footer: string
}

const COPY: Record<EmailLocale, Copy> = {
  fr: {
    subject: 'On a bien reçu ton message',
    preheader: 'Ruslan le lit et te répond en personne, sous 48 heures.',
    helloNamed: (prenom) => `Bonjour ${prenom},`,
    helloPlain: 'Bonjour,',
    intro:
      "Ton message est bien arrivé. C'est Ruslan qui le lit, et c'est lui qui te répond en personne, sous 48 heures, sur cette adresse.",
    recapTitle: 'Ta demande',
    subjectLabel: 'Sujet',
    waitLine:
      "En attendant sa réponse, la page du camp raconte le déroulé d'une journée, les salles où on s'entraîne et ce qui est compris dans le séjour.",
    cta: 'Découvrir le camp',
    campPath: '/le-camp',
    waIntro: "Ta question est urgente ? Écris directement à Ruslan sur WhatsApp, c'est lui qui répond.",
    waPrefill: "Bonjour Ruslan, je viens de t'écrire depuis le site et ma question est un peu urgente.",
    signoff: 'À bientôt,',
    footer:
      'Tu reçois cet email parce que tu as écrit à MKR Caucasian Camp depuis mkrcamp.com. Tu peux répondre directement à ce message.',
  },
  en: {
    subject: 'We got your message',
    preheader: 'Ruslan reads it and answers you in person, within 48 hours.',
    helloNamed: (prenom) => `Hi ${prenom},`,
    helloPlain: 'Hi,',
    intro:
      'Your message reached us. Ruslan reads it himself, and he is the one who answers you in person, within 48 hours, at this address.',
    recapTitle: 'Your request',
    subjectLabel: 'Subject',
    waitLine:
      'While you wait, the camp page walks through a training day, the gyms we train in and what the stay includes.',
    cta: 'Discover the camp',
    campPath: '/en/the-camp',
    waIntro: 'Is your question urgent? Write to Ruslan directly on WhatsApp, he answers himself.',
    waPrefill: 'Hi Ruslan, I just wrote to you from the website and my question is a bit urgent.',
    signoff: 'See you soon,',
    footer:
      'You are receiving this email because you wrote to MKR Caucasian Camp on mkrcamp.com. You can reply directly to this message.',
  },
}

/**
 * Prenom d'affichage : premier mot du nom saisi.
 * Deux corrections de saisie, et rien de plus : un prenom tape tout en majuscules
 * ("MARC") est remis en casse normale, sinon la salutation crie ; et chaque
 * segment d'un prenom compose reprend sa majuscule ("jean-pierre" et
 * "JEAN-PIERRE" donnent tous deux "Jean-Pierre"). Le reste de la saisie fait foi,
 * on ne touche pas a une casse volontaire du type "McKenzie".
 */
function displayFirstName(name: string): string {
  const first = name.trim().split(/\s+/)[0] ?? ''
  if (!first) return ''
  const base = first === first.toLocaleUpperCase('fr-FR') ? first.toLocaleLowerCase('fr-FR') : first
  return base
    .split('-')
    .map((part) => (part ? part.charAt(0).toLocaleUpperCase('fr-FR') + part.slice(1) : part))
    .join('-')
}

/**
 * Construit l'accuse de reception (objet + HTML + texte).
 * Pur : aucune I/O, aucun envoi. Le caller decide du destinataire et du tag.
 */
export function buildContactEmail(input: ContactEmailInput): BuiltContactEmail {
  const c = COPY[input.locale]
  const prenom = displayFirstName(input.name)
  const hello = prenom ? c.helloNamed(prenom) : c.helloPlain
  const campUrl = `${SITE_URL}${c.campPath}`
  const waUrl = whatsappUrl(c.waPrefill)
  const subjectLabel = SUBJECT_LABELS[input.locale][input.subject]

  // Pas de photo pleine largeur ici, a la difference du guide et du pre-depart.
  // Mesure faite le 2026-08-30 : la version avec photo d'en-tete est arrivee en
  // SPAM chez Infomaniak (4 envois sur 4) alors que la notification interne, du
  // meme expediteur et sans image, allait en boite de reception. Un accuse de
  // reception qui ressemble a une newsletter se fait filtrer, et un email de ce
  // volume abime la reputation du domaine pour TOUS les autres envois MKR.
  // La marque tient au logo, au bouton et a la signature.
  const contentRows = [
    renderParagraph(escapeHtml(hello), { main: true, padTop: true }),
    renderParagraph(escapeHtml(c.intro)),
    renderSectionTitle(c.recapTitle),
    renderInfoPanel([{ label: c.subjectLabel, value: subjectLabel }]),
    renderParagraph(escapeHtml(c.waitLine)),
    renderButton(campUrl, c.cta, { primary: false }),
    renderWhatsAppBlock(input.locale, waUrl, { intro: c.waIntro }),
    renderSignature(input.locale, c.signoff),
  ].join('')

  const html = renderEmailShell({
    locale: input.locale,
    title: c.subject,
    preheader: c.preheader,
    contentRows,
    footer: c.footer,
  })

  const text = [
    hello,
    '',
    c.intro,
    '',
    `${c.subjectLabel} : ${subjectLabel}`,
    '',
    `${c.waitLine} ${campUrl}`,
    '',
    whatsAppTextLine(input.locale, waUrl, c.waIntro),
    '',
    c.signoff,
    'Ruslan Mukhtarov · MKR Caucasian Camp',
    '',
    c.footer,
  ].join('\n')

  return { subject: c.subject, html, text }
}

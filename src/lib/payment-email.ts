import { escapeHtml } from '@/lib/email'
import {
  renderEmailShell,
  renderHeroImage,
  renderParagraph,
  renderInfoPanel,
  renderButton,
  renderSignature,
  formatEuros,
  formatDateLocale,
  type EmailLocale,
} from '@/lib/email-layout'

// A2 — rappel de paiement (PLAN_EMAIL_AUTOMATION.md §2).
// Deux paliers candidat : 1 = courtois (deadline sous 7 jours), 2 = ferme
// (deadline demain ou dépassée de peu). Le palier 3 (retard 3 j+) est une
// escalade INTERNE (digest), jamais un 3e email candidat.
// Les coordonnées de paiement vivent dans le CONTRAT (pas dupliquées ici).

export interface PaymentEmailInput {
  locale: EmailLocale
  prenom: string | null
  amountCents: number | null
  /** YYYY-MM-DD */
  deadline: string
  contractNumber: number | null
  stage: 1 | 2
}

export interface BuiltPaymentEmail {
  subject: string
  html: string
  text: string
}

export function buildPaymentEmail(input: PaymentEmailInput): BuiltPaymentEmail {
  const { locale, stage } = input
  const prenom = input.prenom?.trim() || null
  const amount = formatEuros(input.amountCents, locale)
  const date = formatDateLocale(input.deadline, locale)
  const ref = input.contractNumber != null ? `MKR-${input.contractNumber}` : null

  const fr = {
    subject: stage === 1 ? 'Ta place au camp · règlement à finaliser' : `Dernier rappel · échéance le ${date}`,
    preheader:
      stage === 1
        ? `Ton dossier est validé. Il ne reste que le règlement pour bloquer ta place (échéance le ${date}).`
        : `L’échéance de ton règlement arrive le ${date}. Après, ta place repart dans la liste.`,
    hello: prenom ? `Salut ${prenom},` : 'Salut,',
    intro:
      stage === 1
        ? 'Ton dossier est validé et ton contrat est parti. Il ne reste qu’une étape pour bloquer ta place dans la session : le règlement du camp.'
        : 'Petit rappel, cette fois c’est le dernier : ton règlement arrive à échéance. Sans paiement à cette date, ta place repart aux candidats en liste d’attente.',
    panelAmount: 'Montant',
    panelDeadline: 'Échéance',
    panelRef: 'Référence contrat',
    where:
      'Les coordonnées de paiement sont dans ton contrat (le PDF que tu as reçu par email). Vérifie tes spams si tu ne le retrouves pas.',
    alreadyPaid: 'Tu as déjà payé ou tu as une question ? Réponds simplement à cet email, on vérifie tout de suite.',
    cta: 'Une question ? Réponds-nous',
    footer:
      'Email automatique lié à ta candidature MKR Caucasian Camp. Réponds directement à ce message pour parler à un humain.',
    signoff: stage === 1 ? 'À très vite,' : 'On t’attend,',
  }

  const en = {
    subject: stage === 1 ? 'Your camp spot · payment to finalize' : `Final reminder · due ${date}`,
    preheader:
      stage === 1
        ? `Your application is validated. Only the payment is left to lock your spot (due ${date}).`
        : `Your payment is due on ${date}. After that, your spot goes back to the waiting list.`,
    hello: prenom ? `Hey ${prenom},` : 'Hey,',
    intro:
      stage === 1
        ? 'Your application is validated and your agreement has been sent. One step left to lock your spot in the session: the camp payment.'
        : 'Quick reminder, and this is the last one: your payment is due. Without it, your spot goes back to candidates on the waiting list.',
    panelAmount: 'Amount',
    panelDeadline: 'Due date',
    panelRef: 'Agreement reference',
    where:
      'The payment details are in your agreement (the PDF you received by email). Check your spam folder if you cannot find it.',
    alreadyPaid: 'Already paid, or have a question? Just reply to this email and we will check right away.',
    cta: 'Questions? Reply to us',
    footer:
      'Automated email related to your MKR Caucasian Camp application. Reply directly to this message to talk to a human.',
    signoff: stage === 1 ? 'Talk soon,' : 'We are waiting for you,',
  }

  const c = locale === 'en' ? en : fr

  const panelRows = [
    { label: c.panelAmount, value: amount, highlight: true },
    { label: c.panelDeadline, value: date },
    ...(ref ? [{ label: c.panelRef, value: ref }] : []),
  ]

  const contentRows = [
    renderHeroImage('payment-hero.jpg', locale === 'en' ? 'The camp coaches at the gym' : 'Les coachs du camp dans la salle'),
    renderParagraph(escapeHtml(c.hello), { main: true, padTop: true }),
    renderParagraph(escapeHtml(c.intro)),
    renderInfoPanel(panelRows),
    renderParagraph(escapeHtml(c.where)),
    renderParagraph(escapeHtml(c.alreadyPaid)),
    renderButton(`mailto:contact@mkrcamp.com`, c.cta, { primary: stage === 2 }),
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
    `${c.panelAmount} : ${amount}`,
    `${c.panelDeadline} : ${date}`,
    ...(ref ? [`${c.panelRef} : ${ref}`] : []),
    '',
    c.where,
    '',
    c.alreadyPaid,
    '',
    c.signoff,
    'Ruslan Mukhtarov · MKR Caucasian Camp',
    '',
    c.footer,
  ].join('\n')

  return { subject: c.subject, html, text }
}

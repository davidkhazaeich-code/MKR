'use client'

// Panneau "Prochaine etape" (spec 6.3), en tete de fiche : titre et detail de
// l'etape calculee (computeNextStep sur l'etat live), l'action primaire de
// l'etape (icone de son action), puis les autres transitions permises en
// secondaire, sans doublon avec le primaire. Fond et filet gauche au ton de
// l'etape (le seul filet colore autorise).
//
// StepPrimaryButton est partage avec la barre d'actions mobile (ActionBar) :
// meme bouton, meme handler (transition, fenetre de paiement, relance visio,
// onglet et carte cibles, lien Cal, WhatsApp ou email).
// Boutons de transition : desactives tant qu'un enregistrement de la fiche
// est en cours (busy), sauf celui de la transition envoyee (en chargement).

import Button, { ButtonLink } from '@/components/admin/ui/Button'
import Icon from '@/components/admin/ui/Icon'
import { useVisioReminder } from '@/components/admin/VisioReminderCard'
import { useDossier } from './DossierProvider'
import {
  TRANSITION_LABEL, bookingHref, primaryActionFor, secondaryTransitions, shortcutOf, type PrimaryAction,
} from '@/lib/admin/dossier'
import { STEP_ICON, whatsappHref } from '@/lib/admin/row-helpers'
import type { Status } from '@/lib/admin/types'

/** Action primaire de l'etape courante (null : aucune, ex. depart a venir, dossier clos). */
export function usePrimaryAction(): PrimaryAction | null {
  const { step, live, staticData: s } = useDossier()
  return primaryActionFor(step.kind, {
    status: live.status,
    hasBooking: !!s.visioBookingUid,
    hasPhone: whatsappHref(s.phoneE164) !== null,
    hasEmail: !!s.email,
  })
}

/** Bouton de l'action primaire (panneau et barre d'actions mobile). */
export function StepPrimaryButton({ action }: { action: PrimaryAction }) {
  const d = useDossier()
  const s = d.staticData
  const reminder = useVisioReminder({
    candidatureId: d.id,
    candidateEmail: s.email,
    submissionLanguage: s.lang,
    count: d.live.visioReminderCount,
    onSent: (sent) => d.setLive({ visioReminderSentAt: sent.sentAt, visioReminderCount: sent.count }),
  })
  // Libelle tronque plutot que renvoye a la ligne dans la barre mobile etroite.
  const label = <span className="adm-truncate">{action.label}</span>

  let button: React.ReactNode = null
  switch (action.type) {
    case 'transition':
      button = (
        <Button
          variant="primary"
          icon={action.icon}
          loading={d.pendingStatus === action.to}
          disabled={d.busy && d.pendingStatus !== action.to}
          aria-keyshortcuts={shortcutOf(action.to) ?? undefined}
          onClick={() => d.requestTransition(action.to)}
        >
          {label}
        </Button>
      )
      break
    case 'booking':
      button = s.visioBookingUid ? (
        <ButtonLink
          href={bookingHref(s.visioBookingUid)}
          external
          variant="primary"
          icon={action.icon}
          aria-label={`${action.label} de ${s.firstName} dans Cal, nouvel onglet`}
        >
          {label}
        </ButtonLink>
      ) : null
      break
    case 'reminder':
      button = (
        <Button
          variant="primary"
          icon={action.icon}
          loading={reminder.busy}
          disabled={!reminder.canSend}
          onClick={reminder.open}
        >
          {label}
        </Button>
      )
      break
    case 'whatsapp': {
      const href = whatsappHref(s.phoneE164)
      button = href ? (
        <ButtonLink href={href} external variant="whatsapp">
          {label}
        </ButtonLink>
      ) : null
      break
    }
    case 'email':
      button = s.email ? (
        <ButtonLink href={`mailto:${s.email}`} variant="primary" icon={action.icon}>
          {label}
        </ButtonLink>
      ) : null
      break
    case 'goto':
      button = (
        <Button variant="primary" icon={action.icon} onClick={() => d.goTo(action.tab, action.anchor)}>
          {label}
        </Button>
      )
      break
    case 'payment':
      button = (
        <Button variant="primary" icon={action.icon} onClick={d.openPayment}>
          {label}
        </Button>
      )
      break
  }

  return (
    <>
      {button}
      {reminder.dialog}
    </>
  )
}

// Rappel des raccourcis (desktop) : libelles courts des transitions.
const SHORTCUT_HINT: Partial<Record<Status, string>> = {
  validee: 'valider', refusee: 'refuser', annulee: 'annuler', reportee: 'reporter', soldee: 'solder', camp_fait: 'camp fait',
}

export default function NextStepPanel() {
  const d = useDossier()
  const { step, live } = d
  const primary = usePrimaryAction()
  const secondaries = secondaryTransitions(live.status, primary)
  const withKeys = [...(primary?.type === 'transition' ? [primary.to] : []), ...secondaries].filter(
    (to) => shortcutOf(to) && SHORTCUT_HINT[to],
  )

  return (
    <section
      className={`adm-callout adm-callout--accent adm-tone--${step.tone} adm-dossier-step`}
      aria-labelledby="adm-dossier-step-title"
    >
      <p className="adm-label">Prochaine étape</p>
      <h2 id="adm-dossier-step-title" className="adm-callout-title adm-dossier-step-title">
        <Icon name={STEP_ICON[step.kind]} size={18} className="adm-dossier-step-icon" />
        <span>{step.title}</span>
      </h2>
      <p className="adm-callout-text">{step.detail}</p>
      {(primary || secondaries.length > 0) && (
        <div className="adm-callout-actions">
          {primary && <StepPrimaryButton action={primary} />}
          {secondaries.map((to) => (
            <Button
              key={to}
              loading={d.pendingStatus === to}
              disabled={d.busy && d.pendingStatus !== to}
              aria-keyshortcuts={shortcutOf(to) ?? undefined}
              onClick={() => d.requestTransition(to)}
            >
              {TRANSITION_LABEL[to]}
            </Button>
          ))}
        </div>
      )}
      {withKeys.length > 0 && (
        <p className="adm-dossier-keys adm-only-desktop" aria-hidden="true">
          Raccourcis{'\u00a0'}:
          {withKeys.map((to) => (
            <span key={to}>
              <kbd className="adm-kbd">{shortcutOf(to)}</kbd> {SHORTCUT_HINT[to]}
            </span>
          ))}
        </p>
      )}
    </section>
  )
}

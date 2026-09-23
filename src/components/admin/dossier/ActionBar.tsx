'use client'

// Barre d'actions fixe en bas de la fiche (sous 1024 px ; masquee au-dessus,
// ou l'en-tete porte les contacts) : contacts (WhatsApp et Appeler si le
// candidat a un telephone, sinon Email), puis l'action primaire de l'etape,
// meme bouton et meme handler que le panneau "Prochaine etape".
// Avec une action primaire, WhatsApp et Appeler sont des icones seules et le
// primaire prend la largeur restante ; sans, les contacts se partagent la
// largeur avec leur libelle. Un primaire qui double un contact (devis :
// WhatsApp, ou email sans telephone) n'est pas repete.

import { ButtonLink } from '@/components/admin/ui/Button'
import { useDossier } from './DossierProvider'
import { StepPrimaryButton, usePrimaryAction } from './NextStepPanel'
import { telHref } from '@/lib/admin/dossier'
import { whatsappHref } from '@/lib/admin/row-helpers'

export default function ActionBar() {
  const { staticData: s } = useDossier()
  const primary = usePrimaryAction()
  const wa = whatsappHref(s.phoneE164)
  const showPrimary = primary !== null && primary.type !== 'whatsapp' && primary.type !== 'email'
  const iconOnly = showPrimary
  const hasContact = !!s.phoneE164 || !!s.email
  if (!showPrimary && !hasContact) return null

  return (
    <div
      className={`adm-dossier-bar${showPrimary ? ' adm-dossier-bar--primary' : ''}`}
      role="group"
      aria-label="Actions du dossier"
    >
      {s.phoneE164 ? (
        <>
          {wa && (
            <ButtonLink
              href={wa}
              external
              variant="whatsapp"
              iconOnly={iconOnly}
              aria-label={iconOnly ? `WhatsApp ${s.firstName}` : undefined}
            >
              WhatsApp
            </ButtonLink>
          )}
          <ButtonLink
            href={telHref(s.phoneE164)}
            variant="call"
            iconOnly={iconOnly}
            aria-label={iconOnly ? `Appeler ${s.firstName}` : undefined}
          >
            Appeler
          </ButtonLink>
        </>
      ) : s.email ? (
        <ButtonLink href={`mailto:${s.email}`} variant="secondary">
          Email
        </ButtonLink>
      ) : null}
      {showPrimary && primary && <StepPrimaryButton action={primary} />}
    </div>
  )
}

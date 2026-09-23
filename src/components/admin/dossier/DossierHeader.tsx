'use client'

// En-tete de la fiche : avatar, nom (Teko, h1), statut live (point + libelle),
// meta (discipline, session, duree, langue, anciennete), progression live.
// Desktop en plus : retour a la liste d'origine (Echap), position et
// precedent/suivant (K, J), contacts WhatsApp, Appeler, Email. En mobile, ces
// elements vivent dans l'en-tete fixe (DossierNav) et la barre d'actions.
// Apres J/K (navigation client), le nom recoit le focus.

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import Avatar from '@/components/admin/ui/Avatar'
import { ButtonLink } from '@/components/admin/ui/Button'
import Icon from '@/components/admin/ui/Icon'
import Progress from '@/components/admin/ui/Progress'
import StatusLabel from '@/components/admin/ui/StatusLabel'
import { useDossier } from './DossierProvider'
import {
  DossierKeyboard, NeighborButton, backLabel, positionLabel, takeNameFocusRequest, useDossierNav,
} from './DossierNav'
import { telHref } from '@/lib/admin/dossier'
import { formatAgo, plural } from '@/lib/admin/format'
import { LANG_LABEL } from '@/lib/admin/labels'
import { whatsappHref } from '@/lib/admin/row-helpers'

export interface DossierHeaderProps {
  prenom: string | null
  nom: string | null
  /** Discipline puis session (ou le tunnel hors session). */
  campParts: string[]
  durationWeeks: number | null
  /** Candidature MMA hors Club et Groupe : niveau a verifier tant qu'elle est "Recue". */
  mmaToCheck: boolean
}

export default function DossierHeader({ prenom, nom, campParts, durationWeeks, mmaToCheck }: DossierHeaderProps) {
  const { id, live, staticData: s, now } = useDossier()
  const nav = useDossierNav(id)
  const nameRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (takeNameFocusRequest()) nameRef.current?.focus()
  }, [])

  const wa = whatsappHref(s.phoneE164)
  const meta = [...campParts]
  if (durationWeeks) meta.push(plural(durationWeeks, 'semaine', 'semaines'))
  meta.push(LANG_LABEL[s.lang])
  meta.push(`reçue ${formatAgo(s.createdAt, now)}`)
  const position = positionLabel(nav)

  return (
    <header className="adm-dossier-head">
      <div className="adm-dossier-topline adm-only-desktop">
        <Link
          href={nav.backHref}
          className="adm-link adm-dossier-back"
          aria-label={backLabel(nav.label)}
          aria-keyshortcuts="Escape"
        >
          <Icon name="arrow-left" size={16} />
          <span>{nav.label || 'Candidatures'}</span>
        </Link>
        <kbd className="adm-kbd" aria-hidden="true">
          Échap
        </kbd>
        {nav.total > 0 && (
          <div className="adm-dossier-pager">
            <span className="adm-dossier-position">{position}</span>
            <NeighborButton id={nav.prev} dir="prev" variant="secondary" size="sm" />
            <NeighborButton id={nav.next} dir="next" variant="secondary" size="sm" />
          </div>
        )}
      </div>

      <div className="adm-dossier-ident">
        <Avatar prenom={prenom} nom={nom} seed={id} size="lg" />
        <div className="adm-dossier-ident-text">
          <h1 ref={nameRef} className="adm-name adm-dossier-name" tabIndex={-1}>
            {s.fullName}
          </h1>
          <div className="adm-dossier-status">
            <StatusLabel status={live.status} size="lg" />
            {mmaToCheck && live.status === 'recue' && (
              <span className="adm-tone-text adm-tone--warn">
                <Icon name="alert-triangle" size={16} />
                <span>Niveau MMA à vérifier</span>
              </span>
            )}
          </div>
          <p className="adm-dossier-meta">
            {meta.map((part, i) => (
              <span key={i}>{part}</span>
            ))}
          </p>
        </div>
        {(wa || s.phoneE164 || s.email) && (
          <div className="adm-dossier-contacts adm-only-desktop">
            {wa && (
              <ButtonLink href={wa} external variant="whatsapp" size="sm">
                WhatsApp
              </ButtonLink>
            )}
            {s.phoneE164 && (
              <ButtonLink href={telHref(s.phoneE164)} variant="call" size="sm">
                Appeler
              </ButtonLink>
            )}
            {s.email && (
              <ButtonLink href={`mailto:${s.email}`} variant="secondary" size="sm">
                Email
              </ButtonLink>
            )}
          </div>
        )}
      </div>

      <div className="adm-dossier-progress">
        <Progress status={live.status} />
      </div>
      <DossierKeyboard id={id} />
    </header>
  )
}

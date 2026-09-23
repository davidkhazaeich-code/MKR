'use client'

// Ligne de la liste des candidatures (spec 6.2). Le nom est le vrai lien de
// la ligne (.adm-row-link etire, data-dossier-id) ; WhatsApp passe au-dessus.
// Contenu, dans l'ordre du DOM :
//   avatar ; nom, EN et pays ;
//   prochaine etape (icone + texte au ton, 600 si une action est attendue) ;
//   meta : statut, camp, niveau MMA a verifier, partenaire ou source, anciennete ;
//   bouton WhatsApp (si telephone) ; note admin sur une ligne (si presente).
// Mise en page (section "Candidatures" de admin.css, selon la largeur de la
// liste) : carte en trois lignes, puis nom et etape cote a cote, puis une
// ligne en colonnes alignees. `now` = horloge de la page (aucune autre
// lecture de l'heure : meme rendu au serveur et a l'hydratation).

import { memo } from 'react'
import Link from 'next/link'
import Avatar from '@/components/admin/ui/Avatar'
import { ButtonLink } from '@/components/admin/ui/Button'
import Icon from '@/components/admin/ui/Icon'
import StatusLabel, { ToneText } from '@/components/admin/ui/StatusLabel'
import type { ListItem } from '@/lib/admin/list-filters'
import {
  STEP_ICON, campParts, candidateName, dossierHref, firstNameOf, mmaLevelToCheck, originOf, whatsappHref,
} from '@/lib/admin/row-helpers'
import { formatAgo, formatDateTime } from '@/lib/admin/format'

export interface CandidatureRowProps {
  item: ListItem
  now: Date
  /** Intention d'ouvrir la fiche (survol ou focus de la ligne) : prechargement. */
  onIntent: (id: string) => void
}

function CandidatureRow({ item, now, onIntent }: CandidatureRowProps) {
  const { row, step } = item
  const candidate = row.candidate
  const english = row.submission_language === 'en'
  const pays = candidate?.pays?.trim()
  const wa = whatsappHref(candidate?.telephone)
  const origin = originOf(row)
  const note = row.notes_admin?.trim()
  const mma = mmaLevelToCheck(row)
  const intent = () => onIntent(row.id)

  const cls = ['adm-row', 'adm-cand-row']
  if (mma) cls.push('adm-cand-row--warn')
  if (note) cls.push('adm-cand-row--note')

  return (
    <li className={cls.join(' ')} onPointerEnter={intent} onFocus={intent}>
      <Avatar prenom={candidate?.prenom} nom={candidate?.nom} seed={row.id} />

      <p className="adm-cand-name">
        <Link href={dossierHref(row.id)} className="adm-row-link adm-row-title" data-dossier-id={row.id}>
          {candidateName(row)}
        </Link>
        {(english || pays) && (
          <span className="adm-cand-tags">
            {english && (
              <span>
                <span aria-hidden="true">EN</span>
                <span className="adm-sr-only">candidature en anglais</span>
              </span>
            )}
            {pays && <span>{pays}</span>}
          </span>
        )}
      </p>

      <p className="adm-cand-step" title={step.short}>
        <ToneText tone={step.tone} icon={STEP_ICON[step.kind]} strong={step.needsAction}>
          {step.short}
        </ToneText>
      </p>

      <div className="adm-cand-meta">
        <span className="adm-cand-status">
          <StatusLabel status={row.status} />
        </span>
        <span className="adm-cand-camp">
          {campParts(row).map((part, i) => (
            <span key={i}>{part}</span>
          ))}
        </span>
        {mma && <span className="adm-cand-warn">niveau MMA à vérifier</span>}
        {origin && (
          <span className={origin.warn ? 'adm-cand-origin adm-cand-origin--warn' : 'adm-cand-origin'}>
            {origin.text}
          </span>
        )}
        <span className="adm-cand-age">
          <time dateTime={row.created_at} title={`Reçue le ${formatDateTime(row.created_at)}`}>
            <span className="adm-sr-only">Reçue </span>
            {formatAgo(row.created_at, now)}
          </time>
        </span>
      </div>

      {wa && (
        <div className="adm-row-actions adm-cand-actions">
          <ButtonLink
            href={wa}
            external
            variant="whatsapp"
            size="sm"
            iconOnly
            aria-label={`WhatsApp ${firstNameOf(row)}`}
          />
        </div>
      )}

      {note && (
        <p className="adm-cand-note">
          <Icon name="edit" size={14} />
          <span className="adm-cand-note-text">
            <span className="adm-sr-only">Note admin : </span>
            {note}
          </span>
        </p>
      )}
    </li>
  )
}

export default memo(CandidatureRow)

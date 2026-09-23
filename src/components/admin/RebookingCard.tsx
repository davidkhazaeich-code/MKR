'use client'

/**
 * Carte "Proposer une autre session" (fiche dossier, onglet Suivi, ancre #report).
 *
 * Le site retire une session des inscriptions le jour du depart (rotation des
 * saisons, cf. data/sessions.ts), mais les dossiers, eux, restent. Cette carte
 * apparait uniquement sur ceux qui sont encore actifs alors que leur camp est
 * deja parti : elle envoie au candidat un email qui lui propose les sessions
 * ouvertes, avec un lien pour candidater et un lien pour reserver 15 min avec
 * Ruslan.
 *
 * Le discours s'adapte au statut : un dossier "validee" avait deja passe la
 * visio, on le lui rappelle ; un dossier "recue" n'a jamais eu l'appel, c'est
 * lui qu'on met en avant. Dans les deux cas, aucune formulation ne renvoie la
 * faute au candidat.
 *
 * Workflow identique a la relance visio : Previsualiser -> Envoyer (modale) ->
 * POST -> etat "Proposition envoyee le X".
 *
 * DossierRebookingCard : la meme carte branchee sur l'etat live de la fiche
 * (statut, envois, mise a jour apres un envoi reussi).
 */

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Status } from '@/lib/admin-transitions'
import Button from './ui/Button'
import ConfirmModal from './ui/ConfirmModal'
import Icon from './ui/Icon'
import { useToast } from './ui/Toast'
import { useDossier } from './dossier/DossierProvider'
import { formatDateTime, plural } from '@/lib/admin/format'
import { LANG_LABEL } from '@/lib/admin/labels'

export interface RebookingCardProps {
  candidatureId: string
  /** Statut LIVE (etat de la fiche). */
  status: Status
  candidateEmail: string | null
  submissionLanguage: 'fr' | 'en'
  /** Libelle de la session ratee, deja mis en forme cote serveur. */
  missedSessionLabel: string | null
  /** Vrai si le camp de ce dossier est deja parti. Calcule cote serveur. */
  campDeparted: boolean
  rebookingSentAt: string | null
  rebookingSentCount: number
  busyExternal?: boolean
  /** Envoi reussi (la fiche met a jour son etat live). */
  onSent?: (sent: { sentAt: string; count: number }) => void
}

// Espace insecable avant la ponctuation haute (typographie francaise).
const NBSP = '\u00a0'

export default function RebookingCard(props: RebookingCardProps) {
  const toast = useToast()
  const router = useRouter()
  const [refreshing, startTransition] = useTransition()

  const [busy, setBusy] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sentAt, setSentAt] = useState<string | null>(props.rebookingSentAt)
  const [count, setCount] = useState<number>(props.rebookingSentCount)
  // Suivre les props (etat live) quand elles changent.
  const [seen, setSeen] = useState({ sentAt: props.rebookingSentAt, count: props.rebookingSentCount })
  if (seen.sentAt !== props.rebookingSentAt || seen.count !== props.rebookingSentCount) {
    setSeen({ sentAt: props.rebookingSentAt, count: props.rebookingSentCount })
    setSentAt(props.rebookingSentAt)
    setCount(props.rebookingSentCount)
  }

  // Rien a proposer si le camp n'est pas parti, ou si le dossier est clos.
  const isActive = props.status === 'recue' || props.status === 'validee'
  if (!props.campDeparted || !isActive) return null

  const hasEmail = !!props.candidateEmail
  const inputsDisabled = busy || !!props.busyExternal
  const canSend = hasEmail && !inputsDisabled
  const isResend = count > 0
  const wasApproved = props.status === 'validee'

  const handlePreview = () => {
    window.open(
      `/api/admin/candidature/${props.candidatureId}/rebooking/preview`,
      '_blank',
      'noopener',
    )
  }

  const handleSend = async () => {
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/candidature/${props.candidatureId}/rebooking`, {
        method: 'POST',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        toast.show(data.error || 'Envoi de la proposition échoué', 'error', 5000)
        return
      }
      const sent = { sentAt: data.sentAt ?? new Date().toISOString(), count: data.count ?? count + 1 }
      setSentAt(sent.sentAt)
      setCount(sent.count)
      props.onSent?.(sent)
      toast.show(`Proposition envoyée à ${props.candidateEmail}`, 'success')
      startTransition(() => router.refresh())
    } catch {
      toast.show('Connexion impossible. Vérifie ton réseau.', 'error', 5000)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section id="report" className="adm-card adm-dossier-anchor" tabIndex={-1} aria-labelledby="adm-report-title">
      <h2 id="adm-report-title" className="adm-card-title">
        <Icon name="calendar" size={14} />
        Proposer une autre session
      </h2>

      <p className="adm-dossier-text">
        {props.missedSessionLabel
          ? `Le camp de ce dossier (${props.missedSessionLabel}) est parti. `
          : 'Le camp de ce dossier est parti. '}
        L&apos;email propose les sessions encore ouvertes, avec un lien pour choisir sa session et
        un lien pour réserver 15 min avec Ruslan.{' '}
        {wasApproved
          ? 'Le message rappelle que son dossier était déjà validé.'
          : 'Le message met l’appel en avant, puisque la visio n’a jamais eu lieu.'}
      </p>

      {sentAt && (
        <p className="adm-dossier-note adm-tone--ok">
          <Icon name="check-circle" size={16} />
          <span>
            <strong>Proposition envoyée le {formatDateTime(sentAt)}</strong> ({plural(count, 'envoi', 'envois')})
          </span>
        </p>
      )}

      <dl className="adm-defs adm-dossier-defs">
        <div className="adm-def">
          <dt className="adm-def-key">Destinataire</dt>
          <dd className="adm-def-val">
            {props.candidateEmail ? (
              <a href={`mailto:${props.candidateEmail}`}>{props.candidateEmail}</a>
            ) : (
              <span className="adm-def-val--muted">Non renseigné</span>
            )}
          </dd>
        </div>
        <div className="adm-def">
          <dt className="adm-def-key">Langue de l&apos;email</dt>
          <dd className="adm-def-val">{LANG_LABEL[props.submissionLanguage]}</dd>
        </div>
      </dl>

      {!hasEmail && (
        <p className="adm-dossier-note adm-tone--warn">
          <Icon name="alert-triangle" size={16} />
          <span>Email du candidat manquant, impossible d&apos;envoyer la proposition.</span>
        </p>
      )}

      <div className="adm-btn-row">
        <Button onClick={handlePreview} disabled={inputsDisabled} title="Ouvre l'email dans un nouvel onglet">
          Prévisualiser l&apos;email
        </Button>
        <Button
          variant="primary"
          icon="send"
          onClick={() => setConfirmOpen(true)}
          loading={busy || refreshing}
          disabled={!hasEmail || !!props.busyExternal}
          title={!hasEmail ? 'Email du candidat manquant' : undefined}
        >
          {isResend ? 'Renvoyer la proposition' : 'Envoyer la proposition'}
        </Button>
      </div>

      <ConfirmModal
        open={confirmOpen && canSend}
        title={isResend ? `Renvoyer la proposition${NBSP}?` : `Proposer une autre session${NBSP}?`}
        message={[
          `Destinataire${NBSP}: ${props.candidateEmail ?? 'Non renseigné'}`,
          `Langue${NBSP}: ${LANG_LABEL[props.submissionLanguage]}`,
          '',
          `Le candidat recevra la liste des sessions ouvertes, un lien pour candidater et le lien de réservation d'appel de Ruslan. Copie en bcc à contact@mkrcamp.com.${
            isResend ? `\n\nProposition déjà envoyée ${count} fois.` : ''
          }`,
        ].join('\n')}
        confirmLabel={isResend ? 'Renvoyer' : 'Envoyer'}
        cancelLabel="Annuler"
        variant="primary"
        icon="send"
        confirmIcon="send"
        onConfirm={() => {
          setConfirmOpen(false)
          void handleSend()
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </section>
  )
}

/** Carte branchee sur la fiche : statut et envois live, mise a jour apres envoi. */
export function DossierRebookingCard() {
  const { id, live, staticData: s, pendingStatus, setLive } = useDossier()
  return (
    <RebookingCard
      candidatureId={id}
      status={live.status}
      candidateEmail={s.email}
      submissionLanguage={s.lang}
      missedSessionLabel={s.missedSessionLabel}
      campDeparted={s.campDeparted}
      rebookingSentAt={live.rebookingSentAt}
      rebookingSentCount={live.rebookingSentCount}
      busyExternal={pendingStatus !== null}
      onSent={(sent) => setLive({ rebookingSentAt: sent.sentAt, rebookingSentCount: sent.count })}
    />
  )
}

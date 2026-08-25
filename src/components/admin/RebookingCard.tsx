'use client'

/**
 * Carte « Proposer une autre session » du dashboard admin.
 *
 * Le site retire une session des inscriptions le jour du depart (rotation des
 * saisons, cf. data/sessions.ts), mais les dossiers, eux, restent. Cette carte
 * apparait uniquement sur ceux qui sont encore actifs alors que leur camp est
 * deja parti : elle envoie au candidat un email qui lui propose les sessions
 * ouvertes, avec un lien pour candidater et un lien pour reserver 15 min avec
 * Ruslan.
 *
 * Le discours s'adapte au statut : un dossier « validee » avait deja passe la
 * visio, on le lui rappelle ; un dossier « recue » n'a jamais eu l'appel, c'est
 * lui qu'on met en avant. Dans les deux cas, aucune formulation ne renvoie la
 * faute au candidat.
 *
 * Workflow identique a la relance visio : Previsualiser -> Envoyer (modale) ->
 * POST -> etat « Proposition envoyee le X ».
 */

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Status } from '@/lib/admin-transitions'
import ConfirmModal from './ui/ConfirmModal'
import Icon from './ui/Icon'
import { useToast } from './ui/Toast'

export interface RebookingCardProps {
  candidatureId: string
  /** Statut LIVE (etat optimiste d'AdminActions). */
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
}

function formatDateTimeFr(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function RebookingCard(props: RebookingCardProps) {
  const toast = useToast()
  const router = useRouter()
  const [, startTransition] = useTransition()

  const [busy, setBusy] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sentAt, setSentAt] = useState<string | null>(props.rebookingSentAt)
  const [count, setCount] = useState<number>(props.rebookingSentCount)

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
        toast.show(data.error || 'Envoi de la proposition échoué', 'error')
        return
      }
      setSentAt(data.sentAt ?? new Date().toISOString())
      setCount(data.count ?? count + 1)
      toast.show(`Proposition envoyée à ${props.candidateEmail}`, 'success')
      startTransition(() => router.refresh())
    } catch {
      toast.show('Connexion impossible. Vérifie ton réseau.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="adm-card">
      <h2 className="adm-card-title">
        <Icon name="history" size={14} />
        Proposer une autre session
      </h2>

      <p
        style={{
          fontSize: '0.85rem',
          color: 'var(--adm-text-secondary)',
          lineHeight: 1.55,
          margin: '0 0 0.9rem',
        }}
      >
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
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            padding: '0.6rem 0.75rem',
            borderRadius: 8,
            border: '1px solid rgba(34, 197, 94, 0.35)',
            background: 'rgba(34, 197, 94, 0.08)',
            marginBottom: '0.9rem',
            fontSize: '0.8rem',
            color: 'var(--adm-text-secondary)',
            lineHeight: 1.45,
          }}
        >
          <span style={{ color: 'var(--adm-status-validee)', flexShrink: 0, marginTop: 1 }}>
            <Icon name="check-circle" size={14} strokeWidth={2.4} />
          </span>
          <span>
            <strong style={{ color: 'var(--adm-status-validee)' }}>
              Proposition envoyée le {formatDateTimeFr(sentAt)}
            </strong>{' '}
            ({count} envoi{count > 1 ? 's' : ''})
          </span>
        </div>
      )}

      <dl className="adm-defs" style={{ marginBottom: '0.9rem' }}>
        <div className="adm-def">
          <dt className="adm-def-key">Destinataire</dt>
          <dd className="adm-def-val">
            {props.candidateEmail ? (
              <a href={`mailto:${props.candidateEmail}`}>{props.candidateEmail}</a>
            ) : (
              <span className="adm-def-val--muted">—</span>
            )}
          </dd>
        </div>
        <div className="adm-def">
          <dt className="adm-def-key">Langue de l&apos;email</dt>
          <dd className="adm-def-val">
            {props.submissionLanguage === 'en' ? 'English' : 'Français'}
          </dd>
        </div>
      </dl>

      {!hasEmail && (
        <div
          style={{
            marginBottom: '0.9rem',
            padding: '0.6rem 0.75rem',
            borderRadius: 8,
            border: '1px solid rgba(251, 191, 36, 0.35)',
            background: 'rgba(251, 191, 36, 0.07)',
            fontSize: '0.78rem',
            color: 'var(--adm-text-secondary)',
            lineHeight: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <span style={{ color: 'var(--adm-status-reportee)', flexShrink: 0 }}>
            <Icon name="alert-triangle" size={13} strokeWidth={2.2} />
          </span>
          Email du candidat manquant, impossible d&apos;envoyer la proposition.
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        <button
          type="button"
          className="adm-btn adm-btn--ghost"
          onClick={handlePreview}
          disabled={inputsDisabled}
          style={{ padding: '0.5rem 0.8rem' }}
          title="Ouvre l'email dans un nouvel onglet"
        >
          Prévisualiser l&apos;email
        </button>
        <button
          type="button"
          className="adm-action-btn"
          onClick={() => setConfirmOpen(true)}
          disabled={!canSend}
          style={{
            ['--adm-action-color' as string]: 'var(--adm-status-validee)',
            ['--adm-action-bg' as string]: 'rgba(34, 197, 94, 0.1)',
            ['--adm-action-border' as string]: 'rgba(34, 197, 94, 0.4)',
            ['--adm-action-hover-bg' as string]: 'rgba(34, 197, 94, 0.1)',
            opacity: !canSend ? 0.55 : undefined,
          }}
          title={!hasEmail ? 'Email du candidat manquant' : undefined}
        >
          <Icon name="mail" size={15} strokeWidth={2.4} />
          {isResend ? 'Renvoyer la proposition' : 'Envoyer la proposition'}
        </button>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title={isResend ? 'Renvoyer la proposition ?' : 'Proposer une autre session ?'}
        message={[
          `Destinataire : ${props.candidateEmail ?? '—'}`,
          `Langue : ${props.submissionLanguage === 'en' ? 'English' : 'Français'}`,
          '',
          `Le candidat recevra la liste des sessions ouvertes, un lien pour candidater et le lien de réservation d'appel de Ruslan. Copie en bcc à contact@mkrcamp.com.${
            isResend ? `\n\nProposition déjà envoyée ${count} fois.` : ''
          }`,
        ].join('\n')}
        confirmLabel={isResend ? 'Renvoyer' : 'Envoyer'}
        cancelLabel="Annuler"
        variant="primary"
        onConfirm={() => {
          setConfirmOpen(false)
          void handleSend()
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </section>
  )
}

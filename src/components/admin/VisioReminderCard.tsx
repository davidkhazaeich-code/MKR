'use client'

/**
 * Carte « Relance visio » du dashboard admin (rendue par AdminActions, colonne droite).
 *
 * Renvoie a la demande l'email invitant le candidat a reserver sa visio de selection
 * avec Ruslan (meme template que l'email post-inscription, variante 'reminder'). Utile
 * quand le candidat n'a pas encore reserve : la visio est la seule etape qui valide le
 * dossier. Visible uniquement sur les dossiers en attente (statut « Recue »).
 *
 * Workflow : Previsualiser (ouvre l'email rendu dans un onglet) -> Envoyer (modale de
 * confirmation) -> POST -> etat « Rappel envoye le X, N fois ». Renvoi possible.
 */

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Status } from '@/lib/admin-transitions'
import ConfirmModal from './ui/ConfirmModal'
import Icon from './ui/Icon'
import { useToast } from './ui/Toast'

export interface VisioReminderCardProps {
  candidatureId: string
  /** Statut LIVE (etat optimiste d'AdminActions). */
  status: Status
  candidateEmail: string | null
  submissionLanguage: 'fr' | 'en'
  visioReminderSentAt: string | null
  visioReminderCount: number
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

export default function VisioReminderCard(props: VisioReminderCardProps) {
  const toast = useToast()
  const router = useRouter()
  const [, startTransition] = useTransition()

  const [busy, setBusy] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sentAt, setSentAt] = useState<string | null>(props.visioReminderSentAt)
  const [count, setCount] = useState<number>(props.visioReminderCount)

  // Le rappel sert a faire reserver la visio de selection : pertinent tant que le
  // dossier n'est pas valide. On n'affiche la carte que sur les dossiers « Recue ».
  if (props.status !== 'recue') return null

  const hasEmail = !!props.candidateEmail
  const inputsDisabled = busy || !!props.busyExternal
  const canSend = hasEmail && !inputsDisabled
  const isResend = count > 0

  const handlePreview = () => {
    window.open(
      `/api/admin/candidature/${props.candidatureId}/visio-reminder/preview`,
      '_blank',
      'noopener',
    )
  }

  const handleSend = async () => {
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/candidature/${props.candidatureId}/visio-reminder`, {
        method: 'POST',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        toast.show(data.error || 'Envoi du rappel échoué', 'error')
        return
      }
      const r = data.reminder ?? {}
      setSentAt(r.visio_reminder_sent_at ?? new Date().toISOString())
      setCount(r.visio_reminder_count ?? count + 1)
      toast.show(`Rappel visio envoyé à ${props.candidateEmail}`, 'success')
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
        <Icon name="calendar" size={14} />
        Relance visio
      </h2>

      <p
        style={{
          fontSize: '0.85rem',
          color: 'var(--adm-text-secondary)',
          lineHeight: 1.55,
          margin: '0 0 0.9rem',
        }}
      >
        Renvoie au candidat l&apos;email l&apos;invitant à réserver sa visio de sélection avec
        Ruslan (mise en page complète, photo et logo, dans sa langue). À utiliser quand il n&apos;a
        pas encore réservé son créneau.
      </p>

      {/* Etat envoi */}
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
              Rappel envoyé le {formatDateTimeFr(sentAt)}
            </strong>{' '}
            ({count} envoi{count > 1 ? 's' : ''})
          </span>
        </div>
      )}

      {/* Recap destinataire + langue */}
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
          <dd className="adm-def-val">{props.submissionLanguage === 'en' ? 'English' : 'Français'}</dd>
        </div>
      </dl>

      {/* Blocage si pas d'email */}
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
          Email du candidat manquant, impossible d&apos;envoyer le rappel.
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        <button
          type="button"
          className="adm-btn adm-btn--ghost"
          onClick={handlePreview}
          disabled={inputsDisabled}
          style={{ padding: '0.5rem 0.8rem' }}
          title="Ouvre l'email de relance dans un nouvel onglet"
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
          {isResend ? 'Renvoyer le rappel' : 'Envoyer le rappel'}
        </button>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title={isResend ? 'Renvoyer le rappel visio ?' : 'Envoyer le rappel visio ?'}
        message={[
          `Destinataire : ${props.candidateEmail ?? '—'}`,
          `Langue : ${props.submissionLanguage === 'en' ? 'English' : 'Français'}`,
          '',
          `Le candidat recevra l'email l'invitant à réserver sa visio de sélection avec Ruslan (lien Cal). Copie en bcc à contact@mkrcamp.com.${
            isResend ? `\n\nRappel déjà envoyé ${count} fois.` : ''
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

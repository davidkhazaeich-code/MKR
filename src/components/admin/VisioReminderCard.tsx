'use client'

/**
 * Relance visio : renvoie a la demande l'email invitant le candidat a reserver
 * sa visio de selection avec Ruslan (meme template que l'email post-inscription,
 * variante 'reminder'). Utile quand le candidat n'a pas encore reserve : la visio
 * est la seule etape qui valide le dossier. Visible uniquement sur les dossiers en
 * attente (statut "Recue").
 *
 * Workflow : Previsualiser (ouvre l'email rendu dans un onglet) -> Envoyer (modale de
 * confirmation) -> POST -> etat "Rappel envoye le X, N fois". Renvoi possible.
 *
 * Fiche v2 : section de la carte Visio (VisioCard), plus une carte a part. La
 * logique d'envoi vit dans useVisioReminder, partage avec l'action primaire de
 * la fiche ("Envoyer un rappel visio") : meme confirmation, meme route.
 * sentAt et count suivent les props (etat live de la fiche) : un envoi fait
 * depuis l'action primaire se voit aussitot ici.
 */

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Status } from '@/lib/admin-transitions'
import Button from './ui/Button'
import ConfirmModal from './ui/ConfirmModal'
import Icon from './ui/Icon'
import { useToast } from './ui/Toast'
import { formatDateTime, plural } from '@/lib/admin/format'
import { LANG_LABEL } from '@/lib/admin/labels'

export interface VisioReminderCardProps {
  candidatureId: string
  /** Statut LIVE (etat de la fiche). */
  status: Status
  candidateEmail: string | null
  submissionLanguage: 'fr' | 'en'
  visioReminderSentAt: string | null
  visioReminderCount: number
  busyExternal?: boolean
  /** Envoi reussi (la fiche met a jour son etat live). */
  onSent?: (sent: { sentAt: string; count: number }) => void
}

// Espace insecable avant la ponctuation haute (typographie francaise).
const NBSP = '\u00a0'

export interface VisioReminderOptions {
  candidatureId: string
  candidateEmail: string | null
  submissionLanguage: 'fr' | 'en'
  /** Relances deja envoyees. */
  count: number
  onSent?: (sent: { sentAt: string; count: number }) => void
}

/**
 * Envoi de la relance visio avec sa confirmation. Rendre `dialog` a cote du
 * bouton qui appelle `open` ; `busy` couvre l'envoi et le rafraichissement.
 */
export function useVisioReminder(opts: VisioReminderOptions): {
  open: () => void
  busy: boolean
  canSend: boolean
  dialog: React.ReactNode
} {
  const toast = useToast()
  const router = useRouter()
  const [refreshing, startTransition] = useTransition()
  const [sending, setSending] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const email = opts.candidateEmail
  const isResend = opts.count > 0
  const busy = sending || refreshing

  const send = async () => {
    setConfirmOpen(false)
    setSending(true)
    try {
      const res = await fetch(`/api/admin/candidature/${opts.candidatureId}/visio-reminder`, { method: 'POST' })
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        error?: string
        reminder?: { visio_reminder_sent_at?: string; visio_reminder_count?: number }
      }
      if (!res.ok || !data.ok) {
        toast.show(data.error || 'Envoi du rappel échoué', 'error', 5000)
        return
      }
      const r = data.reminder ?? {}
      opts.onSent?.({
        sentAt: r.visio_reminder_sent_at ?? new Date().toISOString(),
        count: r.visio_reminder_count ?? opts.count + 1,
      })
      toast.show(`Rappel visio envoyé à ${email}`, 'success')
      startTransition(() => router.refresh())
    } catch {
      toast.show('Connexion impossible. Vérifie ton réseau.', 'error', 5000)
    } finally {
      setSending(false)
    }
  }

  const dialog = (
    <ConfirmModal
      open={confirmOpen}
      title={isResend ? `Renvoyer le rappel visio${NBSP}?` : `Envoyer le rappel visio${NBSP}?`}
      message={[
        `Destinataire${NBSP}: ${email ?? 'Non renseigné'}`,
        `Langue${NBSP}: ${LANG_LABEL[opts.submissionLanguage]}`,
        '',
        `Le candidat recevra l'email l'invitant à réserver sa visio de sélection avec Ruslan (lien Cal). Copie en bcc à contact@mkrcamp.com.${
          isResend ? `\n\nRappel déjà envoyé ${opts.count} fois.` : ''
        }`,
      ].join('\n')}
      confirmLabel={isResend ? 'Renvoyer' : 'Envoyer'}
      cancelLabel="Annuler"
      variant="primary"
      icon="send"
      confirmIcon="send"
      onConfirm={() => void send()}
      onCancel={() => setConfirmOpen(false)}
    />
  )

  return { open: () => setConfirmOpen(true), busy, canSend: !!email, dialog }
}

export default function VisioReminderCard(props: VisioReminderCardProps) {
  const [sentAt, setSentAt] = useState<string | null>(props.visioReminderSentAt)
  const [count, setCount] = useState<number>(props.visioReminderCount)
  // Suivre les props (etat live) quand elles changent : envoi fait ailleurs.
  const [seen, setSeen] = useState({ sentAt: props.visioReminderSentAt, count: props.visioReminderCount })
  if (seen.sentAt !== props.visioReminderSentAt || seen.count !== props.visioReminderCount) {
    setSeen({ sentAt: props.visioReminderSentAt, count: props.visioReminderCount })
    setSentAt(props.visioReminderSentAt)
    setCount(props.visioReminderCount)
  }

  const reminder = useVisioReminder({
    candidatureId: props.candidatureId,
    candidateEmail: props.candidateEmail,
    submissionLanguage: props.submissionLanguage,
    count,
    onSent: (sent) => {
      setSentAt(sent.sentAt)
      setCount(sent.count)
      props.onSent?.(sent)
    },
  })

  // Le rappel sert a faire reserver la visio de selection : pertinent tant que le
  // dossier n'est pas valide. On n'affiche la section que sur les dossiers "Recue".
  if (props.status !== 'recue') return null

  const hasEmail = !!props.candidateEmail
  const inputsDisabled = !!props.busyExternal
  const isResend = count > 0

  const handlePreview = () => {
    window.open(
      `/api/admin/candidature/${props.candidatureId}/visio-reminder/preview`,
      '_blank',
      'noopener',
    )
  }

  return (
    <div id="relance" className="adm-dossier-sub adm-dossier-anchor" tabIndex={-1}>
      <h3 className="adm-dossier-sub-title">
        Relance visio
      </h3>

      <p className="adm-dossier-text">
        Renvoie au candidat l&apos;email l&apos;invitant à réserver sa visio de sélection avec
        Ruslan (mise en page complète, photo et logo, dans sa langue). À utiliser quand il n&apos;a
        pas encore réservé son créneau.
      </p>

      {sentAt && (
        <p className="adm-dossier-note adm-tone--ok">
          <Icon name="check-circle" size={16} />
          <span>
            <strong>Rappel envoyé le {formatDateTime(sentAt)}</strong> ({plural(count, 'envoi', 'envois')})
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
          <span>Email du candidat manquant, impossible d&apos;envoyer le rappel.</span>
        </p>
      )}

      <div className="adm-btn-row">
        <Button
          onClick={handlePreview}
          disabled={inputsDisabled}
          title="Ouvre l'email de relance dans un nouvel onglet"
        >
          Prévisualiser l&apos;email
        </Button>
        <Button
          onClick={reminder.open}
          loading={reminder.busy}
          disabled={!hasEmail || inputsDisabled}
          title={!hasEmail ? 'Email du candidat manquant' : undefined}
        >
          {isResend ? 'Renvoyer le rappel' : 'Envoyer le rappel'}
        </Button>
      </div>
      {reminder.dialog}
    </div>
  )
}

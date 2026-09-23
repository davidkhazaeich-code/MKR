'use client'

// Relance visio en un geste depuis l'accueil (section "A relancer") :
// bouton secondaire "Relancer" -> confirmation (destinataire, langue, relances
// deja envoyees) -> POST de la route existante visio-reminder -> notification
// et router.refresh() (le compteur et l'etape de la ligne se mettent a jour).
// En cas d'echec, la notification reprend le message du serveur ; rien n'est
// modifie cote serveur si l'email n'est pas parti (le bouton reste utilisable).

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/admin/ui/Button'
import ConfirmModal from '@/components/admin/ui/ConfirmModal'
import { useToast } from '@/components/admin/ui/Toast'
import { LANG_LABEL } from '@/lib/admin/labels'
import type { Lang } from '@/lib/admin/types'

export interface QuickReminderButtonProps {
  id: string
  /** Nom complet du candidat (titre de la confirmation, nom accessible). */
  name: string
  email: string | null
  lang: Lang
  /** Relances visio deja envoyees (visio_reminder_count). */
  count: number
}

// Espace insecable avant la ponctuation haute (typographie francaise).
const NBSP = '\u00a0'

function sentLine(count: number): string {
  if (count <= 0) return "Aucune relance envoyée jusqu'ici."
  if (count === 1) return '1 relance déjà envoyée.'
  return `${count} relances déjà envoyées.`
}

export default function QuickReminderButton({ id, name, email, lang, count }: QuickReminderButtonProps) {
  const router = useRouter()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [refreshing, startTransition] = useTransition()

  const send = async () => {
    setOpen(false)
    setSending(true)
    try {
      const res = await fetch(`/api/admin/candidature/${id}/visio-reminder`, { method: 'POST' })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        toast.show(data.error || 'Envoi de la relance impossible. Réessaie.', 'error', 5000)
        return
      }
      toast.show(`Relance envoyée à ${email}`, 'success')
      startTransition(() => router.refresh())
    } catch {
      toast.show('Connexion impossible. Vérifie ton réseau.', 'error', 5000)
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        loading={sending || refreshing}
        disabled={!email}
        title={email ? undefined : 'Email du candidat manquant'}
        aria-label={`Relancer ${name}`}
        onClick={() => setOpen(true)}
      >
        Relancer
      </Button>
      <ConfirmModal
        open={open}
        variant="primary"
        title={`Relancer ${name}${NBSP}?`}
        message={[
          `Destinataire${NBSP}: ${email ?? 'Non renseigné'}`,
          `Langue de l'email${NBSP}: ${LANG_LABEL[lang]}`,
          sentLine(count),
          '',
          "Le candidat reçoit l'email qui l'invite à réserver sa visio de sélection avec Ruslan.",
        ].join('\n')}
        confirmLabel="Envoyer la relance"
        confirmIcon="send"
        cancelLabel="Annuler"
        onConfirm={() => void send()}
        onCancel={() => setOpen(false)}
      />
    </>
  )
}

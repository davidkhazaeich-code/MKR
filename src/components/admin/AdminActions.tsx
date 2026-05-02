'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { ALLOWED_TRANSITIONS, STATUS_LABEL, type Status } from '@/lib/admin-transitions'

interface Props {
  candidatureId: string
  currentStatus: Status
  registrationFeePaidAt: string | null
  packagePaidAt: string | null
  packageAmountCents: number | null
  notesAdmin: string
  notesVisio: string
}

const DESTRUCTIVE: Record<Status, string | null> = {
  recue: null,
  validee: null,
  refusee: 'Refuser ce dossier ? Le candidat devra être remboursé manuellement.',
  soldee: null,
  camp_fait: null,
  annulee: 'Annuler ce dossier ? Les frais 100€ sont perdus pour le candidat.',
  reportee: 'Reporter ce dossier ? Un crédit 100€ sera valable 12 mois (à noter manuellement).',
}

const ACTION_COLOR: Record<Status, string> = {
  recue: '#9CA3AF',
  validee: '#4ade80',
  refusee: '#fca5a5',
  soldee: '#60a5fa',
  camp_fait: '#a78bfa',
  annulee: '#fca5a5',
  reportee: '#fbbf24',
}

export default function AdminActions({
  candidatureId,
  currentStatus,
  registrationFeePaidAt,
  packagePaidAt,
  packageAmountCents,
  notesAdmin,
  notesVisio,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [adminDraft, setAdminDraft] = useState(notesAdmin)
  const [visioDraft, setVisioDraft] = useState(notesVisio)
  const [packageEur, setPackageEur] = useState(
    packageAmountCents ? String(packageAmountCents / 100) : '',
  )

  const adminDirty = adminDraft !== notesAdmin
  const visioDirty = visioDraft !== notesVisio
  const packageDirty =
    (packageEur === '' && packageAmountCents !== null) ||
    (packageEur !== '' && Math.round(parseFloat(packageEur) * 100) !== packageAmountCents)

  const allowed = ALLOWED_TRANSITIONS[currentStatus] ?? []

  const call = async (body: Record<string, unknown>, confirmMessage?: string) => {
    if (confirmMessage && !window.confirm(confirmMessage)) return
    setError(null)
    try {
      const res = await fetch(`/api/admin/candidature/${candidatureId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        setError(data.error || 'Une erreur est survenue')
        return
      }
      startTransition(() => router.refresh())
    } catch {
      setError('Connexion impossible. Réessaye.')
    }
  }

  const handleTransition = (next: Status) => {
    const message = DESTRUCTIVE[next]
    call({ status: next }, message ?? undefined)
  }

  const handleFeeToggle = () => {
    call({ fee_paid: !registrationFeePaidAt })
  }
  const handlePackageToggle = () => {
    call({ package_paid: !packagePaidAt })
  }

  const handleSavePackageAmount = () => {
    const eur = parseFloat(packageEur)
    if (Number.isNaN(eur) || eur < 0) {
      setError('Montant package invalide')
      return
    }
    call({ package_amount_cents: Math.round(eur * 100) })
  }

  const handleSaveAdminNotes = () => call({ notes_admin: adminDraft })
  const handleSaveVisioNotes = () => call({ notes_visio: visioDraft })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {error && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: 'rgba(252,165,165,0.08)',
            border: '1px solid rgba(252,165,165,0.3)',
            color: '#fca5a5',
            fontSize: '0.85rem',
          }}
        >
          {error}
        </div>
      )}

      {/* === Statut === */}
      <section>
        <h3 style={sectionTitle}>Changer le statut</h3>
        {allowed.length === 0 ? (
          <p style={{ color: '#71717a', fontSize: '0.85rem', margin: 0 }}>
            Statut terminal : pas d&apos;action disponible.
          </p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {allowed.map((next) => (
              <button
                key={next}
                type="button"
                disabled={isPending}
                onClick={() => handleTransition(next)}
                style={{
                  ...actionBtn,
                  color: ACTION_COLOR[next],
                  borderColor: `${ACTION_COLOR[next]}50`,
                  background: `${ACTION_COLOR[next]}12`,
                }}
              >
                {STATUS_LABEL[next]}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* === Paiement === */}
      <section>
        <h3 style={sectionTitle}>Paiement</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={toggleRow}>
            <input
              type="checkbox"
              checked={!!registrationFeePaidAt}
              onChange={handleFeeToggle}
              disabled={isPending}
            />
            <span>
              Frais d&apos;inscription 100€ payés
              {registrationFeePaidAt && (
                <span style={{ color: '#71717a', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                  le {new Date(registrationFeePaidAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
              )}
            </span>
          </label>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>Montant package (EUR) :</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={packageEur}
              onChange={(e) => setPackageEur(e.target.value)}
              placeholder="ex 2900"
              style={inputStyle}
              disabled={isPending}
            />
            {packageDirty && (
              <button type="button" onClick={handleSavePackageAmount} disabled={isPending} style={saveBtn}>
                Enregistrer
              </button>
            )}
          </div>

          <label style={toggleRow}>
            <input
              type="checkbox"
              checked={!!packagePaidAt}
              onChange={handlePackageToggle}
              disabled={isPending}
            />
            <span>
              Package soldé (virement reçu)
              {packagePaidAt && (
                <span style={{ color: '#71717a', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                  le {new Date(packagePaidAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
              )}
            </span>
          </label>
        </div>
      </section>

      {/* === Notes === */}
      <section>
        <h3 style={sectionTitle}>Notes admin</h3>
        <textarea
          value={adminDraft}
          onChange={(e) => setAdminDraft(e.target.value)}
          placeholder="Ce que tu veux noter sur le dossier (suivi, relances, paiement reçu par virement…)"
          rows={4}
          style={textareaStyle}
          disabled={isPending}
        />
        {adminDirty && (
          <button type="button" onClick={handleSaveAdminNotes} disabled={isPending} style={saveBtn}>
            Enregistrer notes admin
          </button>
        )}
      </section>

      <section>
        <h3 style={sectionTitle}>Compte-rendu visio</h3>
        <textarea
          value={visioDraft}
          onChange={(e) => setVisioDraft(e.target.value)}
          placeholder="Notes prises pendant ou après l'entretien de validation"
          rows={4}
          style={textareaStyle}
          disabled={isPending}
        />
        {visioDirty && (
          <button type="button" onClick={handleSaveVisioNotes} disabled={isPending} style={saveBtn}>
            Enregistrer compte-rendu
          </button>
        )}
      </section>
    </div>
  )
}

const sectionTitle: React.CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: '#71717a',
  margin: '0 0 0.6rem',
}

const actionBtn: React.CSSProperties = {
  padding: '0.5rem 0.9rem',
  borderRadius: '8px',
  fontSize: '0.85rem',
  fontWeight: 600,
  border: '1px solid',
  cursor: 'pointer',
  transition: 'all 0.15s',
}

const toggleRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem',
  fontSize: '0.9rem',
  color: '#e4e4e7',
  cursor: 'pointer',
  userSelect: 'none',
}

const inputStyle: React.CSSProperties = {
  padding: '0.4rem 0.6rem',
  borderRadius: '6px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(0,0,0,0.4)',
  color: '#fff',
  fontSize: '0.85rem',
  width: '120px',
}

const textareaStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.8rem',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(0,0,0,0.4)',
  color: '#fff',
  fontSize: '0.85rem',
  fontFamily: 'inherit',
  resize: 'vertical',
}

const saveBtn: React.CSSProperties = {
  marginTop: '0.5rem',
  padding: '0.5rem 0.9rem',
  borderRadius: '8px',
  border: '1px solid rgba(255,140,0,0.4)',
  background: 'rgba(255,140,0,0.1)',
  color: '#FF8C00',
  fontSize: '0.8rem',
  fontWeight: 600,
  cursor: 'pointer',
}

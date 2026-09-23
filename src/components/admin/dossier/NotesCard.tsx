'use client'

// Notes du dossier (onglet Suivi) : compte-rendu de la visio puis notes admin,
// logique reprise de l'ancienne colonne d'actions (AdminActions) :
// - enregistrement automatique 900 ms apres la derniere frappe (PATCH
//   existant), indicateur d'etat par champ (modifie, enregistrement,
//   enregistre, erreur) ;
// - filet anti-perte : toute note non enregistree part en fetch keepalive au
//   pagehide et au demontage (J/K ou Echap demontent la fiche : c'est ce
//   flush qui sauve la note tapee juste avant) ;
// - pas de passage par DossierProvider.patch : ni etat live a modifier, ni
//   boutons d'action a griser a chaque frappe.

import { useEffect, useId, useRef, useState } from 'react'
import Icon from '@/components/admin/ui/Icon'
import { useToast } from '@/components/admin/ui/Toast'
import { useDossier } from './DossierProvider'

const NOTES_DEBOUNCE_MS = 900
const SAVED_VISIBLE_MS = 1800
const MAX_NOTES = 5000

type NoteField = 'notes_visio' | 'notes_admin'
type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error'

export interface NotesCardProps {
  notesVisio: string
  notesAdmin: string
}

interface NoteState {
  draft: string
  setDraft: (value: string) => void
  state: SaveState
  /** Derniere valeur confirmee par le serveur. */
  saved: React.RefObject<string>
  draftRef: React.RefObject<string>
}

function useAutoSavedNote(id: string, field: NoteField, initial: string): NoteState {
  const toast = useToast()
  const [draft, setDraftState] = useState(initial)
  const [state, setState] = useState<SaveState>('idle')
  const saved = useRef(initial)
  const draftRef = useRef(initial)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
    if (idleTimer.current) clearTimeout(idleTimer.current)
  }, [])

  const save = async (value: string) => {
    setState('saving')
    let error: string | null = null
    try {
      const res = await fetch(`/api/admin/candidature/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) error = data.error || 'Enregistrement de la note impossible.'
    } catch {
      error = 'Connexion impossible. La note n’est pas enregistrée.'
    }
    if (error) {
      setState('error')
      toast.show(error, 'error', 5000)
      return
    }
    saved.current = value
    if (draftRef.current !== value) {
      // Saisie reprise pendant l'envoi : le minuteur suivant l'enregistrera.
      setState('dirty')
      return
    }
    setState('saved')
    if (idleTimer.current) clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => setState((s) => (s === 'saved' ? 'idle' : s)), SAVED_VISIBLE_MS)
  }

  const setDraft = (value: string) => {
    setDraftState(value)
    draftRef.current = value
    if (timer.current) clearTimeout(timer.current)
    if (value === saved.current) {
      setState('idle')
      return
    }
    setState('dirty')
    timer.current = setTimeout(() => void save(value), NOTES_DEBOUNCE_MS)
  }

  return { draft, setDraft, state, saved, draftRef }
}

function NoteStatus({ state, id }: { state: SaveState; id: string }) {
  const content =
    state === 'dirty' ? { icon: 'edit' as const, text: 'Modifié, enregistrement automatique' }
      : state === 'saving' ? { icon: 'clock' as const, text: 'Enregistrement' }
        : state === 'saved' ? { icon: 'check' as const, text: 'Enregistré' }
          : state === 'error' ? { icon: 'alert-triangle' as const, text: 'Non enregistré, modifie la note pour réessayer' }
            : null
  const tone = state === 'saved' ? ' adm-tone--ok' : state === 'error' ? ' adm-tone--danger' : ''
  return (
    <p id={id} className={`adm-dossier-note-status${tone}`} role="status">
      {content && (
        <>
          <Icon name={content.icon} size={14} />
          <span>{content.text}</span>
        </>
      )}
    </p>
  )
}

export default function NotesCard({ notesVisio, notesAdmin }: NotesCardProps) {
  const { id } = useDossier()
  const uid = useId()
  const visio = useAutoSavedNote(id, 'notes_visio', notesVisio)
  const admin = useAutoSavedNote(id, 'notes_admin', notesAdmin)

  // Filet anti-perte : pagehide (onglet ferme, rechargement) et demontage.
  const notes = useRef({ visio, admin })
  useEffect(() => {
    notes.current = { visio, admin }
  })
  useEffect(() => {
    const flush = () => {
      const body: Record<string, string> = {}
      const { visio: v, admin: a } = notes.current
      if (v.draftRef.current !== v.saved.current) body.notes_visio = v.draftRef.current
      if (a.draftRef.current !== a.saved.current) body.notes_admin = a.draftRef.current
      if (Object.keys(body).length === 0) return
      void fetch(`/api/admin/candidature/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        keepalive: true,
      }).catch(() => {})
    }
    window.addEventListener('pagehide', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      flush()
    }
  }, [id])

  const fields: { key: string; label: string; note: NoteState; placeholder: string }[] = [
    { key: 'visio', label: 'Compte-rendu visio', note: visio, placeholder: 'Notes prises pendant ou après l’entretien de sélection' },
    { key: 'admin', label: 'Notes admin', note: admin, placeholder: 'Ce que tu veux noter sur le dossier (suivi, relances, paiement reçu)' },
  ]

  return (
    <section className="adm-card" aria-labelledby={`${uid}-title`}>
      <h2 id={`${uid}-title`} className="adm-card-title">
        <Icon name="edit" size={14} />
        Notes
      </h2>
      <div className="adm-dossier-notes">
        {fields.map(({ key, label, note, placeholder }) => (
          <div key={key} className="adm-field">
            <label htmlFor={`${uid}-${key}`} className="adm-field-label">
              {label}
            </label>
            <textarea
              id={`${uid}-${key}`}
              className="adm-notes-textarea"
              value={note.draft}
              onChange={(e) => note.setDraft(e.target.value)}
              placeholder={placeholder}
              rows={4}
              maxLength={MAX_NOTES}
              aria-describedby={`${uid}-${key}-status`}
            />
            <NoteStatus state={note.state} id={`${uid}-${key}-status`} />
          </div>
        ))}
      </div>
    </section>
  )
}

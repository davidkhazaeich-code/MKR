'use client'

// Etat client partage de la fiche dossier (spec 6.3). Remplace l'etat local de
// l'ancienne colonne d'actions : en-tete, prochaine etape, barre d'actions et
// cartes lisent le meme `live` et restent synchronises apres chaque action.
//
// - staticData et nowIso viennent des props a chaque rendu (jamais copies dans
//   un etat) : une seule horloge, celle du rendu serveur ; `step` est recalcule
//   a chaque changement de `live`.
// - live : etat optimiste. patch() applique `optimistic`, appelle le PATCH
//   existant, puis se cale sur data.candidature (le serveur fait foi) ; en cas
//   d'erreur, `rollback` et notification. Puis router.refresh() dans une
//   transition : `busy` reste vrai jusqu'a la fin du rafraichissement.
// - Resynchronisation : quand la valeur serialisee de `initial` change (apres
//   un router.refresh, y compris celui de RefreshOnFocus) et qu'aucun patch
//   n'est en vol, live repart de `initial`. Un rendu serveur arrive pendant
//   un patch est plus ancien que la reponse de ce patch : il est ignore.
// - Transitions : confirmation pour Validee (l'email "dossier valide" part au
//   candidat), Refusee, Annulee, Reportee et Recue (retirer la validation) ;
//   Soldee et Camp fait partent directement. Raccourcis V R A Z S T (hors
//   champ, hors dialogue, sans touche de modification, transition permise).
// - La confirmation et la fenetre "Enregistrer un paiement" sont rendues ici.
// - Onglets (sous 1024 px) : onglet memorise dans le hash (#paiement), lu
//   apres le montage ; goTo() change d'onglet puis amene une carte a l'ecran.

import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useTransition,
} from 'react'
import { useRouter } from 'next/navigation'
import ConfirmModal from '@/components/admin/ui/ConfirmModal'
import { useToast } from '@/components/admin/ui/Toast'
import PaymentModal from './PaymentModal'
import { computeNextStep, type NextStep } from '@/lib/admin/next-step'
import {
  TRANSITION_SHORTCUTS, canTransitionTo, liveFromServer, tabFromHash, toNextStepInput, transitionConfirm,
  transitionSuccess, type DossierLive, type DossierStatic, type DossierTab,
} from '@/lib/admin/dossier'
import { zurichDay } from '@/lib/admin/format'
import type { Status } from '@/lib/admin/types'

export type { DossierLive, DossierStatic, DossierTab } from '@/lib/admin/dossier'

export interface PatchOptions {
  success?: string
  optimistic?: Partial<DossierLive>
  rollback?: Partial<DossierLive>
}

export interface DossierContextValue {
  id: string
  live: DossierLive
  /** Recalcule a chaque changement de live. */
  step: NextStep
  busy: boolean
  patch(body: Record<string, unknown>, opts?: PatchOptions): Promise<boolean>
  setLive(patch: Partial<DossierLive>): void
  /** Ouvre la confirmation si besoin, sinon patch. */
  requestTransition(next: Status): void
  openPayment(): void
  goTo(tab: DossierTab, anchorId?: string): void
  tab: DossierTab
  setTab(tab: DossierTab): void
  /** Donnees figees de la fiche (contacts, langue, reservation Cal). */
  staticData: DossierStatic
  /** Horloge de la page (nowIso du rendu serveur). */
  now: Date
  /** Transition en cours d'envoi ou de rafraichissement (bouton en chargement). */
  pendingStatus: Status | null
}

const DossierContext = createContext<DossierContextValue | null>(null)

export function useDossier(): DossierContextValue {
  const ctx = useContext(DossierContext)
  if (!ctx) throw new Error('useDossier doit etre utilise dans <DossierProvider>')
  return ctx
}

/** Cible de saisie : les raccourcis de la fiche s'y taisent. */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)
}

/** Un dialogue modal est ouvert : il garde le clavier. */
export function isDialogOpen(): boolean {
  return document.querySelector('[role="dialog"][aria-modal="true"]') !== null
}

export interface DossierProviderProps {
  staticData: DossierStatic
  initial: DossierLive
  nowIso: string
  children: React.ReactNode
}

export function DossierProvider({ staticData, initial, nowIso, children }: DossierProviderProps) {
  const router = useRouter()
  const toast = useToast()
  const id = staticData.id
  const now = useMemo(() => new Date(nowIso), [nowIso])

  const [live, setLiveState] = useState<DossierLive>(initial)
  const [inFlightCount, setInFlightCount] = useState(0)
  const [refreshing, startRefresh] = useTransition()
  const [pendingStatus, setPendingStatus] = useState<Status | null>(null)
  const [confirmFor, setConfirmFor] = useState<Status | null>(null)
  const [payment, setPayment] = useState<{ key: number; today: string } | null>(null)
  const [tab, setTabState] = useState<DossierTab>('profil')
  const [anchorRequest, setAnchorRequest] = useState<{ id: string; seq: number } | null>(null)

  const busy = inFlightCount > 0 || refreshing
  const liveRef = useRef(live)
  const busyRef = useRef(busy)
  const inFlight = useRef(0)
  const initialKey = JSON.stringify(initial)
  const initialKeyRef = useRef(initialKey)
  const appliedKeyRef = useRef(initialKey)
  useEffect(() => {
    liveRef.current = live
    busyRef.current = busy
  })

  const setLive = useCallback((p: Partial<DossierLive>) => {
    setLiveState((prev) => ({ ...prev, ...p }))
  }, [])

  // Rendu serveur plus recent que live : il fait foi (si aucun patch en vol).
  const applyServerLive = useCallback(() => {
    const key = initialKeyRef.current
    if (key === appliedKeyRef.current) return
    appliedKeyRef.current = key
    setLiveState(JSON.parse(key) as DossierLive)
  }, [])

  useEffect(() => {
    initialKeyRef.current = initialKey
    if (inFlight.current === 0) applyServerLive()
  }, [initialKey, applyServerLive])

  const patch = useCallback(
    async (body: Record<string, unknown>, opts: PatchOptions = {}): Promise<boolean> => {
      inFlight.current += 1
      setInFlightCount((n) => n + 1)
      if (opts.optimistic) setLive(opts.optimistic)
      let ok = false
      try {
        const res = await fetch(`/api/admin/candidature/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; candidature?: unknown }
        if (!res.ok || !data.ok) {
          toast.show(data.error || 'Enregistrement impossible. Réessaie.', 'error', 5000)
        } else {
          ok = true
          // Tout rendu serveur recu pendant le vol est plus ancien que cette reponse.
          appliedKeyRef.current = initialKeyRef.current
          // "Rien a mettre a jour" arrive sans candidature : live reste tel quel.
          if (data.candidature) setLiveState((prev) => liveFromServer(prev, data.candidature))
          if (opts.success) toast.show(opts.success, 'success')
          startRefresh(() => router.refresh())
        }
      } catch {
        toast.show('Connexion impossible. Vérifie ton réseau.', 'error', 5000)
      } finally {
        inFlight.current -= 1
        setInFlightCount((n) => n - 1)
      }
      if (!ok) {
        if (opts.rollback) setLive(opts.rollback)
        if (inFlight.current === 0) applyServerLive()
      }
      return ok
    },
    [id, router, toast, setLive, applyServerLive],
  )

  // La transition en cours reste affichee jusqu'a la fin du rafraichissement.
  useEffect(() => {
    if (!busy) setPendingStatus(null)
  }, [busy])

  const doTransition = useCallback(
    async (next: Status) => {
      const prev = liveRef.current
      if (!canTransitionTo(prev.status, next)) return
      setPendingStatus(next)
      await patch(
        { status: next },
        {
          success: transitionSuccess(next),
          optimistic: { status: next, statusChangedAt: new Date().toISOString() },
          rollback: { status: prev.status, statusChangedAt: prev.statusChangedAt },
        },
      )
    },
    [patch],
  )

  const requestTransition = useCallback(
    (next: Status) => {
      if (!canTransitionTo(liveRef.current.status, next)) return
      if (transitionConfirm(next, staticData.email)) setConfirmFor(next)
      else void doTransition(next)
    },
    [doTransition, staticData.email],
  )

  // "Aujourd'hui a Zurich" lu au clic (jamais pendant le rendu).
  const openPayment = useCallback(() => {
    setPayment({ key: Date.now(), today: zurichDay(new Date()) })
  }, [])

  const setTab = useCallback((next: DossierTab) => {
    setTabState(next)
    try {
      window.history.replaceState(null, '', `#${next}`)
    } catch {
      /* historique indisponible : l'onglet vaut pour cette page */
    }
  }, [])

  const goTo = useCallback(
    (next: DossierTab, anchorId?: string) => {
      setTab(next)
      if (anchorId) setAnchorRequest((prev) => ({ id: anchorId, seq: (prev?.seq ?? 0) + 1 }))
    },
    [setTab],
  )

  // Carte demandee par goTo : amenee a l'ecran une fois son onglet affiche,
  // puis focus (tabIndex -1) pour que clavier et lecteur d'ecran y soient.
  useEffect(() => {
    if (!anchorRequest) return
    const el = document.getElementById(anchorRequest.id)
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' })
    el.focus({ preventScroll: true })
  }, [anchorRequest])

  // Onglet du hash, lu apres le montage (rendu serveur et hydratation : Profil).
  useEffect(() => {
    const sync = () => {
      const fromHash = tabFromHash(window.location.hash)
      if (fromHash) setTabState(fromHash)
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  // Raccourcis V R A Z S T (table de l'ancienne colonne d'actions).
  const requestRef = useRef(requestTransition)
  useEffect(() => {
    requestRef.current = requestTransition
  })
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return
      if (isEditableTarget(e.target) || isDialogOpen() || busyRef.current) return
      const next = TRANSITION_SHORTCUTS[e.key.toLowerCase()]
      if (!next || !canTransitionTo(liveRef.current.status, next)) return
      e.preventDefault()
      requestRef.current(next)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const step = useMemo(() => computeNextStep(toNextStepInput(staticData, live), now), [staticData, live, now])

  const value = useMemo<DossierContextValue>(
    () => ({
      id, live, step, busy, patch, setLive, requestTransition, openPayment, goTo, tab, setTab,
      staticData, now, pendingStatus: busy ? pendingStatus : null,
    }),
    [id, live, step, busy, patch, setLive, requestTransition, openPayment, goTo, tab, setTab, staticData, now, pendingStatus],
  )

  const confirm = confirmFor ? transitionConfirm(confirmFor, staticData.email) : null

  return (
    <DossierContext.Provider value={value}>
      {children}
      <ConfirmModal
        open={confirm !== null}
        title={confirm?.title ?? ''}
        message={confirm?.message ?? ''}
        confirmLabel={confirm?.confirmLabel}
        cancelLabel={confirm?.cancelLabel}
        variant={confirm?.variant}
        icon={confirm?.icon}
        confirmIcon={confirm?.confirmIcon}
        onConfirm={() => {
          const next = confirmFor
          setConfirmFor(null)
          if (next) void doTransition(next)
        }}
        onCancel={() => setConfirmFor(null)}
      />
      {payment && <PaymentModal key={payment.key} today={payment.today} onClose={() => setPayment(null)} />}
    </DossierContext.Provider>
  )
}

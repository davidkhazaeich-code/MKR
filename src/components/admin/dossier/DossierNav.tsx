'use client'

// Navigation entre dossiers : contexte precedent/suivant (derniere liste vue,
// enregistree par l'accueil et la liste des candidatures), retour a la liste
// filtree d'origine.
//
// - useDossierNav(id) : lu dans sessionStorage APRES le montage (le rendu
//   serveur et l'hydratation partent d'un etat neutre : aucun ecart).
// - DossierNav : contenu de l'en-tete mobile de la fiche (retour, position,
//   precedent, suivant), rendu hors du DossierProvider.
// - DossierKeyboard : J suivant, K precedent, Echap retour (hors champ, hors
//   dialogue ouvert : un dialogue garde Echap ; repetition de touche ignoree).
// - Apres un passage au dossier voisin (navigation client), la fiche suivante
//   donne le focus a son nom (h1) : clavier et lecteur d'ecran repartent du
//   haut de la fiche.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Button, { ButtonLink } from '@/components/admin/ui/Button'
import { isDialogOpen, isEditableTarget } from './DossierProvider'
import { neighbors, readNavContext, type NavContext } from '@/lib/admin/nav-context'
import { dossierHref } from '@/lib/admin/row-helpers'

const FALLBACK_BACK = '/admin/inscriptions'

export interface DossierNavState {
  prev: string | null
  next: string | null
  /** Position (1 a total) dans la liste d'origine ; 0 sans contexte. */
  position: number
  total: number
  backHref: string
  /** Nom de la liste d'origine ("À faire", "Candidatures"), vide sans contexte. */
  label: string
}

export function useDossierNav(id: string): DossierNavState {
  const [ctx, setCtx] = useState<NavContext | null>(null)
  useEffect(() => {
    setCtx(readNavContext())
  }, [id])
  const n = neighbors(ctx, id)
  return { ...n, backHref: ctx?.backHref ?? FALLBACK_BACK, label: ctx?.label ?? '' }
}

// Demande de focus sur le nom du prochain dossier monte (variable de module :
// elle survit a la navigation client, pas a un rechargement).
let focusNameOnMount = false

export function requestNameFocus(): void {
  focusNameOnMount = true
}

export function takeNameFocusRequest(): boolean {
  const requested = focusNameOnMount
  focusNameOnMount = false
  return requested
}

export function backLabel(label: string): string {
  return label ? `Retour à « ${label} »` : 'Retour aux candidatures'
}

export function positionLabel(nav: DossierNavState): string {
  return nav.total > 0 ? `${nav.position} sur ${nav.total}` : ''
}

/** Lien vers le dossier voisin, ou bouton desactive en bout de liste. */
export function NeighborButton({
  id, dir, variant, size = 'md',
}: {
  id: string | null
  dir: 'prev' | 'next'
  variant: 'ghost' | 'secondary'
  size?: 'md' | 'sm'
}) {
  const label = dir === 'prev' ? 'Dossier précédent' : 'Dossier suivant'
  const key = dir === 'prev' ? 'K' : 'J'
  const icon = dir === 'prev' ? 'chevron-left' : 'chevron-right'
  if (!id) {
    return <Button variant={variant} size={size} icon={icon} iconOnly disabled aria-label={label} />
  }
  return (
    <ButtonLink
      href={dossierHref(id)}
      variant={variant}
      size={size}
      icon={icon}
      iconOnly
      aria-label={label}
      aria-keyshortcuts={key}
      title={`${label} (${key})`}
      onClick={requestNameFocus}
    />
  )
}

/** En-tete mobile de la fiche : [retour] [liste et position] [precedent, suivant]. */
export default function DossierNav({ id }: { id: string }) {
  const nav = useDossierNav(id)
  const position = positionLabel(nav)
  const title = position ? (nav.label ? `${nav.label} · ${position}` : position) : 'Dossier'
  return (
    <>
      <div className="adm-topbar-start">
        <ButtonLink
          href={nav.backHref}
          variant="ghost"
          icon="arrow-left"
          iconOnly
          aria-label={backLabel(nav.label)}
          aria-keyshortcuts="Escape"
        />
      </div>
      <p className="adm-topbar-title">{title}</p>
      <div className="adm-topbar-end">
        {nav.total > 0 && (
          <>
            <NeighborButton id={nav.prev} dir="prev" variant="ghost" />
            <NeighborButton id={nav.next} dir="next" variant="ghost" />
          </>
        )}
      </div>
    </>
  )
}

/** J suivant, K precedent, Echap retour a la liste d'origine. */
export function DossierKeyboard({ id }: { id: string }) {
  const router = useRouter()
  const { prev, next, backHref } = useDossierNav(id)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return
      if (isEditableTarget(e.target) || isDialogOpen()) return
      // Touche maintenue : une seule navigation (pas d'entrees d'historique en double).
      if (e.repeat) return
      const key = e.key.toLowerCase()
      const target = key === 'j' ? next : key === 'k' ? prev : null
      if (target) {
        e.preventDefault()
        requestNameFocus()
        router.push(dossierHref(target))
      } else if (e.key === 'Escape') {
        e.preventDefault()
        router.push(backHref)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [router, prev, next, backHref])
  return null
}

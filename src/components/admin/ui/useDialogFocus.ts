'use client'

// Gestion du focus des dialogues (ConfirmModal, Sheet) :
// - focus initial dans le dialogue, retour a l'element declencheur a la fermeture ;
// - Tab et Maj+Tab bouclent sur les elements focusables du dialogue ;
// - Echap ferme ; seul le dialogue du dessus reagit (pile) ;
// - defilement de la page bloque tant que le dialogue est ouvert.

import { useEffect, useRef, useSyncExternalStore } from 'react'
import type { RefObject } from 'react'

const FOCUSABLE = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/** Elements focusables et visibles de `root`, dans l'ordre du document. */
export function getFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.tabIndex >= 0 && el.getClientRects().length > 0,
  )
}

const noopSubscribe = () => () => {}

/** false au rendu serveur et pendant l'hydratation, true ensuite (portails). */
export function useIsClient(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false)
}

// Pile des dialogues ouverts : seul le dernier gere clavier et focus.
// Le verrou de defilement est pose une fois pour toute la pile (passage de 0
// a 1 dialogue) et leve une fois (retour a 0) : React ne garantit pas l'ordre
// des nettoyages (freres dans l'ordre de l'arbre, parent avant enfants), donc
// chaque dialogue ne doit pas restaurer sa propre copie de la valeur.
const openStack: symbol[] = []
let overflowBeforeLock = ''

export function useDialogFocus(
  open: boolean,
  containerRef: RefObject<HTMLElement | null>,
  onEscape: () => void,
  initialFocus?: () => HTMLElement | null | undefined,
): void {
  const onEscapeRef = useRef(onEscape)
  const initialFocusRef = useRef(initialFocus)
  useEffect(() => {
    onEscapeRef.current = onEscape
    initialFocusRef.current = initialFocus
  })

  useEffect(() => {
    if (!open) return
    const id = Symbol('dialog')
    if (openStack.length === 0) {
      overflowBeforeLock = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    openStack.push(id)
    const isTop = () => openStack[openStack.length - 1] === id
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null

    const container = containerRef.current
    // Le repli du focus (dialogue sans element focusable) exige un conteneur focusable.
    if (container && !container.hasAttribute('tabindex')) container.tabIndex = -1
    const target =
      initialFocusRef.current?.() ?? (container ? getFocusable(container)[0] : null) ?? container
    target?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (!isTop()) return
      if (e.key === 'Escape') {
        // Consomme l'evenement : les raccourcis de page (retour a la liste...)
        // ne doivent pas partir en meme temps.
        e.preventDefault()
        e.stopPropagation()
        onEscapeRef.current()
        return
      }
      if (e.key !== 'Tab') return
      const root = containerRef.current
      if (!root) return
      const items = getFocusable(root)
      if (items.length === 0) {
        e.preventDefault()
        root.focus()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      const inside = active instanceof Node && root.contains(active)
      if (e.shiftKey) {
        if (!inside || active === first || active === root) {
          e.preventDefault()
          last.focus()
        }
      } else if (!inside || active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    // Le focus ne sort pas du dialogue (clic ailleurs, focus programmatique).
    const onFocusIn = (e: FocusEvent) => {
      if (!isTop()) return
      const root = containerRef.current
      if (root && e.target instanceof Node && !root.contains(e.target)) {
        ;(getFocusable(root)[0] ?? root).focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('focusin', onFocusIn)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.removeEventListener('focusin', onFocusIn)
      const index = openStack.lastIndexOf(id)
      if (index >= 0) openStack.splice(index, 1)
      if (openStack.length === 0) document.body.style.overflow = overflowBeforeLock
      if (previous && previous !== document.body && previous.isConnected) previous.focus()
    }
  }, [open, containerRef])
}

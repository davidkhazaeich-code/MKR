'use client'

// Retour sur l'onglet (ou sur l'app installee) : router.refresh() si les
// donnees affichees ont plus de 60 s. Rien a l'ecran.
//
// "Donnees recues" = au montage, puis a chaque nouveau rendu serveur de la
// page (renderedAt change : bouton Rafraichir, refresh apres une action,
// ou ce composant lui-meme). renderedAt ne sert que de signal de changement :
// l'age est mesure sur l'horloge du navigateur, jamais compare a l'heure du
// serveur (aucun effet d'un ecart d'horloge).

import { startTransition, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const STALE_AFTER_MS = 60_000

export default function RefreshOnFocus({ renderedAt }: { renderedAt: number }) {
  const router = useRouter()
  const lastRefresh = useRef(0)

  useEffect(() => {
    lastRefresh.current = Date.now()
  }, [renderedAt])

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return
      if (Date.now() - lastRefresh.current <= STALE_AFTER_MS) return
      lastRefresh.current = Date.now()
      startTransition(() => router.refresh())
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [router])

  return null
}

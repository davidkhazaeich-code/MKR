'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// Composant invisible : ecoute Echap pour retourner a la liste admin.
// Skip si une input/textarea est focus ou si une modale est ouverte.
export default function BackShortcut({ to }: { to: string }) {
  const router = useRouter()
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }
      // Eviter si une modale dialog est ouverte
      if (document.querySelector('[role="dialog"]')) return
      e.preventDefault()
      router.push(to)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [router, to])
  return null
}

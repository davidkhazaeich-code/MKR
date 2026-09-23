'use client'

// Bouton "Rafraichir" (icone seule) : relit les donnees serveur de la page
// (router.refresh) sans recharger ni perdre l'etat client (filtres, saisie).
// Spinner tant que la transition est en cours.
// ghost dans l'en-tete mobile (chrome sombre) ; secondary possible dans un
// en-tete de page desktop.

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/admin/ui/Button'

export interface RefreshButtonProps {
  variant?: 'ghost' | 'secondary'
  size?: 'md' | 'sm'
  className?: string
}

export default function RefreshButton({ variant = 'ghost', size = 'md', className }: RefreshButtonProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <Button
      variant={variant}
      size={size}
      icon="refresh"
      iconOnly
      loading={pending}
      aria-label="Rafraîchir"
      title="Rafraîchir"
      className={className}
      onClick={() => startTransition(() => router.refresh())}
    />
  )
}

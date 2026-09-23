'use client'

// Erreur inattendue dans une page /admin (limite d'erreur du segment).
// unstable_retry (Next 16.2) : refait la requete et le rendu du segment.
// error.digest : identifiant a retrouver dans les journaux serveur (Vercel).

import { useEffect } from 'react'
import Button, { ButtonLink } from '@/components/admin/ui/Button'
import Icon from '@/components/admin/ui/Icon'

export default function AdminError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main id="adm-main" className="adm-container">
      <section className="adm-empty" role="alert" aria-labelledby="adm-error-title">
        <span className="adm-empty-icon adm-tone--danger" aria-hidden="true">
          <Icon name="alert-triangle" size={28} />
        </span>
        <h1 id="adm-error-title" className="adm-empty-title">
          Une erreur est survenue
        </h1>
        <p className="adm-empty-text">La page n’a pas pu se charger. Réessaie dans un instant.</p>
        {error.digest && (
          <p className="adm-small adm-muted">
            Si le problème continue, transmets ce code à David :{' '}
            <span className="adm-mono">{error.digest}</span>
          </p>
        )}
        <div className="adm-empty-actions">
          <Button variant="primary" icon="refresh" onClick={() => unstable_retry()}>
            Réessayer
          </Button>
          <ButtonLink href="/admin" variant="secondary">
            Retour à l’accueil
          </ButtonLink>
        </div>
      </section>
    </main>
  )
}

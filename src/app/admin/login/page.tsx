import type { Metadata } from 'next'
import Image from 'next/image'
import Button from '@/components/admin/ui/Button'

// Connexion admin : formulaire POST vers /api/admin/login (champs token et
// next), cookie de 30 jours pose par la route. Chrome sombre dans les deux
// themes (data-theme="dark" sur l'ecran).
// Gestionnaires de mots de passe : identifiant fixe "admin" (champ
// visuellement masque) + jeton en autocomplete="current-password".

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Connexion · MKR Admin',
}

// Retour apres connexion : une page /admin, jamais la connexion elle-meme.
function safeNext(raw: string | undefined): string {
  if (!raw || !raw.startsWith('/admin') || raw.startsWith('/admin/login')) return '/admin'
  return raw
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const params = await searchParams
  const next = safeNext(params.next)
  const hasError = params.error === '1'

  return (
    <main className="adm-login" data-theme="dark">
      <Image
        src="/logo-white.webp"
        alt="MKR Caucasian Camp"
        width={93}
        height={56}
        className="adm-login-logo"
        loading="eager"
      />

      <div className="adm-card adm-login-card">
        <h1 className="adm-h1">Connexion</h1>
        <p className="adm-login-intro">Espace réservé à l’équipe MKR Caucasian Camp.</p>

        <form method="POST" action="/api/admin/login" className="adm-login-form">
          <input type="hidden" name="next" value={next} />
          {/* Identifiant pour les gestionnaires de mots de passe, jamais saisi */}
          <input
            type="text"
            name="username"
            defaultValue="admin"
            autoComplete="username"
            tabIndex={-1}
            aria-hidden="true"
            className="adm-sr-only"
          />

          <div className="adm-field">
            <label htmlFor="adm-login-token" className="adm-field-label">
              Mot de passe
            </label>
            <input
              id="adm-login-token"
              name="token"
              type="password"
              autoComplete="current-password"
              autoFocus
              required
              className="adm-input"
              aria-invalid={hasError || undefined}
              aria-describedby={hasError ? 'adm-login-error' : undefined}
            />
            {hasError && (
              <p id="adm-login-error" className="adm-field-error" role="alert">
                Mot de passe incorrect. Réessaie.
              </p>
            )}
          </div>

          <Button type="submit" variant="primary" icon="log-in">
            Se connecter
          </Button>

          <p className="adm-login-note">Connexion mémorisée 30 jours sur cet appareil.</p>
        </form>
      </div>
    </main>
  )
}

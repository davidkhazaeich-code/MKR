import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Connexion · MKR Admin',
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const params = await searchParams
  const next = params.next && params.next.startsWith('/admin') ? params.next : '/admin/inscriptions'
  const hasError = params.error === '1'

  return (
    <div className="adm-login-shell">
      <form method="POST" action="/api/admin/login" className="adm-login-card">
        <div className="adm-login-logo">
          <span className="adm-brand-mark-dot" aria-hidden="true" />
          MKR Admin
        </div>

        <h1 className="adm-login-title">Bienvenue</h1>
        <p className="adm-login-help">
          Token requis pour accéder au tableau de bord des candidatures.
        </p>

        <input type="hidden" name="next" value={next} />

        <div className="adm-login-form">
          <label>
            <p className="adm-login-field-label">Token admin</p>
            <input
              name="token"
              type="password"
              autoComplete="off"
              autoFocus
              required
              placeholder="••••••••••••••••"
              className="adm-login-field-input"
            />
          </label>

          {hasError && <p className="adm-login-error">Token invalide. Réessaye.</p>}

          <button type="submit" className="adm-login-submit">
            Se connecter
          </button>
        </div>
      </form>
    </div>
  )
}

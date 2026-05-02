import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Admin · Connexion',
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const params = await searchParams
  const next = params.next && params.next.startsWith('/admin') ? params.next : '/admin/inscriptions'
  const error = params.error === '1'

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0A0A0A',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <form
        method="POST"
        action="/api/admin/login"
        style={{
          width: '100%',
          maxWidth: 360,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          padding: '2rem',
          borderRadius: '16px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 600, margin: 0 }}>Admin MKR</h1>
          <p style={{ color: '#9CA3AF', fontSize: '0.85rem', margin: '0.4rem 0 0' }}>
            Token requis pour acceder aux candidatures.
          </p>
        </div>
        <input type="hidden" name="next" value={next} />
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Token
          </span>
          <input
            name="token"
            type="password"
            autoComplete="off"
            autoFocus
            required
            style={{
              padding: '0.7rem 0.9rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(0,0,0,0.4)',
              color: '#fff',
              fontSize: '0.9rem',
              fontFamily: 'ui-monospace, SFMono-Regular, monospace',
            }}
          />
        </label>
        {error && (
          <p style={{ color: '#fca5a5', fontSize: '0.8rem', margin: 0 }}>
            Token invalide. Reessaye.
          </p>
        )}
        <button
          type="submit"
          style={{
            padding: '0.75rem',
            borderRadius: '8px',
            border: 'none',
            background: '#FF6B00',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          Se connecter
        </button>
      </form>
    </div>
  )
}

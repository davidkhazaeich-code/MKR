import type { Metadata } from 'next'
import Link from 'next/link'
import AdminShell from '@/components/admin/shell/AdminShell'
import RefreshButton from '@/components/admin/shell/RefreshButton'
import { ButtonLink } from '@/components/admin/ui/Button'
import Icon from '@/components/admin/ui/Icon'
import SessionCard, { StatusLinks, sessionListHref } from '@/components/admin/sessions/SessionCard'
import { loadDossierRows } from '@/lib/admin/data'
import { buildSessionsOverview } from '@/lib/admin/sessions-stats'
import { formatTime, plural } from '@/lib/admin/format'
import type { DossierRow } from '@/lib/admin/types'

// Sessions (spec 6.4) : une carte par session non terminee (en cours et a
// venir), puis les dossiers sans session (sur mesure), les ids de session
// inconnus du calendrier (dossiers a rattacher) et les sessions passees qui
// portent des dossiers, repliees (details ferme a toutes les largeurs : pas
// de saut a l'hydratation, et les camps passes se consultent rarement).
// Chiffres : buildSessionsOverview, aucun recalcul ici. Une seule horloge :
// `now` est pris une fois et passe partout.

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Sessions · MKR Admin',
}

function LoadError({ title, message, retry }: { title: string; message: string; retry: boolean }) {
  return (
    <AdminShell active="sessions" title="Sessions">
      <div className="adm-container">
        <div className="adm-page-head">
          <h1 className="adm-h1">Sessions</h1>
        </div>
        <section className="adm-empty adm-tone--danger" aria-labelledby="sess-error-title">
          <span className="adm-empty-icon" aria-hidden="true">
            <Icon name="alert-triangle" size={28} />
          </span>
          <h2 id="sess-error-title" className="adm-empty-title">
            {title}
          </h2>
          <p className="adm-empty-text">{message}</p>
          {retry && (
            <div className="adm-empty-actions">
              <ButtonLink href="/admin/sessions" variant="primary" icon="refresh">
                Réessayer
              </ButtonLink>
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  )
}

export default async function AdminSessionsPage() {
  const now = new Date()

  let rows: DossierRow[] = []
  let configError: string | null = null
  let queryError: string | null = null
  try {
    const result = await loadDossierRows()
    rows = result.rows
    queryError = result.error
  } catch (err) {
    configError = err instanceof Error ? err.message : String(err)
  }

  if (configError) {
    return <LoadError title="Configuration manquante" message={configError} retry={false} />
  }
  if (queryError) {
    return (
      <LoadError
        title="Chargement impossible"
        message={`Les dossiers n'ont pas pu être lus (${queryError}).`}
        retry
      />
    )
  }

  const { current, past, orphans, surMesure } = buildSessionsOverview(rows, now)

  return (
    <AdminShell active="sessions" title="Sessions">
      <div className="adm-container adm-sess">
        <header className="adm-page-head adm-sess-head">
          <div>
            <h1 className="adm-h1">Sessions</h1>
            <p className="adm-page-meta">
              {rows.length === 0 ? 'Aucun dossier' : plural(rows.length, 'dossier', 'dossiers')}
              {' · '}mis à jour à {formatTime(now.toISOString())}
            </p>
          </div>
          <RefreshButton variant="secondary" size="sm" className="adm-only-desktop" />
        </header>

        {current.length > 0 && (
          <section className="adm-section" aria-labelledby="sess-current-title">
            <div className="adm-section-head">
              <h2 id="sess-current-title" className="adm-section-title">
                En cours et à venir
              </h2>
              <span className="adm-section-count">
                {current.length}
                <span className="adm-sr-only"> {current.length > 1 ? 'sessions' : 'session'}</span>
              </span>
            </div>
            <ul className="adm-sess-grid">
              {current.map((s) => (
                <li key={s.id}>
                  <SessionCard session={s} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="adm-section" aria-labelledby="sess-none-title">
          <div className="adm-section-head">
            <h2 id="sess-none-title" className="adm-section-title">
              Sans session (sur mesure)
            </h2>
            <span className="adm-section-count">
              {surMesure.total}
              <span className="adm-sr-only"> {surMesure.total > 1 ? 'dossiers' : 'dossier'}</span>
            </span>
            <p className="adm-section-help">Sur mesure, famille ou club : dossiers sans session du calendrier.</p>
          </div>
          <div className="adm-sess-grid">
            <div className="adm-card adm-sess-card">
              <StatusLinks session="none" context="sans session" byStatus={surMesure.byStatus} total={surMesure.total} />
            </div>
          </div>
        </section>

        {orphans.length > 0 && (
          <section className="adm-section" aria-labelledby="sess-orphans-title">
            <div className="adm-section-head">
              <h2 id="sess-orphans-title" className="adm-section-title">
                Sessions inconnues
              </h2>
              <span className="adm-section-count">
                {orphans.length}
                <span className="adm-sr-only"> {orphans.length > 1 ? 'identifiants' : 'identifiant'}</span>
              </span>
              <p className="adm-section-help">Session inconnue du calendrier : dossiers à rattacher.</p>
            </div>
            <div className="adm-sess-grid">
              <div className="adm-card adm-sess-card">
                <ul className="adm-sess-links">
                  {orphans.map((o) => (
                    <li key={o.id}>
                      <Link href={sessionListHref(o.id, 'tous')} className="adm-sess-link">
                        <span className="adm-mono adm-sess-orphan-id">{o.id}</span>{' '}
                        <span className="adm-sess-link-count">{plural(o.total, 'dossier', 'dossiers')}</span>
                        <Icon name="chevron-right" size={16} className="adm-sess-chevron" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {past.length > 0 && (
          <details className="adm-section adm-sess-past">
            <summary className="adm-sess-past-summary">
              <h2 className="adm-section-title">
                Sessions passées <span aria-hidden="true">· {past.length}</span>
                <span className="adm-sr-only">, {plural(past.length, 'session', 'sessions')}</span>
              </h2>
              <Icon name="chevron-down" size={18} className="adm-sess-past-chevron" />
            </summary>
            <ul className="adm-sess-grid adm-sess-past-grid">
              {past.map((s) => (
                <li key={s.id}>
                  <SessionCard session={s} />
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </AdminShell>
  )
}

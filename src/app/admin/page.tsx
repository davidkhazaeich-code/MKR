import type { Metadata } from 'next'
import Link from 'next/link'
import AdminShell from '@/components/admin/shell/AdminShell'
import RefreshButton from '@/components/admin/shell/RefreshButton'
import { ButtonLink } from '@/components/admin/ui/Button'
import Icon from '@/components/admin/ui/Icon'
import NavContextScope from '@/components/admin/queue/NavContextScope'
import QueueRow, { VisioRow } from '@/components/admin/queue/QueueRow'
import { loadDossierRows } from '@/lib/admin/data'
import { buildQueue, type QueueData } from '@/lib/admin/queue'
import { buildSessionsOverview, placesSummary, type SessionStat } from '@/lib/admin/sessions-stats'
import { STATUS_TONE } from '@/lib/admin/labels'
import { capitalize, formatDayLong } from '@/lib/admin/format'
import type { DossierRow } from '@/lib/admin/types'

// Accueil "A faire" : ce que Ruslan doit faire maintenant.
// Ordre du DOM = ordre de lecture en mobile : en-tete (titre, date, compteur),
// vue d'ensemble (prochain depart, dossiers par statut), agenda des visios,
// puis les sections. Cet ordre sert aussi de contexte precedent/suivant a la
// fiche (NavContextScope). >= 1200 px : la vue d'ensemble et l'agenda passent
// dans une colonne de droite par placement explicite (admin.css, "A faire").
// Une seule horloge : `now` est pris une fois ici et passe partout.

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'À faire · MKR Admin',
}

const PIPELINE = [
  { status: 'recue', label: 'Reçues' },
  { status: 'validee', label: 'Validées' },
  { status: 'soldee', label: 'Soldées' },
  { status: 'camp_fait', label: 'Camp fait' },
] as const

function countLabel(n: number, one: string, many: string): string {
  return n > 1 ? many : one
}

function LoadError({ title, message, retry }: { title: string; message: string; retry: boolean }) {
  return (
    <AdminShell active="queue" title="À faire">
      <div className="adm-container">
        <div className="adm-page-head">
          <h1 className="adm-h1">À faire</h1>
        </div>
        <section className="adm-empty adm-tone--danger" aria-labelledby="todo-error-title">
          <span className="adm-empty-icon" aria-hidden="true">
            <Icon name="alert-triangle" size={28} />
          </span>
          <h2 id="todo-error-title" className="adm-empty-title">
            {title}
          </h2>
          <p className="adm-empty-text">{message}</p>
          {retry && (
            <div className="adm-empty-actions">
              <ButtonLink href="/admin" variant="primary" icon="refresh">
                Réessayer
              </ButtonLink>
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  )
}

function Departure({ session }: { session: SessionStat }) {
  const when = session.daysToStart === 1 ? 'part demain' : `part dans ${session.daysToStart} j`
  return (
    <section className="adm-todo-block" aria-labelledby="todo-depart-title">
      <h2 id="todo-depart-title" className="adm-section-title adm-todo-block-title">
        Prochain départ
      </h2>
      <div className="adm-rows">
        <div className="adm-row adm-todo-depart">
          <div className="adm-row-main">
            <p className="adm-todo-depart-line">
              <Link href="/admin/sessions" className="adm-row-link">
                <span className="adm-todo-depart-name">{session.name}</span> {when}
                <span className="adm-sr-only">, voir les sessions</span>
              </Link>
            </p>
            <p className="adm-row-meta">{placesSummary(session)}</p>
          </div>
          <Icon name="chevron-right" size={18} className="adm-todo-chevron" />
        </div>
      </div>
    </section>
  )
}

function Pipeline({ pipeline }: { pipeline: QueueData['pipeline'] }) {
  return (
    <section className="adm-todo-block" aria-labelledby="todo-dossiers-title">
      <h2 id="todo-dossiers-title" className="adm-section-title adm-todo-block-title">
        Dossiers
      </h2>
      <ul className="adm-todo-stats">
        {PIPELINE.map(({ status, label }) => (
          <li key={status}>
            <Link href={`/admin/inscriptions?statut=${status}`} className="adm-todo-stat">
              <span className="adm-todo-stat-num">
                <span className={`adm-status-dot adm-tone--${STATUS_TONE[status]}`} aria-hidden="true" />
                {pipeline[status]}
              </span>
              <span className="adm-todo-stat-label">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Agenda({ agenda, now }: { agenda: QueueData['agenda']; now: Date }) {
  const total = agenda.reduce((n, group) => n + group.items.length, 0)
  return (
    <section className="adm-todo-block adm-todo-agenda" aria-labelledby="todo-visios-title">
      <div className="adm-section-head">
        <h2 id="todo-visios-title" className="adm-section-title">
          Visios
        </h2>
        <span className="adm-section-count">
          {total}
          <span className="adm-sr-only"> rendez-vous</span>
        </span>
      </div>
      {agenda.map((group) => (
        <div key={group.key} className={`adm-todo-day adm-todo-day--${group.key}`}>
          <h3 className="adm-todo-day-title">{group.label}</h3>
          <ul className="adm-rows adm-todo-list">
            {group.items.map((item) => (
              <VisioRow key={item.row.id} item={item} group={group.key} now={now} />
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}

export default async function AdminTodoPage() {
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

  const queue = buildQueue(rows, now)
  const nextDeparture = buildSessionsOverview(rows, now).current.find((s) => s.state === 'a_venir') ?? null
  const hasAgenda = queue.agenda.length > 0

  return (
    <AdminShell active="queue" title="À faire">
      <NavContextScope backHref="/admin" label="À faire" className="adm-container adm-todo">
        <header className="adm-todo-head">
          <div className="adm-todo-titles">
            <h1 className="adm-h1">À faire</h1>
            <p className="adm-todo-date">{capitalize(formatDayLong(now.toISOString()))}</p>
            <p className="adm-todo-count">
              {queue.actionCount === 0 ? (
                "Aucun dossier n'attend d'action"
              ) : (
                <>
                  <strong>{queue.actionCount}</strong>{' '}
                  {countLabel(queue.actionCount, 'dossier attend', 'dossiers attendent')} une action
                </>
              )}
            </p>
          </div>
          <RefreshButton variant="secondary" size="sm" className="adm-only-desktop" />
        </header>

        <div className="adm-todo-side">
          {nextDeparture && <Departure session={nextDeparture} />}
          <Pipeline pipeline={queue.pipeline} />
          {hasAgenda && <Agenda agenda={queue.agenda} now={now} />}
        </div>

        <div className="adm-todo-main">
          {queue.sections.length === 0 ? (
            <section className="adm-empty adm-tone--ok" aria-labelledby="todo-empty-title">
              <span className="adm-empty-icon" aria-hidden="true">
                <Icon name="check-circle" size={28} />
              </span>
              <h2 id="todo-empty-title" className="adm-empty-title">
                Rien d&apos;urgent.
              </h2>
              <p className="adm-empty-text">
                {hasAgenda
                  ? "En dehors des visios prévues, aucun dossier n'attend d'action."
                  : "Aucun dossier n'attend d'action pour l'instant."}
              </p>
              <div className="adm-empty-actions">
                <ButtonLink href="/admin/inscriptions">Voir les candidatures</ButtonLink>
              </div>
            </section>
          ) : (
            queue.sections.map((section) => (
              <section key={section.key} className="adm-section" aria-labelledby={`todo-${section.key}-title`}>
                <div className="adm-section-head">
                  <h2 id={`todo-${section.key}-title`} className="adm-section-title">
                    {section.title}
                  </h2>
                  <span className="adm-section-count">
                    {section.items.length}
                    <span className="adm-sr-only"> {countLabel(section.items.length, 'dossier', 'dossiers')}</span>
                  </span>
                  <p className="adm-section-help">{section.hint}</p>
                </div>
                <ul className="adm-rows adm-todo-list">
                  {section.items.map((item) => (
                    <QueueRow key={item.row.id} item={item} section={section.key} now={now} />
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      </NavContextScope>
    </AdminShell>
  )
}

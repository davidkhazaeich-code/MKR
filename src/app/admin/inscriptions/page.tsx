import type { Metadata } from 'next'
import AdminShell from '@/components/admin/shell/AdminShell'
import { ButtonLink } from '@/components/admin/ui/Button'
import Icon from '@/components/admin/ui/Icon'
import CandidaturesView from '@/components/admin/candidatures/CandidaturesView'
import { loadDossierRows } from '@/lib/admin/data'
import type { DossierRow } from '@/lib/admin/types'

// Liste des candidatures : toutes les lignes en une requete (limite 2 000),
// recherche, filtres et tri cote client (CandidaturesView), refletes dans
// l'URL. Une seule horloge : nowIso est pris ici et passe a la vue.

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Candidatures · MKR Admin',
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function LoadError({ title, message, retryHref }: { title: string; message: string; retryHref: string | null }) {
  return (
    <AdminShell active="candidatures" title="Candidatures">
      <div className="adm-container">
        <div className="adm-page-head">
          <h1 className="adm-h1">Candidatures</h1>
        </div>
        <section className="adm-empty adm-tone--danger" aria-labelledby="cand-error-title">
          <span className="adm-empty-icon" aria-hidden="true">
            <Icon name="alert-triangle" size={28} />
          </span>
          <h2 id="cand-error-title" className="adm-empty-title">
            {title}
          </h2>
          <p className="adm-empty-text">{message}</p>
          {retryHref && (
            <div className="adm-empty-actions">
              <ButtonLink href={retryHref} variant="primary" icon="refresh">
                Réessayer
              </ButtonLink>
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  )
}

/** Meme URL, filtres compris : "Reessayer" relit la liste telle qu'elle etait demandee. */
async function currentHref(searchParams: SearchParams): Promise<string> {
  const usp = new URLSearchParams()
  for (const [key, value] of Object.entries(await searchParams)) {
    for (const v of Array.isArray(value) ? value : value === undefined ? [] : [value]) usp.append(key, v)
  }
  const q = usp.toString()
  return q ? `/admin/inscriptions?${q}` : '/admin/inscriptions'
}

export default async function AdminInscriptionsPage({ searchParams }: { searchParams: SearchParams }) {
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
    return <LoadError title="Configuration manquante" message={configError} retryHref={null} />
  }
  if (queryError) {
    return (
      <LoadError
        title="Erreur Supabase"
        message={`Les candidatures n'ont pas pu être lues (${queryError}).`}
        retryHref={await currentHref(searchParams)}
      />
    )
  }

  return (
    <AdminShell active="candidatures" title="Candidatures">
      <CandidaturesView rows={rows} nowIso={new Date().toISOString()} />
    </AdminShell>
  )
}

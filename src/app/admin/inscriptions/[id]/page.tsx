import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { STATUS_LABEL, type Status } from '@/lib/admin-transitions'
import AdminActions from '@/components/admin/AdminActions'
import Avatar from '@/components/admin/ui/Avatar'
import BackShortcut from '@/components/admin/ui/BackShortcut'
import Badge from '@/components/admin/ui/Badge'
import Icon from '@/components/admin/ui/Icon'
import Progress from '@/components/admin/ui/Progress'
import Topbar from '@/components/admin/ui/Topbar'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Dossier · MKR Admin',
}

type TunnelType = 'session' | 'custom' | 'famille' | 'groupe'

const TUNNEL_LABEL: Record<TunnelType, string> = {
  session: 'MKR Camp 2026',
  custom: 'Sur Mesure',
  famille: 'Famille',
  groupe: 'Club & Groupe',
}

const TUNNEL_COLOR: Record<TunnelType, string> = {
  session: 'var(--adm-tunnel-session)',
  custom: 'var(--adm-tunnel-custom)',
  famille: 'var(--adm-tunnel-famille)',
  groupe: 'var(--adm-tunnel-groupe)',
}

const STATUS_COLOR: Record<Status, string> = {
  recue: 'var(--adm-status-recue)',
  validee: 'var(--adm-status-validee)',
  refusee: 'var(--adm-status-refusee)',
  soldee: 'var(--adm-status-soldee)',
  camp_fait: 'var(--adm-status-camp_fait)',
  annulee: 'var(--adm-status-annulee)',
  reportee: 'var(--adm-status-reportee)',
}

interface CandidatureRow {
  id: string
  created_at: string
  updated_at: string
  tunnel_type: TunnelType
  session_id: string | null
  duree_semaines: number | null
  date_debut_souhaitee: string | null
  status: Status
  status_changed_at: string
  status_changed_by_email: string | null
  registration_fee_cents: number | null
  registration_fee_currency: string | null
  registration_fee_paid_at: string | null
  package_amount_cents: number | null
  package_paid_at: string | null
  notes_admin: string | null
  notes_visio: string | null
  form_data: Record<string, unknown>
  group_members: unknown
  candidate: {
    prenom: string
    nom: string
    email: string
    telephone: string | null
    date_naissance: string | null
    pays: string | null
    ville_depart: string | null
  } | null
}

interface AuditRow {
  id: number
  event: string
  from_value: Record<string, unknown> | null
  to_value: Record<string, unknown> | null
  data: Record<string, unknown> | null
  actor_email: string
  at: string
}

const SECTION_LABELS: Record<string, string> = {
  experience: 'Expérience sportive',
  sante: 'Santé',
  groupe: 'Groupe / Club',
  famille: 'Famille',
  custom: 'Sur mesure',
  logistique: 'Logistique',
  confirmations: 'Confirmations',
  _meta: 'Métadonnées techniques',
}

const FIELD_LABELS: Record<string, string> = {
  discipline_principale: 'Discipline principale',
  disciplines_secondaires: 'Disciplines secondaires',
  annees_pratique: 'Années de pratique',
  niveau: 'Niveau',
  club: 'Club',
  coach: 'Coach',
  palmares: 'Palmarès',
  lien_video: 'Lien vidéo',
  condition_physique: 'Condition physique',
  blessures_recentes: 'Blessures récentes',
  blessures_detail: 'Détail blessures',
  contre_indications: 'Contre-indications',
  contre_indications_detail: 'Détail contre-indications',
  deux_fois_jour: "S'entraîner 2× par jour",
  nom_club: 'Nom du club',
  nombre_participants: 'Nombre de participants',
  niveau_groupe: 'Niveau du groupe',
  disciplines: 'Disciplines',
  palmares_club: 'Palmarès club',
  certifs_confirme: 'Certificats confirmés',
  restrictions: 'Restrictions',
  format: 'Format',
  enfants: 'Enfants',
  composition: 'Composition',
  autres_participants: 'Autres participants',
  source_decouverte: 'Comment il/elle nous a connus',
  disponible_entretien: 'Disponible pour entretien',
  message: 'Message libre',
  certif_medical: 'Certificat médical OK',
  accepte_conditions: 'Accepte conditions',
  pret: 'Prêt à venir',
  ip: 'IP',
  ua: 'User-Agent',
}

const EVENT_LABEL: Record<string, string> = {
  created: 'Candidature reçue',
  status_change: 'Changement de statut',
  fee_paid_change: 'Frais 100€',
  package_paid_change: 'Package',
  package_amount_change: 'Montant package',
  notes_admin_update: 'Notes admin éditées',
  notes_visio_update: 'Compte-rendu visio édité',
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatRelative(iso: string): string {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diffMin < 1) return "à l'instant"
  if (diffMin < 60) return `il y a ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `il y a ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  return `il y a ${diffD}j`
}

function renderValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non'
  if (Array.isArray(value)) {
    if (value.length === 0) return '—'
    return value.map((v) => (typeof v === 'object' ? JSON.stringify(v) : String(v))).join(', ')
  }
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export default async function CandidatureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let candidature: CandidatureRow | null = null
  let auditEntries: AuditRow[] = []
  let configError: string | null = null

  try {
    const supabase = getSupabaseAdmin()
    const [candRes, auditRes] = await Promise.all([
      supabase
        .from('candidatures')
        .select(`
          id, created_at, updated_at, tunnel_type, session_id, duree_semaines,
          date_debut_souhaitee, status, status_changed_at, status_changed_by_email,
          registration_fee_cents, registration_fee_currency, registration_fee_paid_at,
          package_amount_cents, package_paid_at, notes_admin, notes_visio,
          form_data, group_members,
          candidate:candidates ( prenom, nom, email, telephone, date_naissance, pays, ville_depart )
        `)
        .eq('id', id)
        .maybeSingle(),
      supabase
        .from('audit_log')
        .select('id, event, from_value, to_value, data, actor_email, at')
        .eq('candidature_id', id)
        .order('at', { ascending: false })
        .limit(50),
    ])

    if (!candRes.data) {
      notFound()
    }
    candidature = candRes.data as unknown as CandidatureRow
    auditEntries = (auditRes.data ?? []) as AuditRow[]
  } catch (err) {
    configError = (err as Error).message
  }

  if (configError) {
    return (
      <>
        <Topbar />
        <div className="adm-container">
          <p style={{ color: 'var(--adm-status-refusee)' }}>Configuration manquante : {configError}</p>
        </div>
      </>
    )
  }

  if (!candidature) notFound()

  const c = candidature.candidate
  const fullName = c ? `${c.prenom} ${c.nom}` : '(candidat manquant)'
  const tunnelColor = TUNNEL_COLOR[candidature.tunnel_type]
  const statusColor = STATUS_COLOR[candidature.status]
  const formData = candidature.form_data ?? {}
  const packageEur = candidature.package_amount_cents
    ? (candidature.package_amount_cents / 100).toFixed(2)
    : null
  const phoneTel = c?.telephone?.replace(/[^+0-9]/g, '') ?? ''

  return (
    <>
      <Topbar subtitle="Dossier" />
      <BackShortcut to="/admin/inscriptions" />
      <main className="adm-container" style={{ paddingBottom: '6rem' }}>
        <Link href="/admin/inscriptions" className="adm-back-link">
          <Icon name="arrow-left" size={15} />
          Retour à la liste
          <span className="adm-hide-mobile" style={{ marginLeft: '0.4rem', fontSize: '0.7rem', color: 'var(--adm-text-muted)' }}>
            <kbd className="adm-kbd">Esc</kbd>
          </span>
        </Link>

        {/* Hero */}
        <section
          className="adm-card adm-card--hero adm-hero"
          style={{ ['--adm-status-color' as string]: statusColor }}
        >
          <Avatar prenom={c?.prenom} nom={c?.nom} seed={candidature.id} size="lg" />
          <div className="adm-hero-main">
            <div className="adm-hero-badges">
              <Badge color={tunnelColor} dot size="lg">
                {TUNNEL_LABEL[candidature.tunnel_type]}
              </Badge>
              <Badge
                color={statusColor}
                dot
                pulse={candidature.status === 'recue'}
                size="lg"
              >
                {STATUS_LABEL[candidature.status]}
              </Badge>
            </div>
            <h1 className="adm-hero-name">{fullName}</h1>
            <p className="adm-hero-meta">
              Reçue {formatRelative(candidature.created_at)} · {formatDateTime(candidature.created_at)}
            </p>
          </div>
          {c && (
            <div className="adm-hero-quick">
              <a href={`mailto:${c.email}`} className="adm-quick-btn" aria-label="Envoyer un email">
                <Icon name="mail" size={15} />
                <span className="adm-hide-mobile">Email</span>
              </a>
              {c.telephone && (
                <>
                  <a href={`tel:${phoneTel}`} className="adm-quick-btn" aria-label="Appeler">
                    <Icon name="phone" size={15} />
                    <span className="adm-hide-mobile">Appeler</span>
                  </a>
                  <a
                    href={`https://wa.me/${phoneTel.replace('+', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="adm-quick-btn adm-quick-btn--whatsapp"
                    aria-label="Ouvrir WhatsApp"
                  >
                    <Icon name="whatsapp" size={15} />
                    <span className="adm-hide-mobile">WhatsApp</span>
                  </a>
                </>
              )}
            </div>
          )}
        </section>

        <section className="adm-card" style={{ marginBottom: '1.25rem' }}>
          <h2 className="adm-card-title">
            <Icon name="check-circle" size={14} />
            Progression du dossier
          </h2>
          <Progress status={candidature.status} />
        </section>

        {/* 2-col desktop / stack mobile */}
        <div className="adm-card-grid adm-card-grid--detail">
          {/* LEFT : infos */}
          <div className="adm-card-stack">
            <section className="adm-card">
              <h2 className="adm-card-title">Identité</h2>
              {c && (
                <DefList
                  items={[
                    ['Prénom', c.prenom],
                    ['Nom', c.nom],
                    ['Email', <a key="e" href={`mailto:${c.email}`}>{c.email}</a>],
                    [
                      'Téléphone',
                      c.telephone ? (
                        <a key="t" href={`tel:${phoneTel}`}>
                          {c.telephone}
                        </a>
                      ) : (
                        '—'
                      ),
                    ],
                    ['Date de naissance', c.date_naissance ?? '—'],
                    ['Pays', c.pays ?? '—'],
                    ['Ville de départ', c.ville_depart ?? '—'],
                  ]}
                />
              )}
            </section>

            <section className="adm-card">
              <h2 className="adm-card-title">Logistique demandée</h2>
              <DefList
                items={[
                  ['Tunnel', TUNNEL_LABEL[candidature.tunnel_type]],
                  ['Session', candidature.session_id ?? '—'],
                  [
                    'Durée souhaitée',
                    candidature.duree_semaines ? `${candidature.duree_semaines} semaine(s)` : '—',
                  ],
                  ['Date début souhaitée', candidature.date_debut_souhaitee ?? '—'],
                ]}
              />
            </section>

            {Object.entries(formData).map(([sectionKey, sectionValue]) => {
              if (sectionValue === null || sectionValue === undefined) return null
              if (typeof sectionValue !== 'object') return null
              const label = SECTION_LABELS[sectionKey] ?? sectionKey
              const entries = Object.entries(sectionValue as Record<string, unknown>)
              if (entries.length === 0) return null
              return (
                <section key={sectionKey} className="adm-card">
                  <h2 className="adm-card-title">{label}</h2>
                  <DefList
                    items={entries.map(([k, v]) => [FIELD_LABELS[k] ?? k, renderValue(v)])}
                  />
                </section>
              )
            })}

            {candidature.group_members ? (
              <section className="adm-card">
                <h2 className="adm-card-title">Membres du groupe</h2>
                <pre className="adm-pre">{JSON.stringify(candidature.group_members, null, 2)}</pre>
              </section>
            ) : null}

            <section className="adm-card">
              <h2 className="adm-card-title">État paiement</h2>
              <DefList
                items={[
                  [
                    "Frais d'inscription 100€",
                    candidature.registration_fee_paid_at ? (
                      <span style={{ color: 'var(--adm-status-validee)' }}>
                        ✓ Payés le {formatDateTime(candidature.registration_fee_paid_at)}
                      </span>
                    ) : (
                      <span className="adm-def-val--muted">Non payés</span>
                    ),
                  ],
                  ['Montant package', packageEur ? `${packageEur} €` : '—'],
                  [
                    'Package soldé',
                    candidature.package_paid_at ? (
                      <span style={{ color: 'var(--adm-status-validee)' }}>
                        ✓ Soldé le {formatDateTime(candidature.package_paid_at)}
                      </span>
                    ) : (
                      <span className="adm-def-val--muted">Non soldé</span>
                    ),
                  ],
                ]}
              />
            </section>

            <section className="adm-card">
              <h2 className="adm-card-title">
                <Icon name="history" size={14} />
                Historique
              </h2>
              {auditEntries.length === 0 ? (
                <p className="adm-action-empty">Aucune entrée.</p>
              ) : (
                <ol className="adm-timeline">
                  {auditEntries.map((e, idx) => {
                    const reminderText =
                      e.data && typeof e.data === 'object' && 'reminder' in e.data
                        ? String((e.data as Record<string, unknown>).reminder)
                        : null
                    return (
                      <li key={e.id} className="adm-timeline-item">
                        <span
                          className={
                            idx === 0
                              ? 'adm-timeline-dot adm-timeline-dot--accent'
                              : 'adm-timeline-dot'
                          }
                          aria-hidden="true"
                        />
                        <div className="adm-timeline-event">
                          {EVENT_LABEL[e.event] ?? e.event}
                        </div>
                        <div className="adm-timeline-time">
                          {formatDateTime(e.at)} · {e.actor_email}
                        </div>
                        {e.event === 'status_change' && e.from_value && e.to_value && (
                          <div className="adm-timeline-detail">
                            {STATUS_LABEL[e.from_value.status as Status]} →{' '}
                            <span style={{ color: 'var(--adm-text-primary)', fontWeight: 600 }}>
                              {STATUS_LABEL[e.to_value.status as Status]}
                            </span>
                          </div>
                        )}
                        {reminderText && (
                          <div className="adm-timeline-reminder">⚠️ {reminderText}</div>
                        )}
                      </li>
                    )
                  })}
                </ol>
              )}
            </section>
          </div>

          {/* RIGHT : actions admin (sticky desktop) */}
          <div style={{ position: 'sticky', top: '78px' }}>
            <AdminActions
              candidatureId={candidature.id}
              currentStatus={candidature.status}
              registrationFeePaidAt={candidature.registration_fee_paid_at}
              packagePaidAt={candidature.package_paid_at}
              packageAmountCents={candidature.package_amount_cents}
              notesAdmin={candidature.notes_admin ?? ''}
              notesVisio={candidature.notes_visio ?? ''}
            />
          </div>
        </div>
      </main>
    </>
  )
}

function DefList({ items }: { items: Array<[string, React.ReactNode]> }) {
  return (
    <dl className="adm-defs">
      {items.map(([k, v], i) => (
        <div key={i} className="adm-def">
          <dt className="adm-def-key">{k}</dt>
          <dd className="adm-def-val">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { STATUS_LABEL, type Status } from '@/lib/admin-transitions'
import AdminActions from '@/components/admin/AdminActions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Dossier candidature MKR',
}

type TunnelType = 'session' | 'custom' | 'famille' | 'groupe'

const TUNNEL_LABEL: Record<TunnelType, string> = {
  session: 'MKR Camp 2026',
  custom: 'Sur Mesure',
  famille: 'Famille',
  groupe: 'Club & Groupe',
}

const TUNNEL_COLOR: Record<TunnelType, string> = {
  session: '#FF6B00',
  custom: '#60a5fa',
  famille: '#4ade80',
  groupe: '#a78bfa',
}

const STATUS_COLOR: Record<Status, string> = {
  recue: '#FF8C00',
  validee: '#4ade80',
  refusee: '#fca5a5',
  soldee: '#60a5fa',
  camp_fait: '#a78bfa',
  annulee: '#71717a',
  reportee: '#fbbf24',
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
  deux_fois_jour: 'Peut s\'entraîner 2× par jour',
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
      <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#fff', padding: '2rem' }}>
        <h1>Dossier candidature</h1>
        <p style={{ color: '#fca5a5' }}>Configuration manquante : {configError}</p>
      </div>
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

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#fff', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        {/* Back link */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            href="/admin/inscriptions"
            style={{ color: '#FF8C00', fontSize: '0.85rem', textDecoration: 'none' }}
          >
            ← Retour à la liste
          </Link>
        </div>

        {/* Header */}
        <header
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '2rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <Badge color={tunnelColor}>{TUNNEL_LABEL[candidature.tunnel_type]}</Badge>
              <Badge color={statusColor}>{STATUS_LABEL[candidature.status]}</Badge>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 600, margin: 0 }}>{fullName}</h1>
            <p style={{ color: '#9CA3AF', fontSize: '0.85rem', margin: '0.4rem 0 0' }}>
              Reçue {formatRelative(candidature.created_at)} · {formatDateTime(candidature.created_at)}
            </p>
          </div>
        </header>

        {/* Identité + Logistique */}
        <section style={card}>
          <h2 style={cardTitle}>Identité</h2>
          {c && (
            <DefList
              items={[
                ['Prénom', c.prenom],
                ['Nom', c.nom],
                ['Email', <a key="e" href={`mailto:${c.email}`} style={linkStyle}>{c.email}</a>],
                ['Téléphone', c.telephone ? (
                  <a key="t" href={`tel:${c.telephone.replace(/[^+0-9]/g, '')}`} style={linkStyle}>
                    {c.telephone}
                  </a>
                ) : '—'],
                ['Date de naissance', c.date_naissance ?? '—'],
                ['Pays', c.pays ?? '—'],
                ['Ville de départ', c.ville_depart ?? '—'],
              ]}
            />
          )}
        </section>

        <section style={card}>
          <h2 style={cardTitle}>Logistique demandée</h2>
          <DefList
            items={[
              ['Tunnel', TUNNEL_LABEL[candidature.tunnel_type]],
              ['Session', candidature.session_id ?? '—'],
              ['Durée souhaitée', candidature.duree_semaines ? `${candidature.duree_semaines} semaine(s)` : '—'],
              ['Date début souhaitée', candidature.date_debut_souhaitee ?? '—'],
            ]}
          />
        </section>

        {/* form_data sections */}
        {Object.entries(formData).map(([sectionKey, sectionValue]) => {
          if (sectionValue === null || sectionValue === undefined) return null
          if (typeof sectionValue !== 'object') return null
          const label = SECTION_LABELS[sectionKey] ?? sectionKey
          const entries = Object.entries(sectionValue as Record<string, unknown>)
          if (entries.length === 0) return null
          return (
            <section key={sectionKey} style={card}>
              <h2 style={cardTitle}>{label}</h2>
              <DefList
                items={entries.map(([k, v]) => [
                  FIELD_LABELS[k] ?? k,
                  renderValue(v),
                ])}
              />
            </section>
          )
        })}

        {/* group_members */}
        {candidature.group_members ? (
          <section style={card}>
            <h2 style={cardTitle}>Membres du groupe</h2>
            <pre style={preStyle}>{JSON.stringify(candidature.group_members, null, 2)}</pre>
          </section>
        ) : null}

        {/* Paiement état */}
        <section style={card}>
          <h2 style={cardTitle}>État paiement</h2>
          <DefList
            items={[
              [
                "Frais d'inscription 100€",
                candidature.registration_fee_paid_at
                  ? `Payés le ${formatDateTime(candidature.registration_fee_paid_at)}`
                  : 'Non payés',
              ],
              ['Montant package', packageEur ? `${packageEur} €` : '—'],
              [
                'Package soldé',
                candidature.package_paid_at
                  ? `Soldé le ${formatDateTime(candidature.package_paid_at)}`
                  : 'Non soldé',
              ],
            ]}
          />
        </section>

        {/* Actions admin (client) */}
        <section style={{ ...card, borderColor: 'rgba(255,140,0,0.25)' }}>
          <h2 style={cardTitle}>Actions admin</h2>
          <AdminActions
            candidatureId={candidature.id}
            currentStatus={candidature.status}
            registrationFeePaidAt={candidature.registration_fee_paid_at}
            packagePaidAt={candidature.package_paid_at}
            packageAmountCents={candidature.package_amount_cents}
            notesAdmin={candidature.notes_admin ?? ''}
            notesVisio={candidature.notes_visio ?? ''}
          />
        </section>

        {/* Audit log */}
        <section style={card}>
          <h2 style={cardTitle}>Historique</h2>
          {auditEntries.length === 0 ? (
            <p style={{ color: '#71717a', fontSize: '0.85rem', margin: 0 }}>Aucune entrée.</p>
          ) : (
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {auditEntries.map((e) => (
                <li
                  key={e.id}
                  style={{
                    paddingLeft: '0.9rem',
                    borderLeft: '2px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div style={{ fontSize: '0.85rem', color: '#e4e4e7', fontWeight: 600 }}>
                    {EVENT_LABEL[e.event] ?? e.event}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#71717a' }}>
                    {formatDateTime(e.at)} · {e.actor_email}
                  </div>
                  {e.event === 'status_change' && e.from_value && e.to_value && (
                    <div style={{ fontSize: '0.8rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
                      {STATUS_LABEL[e.from_value.status as Status]} → {STATUS_LABEL[e.to_value.status as Status]}
                    </div>
                  )}
                  {e.data && typeof e.data === 'object' && 'reminder' in e.data && (
                    <div style={{ fontSize: '0.8rem', color: '#fbbf24', marginTop: '0.25rem' }}>
                      ⚠️ {String((e.data as Record<string, unknown>).reminder)}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  )
}

// --- Petits composants utilitaires inline ---

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      style={{
        padding: '0.25rem 0.6rem',
        borderRadius: '999px',
        fontSize: '0.7rem',
        fontWeight: 700,
        color,
        background: `${color}1a`,
        border: `1px solid ${color}40`,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}
    >
      {children}
    </span>
  )
}

function DefList({ items }: { items: Array<[string, React.ReactNode]> }) {
  return (
    <dl
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '0.6rem 1.2rem',
        margin: 0,
      }}
    >
      {items.map(([k, v], i) => (
        <div key={i}>
          <dt style={{ fontSize: '0.7rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>{k}</dt>
          <dd style={{ margin: 0, fontSize: '0.9rem', color: '#e4e4e7' }}>{v}</dd>
        </div>
      ))}
    </dl>
  )
}

const card: React.CSSProperties = {
  marginBottom: '1.25rem',
  padding: '1.25rem',
  borderRadius: '14px',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.06)',
}

const cardTitle: React.CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: '#71717a',
  margin: '0 0 0.9rem',
}

const linkStyle: React.CSSProperties = { color: '#FF8C00', textDecoration: 'none' }

const preStyle: React.CSSProperties = {
  margin: 0,
  padding: '0.75rem',
  background: 'rgba(0,0,0,0.4)',
  borderRadius: '8px',
  fontSize: '0.75rem',
  overflowX: 'auto',
  color: '#e4e4e7',
}

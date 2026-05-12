import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { STATUS_LABEL, type Status } from '@/lib/admin-transitions'
import AdminActions from '@/components/admin/AdminActions'
import DangerSection from '@/components/admin/DangerSection'
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

type PaymentMethod = 'virement' | 'cash' | 'autre'

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  virement: 'Virement bancaire',
  cash: 'Espèces',
  autre: 'Autre',
}

type CampDiscipline = 'lutte' | 'mma' | 'combo_quote'

const DISCIPLINE_LABEL_FULL: Record<CampDiscipline, string> = {
  lutte: 'Lutte · Daghestan (Makhachkala / Kaspiysk)',
  mma: 'MMA · Tchétchénie (Grozny, Akhmat)',
  combo_quote: 'Combo Lutte + MMA · sur devis',
}

interface CandidatureRow {
  id: string
  created_at: string
  updated_at: string
  tunnel_type: TunnelType
  session_id: string | null
  duree_semaines: number | null
  date_debut_souhaitee: string | null
  camp_discipline: CampDiscipline | null
  status: Status
  status_changed_at: string
  status_changed_by_email: string | null
  package_amount_cents: number | null
  package_paid_at: string | null
  payment_method: PaymentMethod | null
  payment_date: string | null
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
  conjoint_participe: 'Conjoint(e) participe aussi',
  nombre_parents: 'Nombre de parents participants',
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

// Decrit un evenement audit en label explicite + detail optionnel.
// Le label change selon la direction du change (set vs unset).
function describeEvent(e: AuditRow): { label: string; detail: string | null; accent?: string } {
  switch (e.event) {
    case 'created':
      return { label: 'Candidature reçue', detail: null, accent: 'var(--adm-status-recue)' }
    case 'status_change': {
      const from = e.from_value?.status as Status | undefined
      const to = e.to_value?.status as Status | undefined
      return {
        label: 'Changement de statut',
        detail: from && to ? `${STATUS_LABEL[from]} → ${STATUS_LABEL[to]}` : null,
        accent: to ? `var(--adm-status-${to})` : undefined,
      }
    }
    case 'package_paid_change': {
      const isPaid = !!e.to_value?.package_paid_at
      return {
        label: isPaid
          ? 'Package soldé (paiement reçu)'
          : 'Package retiré du soldé',
        detail: null,
        accent: isPaid ? 'var(--adm-status-soldee)' : 'var(--adm-text-muted)',
      }
    }
    case 'package_amount_change': {
      const fromCents = e.from_value?.package_amount_cents as number | null | undefined
      const toCents = e.to_value?.package_amount_cents as number | null | undefined
      const fromEur = fromCents ? `${(fromCents / 100).toFixed(2)} €` : '—'
      const toEur = toCents ? `${(toCents / 100).toFixed(2)} €` : '—'
      return { label: 'Montant package mis à jour', detail: `${fromEur} → ${toEur}` }
    }
    case 'payment_method_change': {
      const from = e.from_value?.payment_method as PaymentMethod | null | undefined
      const to = e.to_value?.payment_method as PaymentMethod | null | undefined
      const fromLabel = from ? PAYMENT_METHOD_LABEL[from] : '—'
      const toLabel = to ? PAYMENT_METHOD_LABEL[to] : '—'
      return { label: 'Méthode de paiement mise à jour', detail: `${fromLabel} → ${toLabel}` }
    }
    case 'payment_date_change': {
      const from = e.from_value?.payment_date as string | null | undefined
      const to = e.to_value?.payment_date as string | null | undefined
      return {
        label: 'Date de paiement mise à jour',
        detail: `${from ? formatDateOnly(from) : '—'} → ${to ? formatDateOnly(to) : '—'}`,
      }
    }
    // Events legacy (avant suppression Stripe / 100€) : on les laisse s'afficher
    // bruts pour préserver l'historique sans casser l'UI.
    case 'fee_paid_change':
      return { label: '[archive] Frais d\'inscription marqués payés/retirés', detail: null }
    case 'notes_admin_update':
      return { label: 'Notes admin éditées', detail: null }
    case 'notes_visio_update':
      return { label: 'Compte-rendu visio édité', detail: null }
    default:
      return { label: e.event, detail: null }
  }
}

function formatDateOnly(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
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
          id, created_at, updated_at, tunnel_type, session_id, duree_semaines, camp_discipline,
          date_debut_souhaitee, status, status_changed_at, status_changed_by_email,
          package_amount_cents, package_paid_at, payment_method, payment_date,
          notes_admin, notes_visio, form_data, group_members,
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

  // Calcul du restant à payer (centimes). Plus de frais 100€ upfront : le
  // package est soit soldé en une fois post-visio, soit en attente.
  const totalCents = candidature.package_amount_cents
  const packagePaid = !!candidature.package_paid_at
  const remainingCents = packagePaid ? 0 : totalCents ?? null
  const remainingEur = remainingCents !== null ? (remainingCents / 100).toFixed(2) : null
  const paidCents = packagePaid && totalCents ? totalCents : 0
  const totalToCollect = totalCents ?? 0
  const progressPct = totalToCollect > 0 ? Math.min(100, Math.round((paidCents / totalToCollect) * 100)) : 0
  const phoneTel = c?.telephone?.replace(/[^+0-9]/g, '') ?? ''

  return (
    <>
      <Topbar
        crumbs={[
          { label: 'Candidatures', href: '/admin/inscriptions' },
          { label: c ? `${c.prenom ?? ''} ${c.nom ?? ''}`.trim() || 'Dossier' : 'Dossier' },
        ]}
      />
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

        {/* Bandeau "Devis à envoyer" pour les groupes/clubs */}
        {candidature.tunnel_type === 'groupe' && candidature.status === 'recue' && (
          <section
            className="adm-card"
            style={{
              marginBottom: '1.25rem',
              padding: '1rem 1.25rem',
              borderLeft: '4px solid #a78bfa',
              background: 'rgba(167, 139, 250, 0.07)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem', lineHeight: 1 }} aria-hidden="true">🔀</span>
              <div>
                <strong style={{ color: '#a78bfa', display: 'block', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                  Demande de devis Club & Groupe
                </strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--adm-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  Aucun paiement à ce stade. <strong>À contacter sous 48h</strong> pour cadrer en visio (objectifs, dates, niveau, budget)
                  puis envoyer un devis personnalisé. La santé individuelle et les certificats médicaux seront collectés après acceptation.
                </p>
              </div>
            </div>
          </section>
        )}

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
                  ['Camp choisi', candidature.camp_discipline ? DISCIPLINE_LABEL_FULL[candidature.camp_discipline] : '—'],
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
              <h2 className="adm-card-title">
                <Icon name="euro" size={14} />
                État paiement
              </h2>

              {/* Récap visuel : reste à payer en grand + barre de progression */}
              <div
                style={{
                  marginBottom: '1.25rem',
                  padding: '1rem 1.1rem',
                  borderRadius: '12px',
                  border: '1px solid var(--adm-border-subtle)',
                  background: packagePaid
                    ? 'rgba(34, 197, 94, 0.06)'
                    : remainingCents && remainingCents > 0
                      ? 'rgba(251, 191, 36, 0.05)'
                      : 'rgba(255, 255, 255, 0.02)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--adm-text-muted)', fontWeight: 700 }}>
                    {packagePaid ? 'Tout est payé' : 'Reste à payer'}
                  </span>
                  {totalCents && totalCents > 0 && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--adm-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                      {(paidCents / 100).toFixed(2)} € sur {(totalCents / 100).toFixed(2)} €
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--adm-font-display)',
                    fontSize: '3rem',
                    fontWeight: 700,
                    letterSpacing: '0.01em',
                    lineHeight: 0.95,
                    color: packagePaid
                      ? 'var(--adm-status-validee)'
                      : remainingCents && remainingCents > 0
                        ? 'var(--adm-status-reportee)'
                        : 'var(--adm-text-secondary)',
                    fontVariantNumeric: 'tabular-nums',
                    marginBottom: '0.9rem',
                  }}
                >
                  {packagePaid
                    ? '✓ Soldé'
                    : remainingEur !== null
                      ? `${remainingEur} €`
                      : '— € (montant à définir)'}
                </div>
                {totalCents && totalCents > 0 && (
                  <div
                    style={{
                      height: 6,
                      borderRadius: 999,
                      background: 'var(--adm-bg-base)',
                      overflow: 'hidden',
                      border: '1px solid var(--adm-border-subtle)',
                    }}
                    aria-label={`${progressPct}% encaissé`}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${progressPct}%`,
                        background: packagePaid
                          ? 'var(--adm-status-validee)'
                          : 'linear-gradient(90deg, var(--adm-status-validee), var(--adm-status-reportee))',
                        borderRadius: 999,
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                )}
              </div>

              <DefList
                items={[
                  ['Montant package total', packageEur ? `${packageEur} €` : '—'],
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
                  [
                    'Méthode de paiement',
                    candidature.payment_method ? (
                      <span>{PAYMENT_METHOD_LABEL[candidature.payment_method]}</span>
                    ) : (
                      <span className="adm-def-val--muted">—</span>
                    ),
                  ],
                  [
                    'Date de réception',
                    candidature.payment_date ? (
                      <span>{formatDateOnly(candidature.payment_date)}</span>
                    ) : (
                      <span className="adm-def-val--muted">—</span>
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
                    const described = describeEvent(e)
                    const reminderText =
                      e.data && typeof e.data === 'object' && 'reminder' in e.data
                        ? String((e.data as Record<string, unknown>).reminder)
                        : null
                    const dotClass = idx === 0 || described.accent
                      ? 'adm-timeline-dot adm-timeline-dot--accent'
                      : 'adm-timeline-dot'
                    const dotStyle: React.CSSProperties | undefined = described.accent
                      ? { background: described.accent, borderColor: described.accent, boxShadow: `0 0 0 3px color-mix(in srgb, ${described.accent} 24%, transparent)` }
                      : undefined
                    return (
                      <li key={e.id} className="adm-timeline-item">
                        <span className={dotClass} style={dotStyle} aria-hidden="true" />
                        <div className="adm-timeline-event">{described.label}</div>
                        <div className="adm-timeline-time">
                          {formatDateTime(e.at)} · {e.actor_email}
                        </div>
                        {described.detail && (
                          <div className="adm-timeline-detail">
                            <span style={{ color: 'var(--adm-text-primary)', fontWeight: 600 }}>
                              {described.detail}
                            </span>
                          </div>
                        )}
                        {reminderText && (
                          <div className="adm-timeline-reminder" style={{ display: 'inline-flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                            <Icon name="alert-triangle" size={13} strokeWidth={2.2} />
                            <span>{reminderText}</span>
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ol>
              )}
            </section>
          </div>

          {/* RIGHT : actions admin (sticky desktop) */}
          <div id="admin-actions" style={{ position: 'sticky', top: '78px', scrollMarginTop: '78px' }}>
            <AdminActions
              candidatureId={candidature.id}
              currentStatus={candidature.status}
              packagePaidAt={candidature.package_paid_at}
              packageAmountCents={candidature.package_amount_cents}
              paymentMethod={candidature.payment_method}
              paymentDate={candidature.payment_date}
              notesAdmin={candidature.notes_admin ?? ''}
              notesVisio={candidature.notes_visio ?? ''}
            />
          </div>
        </div>

        {/* Danger zone — full width, en bas, separe du workflow normal */}
        <DangerSection candidatureId={candidature.id} candidateName={fullName} />
      </main>

      {/* FAB mobile vers les actions admin (caché desktop, sticky desktop suffit) */}
      <a
        href="#admin-actions"
        className="adm-fab adm-hide-desktop"
        aria-label="Aller aux actions admin"
        title="Actions admin"
      >
        <Icon name="zap" size={18} strokeWidth={2.2} />
        <span>Actions</span>
      </a>
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
